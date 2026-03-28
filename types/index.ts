export type EmergencyStatus = 'IDLE' | 'EMERGENCY' | 'ARRIVED';
export type SignalStatus = 'RED' | 'GREEN' | 'YELLOW';

export interface Location {
  lat: number;
  lng: number;
}

export interface Ambulance {
  id: string;
  location: Location;
  status: EmergencyStatus;
  heading: number;
  speed: number;
}

export interface TrafficSignal {
  id: string;
  location: Location;
  status: SignalStatus;
  name: string;
}

export interface Hospital {
  id: string;
  location: Location;
  name: string;
}

export interface RouteStep {
  instruction: string;
  distance: number;
  duration: number;
  maneuver: {
    type: string;
    modifier?: string;
    location: [number, number];
  };
}

export interface RouteData {
  geometry: GeoJSON.LineString;     // decoded polyline from Mapbox
  distance: number;                 // meters (road distance, NOT straight line)
  duration: number;                 // seconds (traffic-aware ETA)
  steps: RouteStep[];               // turn-by-turn instructions
  ambulanceId: string;
  destinationId: string;
}

export interface ActivityLogEntry {
  id: string;
  timestamp: Date;
  message: string;
  type: 'INFO' | 'WARNING' | 'SUCCESS' | 'EMERGENCY';
}
