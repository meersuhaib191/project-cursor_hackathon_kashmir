import { create } from 'zustand';
import {
  Ambulance,
  TrafficSignal,
  Hospital,
  RouteData,
  EmergencyStatus,
  ActivityLogEntry,
  Location,
} from '../types';
import { TRAFFIC_SIGNALS, HOSPITALS, MAP_CONFIG } from './mapConfig';
import { fetchRoute, haversineDistance } from './routing';

interface LifeLineStore {
  // State
  ambulance: Ambulance;
  signals: TrafficSignal[];
  hospitals: Hospital[];
  currentRoute: RouteData | null;
  selectedPickupId: string | null;
  selectedHospitalId: string | null;
  emergencyMode: boolean;
  logs: ActivityLogEntry[];
  isRouteLoading: boolean;
  gpsActive: boolean;
  lastRouteCalcLocation: Location | null;
  hasCongestion: boolean;
  isBroadcasting: boolean;
  normalRouteEta: number | null;   // seconds — what it would take without emergency
  timeSaved: number | null;        // seconds — time saved by emergency routing

  // Actions
  setGpsActive: (active: boolean) => void;
  updateDriverLocation: (location: Location, heading: number, speed: number) => void;
  selectPickup: (pickupId: string) => void;
  selectHospital: (hospitalId: string) => void;
  toggleEmergencyMode: () => void;
  startDispatch: () => Promise<void>;
  stopDispatch: () => void;
  recalculateRoute: () => Promise<void>;
  addLog: (message: string, type: ActivityLogEntry['type']) => void;
  broadcastAlert: (message: string) => void;
  setAmbulanceLocation: (location: Location) => void;
}

let simulationInterval: any = null;
let currentSimIndex = 0;

const RECALC_DISTANCE_THRESHOLD = 50; // meters
const SIGNAL_TRIGGER_DISTANCE = 300;  // meters — turn signal green when ambulance is within 300m

