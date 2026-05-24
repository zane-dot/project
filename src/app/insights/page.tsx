'use client';

import { useMemo, useState } from 'react';
import { DISTRICTS } from '@/data/districts';
import { Card, CardContent } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const REGIONS = ['全部', 'HK Island', 'Kowloon', 'New Territories'] as const;

export default function InsightsPage() {
  const [region, setRegion] = useState<(typeof REGIONS)[number]>('全部');

  const data = useMemo(() => {
    const list = region === '全部' ? DISTRICTS : DISTRICTS.filter((d) => d.region === region);
    return list
      .sort((a, b) => b.avgPsf - a.avgPsf)
      .map((d) => ({
        name: d.nameZh,
        呎租: d.avgPsf,
        月租: Math.round(d.avgRent / 1000),
        同比: d.yoy,
      }));
  }, [region]);

  return (
    <div className="container py-12">
      <div className="mb-8">
        <Badge variant="accent" className="mb-3">租金洞察 · 基於 RVD 2026 Q1</Badge>
        <h1 className="text-4xl font-bold mb-2">香港 18 區租金一目了然</h1>
        <p className="text-muted-foreground">數據來源：差餉物業估價署私人住宅租金統計</p>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {REGIONS.map((r) => (
          <Button
            key={r}
            size="sm"
            variant={region === r ? 'default' : 'outline'}
            onClick={() => setRegion(r)}
          >
            {r}
          </Button>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">平均呎租排行 (HKD/呎/月)</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={data} layout="vertical" margin={{ left: 30 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" width={70} />
                <Tooltip />
                <Bar dataKey="呎租" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">~500 呎單位平均月租 (千 HKD)</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={data} layout="vertical" margin={{ left: 30 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" width={70} />
                <Tooltip />
                <Bar dataKey="月租" fill="hsl(var(--accent))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold mb-4">同比變動 (%)</h3>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="同比" stroke="hsl(var(--primary))" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
