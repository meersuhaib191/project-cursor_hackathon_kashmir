'use client';

import { useState, useEffect, useRef } from 'react';
import { useLifeLineStore } from '@/lib/store';
import { PICKUP_LOCATIONS } from '@/lib/mapConfig';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Play, Square, ShieldAlert, Shield, MapPin, Loader2, Navigation, AlertTriangle, Megaphone, Siren, Search, Check, ChevronDown } from 'lucide-react';

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
    pickupAddress,
    setPickupAddress,
    geocodePickupAddress,
    selectPickup,
    selectHospital,
    toggleEmergencyMode,
    startDispatch,
    stopDispatch,
    isDispatching,
    broadcastAlert,
  } = useLifeLineStore();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter pickup locations based on search query
  const filteredPickups = PICKUP_LOCATIONS.filter(loc => 
    loc.name.toLowerCase().includes(pickupAddress.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <Card className="border-slate-800 bg-slate-900/40 backdrop-blur-xl shadow-2xl overflow-visible border-none ring-1 ring-slate-800/50 h-full">
      <CardHeader className="pb-3 border-b border-slate-800/50">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Navigation className="h-4 w-4 text-blue-400" />
            Dispatch Console
          </CardTitle>
          
          {!gpsActive && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-red-500/10 text-red-500 border-red-500/20 text-[8px] px-1.5 py-0">NO GPS</Badge>
              <button 
                onClick={() => {
                  if ("geolocation" in navigator) {
                    navigator.geolocation.getCurrentPosition((pos) => {
                      useLifeLineStore.getState().setAmbulanceLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                      useLifeLineStore.getState().setGpsActive(true);
                    });
                  }
                }}
                className="bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white p-1 rounded transition-colors"
                title="Fetch Device Location"
              >
                <Search className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-4">
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

          {/* Pickup Address Input with Searchable Dropdown */}
          <div className="space-y-1.5 pt-2 relative" ref={dropdownRef}>
            <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              <MapPin className="h-3 w-3 inline mr-1" />
              Patient Pickup Location
            </label>
            <div className="relative group">
              <input
                type="text"
                placeholder="Search or enter location..."
                value={pickupAddress}
                onChange={(e) => {
                  setPickupAddress(e.target.value);
                  setIsDropdownOpen(true);
                }}
                onFocus={() => setIsDropdownOpen(true)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    geocodePickupAddress();
                    setIsDropdownOpen(false);
                  }
                }}
                disabled={isDispatching}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-lg pl-3 pr-10 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  disabled={isDispatching}
                  className="p-1 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  <ChevronDown className={`h-4 w-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                <button
                  onClick={() => {
                    geocodePickupAddress();
                    setIsDropdownOpen(false);
                  }}
                  disabled={isDispatching || !pickupAddress}
                  className="p-1 text-slate-400 hover:text-blue-400 disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
                  title="Search and Set Location"
                >
                  <Search className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Dropdown List */}
            {isDropdownOpen && !isDispatching && (
              <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-48 overflow-y-auto rounded-xl border border-slate-700 bg-slate-900/95 backdrop-blur-xl shadow-2xl animate-in fade-in zoom-in-95 duration-200 scrollbar-hide">
                <div className="p-2">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest px-2 mb-1 block">Suggested Locations</span>
                  {filteredPickups.length > 0 ? (
                    filteredPickups.map((loc) => (
                      <button
                        key={loc.id}
                        onClick={() => {
                          setPickupAddress(loc.name);
                          selectPickup(loc.id);
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs text-left transition-colors ${selectedPickupId === loc.id ? 'bg-blue-500/20 text-blue-400' : 'text-slate-300 hover:bg-slate-800'}`}
                      >
                        <span className="truncate">{loc.name}</span>
                        {selectedPickupId === loc.id && <Check className="h-3 w-3" />}
                      </button>
                    ))
                  ) : (
                    <div className="px-3 py-2 text-[10px] text-slate-500 italic">No landmarks found... hit search for custom address</div>
                  )}
                  
                  <div className="mt-2 pt-2 border-t border-slate-800">
                    <button
                      onClick={() => {
                        geocodePickupAddress();
                        setIsDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-left text-blue-400 hover:bg-blue-500/10 transition-colors"
                    >
                      <Search className="h-3 w-3" />
                      <span className="truncate font-medium">Search for "{pickupAddress || '...'}"</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {!isDispatching && (
              <Button
                onClick={() => startDispatch('PICKUP')}
                variant="emergency"
                className="w-full h-9 text-[10px] uppercase font-bold tracking-wider shadow-[0_0_15px_rgba(220,38,38,0.3)] mt-1 bg-red-600 hover:bg-red-700 active:scale-95 transition-all text-white"
                disabled={!selectedPickupId || selectedPickupId === 'GPS' || selectedPickupId === 'DEFAULT'}
              >
                {isRouteLoading ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <MapPin className="mr-2 h-3.5 w-3.5" />}
                Route to Pickup
              </Button>
            )}
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
            {!isDispatching && (
              <Button
                onClick={() => startDispatch('HOSPITAL')}
                variant="emergency"
                className="w-full h-9 text-[10px] uppercase font-bold tracking-wider shadow-[0_0_15px_rgba(220,38,38,0.2)] mt-1"
                disabled={!selectedHospitalId}
              >
                {isRouteLoading ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <Siren className="mr-2 h-3.5 w-3.5" />}
                Route to Hospital
              </Button>
            )}
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

          {/* Active Dispatch Controls */}
          {isDispatching && (
            <div className="pt-2">
              <Button onClick={stopDispatch} variant="destructive" className="w-full h-10 uppercase font-bold tracking-widest text-xs">
                <Square className="mr-2 h-4 w-4" /> Abort Mission
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
