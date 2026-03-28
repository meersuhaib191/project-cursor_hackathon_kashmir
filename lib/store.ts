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
  isDispatching: boolean;
  pickupAddress: string;
  activeTarget: { id: string, name: string, location: Location } | null;
  normalRouteEta: number | null;   // seconds — what it would take without emergency
  timeSaved: number | null;        // seconds — time saved by emergency routing

  // Actions
  setGpsActive: (active: boolean) => void;
  updateDriverLocation: (location: Location, heading: number, speed: number) => void;
  selectPickup: (pickupId: string) => void;
  selectHospital: (hospitalId: string) => void;
  toggleEmergencyMode: () => void;
  startDispatch: (targetType: 'PICKUP' | 'HOSPITAL') => Promise<void>;
  stopDispatch: () => void;
  recalculateRoute: () => Promise<void>;
  setPickupAddress: (address: string) => void;
  geocodePickupAddress: () => Promise<void>;
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
  isDispatching: false,
  pickupAddress: '',
  activeTarget: null,
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
    const { ambulance, currentRoute, lastRouteCalcLocation, signals, activeTarget } = get();

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
    if (activeTarget) {
      const distToNode = haversineDistance(location, activeTarget.location);
      if (distToNode < 30) {
        if (simulationInterval) clearInterval(simulationInterval);
        set({ 
          currentRoute: null, 
          hasCongestion: false, 
          signals: [], 
          normalRouteEta: null, 
          timeSaved: null,
          activeTarget: null, // Reset target on arrival
          isDispatching: false
        });
        set((s) => ({ ambulance: { ...s.ambulance, status: 'ARRIVED' } }));
        const isPickup = activeTarget.id === 'CUSTOM' || activeTarget.id.startsWith('P');
        get().addLog(isPickup ? `🎯 Reached Pickup Origin: ${activeTarget.name}` : `🏥 Arrived at hospital: ${activeTarget.name}. Mission segment complete!`, 'SUCCESS');
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
      get().addLog(`Target Pickup Location set: ${pickup.name}. Ready for routing.`, 'INFO');
    }
  },

  setPickupAddress: (address) => set({ pickupAddress: address }),

  geocodePickupAddress: async () => {
    const { pickupAddress } = get();
    if (!pickupAddress || pickupAddress.trim().length < 3) return;

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(pickupAddress)}.json?proximity=74.79,34.08&bbox=74.75,34.05,74.85,34.12&access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`
      );
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        const feature = data.features[0];
        const [lng, lat] = feature.center;
        
        // Generate a random stable ID for this custom point
        const customId = `CUSTOM-${Math.random().toString(36).substring(7)}`;
        
        // Use a temporary 'PICKUP' landmark in the store if needed, 
        // but for now we just select it by location
        set({ selectedPickupId: customId });
        
        // We'll hijack the selection logic by pushing this to a temporary store state or just setting the ambulance location to this new point
        // For 'Route to Pickup' to work, we need an ID that the startDispatch can find.
        // Let's modify startDispatch to handle custom coordinates.
        
        get().addLog(`📍 Location identified: ${feature.place_name}`, 'SUCCESS');
        
        // Temporarily store the coordinate for the 'PICKUP' route
        (get() as any).customPickupLocation = { lat, lng };
      } else {
        get().addLog('❌ Could not find that location in Srinagar. Try a more specific street name.', 'WARNING');
      }
    } catch (err) {
      console.error('Geocoding error:', err);
      get().addLog('❌ Connection error during location search.', 'WARNING');
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

  startDispatch: async (targetType) => {
    const { ambulance, selectedHospitalId, selectedPickupId, hospitals, emergencyMode } = get();
    
    let targetNode: any = null;
    if (targetType === 'HOSPITAL') {
      if (!selectedHospitalId) {
        get().addLog('⚠️ Select a hospital destination first!', 'WARNING');
        return;
      }
      targetNode = hospitals.find((h) => h.id === selectedHospitalId);
    } else if (targetType === 'PICKUP') {
      const customLoc = (get() as any).customPickupLocation;
      if (customLoc) {
        targetNode = { id: 'CUSTOM', name: get().pickupAddress, location: customLoc };
      } else {
        if (!selectedPickupId || selectedPickupId === 'GPS' || selectedPickupId === 'DEFAULT') {
          get().addLog('⚠️ Enter and search for a pickup location in the box first!', 'WARNING');
          return;
        }
        const { PICKUP_LOCATIONS } = require('./mapConfig');
        targetNode = PICKUP_LOCATIONS.find((p: any) => p.id === selectedPickupId);
      }
    }

    if (!targetNode) return;

    set({ isRouteLoading: true, activeTarget: targetNode, isDispatching: true });
    get().addLog(`🚑 Dispatching to ${targetNode.name}...`, 'EMERGENCY');

    const route = await fetchRoute(
      ambulance.location,
      targetNode.location,
      emergencyMode,
      ambulance.id,
      targetNode.id
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
        targetNode.location,
        false, // standard driving profile
        ambulance.id,
        targetNode.id
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
          // Snap directly to the target pin (pickup or hospital) to artificially trigger the < 30m arrival threshold
          const { PICKUP_LOCATIONS } = require('./mapConfig');
          let targetPin = get().hospitals.find(h => h.id === currentRoute.destinationId)?.location;
          if (!targetPin) {
            targetPin = PICKUP_LOCATIONS.find((p: any) => p.id === currentRoute.destinationId)?.location;
          }
          if (targetPin) {
            newLocation.lat = targetPin.lat;
            newLocation.lng = targetPin.lng;
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
      set({ isRouteLoading: false, isDispatching: false });
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
      isDispatching: false,
      activeTarget: null,
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
