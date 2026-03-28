import { Location, RouteData, RouteStep } from '../types';

/**
 * Mapbox Directions API integration.
 * Uses the driving-traffic profile for traffic-aware routing.
 * Returns road-following polylines — NEVER straight-line paths.
 */

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

type MapboxProfile = 'mapbox/driving-traffic' | 'mapbox/driving';

interface DirectionsResponse {
  routes: Array<{
    geometry: GeoJSON.LineString;
    distance: number;
    duration: number;
    legs: Array<{
      steps: Array<{
        maneuver: {
          instruction: string;
          type: string;
          modifier?: string;
          location: [number, number];
        };
        distance: number;
        duration: number;
      }>;
    }>;
  }>;
  code: string;
}

/**
 * Fetch a road-following route between two points using the Mapbox Directions API.
 * 
 * @param origin - Driver's current GPS location
 * @param destination - Selected hospital location
 * @param emergencyMode - If true, uses traffic profile for fastest route
 * @param ambulanceId - Identifier for the ambulance
 * @param destinationId - Identifier for the destination hospital
 */
export async function fetchRoute(
  origin: Location,
  destination: Location,
  emergencyMode: boolean,
  ambulanceId: string,
  destinationId: string
): Promise<RouteData | null> {
  if (!MAPBOX_TOKEN) {
    console.error('[Routing] Mapbox token not configured');
    return null;
  }

  // Use driving-traffic for traffic-aware routing in emergency mode
  const profile: MapboxProfile = emergencyMode
    ? 'mapbox/driving-traffic'
    : 'mapbox/driving';

  const coordinates = `${origin.lng},${origin.lat};${destination.lng},${destination.lat}`;

  const params = new URLSearchParams({
    access_token: MAPBOX_TOKEN,
    geometries: 'geojson',       // get GeoJSON LineString directly (no decode needed)
    overview: 'full',             // full resolution geometry
    steps: 'true',                // turn-by-turn instructions
    alternatives: 'false',
    annotations: 'speed,duration',
  });

  const url = `https://api.mapbox.com/directions/v5/${profile}/${coordinates}?${params}`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.error('[Routing] Mapbox API error:', res.status, await res.text());
      return null;
    }

    const data: DirectionsResponse = await res.json();

    if (data.code !== 'Ok' || !data.routes.length) {
      console.error('[Routing] No routes found:', data.code);
      return null;
    }

    const route = data.routes[0];
    const steps: RouteStep[] = [];

    // Extract turn-by-turn steps from all legs
    for (const leg of route.legs) {
      for (const step of leg.steps) {
        steps.push({
          instruction: step.maneuver.instruction,
          distance: step.distance,
          duration: step.duration,
          maneuver: {
            type: step.maneuver.type,
            modifier: step.maneuver.modifier,
            location: step.maneuver.location,
          },
        });
      }
    }

    return {
      geometry: route.geometry,        // GeoJSON LineString following roads
      distance: route.distance,        // road distance in meters
      duration: route.duration,         // traffic-aware ETA in seconds
      steps,
      ambulanceId,
      destinationId,
    };
  } catch (err) {
    console.error('[Routing] Network error:', err);
    return null;
  }
}

/**
 * Haversine distance — ONLY used for distance checks (e.g. "has driver moved enough to recalculate?")
 * NOT used for route distance or ETA. Those come exclusively from the Directions API.
 */
export function haversineDistance(l1: Location, l2: Location): number {
  const R = 6371e3;
  const phi1 = (l1.lat * Math.PI) / 180;
  const phi2 = (l2.lat * Math.PI) / 180;
  const dPhi = ((l2.lat - l1.lat) * Math.PI) / 180;
  const dLambda = ((l2.lng - l1.lng) * Math.PI) / 180;

  const a =
    Math.sin(dPhi / 2) * Math.sin(dPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(dLambda / 2) * Math.sin(dLambda / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function isPointNearRoute(point: Location, routeCoords: [number, number][], thresholdMeters: number = 100): boolean {
  for (const coord of routeCoords) {
    const dist = haversineDistance(point, { lng: coord[0], lat: coord[1] });
    if (dist <= thresholdMeters) return true;
  }
  return false;
}
