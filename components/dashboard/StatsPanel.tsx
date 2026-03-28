'use client';

import { useLifeLineStore } from '@/lib/store';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Clock, Route, Zap, Timer, Navigation2 } from 'lucide-react';

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
  const { currentRoute, ambulance } = useLifeLineStore();

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

  return (
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
  );
}
