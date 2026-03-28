'use client';

import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useLifeLineStore } from '@/lib/store';
import { MAP_CONFIG } from '@/lib/mapConfig';
import { isPointNearRoute } from '@/lib/routing';
import { AlertTriangle, Map as MapIcon, Info } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

export function MapView() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const ambulanceMarker = useRef<mapboxgl.Marker | null>(null);
  const signalMarkers = useRef<{ [key: string]: mapboxgl.Marker }>({});
  const hospitalMarkers = useRef<mapboxgl.Marker[]>([]);
  const mapReady = useRef(false);

  const {
    ambulance,
    signals,
    hospitals,
    currentRoute,
  } = useLifeLineStore();

  const [mapError, setMapError] = useState<string | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainer.current) return;
    if (!MAPBOX_TOKEN) {
      setMapError('Mapbox Access Token is missing. Please add NEXT_PUBLIC_MAPBOX_TOKEN to your .env.local file.');
      return;
    }

    try {
      mapboxgl.accessToken = MAPBOX_TOKEN;

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: MAP_CONFIG.MAP_STYLE,
        center: [MAP_CONFIG.DEFAULT_CENTER.lng, MAP_CONFIG.DEFAULT_CENTER.lat],
        zoom: MAP_CONFIG.DEFAULT_ZOOM,
        pitch: 45,
        bearing: -17,
        antialias: true,
      });

      map.current.on('load', () => {
        mapReady.current = true;

        // 3D buildings
        const layers = map.current?.getStyle()?.layers;
        const labelLayerId = layers?.find(
          (layer) => layer.type === 'symbol' && layer.layout?.['text-field']
        )?.id;

        if (map.current) {
          map.current.addLayer(
            {
              id: 'add-3d-buildings',
              source: 'composite',
              'source-layer': 'building',
              filter: ['==', 'extrude', 'true'],
              type: 'fill-extrusion',
              minzoom: 15,
              paint: {
                'fill-extrusion-color': '#aaa',
                'fill-extrusion-height': ['interpolate', ['linear'], ['zoom'], 15, 0, 15.05, ['get', 'height']],
                'fill-extrusion-base': ['interpolate', ['linear'], ['zoom'], 15, 0, 15.05, ['get', 'min_height']],
                'fill-extrusion-opacity': 0.6,
              },
            },
            labelLayerId
          );
          // Add hospital markers
          hospitals.forEach((hospital) => {
            const el = document.createElement('div');
            el.innerHTML = `
              <div style="display:flex;flex-direction:column;align-items:center;cursor:pointer;filter:drop-shadow(0 4px 10px rgba(0,0,0,0.5));">
                <div style="background:#2563eb;border:2px solid white;border-radius:6px;width:32px;height:32px;display:flex;align-items:center;justify-content:center;box-shadow:0 0 15px rgba(37,99,235,0.7);transition:all 0.3s ease-in-out;">
                  <span style="color:white;font-family:'Arial Black', sans-serif;font-weight:900;font-size:20px;line-height:1;margin-top:-1px;">H</span>
                </div>
                <div style="background:rgba(15,23,42,0.9);backdrop-filter:blur(6px);font-size:9px;color:white;padding:3px 8px;border-radius:6px;margin-top:6px;white-space:nowrap;font-weight:700;border:1px solid rgba(255,255,255,0.1);letter-spacing:0.3px;box-shadow:0 4px 12px rgba(0,0,0,0.5);">${hospital.name}</div>
              </div>
            `;
            const marker = new mapboxgl.Marker(el)
              .setLngLat([hospital.location.lng, hospital.location.lat])
              .addTo(map.current!);
            hospitalMarkers.current.push(marker);
          });
        }
      });

      // Setup Resize Observer to automatically call map resize whenever container dims change
      const resizeObserver = new ResizeObserver(() => {
        if (map.current) {
          map.current.resize();
        }
      });
      resizeObserver.observe(mapContainer.current);

      return () => {
        resizeObserver.disconnect();
        map.current?.remove();
      };
    } catch {
      setMapError('Failed to initialize map. Check your token and credentials.');
    }
  }, [hospitals]);

  // Update Ambulance Marker
  useEffect(() => {
    if (!map.current || !mapReady.current) return;

    if (!ambulanceMarker.current) {
      const el = document.createElement('div');
      el.className = 'ambulance-marker';
      
      const innerHTML = `
        <div style="position:relative;">
          <div style="position:absolute;inset:0;background:#ef4444;border-radius:50%;filter:blur(6px);opacity:0.6;animation:pulse 2s infinite;"></div>
          <div style="position:relative;background:white;padding:6px;border-radius:50%;border:3px solid #dc2626;box-shadow:0 0 15px rgba(220,38,38,0.5);">
            <svg viewBox="0 0 24 24" width="22" height="22" stroke="#dc2626" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
              <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-1.1 0-2 .9-2 2v9c0 1.1.9 2 2 2h14"></path>
              <circle cx="7" cy="17" r="2"></circle><circle cx="17" cy="17" r="2"></circle>
            </svg>
          </div>
        </div>
      `;
      el.innerHTML = innerHTML;

      ambulanceMarker.current = new mapboxgl.Marker(el)
        .setLngLat([ambulance.location.lng, ambulance.location.lat])
        .addTo(map.current);
    } else {
      ambulanceMarker.current.setLngLat([ambulance.location.lng, ambulance.location.lat]);

      // Smooth camera follow during emergency
      if (ambulance.status === 'EMERGENCY') {
        map.current.easeTo({
          center: [ambulance.location.lng, ambulance.location.lat],
          duration: 400,
          essential: true,
        });
      }
    }
  }, [ambulance.location, ambulance.heading, ambulance.status]);

  // Update Signal Markers — fully reactive to dynamically generated signals
  useEffect(() => {
    if (!map.current || !mapReady.current) return;

    // Remove old markers that no longer exist in the new signals array
    const currentSignalIds = new Set(signals.map(s => s.id));
    Object.keys(signalMarkers.current).forEach(id => {
      if (!currentSignalIds.has(id)) {
        signalMarkers.current[id].remove();
        delete signalMarkers.current[id];
      }
    });

    // Create or update markers for each signal
    signals.forEach((signal) => {
      let marker = signalMarkers.current[signal.id];
      
      if (!marker) {
        const el = document.createElement('div');
        el.className = 'signal-marker';
        marker = new mapboxgl.Marker(el)
          .setLngLat([signal.location.lng, signal.location.lat])
          .addTo(map.current!);
        signalMarkers.current[signal.id] = marker;
      }

      const el = marker.getElement();
      const isGreen = signal.status === 'GREEN';
      
      el.innerHTML = `
        <div style="display:flex;flex-direction:column;align-items:center;pointer-events:none;">
          <div style="position:relative;">
            <div style="position:absolute;inset:-4px;border-radius:50%;background:${isGreen ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'};filter:blur(4px);animation:pulse 2s infinite;"></div>
            <div style="position:relative;height:22px;width:22px;border-radius:50%;border:2.5px solid white;box-shadow:0 0 ${isGreen ? '15px rgba(34,197,94,0.8)' : '10px rgba(239,68,68,0.5)'};background:${isGreen ? '#22c55e' : '#ef4444'};transition:all 0.5s ease;transform:scale(${isGreen ? '1.4' : '1'});"></div>
          </div>
          <div style="background:rgba(0,0,0,0.75);backdrop-filter:blur(4px);font-size:8px;color:${isGreen ? '#4ade80' : '#fca5a5'};padding:2px 6px;border-radius:4px;margin-top:5px;white-space:nowrap;font-weight:700;letter-spacing:0.5px;border:1px solid ${isGreen ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'};">${signal.name} · ${isGreen ? 'CLEAR' : 'STOP'}</div>
        </div>
      `;
    });
  }, [signals]);

  // Update Route Layer
  useEffect(() => {
    if (!map.current || !mapReady.current) return;

    const routeData = currentRoute
      ? {
          type: 'Feature' as const,
          properties: {},
          geometry: currentRoute.geometry,
        }
      : { type: 'FeatureCollection' as const, features: [] as never[] };

    if (map.current.getSource('route')) {
      (map.current.getSource('route') as mapboxgl.GeoJSONSource).setData(routeData as GeoJSON.GeoJSON);
    } else if (currentRoute) {
      map.current.addSource('route', { type: 'geojson', data: routeData as GeoJSON.GeoJSON });

      // Glow layer underneath
      map.current.addLayer({
        id: 'route-glow',
        type: 'line',
        source: 'route',
        paint: {
          'line-color': '#10b981',
          'line-width': 14,
          'line-opacity': 0.25,
          'line-blur': 12,
        },
      });

      // Main route line
      map.current.addLayer({
        id: 'route',
        type: 'line',
        source: 'route',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color': '#10b981',
          'line-width': 5,
          'line-opacity': 0.9,
          'line-blur': 0.5,
        },
      });

      // Fit map to show entire route
      const coords = currentRoute.geometry.coordinates as [number, number][];
      const bounds = coords.reduce(
        (b, c) => b.extend(c),
        new mapboxgl.LngLatBounds(coords[0], coords[0])
      );
      map.current.fitBounds(bounds, { padding: 80, duration: 1500 });
    }
  }, [currentRoute]);

  // Error fallback
  if (mapError) {
    return (
      <div className="flex-1 bg-slate-900 flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="grid grid-cols-12 gap-1 w-full h-full">
            {Array.from({ length: 144 }).map((_, i) => (
              <div key={i} className="bg-blue-500 border border-blue-400/20"></div>
            ))}
          </div>
        </div>
        <div className="relative z-10 max-w-md">
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-full p-6 mb-6 inline-block">
            <AlertTriangle className="h-12 w-12 text-yellow-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-100 mb-4">Map Integration Key Missing</h2>
          <p className="text-slate-400 mb-8 leading-relaxed">{mapError}</p>
          <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 text-left border border-slate-700 mb-8">
            <h3 className="text-sm font-semibold text-slate-200 mb-2 flex items-center">
              <Info className="h-4 w-4 mr-2 text-blue-400" /> Quick Setup
            </h3>
            <ol className="text-xs text-slate-400 space-y-2 list-decimal list-inside">
              <li>Sign up free at <a href="https://mapbox.com" target="_blank" className="text-blue-400 underline">mapbox.com</a></li>
              <li>Copy your Default Public Token</li>
              <li>Add <code className="bg-slate-900 px-1 rounded text-pink-400">NEXT_PUBLIC_MAPBOX_TOKEN=your_token</code> to .env.local</li>
              <li>Restart the dev server</li>
            </ol>
          </div>
          <Button variant="secondary" onClick={() => window.location.reload()} className="px-8">
            <MapIcon className="mr-2 h-4 w-4" /> Refresh and Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 relative flex flex-col">
      <div ref={mapContainer} className="flex-1" />
    </div>
  );
}
