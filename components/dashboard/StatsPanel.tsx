'use client';

import { useLifeLineStore } from '@/lib/store';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Clock, Route, Zap, Navigation2, TrendingDown, Timer, Siren } from 'lucide-react';

function formatDuration(seconds: number): string {
  if (seconds <= 0) return '--:--';
  const min = Math.floor(seconds / 60);
  const sec = Math.floor(seconds % 60);
  return `${min}:${sec.toString().padStart(2, '0')}`;
}

function formatDistance(meters: number): string {
  if (meters <= 0) return '0m';
  if (meters < 1000) return `${Math.round(meters)}m`;
  return `${(meters / 1000).toFixed(1)}km`;
}

export function StatsPanel() {
  const { currentRoute, ambulance, normalRouteEta, timeSaved } = useLifeLineStore();

  const stats = [
    {
      label: 'ETA',
      value: currentRoute ? formatDuration(currentRoute.duration) : '--:--',
      sub: currentRoute ? 'traffic-aware' : '',
      icon: Clock,
      color: 'text-blue-400',
    },
    {
      label: 'Road Distance',
      value: currentRoute ? formatDistance(currentRoute.distance) : '0m',
      sub: currentRoute ? 'via roads' : '',
      icon: Route,
      color: 'text-purple-400',
    },
    {
      label: 'Speed',
      value: ambulance.speed > 0 ? `${Math.round(ambulance.speed)}` : '0',
      sub: 'km/h',
      icon: Zap,
      color: 'text-yellow-400',
    },
    {
      label: 'Turns',
      value: currentRoute ? `${currentRoute.steps.length}` : '0',
      sub: 'maneuvers',
      icon: Navigation2,
      color: 'text-green-400',
    },
  ];

  const savedMinutes = timeSaved ? Math.ceil(timeSaved / 60) : 0;
  const savedPercent = (normalRouteEta && timeSaved) ? Math.round((timeSaved / normalRouteEta) * 100) : 0;

  return (
    <>
      <div className="grid grid-cols-2 gap-3 mb-4">
        {stats.map((stat) => (
          <Card key={stat.label} variant="glass">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0 pt-3 px-4">
              <CardTitle className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                {stat.label}
              </CardTitle>
              <stat.icon className={`h-3 w-3 ${stat.color}`} />
            </CardHeader>
            <CardContent className="px-4 pb-3 pt-1">
              <div className="text-xl font-bold text-slate-100">{stat.value}</div>
              {stat.sub && (
                <p className="text-[9px] text-slate-500 font-medium">{stat.sub}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Route Comparison Overlay */}
      {currentRoute && normalRouteEta && timeSaved !== null && (
        <Card variant="glass" className="mb-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500" />
          <CardHeader className="pb-1 pt-3">
            <CardTitle className="text-[10px] font-medium text-slate-400 uppercase tracking-wider flex items-center">
              <TrendingDown className="h-3 w-3 mr-1 text-green-400" />
              Route Comparison
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-3">
            <div className="space-y-2.5">
              {/* Normal Route */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-red-500" />
                  <span className="text-[10px] text-slate-400 font-medium">Standard Route</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Timer className="h-3 w-3 text-red-400" />
                  <span className="text-sm font-bold text-red-400 line-through decoration-red-500/50">
                    {formatDuration(normalRouteEta)}
                  </span>
                </div>
              </div>

              {/* Emergency Route */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[10px] text-slate-400 font-medium">AI Emergency Route</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Siren className="h-3 w-3 text-green-400" />
                  <span className="text-sm font-bold text-green-400">
                    {formatDuration(currentRoute.duration)}
                  </span>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-slate-700/50" />

              {/* Savings Badge */}
              <div className="flex items-center justify-between bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2">
                <div className="flex flex-col">
                  <span className="text-[9px] text-green-400/70 uppercase font-bold tracking-wider">Time Saved</span>
                  <span className="text-lg font-black text-green-400">{savedMinutes} min</span>
                </div>
                <div className="bg-green-500/20 border border-green-500/30 rounded-full px-3 py-1">
                  <span className="text-sm font-black text-green-400">↓ {savedPercent}%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
