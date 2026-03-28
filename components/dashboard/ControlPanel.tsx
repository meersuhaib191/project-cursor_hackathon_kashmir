'use client';

import { useLifeLineStore } from '@/lib/store';
import { PICKUP_LOCATIONS } from '@/lib/mapConfig';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Play, Square, ShieldAlert, Shield, MapPin, Loader2, Navigation, AlertTriangle, Megaphone } from 'lucide-react';

export function ControlPanel() {
  const {
    ambulance,
    hospitals,
    selectedPickupId,
    selectedHospitalId,
    emergencyMode,
    isRouteLoading,
    gpsActive,
    hasCongestion,
    isBroadcasting,
    selectPickup,
    selectHospital,
    toggleEmergencyMode,
    startDispatch,
    stopDispatch,
    broadcastAlert,
  } = useLifeLineStore();

  const isDispatching = ambulance.status === 'EMERGENCY';

  return (
    <Card variant={isDispatching ? 'emergency' : 'glass'} className="mb-4">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Mission Control</CardTitle>
        <div className="flex items-center gap-2">
          {gpsActive ? (
            <Badge variant="success" className="text-[9px] h-4 inline-flex">
              <Navigation className="h-2 w-2 mr-1" /> GPS LIVE
            </Badge>
          ) : (
            <div className="flex items-center gap-1.5">
              <Badge variant="destructive" className="text-[9px] h-4 animate-pulse">
                NO GPS
              </Badge>
              <button 
                onClick={() => {
                  if (typeof window !== 'undefined' && 'geolocation' in navigator) {
                    navigator.geolocation.getCurrentPosition(
                      (position) => {
                        useLifeLineStore.getState().setAmbulanceLocation({
                          lat: position.coords.latitude,
                          lng: position.coords.longitude
                        });
                        useLifeLineStore.getState().setGpsActive(true);
                        useLifeLineStore.getState().addLog('Manual GPS lock acquired.', 'SUCCESS');
                      },
                      (error) => {
                        console.warn('Manual GPS failed:', error);
                        useLifeLineStore.getState().addLog('Failed to acquire GPS. Permission denied or unavailable.', 'WARNING');
                      },
                      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
                    );
                  }
                }}
                className="bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white p-1 rounded transition-colors"
                title="Fetch Device Location"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="2" y2="6"/><line x1="12" x2="12" y1="18" y2="22"/><line x1="2" x2="6" y1="12" y2="12"/><line x1="18" x2="22" y1="12" y2="12"/></svg>
              </button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-4">
          {/* Ambulance ID */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Unit: {ambulance.id}</span>
            <Badge
              variant={
                ambulance.status === 'EMERGENCY'
                  ? 'emergency'
                  : ambulance.status === 'ARRIVED'
                  ? 'success'
                  : 'secondary'
              }
            >
              {ambulance.status}
            </Badge>
          </div>

          {/* Origin Dropdown */}
          <div className="space-y-1.5 pt-2">
            <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              <MapPin className="h-3 w-3 inline mr-1" />
              Pickup Origin
            </label>
            <select
              value={selectedPickupId || ''}
              onChange={(e) => selectPickup(e.target.value)}
              disabled={isDispatching}
              className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
            >
              <option value="DEFAULT" disabled>
                Select pickup point...
              </option>
              <option value="GPS" className="text-blue-400 font-semibold">
                [LIVE] Device GPS
              </option>
              {PICKUP_LOCATIONS.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name}
                </option>
              ))}
            </select>
          </div>

          {/* Hospital Dropdown */}
          <div className="space-y-1.5 pt-1">
            <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              <MapPin className="h-3 w-3 inline mr-1" />
              Destination Hospital
            </label>
            <select
              value={selectedHospitalId || ''}
              onChange={(e) => selectHospital(e.target.value)}
              disabled={isDispatching}
              className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
            >
              <option value="" disabled>
                Select hospital...
              </option>
              {hospitals.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name}
                </option>
              ))}
            </select>
          </div>

          {/* Emergency Mode Static Indicator */}
          <div className="flex items-center justify-between w-full px-3 py-2.5 rounded-lg border bg-red-950/50 border-red-500/50 text-red-400">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-red-500 animate-pulse" />
              <span className="text-xs font-semibold tracking-wide">Emergency Mode</span>
            </div>
            <Badge variant="emergency" className="text-[9px] px-1.5 py-0 h-4">ALWAYS ON</Badge>
          </div>
          <p className="text-[10px] text-red-400/70 -mt-2 px-1">
            Traffic-aware routing · Faster roads prioritized · Signals auto-cleared
          </p>

          {/* Congestion Alert & Broadcast */}
          {hasCongestion && isDispatching && (
            <div className="bg-yellow-500/10 border border-yellow-500/50 rounded-lg p-3 flex flex-col space-y-2 relative overflow-hidden animate-in slide-in-from-right-4 fade-in duration-300 shadow-lg">
              <div className="absolute top-0 right-0 w-16 h-16 bg-yellow-500/20 blur-xl rounded-full" />
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-500 animate-pulse" />
                <span className="text-[11px] font-bold text-yellow-500 uppercase tracking-widest">Congestion Ahead</span>
              </div>
              <p className="text-[10px] text-yellow-400/80 leading-snug">
                AI Scanner detected bottleneck on current route. Broadcast alert recommended.
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                className={`w-full mt-1 border-yellow-500/50 text-[10px] uppercase tracking-wider font-bold transition-all ${
                  isBroadcasting 
                    ? 'bg-yellow-500/40 text-yellow-100' 
                    : 'bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-500'
                }`}
                disabled={isBroadcasting}
                onClick={() => broadcastAlert("clear the road and give way as ambulance is approaching")}
              >
                {isBroadcasting ? (
                  <><Loader2 className="mr-2 h-3 w-3 animate-spin" /> Transmitting Audio...</>
                ) : (
                  <><Megaphone className="mr-2 h-3 w-3" /> Broadcast Clearance</>
                )}
              </Button>
            </div>
          )}

          {/* Dispatch Controls */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            {!isDispatching ? (
              <Button
                onClick={startDispatch}
                variant="emergency"
                className="w-full col-span-2"
                disabled={!selectedHospitalId || isRouteLoading}
              >
                {isRouteLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Calculating Route...
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" /> Start Dispatch
                  </>
                )}
              </Button>
            ) : (
              <Button onClick={stopDispatch} variant="destructive" className="w-full col-span-2">
                <Square className="mr-2 h-4 w-4" /> Cancel Dispatch
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