export const useLifeLineStore = create<LifeLineStore>((set, get) => ({
  // Initial State
  ambulance: {
    id: 'AMB-789',
    location: MAP_CONFIG.DEFAULT_CENTER,
    status: 'IDLE',
    heading: 0,
    speed: 0,
  },
  signals: TRAFFIC_SIGNALS.map((s) => ({ ...s, status: 'RED' as const })),
  hospitals: HOSPITALS,
  currentRoute: null,
  selectedPickupId: null,
  selectedHospitalId: null,
  emergencyMode: true,
  logs: [
    {
      id: '1',
      timestamp: new Date(),
      message: 'System initialized. Waiting for GPS lock...',
      type: 'INFO',
    },
  ],
  isRouteLoading: false,
  gpsActive: false,
  lastRouteCalcLocation: null,
  hasCongestion: false,
  isBroadcasting: false,
  normalRouteEta: null,
  timeSaved: null,

  // Actions
  setGpsActive: (active) => {
    set({ gpsActive: active });
    if (active) {
      get().addLog('GPS lock acquired. Tracking driver location.', 'SUCCESS');
    }
  },

  setAmbulanceLocation: (location) => {
    set((state) => ({
      ambulance: { ...state.ambulance, location },
      selectedPickupId: 'GPS', // Auto switch the dropdown to GPS/Custom
    }));
  },

  updateDriverLocation: (location, heading, speed) => {
    const { ambulance, currentRoute, lastRouteCalcLocation, signals } = get();

    // Update signal states based on proximity
    const updatedSignals = signals.map((signal) => {
      const dist = haversineDistance(location, signal.location);
      if (dist < SIGNAL_TRIGGER_DISTANCE && ambulance.status === 'EMERGENCY') {
        if (signal.status !== 'GREEN') {
          get().addLog(`🟢 Signal "${signal.name}" cleared to GREEN`, 'SUCCESS');
        }
        return { ...signal, status: 'GREEN' as const };
      }
      // Keep already-green signals green (ambulance already passed)
      if (signal.status === 'GREEN') {
        return signal;
      }
      return { ...signal, status: 'RED' as const };
    });

    set({
      ambulance: { ...ambulance, location, heading, speed },
      signals: updatedSignals,
    });

    // Check if we need to recalculate the route
    if (currentRoute && lastRouteCalcLocation) {
      const movedDistance = haversineDistance(location, lastRouteCalcLocation);
      /* Simulation mode disabled recalcs to prevent infinite loops */
      // if (movedDistance > RECALC_DISTANCE_THRESHOLD) {
      //   get().recalculateRoute();
      // }
    }

    // Check if arrived at destination
    if (currentRoute) {
      const hospital = get().hospitals.find((h) => h.id === currentRoute.destinationId);
      if (hospital) {
        const distToHospital = haversineDistance(location, hospital.location);
        if (distToHospital < 30) {
          if (simulationInterval) clearInterval(simulationInterval);
          set({ currentRoute: null, hasCongestion: false, signals: [], normalRouteEta: null, timeSaved: null });
          set((s) => ({ ambulance: { ...s.ambulance, status: 'ARRIVED' } }));
          get().addLog('🏥 Arrived at hospital. Mission complete!', 'SUCCESS');
        }
      }
    }
  },

  selectPickup: (pickupId) => {
    set({ selectedPickupId: pickupId });
    if (pickupId === 'GPS') {
      get().addLog('Switched to Live GPS Tracking mode.', 'INFO');
      return;
    }
    const { PICKUP_LOCATIONS } = require('./mapConfig');
    const pickup = PICKUP_LOCATIONS.find((p: any) => p.id === pickupId);
    if (pickup) {
      get().setAmbulanceLocation(pickup.location);
      get().addLog(`Dispatch origin updated to: ${pickup.name}`, 'INFO');
    }
  },

  selectHospital: (hospitalId) => {
    set({ selectedHospitalId: hospitalId });
    const hospital = get().hospitals.find((h) => h.id === hospitalId);
    if (hospital) {
      get().addLog(`Hospital selected: ${hospital.name}`, 'INFO');
    }
  },

  toggleEmergencyMode: () => {
    const newMode = !get().emergencyMode;
    set({ emergencyMode: newMode });
    get().addLog(
      newMode
        ? '🚨 Emergency Mode ACTIVATED — using traffic-aware fastest route'
        : 'Emergency Mode deactivated — using standard routing',
      newMode ? 'EMERGENCY' : 'INFO'
    );
    // Recalculate with new profile if route exists
    if (get().currentRoute) {
      get().recalculateRoute();
    }
  },

  startDispatch: async () => {
    const { ambulance, selectedHospitalId, hospitals, emergencyMode } = get();
    if (!selectedHospitalId) {
      get().addLog('⚠️ Select a hospital destination first!', 'WARNING');
      return;
    }

    const hospital = hospitals.find((h) => h.id === selectedHospitalId);
    if (!hospital) return;

    set({ isRouteLoading: true });
    get().addLog(`🚑 Dispatching to ${hospital.name}...`, 'EMERGENCY');

    const route = await fetchRoute(
      ambulance.location,
      hospital.location,
      emergencyMode,
      ambulance.id,
      hospital.id
    );

    if (route) {
      const distKm = (route.distance / 1000).toFixed(1);
      const etaMin = Math.ceil(route.duration / 60);

      set({
        currentRoute: route,
        isRouteLoading: false,
        lastRouteCalcLocation: { ...ambulance.location },
        hasCongestion: false,
        isBroadcasting: false,
      });

      // Randomly decide if this specific dispatch will encounter unexpected traffic (40% chance)
      const willEncounterCongestion = Math.random() < 0.4;
      if (willEncounterCongestion) {
        // Trigger the congestion alert 4 to 8 seconds into the dispatch to make it feel "real-time" and dynamic
        const delay = 4000 + Math.random() * 4000;
        setTimeout(() => {
          if (get().ambulance.status === 'EMERGENCY') {
            set({ hasCongestion: true });
            get().addLog('⚠️ AI Scanner: Unexpected severe bottleneck detected ahead. Broadcast available.', 'WARNING');
          }
        }, delay);
      }

      // Calculate normal route for comparison (without emergency mode)
      const normalRoute = await fetchRoute(
        ambulance.location,
        hospital.location,
        false, // standard driving profile
        ambulance.id,
        hospital.id
      );
      const normalEta = normalRoute ? normalRoute.duration : route.duration * 1.6;
      const saved = normalEta - route.duration;
      set({ normalRouteEta: normalEta, timeSaved: saved > 0 ? saved : 0 });

      set((s) => ({ ambulance: { ...s.ambulance, status: 'EMERGENCY' } }));

      // GENERATE FAKE SIGNALS AT ALL INTERSECTIONS (EVERY ROUTE STEP)
      const fakeSignals: TrafficSignal[] = [];
      const steps = route.steps || [];

      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        // Skip depart and arrive — those aren't intersections
        if (step.maneuver.type === 'depart' || step.maneuver.type === 'arrive') continue;

        const point = { lng: step.maneuver.location[0], lat: step.maneuver.location[1] };

        fakeSignals.push({
          id: `SIM-SIG-${fakeSignals.length + 1}`,
          name: `Signal ${fakeSignals.length + 1}`,
          location: point,
          status: 'RED'
        });
      }

      // Randomly pre-set ~30% of signals to GREEN for realism
      fakeSignals.forEach((sig) => {
        if (Math.random() < 0.3) {
          sig.status = 'GREEN';
        }
      });

      set({ signals: fakeSignals });

      // START SIMULATION
      currentSimIndex = 0;
      if (simulationInterval) clearInterval(simulationInterval);
      
      simulationInterval = setInterval(() => {
        const { currentRoute, ambulance } = get();
        if (!currentRoute || ambulance.status !== 'EMERGENCY') {
          if (simulationInterval) clearInterval(simulationInterval);
          return;
        }

        // Jump ahead by 5 coordinates
        currentSimIndex += 5;
        
        let forcedArrivalCoordinate = false;
        if (currentSimIndex >= currentRoute.geometry.coordinates.length - 1) {
          currentSimIndex = currentRoute.geometry.coordinates.length - 1;
          forcedArrivalCoordinate = true;
        }

        const coords = currentRoute.geometry.coordinates[currentSimIndex];
        const newLocation = { lng: coords[0], lat: coords[1] };
        
        if (forcedArrivalCoordinate) {
          // Snap directly to the hospital pin to artificially trigger the < 30m arrival threshold gracefully
          const targetHospital = get().hospitals.find(h => h.id === currentRoute.destinationId);
          if (targetHospital) {
            newLocation.lat = targetHospital.location.lat;
            newLocation.lng = targetHospital.location.lng;
          }
        }
        
        let heading = ambulance.heading;
        if (currentSimIndex > 0) {
          const prevCoords = currentRoute.geometry.coordinates[Math.max(0, currentSimIndex - 5)];
          const dx = coords[0] - prevCoords[0];
          const dy = coords[1] - prevCoords[1];
          heading = (Math.atan2(dx, dy) * 180 / Math.PI + 360) % 360;
        }

        // Apply new fake position and speed (fake 80 km/h)
        get().updateDriverLocation(newLocation, heading, 80); 

      }, 400); // tick every 400ms

      get().addLog(
        `✅ Route found: ${distKm}km via roads, ETA ${etaMin} min (${route.steps.length} turns)`,
        'SUCCESS'
      );
    } else {
      set({ isRouteLoading: false });
      get().addLog('❌ Failed to calculate route. Check network/API.', 'WARNING');
    }
  },

  stopDispatch: () => {
    if (simulationInterval) clearInterval(simulationInterval);
    set({
      currentRoute: null,
      lastRouteCalcLocation: null,
      hasCongestion: false,
      isBroadcasting: false,
      signals: [],
      normalRouteEta: null,
      timeSaved: null,
    });
    set((s) => ({ ambulance: { ...s.ambulance, status: 'IDLE', speed: 0 } }));
    get().addLog('Dispatch cancelled. Returning to standby.', 'INFO');
  },

  recalculateRoute: async () => {
    const { ambulance, selectedHospitalId, hospitals, emergencyMode } = get();
    if (!selectedHospitalId) return;

    const hospital = hospitals.find((h) => h.id === selectedHospitalId);
    if (!hospital) return;

    const route = await fetchRoute(
      ambulance.location,
      hospital.location,
      emergencyMode,
      ambulance.id,
      hospital.id
    );

    if (route) {
      set({
        currentRoute: route,
        lastRouteCalcLocation: { ...ambulance.location },
      });
    }
  },

  addLog: (message, type) => {
    const newLog: ActivityLogEntry = {
      id: Math.random().toString(36).substring(7),
      timestamp: new Date(),
      message,
      type,
    };
    set((s) => ({ logs: [newLog, ...s.logs].slice(0, 50) }));
  },

  broadcastAlert: (message) => {
    set({ isBroadcasting: true });
    get().addLog(`📢 PUBLIC AUDIO BROADCAST: "${message}"`, 'EMERGENCY');
    // Simulating clearing the congestion shortly after broadcast
    setTimeout(() => {
      set({ hasCongestion: false, isBroadcasting: false });
      get().addLog('🛣️ Traffic yielding. Road congestion clearing up...', 'SUCCESS');
    }, 2500);
  },
}));
