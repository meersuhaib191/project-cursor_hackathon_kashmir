'use client';

import { useLifeLineStore } from '@/lib/store';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ShieldCheck, ShieldAlert, Navigation, Info, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';

function formatTimestamp(date: Date): string {
  const h = date.getHours().toString().padStart(2, '0');
  const m = date.getMinutes().toString().padStart(2, '0');
  const s = date.getSeconds().toString().padStart(2, '0');
  return `${h}:${m}:${s}`;
}

export function ActivityLog() {
  const { logs } = useLifeLineStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'EMERGENCY': return <ShieldAlert className="h-3 w-3 text-red-500" />;
      case 'SUCCESS': return <ShieldCheck className="h-3 w-3 text-green-500" />;
      case 'WARNING': return <ShieldAlert className="h-3 w-3 text-yellow-500" />;
      default: return <Info className="h-3 w-3 text-blue-500" />;
    }
  };

  return (
    <Card variant="glass" className="flex-1 overflow-hidden flex flex-col min-h-[150px]">
      <CardHeader className="py-3 shrink-0">
        <CardTitle className="text-sm font-medium flex items-center">
          <Navigation className="mr-2 h-4 w-4 text-blue-500" />
          Live Event Log
        </CardTitle>
      </CardHeader>
      <CardContent className="overflow-y-auto px-4 py-2 space-y-3 flex-1 scrollbar-hide">
        {logs.map((log) => (
          <div key={log.id} className="flex gap-3 items-start animate-slide-in">
            <div className="mt-1 shrink-0">{getIcon(log.type)}</div>
            <div className="flex flex-col space-y-0.5">
              <p className="text-xs text-slate-200 leading-tight">{log.message}</p>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] text-slate-500 flex items-center">
                  <Clock className="h-2 w-2 mr-1" />
                  {mounted ? formatTimestamp(log.timestamp) : '--:--:--'}
                </span>
                <Badge
                  variant={log.type === 'EMERGENCY' ? 'destructive' : 'secondary'}
                  className="text-[8px] h-3 px-1 py-0 leading-none"
                >
                  {log.type}
                </Badge>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
