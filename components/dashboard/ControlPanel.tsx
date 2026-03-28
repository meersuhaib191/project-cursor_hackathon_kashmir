'use client';

import { useLifeLineStore } from '@/lib/store';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Play, Square, ShieldAlert, Shield, MapPin, Loader2, Navigation, AlertTriangle, Megaphone } from 'lucide-react';

export function ControlPanel() {
  const {
    ambulance,
    hospitals,
    selectedHospitalId,
    emergencyMode,
    isRouteLoading,
    gpsActive,
    hasCongestion,
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
            <Badge variant="success" className="text-[9px] h-4">
              <Navigation className="h-2 w-2 mr-1" /> GPS LIVE
            </Badge>
          ) : (
            <Badge variant="destructive" className="text-[9px] h-4 animate-pulse">
              NO GPS
            </Badge>
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

          {/* Hospital Dropdown */}
          <div className="space-y-1.5">
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

          {/* Emergency Mode Toggle */}
          <button
            onClick={toggleEmergencyMode}
            className={`flex items-center justify-between w-full px-3 py-2.5 rounded-lg border transition-all ${
              emergencyMode
                ? 'bg-red-950/50 border-red-500/50 text-red-400'
                : 'bg-slate-800/50 border-slate-700 text-slate-400'
            }`}
          >
            <div className="flex items-center gap-2">
              {emergencyMode ? (
                <ShieldAlert className="h-4 w-4 text-red-500" />
              ) : (
                <Shield className="h-4 w-4" />
              )}
              <span className="text-xs font-semibold">Emergency Mode</span>
            </div>
            <div
              className={`w-9 h-5 rounded-full transition-all relative ${
                emergencyMode ? 'bg-red-600' : 'bg-slate-700'
              }`}
            >
              <div
                className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-md transition-all ${
                  emergencyMode ? 'left-[18px]' : 'left-0.5'
                }`}
              />
            </div>
          </button>
          {emergencyMode && (
            <p className="text-[10px] text-red-400/70 -mt-2 px-1">
              Traffic-aware routing · Faster roads prioritized · Signals auto-cleared
            </p>
          )}

          {/* Congestion Alert & Broadcast */}
          {hasCongestion && isDispatching && (
            <div className="bg-yellow-500/10 border border-yellow-500/50 rounded-lg p-3 flex flex-col space-y-2 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-yellow-500/20 blur-xl rounded-full" />
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-500 animate-pulse" />
                <span className="text-xs font-bold text-yellow-500">SEVERE CONGESTION</span>
              </div>
              <p className="text-[10px] text-yellow-400/80 leading-snug">
                Heavy traffic flow blocking current routed path. Broadcast clearance required.
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full mt-1 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-500 border-yellow-500/50 text-[10px] uppercase tracking-wider font-bold"
                onClick={() => broadcastAlert("clear the road and give way as ambulance is approaching")}
              >
                <Megaphone className="mr-2 h-3 w-3" /> Broadcast Clearance
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
