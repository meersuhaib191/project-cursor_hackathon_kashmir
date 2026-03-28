'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { ControlPanel } from '@/components/dashboard/ControlPanel';
import { StatsPanel } from '@/components/dashboard/StatsPanel';
import { SignalList } from '@/components/dashboard/SignalList';
import { ActivityLog } from '@/components/dashboard/ActivityLog';
import { useLifeLineStore } from '@/lib/store';
import { Ambulance, Activity, Siren, Bell } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

// Dynamic import for MapView (SSR: false)
const MapView = dynamic(() => import('@/components/dashboard/MapView').then(mod => mod.MapView), { 
  ssr: false,
  loading: () => (
    <div className="flex-1 bg-slate-900 animate-pulse flex items-center justify-center">
      <div className="flex flex-col items-center">
        <Activity className="h-12 w-12 text-slate-700 animate-bounce mb-4" />
        <span className="text-slate-500 font-medium">Initializing Neural Grid...</span>
      </div>
    </div>
  )
});

export default function DashboardPage() {
  const { ambulance, setAmbulanceLocation, setGpsActive, addLog } = useLifeLineStore();
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (useLifeLineStore.getState().ambulance.status === 'IDLE') {
            setAmbulanceLocation({
              lat: position.coords.latitude,
              lng: position.coords.longitude
            });
            setGpsActive(true);
            addLog('GPS lock acquired. Source node set to device location.', 'SUCCESS');
          }
        },
        (error) => {
          console.warn('Geolocation failed:', error);
          addLog('Failed to acquire GPS lock. Please manually fetch GPS if needed.', 'WARNING');
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    }
  }, [setAmbulanceLocation, setGpsActive, addLog]);

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Sidebar Navigation (Slim) */}
      <aside className="w-16 border-r border-slate-800 bg-slate-900/50 backdrop-blur-xl flex flex-col items-center py-6 space-y-8 flex-shrink-0 z-30">
        <div className="bg-red-600 p-2 rounded-xl shadow-[0_0_15px_rgba(220,38,38,0.4)]">
          <Siren className="h-5 w-5 text-white" />
        </div>

        <nav className="flex flex-col space-y-6 flex-1 items-center w-full relative">
          <button className="p-2 text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded-xl transition-all">
            <Activity className="h-5 w-5" />
          </button>
          
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className={`p-2 transition-all rounded-xl relative ${showNotifications ? 'bg-slate-800 text-white shadow-inner' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'}`}
            >
              <Bell className="h-5 w-5" />
              <div className="absolute top-1.5 right-1.5 h-1.5 w-1.5 bg-red-500 rounded-full animate-pulse"></div>
            </button>

            {/* Notifications Popover */}
            {showNotifications && (
              <div className="absolute left-14 top-0 w-80 bg-slate-900/95 backdrop-blur-3xl border border-slate-700/80 rounded-2xl shadow-2xl p-5 ml-4 flex flex-col animate-in fade-in slide-in-from-left-4 duration-200">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xs font-bold text-slate-100 uppercase tracking-widest">Pending Dispatches</h3>
                  <Badge variant="emergency" className="text-[9px] px-1.5 py-0 h-4">1 NEW</Badge>
                </div>
                
                <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4 flex flex-col relative overflow-hidden group hover:border-blue-500/40 transition-colors cursor-pointer">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/10 blur-xl rounded-full"></div>
                  
                  <div className="flex items-start justify-between relative z-10">
                    <Badge variant="secondary" className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-[9px] px-1.5 py-0">NEXT PICKUP</Badge>
                    <span className="text-[10px] text-slate-400 font-medium">In 12 mins</span>
                  </div>
                  
                  <div className="flex flex-col space-y-1 relative z-10 mt-3">
                    <span className="text-sm font-bold text-slate-200">Cardiac Emergency (Priority 1)</span>
                    <span className="text-xs text-slate-400">Pickup: Rajbagh Sector 4, House 112</span>
                    <span className="text-xs text-slate-400 mt-0.5">Drop: SMHS Hospital ICU</span>
                  </div>
                  
                  <div className="flex items-center space-x-3 mt-4 pt-3 border-t border-slate-700/80 relative z-10">
                    <div className="h-7 w-7 rounded-full bg-slate-950 flex items-center justify-center border border-slate-800 shadow-inner">
                      <span className="text-[9px] font-bold text-slate-300">PT</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-slate-200">Male, 58 yrs</span>
                      <span className="text-[9px] text-slate-500 font-medium">History of Arrhythmia</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex overflow-hidden">
        {/* Map View Section */}
        <section className="flex-1 flex flex-col relative">
          {/* Dashboard Header Overlay */}
          <header className="absolute top-0 left-0 right-0 p-6 z-20 flex justify-between items-start pointer-events-none">
            <div className="bg-slate-900/40 backdrop-blur-md border border-slate-700/50 rounded-2xl p-4 flex items-center shadow-2xl pointer-events-auto">
              <div className="h-10 w-10 bg-red-600/20 rounded-lg flex items-center justify-center mr-4 border border-red-500/30">
                <Ambulance className="h-6 w-6 text-red-500" />
              </div>
              <div className="flex flex-col pr-4 border-r border-slate-700/50">
                <h1 className="text-lg font-bold tracking-tight">LifeLine AI</h1>
                <span className="text-[10px] uppercase text-slate-500 font-bold tracking-widest">Ambulance Routing System</span>
              </div>
              <div className="pl-4 flex flex-col">
                <Badge variant={ambulance.status === 'EMERGENCY' ? 'emergency' : 'secondary'} className="text-[9px] h-4 mb-1">
                  {ambulance.status === 'EMERGENCY' ? 'CRITICAL DISPATCH' : 'SYSTEM READY'}
                </Badge>
                <span className="text-[10px] text-slate-400 font-medium">Node: SRINAGAR-HQ-01</span>
              </div>
            </div>
          </header>

          <MapView />
        </section>

        {/* Right Info Panels */}
        <aside className="w-96 border-l border-slate-800 bg-slate-900/50 backdrop-blur-xl flex flex-col p-6 space-y-0 overflow-y-auto overflow-x-hidden scrollbar-hide">
          <ControlPanel />
          <StatsPanel />
          <SignalList />
          <ActivityLog />
          
          <div className="pt-6 mt-auto text-center border-t border-slate-800">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
              Powered by Advanced Routing Intelligence v1.0
            </p>
          </div>
        </aside>
      </main>
    </div>
  );
}
