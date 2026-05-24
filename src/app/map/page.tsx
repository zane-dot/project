'use client';

import dynamic from 'next/dynamic';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const MapView = dynamic(() => import('@/components/map/map-view').then((m) => m.MapView), {
  ssr: false,
  loading: () => (
    <div className="h-[70vh] w-full flex items-center justify-center text-muted-foreground">
      載入地圖中…
    </div>
  ),
});

export default function MapPage() {
  return (
    <div className="container py-8">
      <div className="mb-4 flex items-center justify-between flex-wrap gap-2">
        <div>
          <Badge variant="accent" className="mb-2">地圖模式</Badge>
          <h1 className="text-3xl font-bold">MTR 站點 + 各區租金熱力</h1>
        </div>
      </div>
      <Card>
        <CardContent className="p-0 overflow-hidden rounded-xl">
          <MapView />
        </CardContent>
      </Card>
    </div>
  );
}
