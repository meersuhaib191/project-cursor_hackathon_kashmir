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
  const { ambulance } = useLifeLineStore();

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Sidebar / Sidebar Navigation (Slim) */}
      <aside className="w-16 border-r border-slate-800 flex flex-col items-center py-6 space-y-8 glass">
        <div className="bg-red-600 p-2 rounded-xl shadow-[0_0_15px_rgba(220,38,38,0.4)]">
          <Siren className="h-6 w-6 text-white" />
        </div>
        <nav className="flex flex-col space-y-6 flex-1">
          <button className="p-2 text-blue-500 bg-blue-500/10 rounded-lg">
            <Activity className="h-5 w-5" />
          </button>
          <button className="p-2 text-slate-500 hover:text-slate-300 transition-colors">
            <Bell className="h-5 w-5" />
          </button>
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
