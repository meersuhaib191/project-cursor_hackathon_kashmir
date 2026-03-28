'use client';

import { useLifeLineStore } from '@/lib/store';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { MapPin, ShieldCheck, ShieldAlert } from 'lucide-react';
import { isPointNearRoute } from '@/lib/routing';

export function SignalList() {
  const { signals, currentRoute, ambulance } = useLifeLineStore();

  const activeSignals = currentRoute && ambulance.status === 'EMERGENCY'
    ? signals.filter(s => isPointNearRoute(s.location, currentRoute.geometry.coordinates as [number, number][], 150))
    : [];

  return (
    <Card variant="glass" className="mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center">
          <ShieldCheck className="mr-2 h-4 w-4 text-green-500" />
          Traffic Management AI
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {activeSignals.map((signal) => (
            <div key={signal.id} className="flex items-center justify-between border-b border-slate-700/50 pb-2 last:border-0 last:pb-0">
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-slate-200">{signal.name}</span>
                <span className="text-[10px] text-slate-500 uppercase flex items-center mt-0.5">
                  <MapPin className="h-2 w-2 mr-1" /> Intersection ID: {signal.id}
                </span>
              </div>
              <Badge 
                variant={signal.status === 'GREEN' ? 'success' : 'destructive'}
                className="text-[10px] py-0 h-5"
              >
                {signal.status}
              </Badge>
            </div>
          ))}
          {activeSignals.length === 0 && (
            <div className="text-xs text-slate-500 text-center py-4">
              No active signals in vicinity.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
