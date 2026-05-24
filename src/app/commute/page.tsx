'use client';

import dynamic from 'next/dynamic';
import { useMemo, useState } from 'react';
import { Train, MapPin, Clock, DollarSign, Filter, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MTR_STATIONS } from '@/data/mtr-stations';
import { DISTRICTS } from '@/data/districts';
import { shortestTimesFrom, monthlyCommuteFare } from '@/lib/commute';
import { formatHKD } from '@/lib/utils';

const CommuteMap = dynamic(() => import('@/components/map/commute-map').then((m) => m.CommuteMap), { ssr: false });

/** 把站点映射到所在区（粗略：按经纬度找最近 district 中心） */
function stationDistrict(lat: number, lng: number) {
  let best = DISTRICTS[0];
  let bestDist = Infinity;
  for (const d of DISTRICTS) {
    const dx = d.center[0] - lat;
    const dy = d.center[1] - lng;
    const dist = dx * dx + dy * dy;
    if (dist < bestDist) {
      bestDist = dist;
      best = d;
    }
  }
  return best;
}

export default function CommutePage() {
  const [workMtr, setWorkMtr] = useState('CEN');
  const [maxMins, setMaxMins] = useState(30);
  const [maxRent, setMaxRent] = useState(20000);
  const [sqftTarget, setSqftTarget] = useState(400);

  const timeMap = useMemo(() => shortestTimesFrom(workMtr), [workMtr]);

  const results = useMemo(() => {
    return MTR_STATIONS.map((s) => {
      const mins = timeMap.get(s.code) ?? Infinity;
      const district = stationDistrict(s.lat, s.lng);
      const estRent = district.avgPsf * sqftTarget;
      const commuteFare = monthlyCommuteFare(mins === Infinity ? 60 : mins, s.code, workMtr);
      const totalMonthly = estRent + commuteFare;
      // 性价比 = 总月支出越低越好 + 通勤越短越好
      const score =
        mins === Infinity || estRent > maxRent
          ? 0
          : Math.round(100 - (totalMonthly / 500) - mins * 0.5);
      return {
        station: s,
        district,
        mins,
        estRent: Math.round(estRent),
        commuteFare,
        totalMonthly: Math.round(totalMonthly),
        score: Math.max(0, Math.min(100, score)),
      };
    })
      .filter((r) => r.mins !== Infinity && r.mins <= maxMins && r.estRent <= maxRent)
      .sort((a, b) => b.score - a.score);
  }, [timeMap, maxMins, maxRent, sqftTarget]);

  const workStation = MTR_STATIONS.find((s) => s.code === workMtr)!;

  return (
    <div className="container py-10 space-y-8">
      <div>
        <Badge variant="accent" className="mb-3">通勤优先 · 反向搜索</Badge>
        <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center gap-2">
          <Train className="h-8 w-8 text-primary" />
          从「公司位置」出发，找到性价比最高的住区
        </h1>
        <p className="text-muted-foreground max-w-3xl">
          传统平台让你「先选区再看房」，导致很多人忽略了通勤时间这个最大隐藏成本。
          这里反过来：告诉我你公司在哪、能接受多久通勤、预算多少，
          我用 Dijkstra 算法在港铁网络上算出所有满足条件的住区，按「月租 + 车费」综合排序。
        </p>
      </div>

      {/* 输入条 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="h-4 w-4 text-accent" /> 我的偏好
          </CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-4 gap-4">
          <Field label="公司港铁站">
            <select
              value={workMtr}
              onChange={(e) => setWorkMtr(e.target.value)}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              {MTR_STATIONS.map((s) => (
                <option key={s.code} value={s.code}>{s.nameZh} ({s.nameEn})</option>
              ))}
            </select>
          </Field>
          <Field label={`最大通勤时间：${maxMins} 分钟`}>
            <input
              type="range"
              min={10}
              max={90}
              step={5}
              value={maxMins}
              onChange={(e) => setMaxMins(Number(e.target.value))}
              className="w-full accent-primary"
            />
          </Field>
          <Field label={`最大月租：${formatHKD(maxRent)}`}>
            <input
              type="range"
              min={5000}
              max={50000}
              step={1000}
              value={maxRent}
              onChange={(e) => setMaxRent(Number(e.target.value))}
              className="w-full accent-primary"
            />
          </Field>
          <Field label={`理想面积：${sqftTarget} 呎`}>
            <input
              type="range"
              min={100}
              max={1000}
              step={20}
              value={sqftTarget}
              onChange={(e) => setSqftTarget(Number(e.target.value))}
              className="w-full accent-primary"
            />
          </Field>
        </CardContent>
      </Card>

      {/* 地图 + 列表 */}
      <div className="grid lg:grid-cols-5 gap-6">
        <Card className="lg:col-span-3 overflow-hidden">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" /> 等时圈地图：从 {workStation.nameZh} 出发
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <CommuteMap
              workStation={workStation}
              timeMap={timeMap}
              maxMins={maxMins}
            />
            <div className="p-4 flex flex-wrap gap-3 text-xs border-t">
              <LegendDot color="#22c55e" label="≤ 15 分钟" />
              <LegendDot color="#84cc16" label="15-25 分钟" />
              <LegendDot color="#eab308" label="25-40 分钟" />
              <LegendDot color="#f97316" label="40-60 分钟" />
              <LegendDot color="#ef4444" label="&gt; 60 分钟" />
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-accent" /> 推荐住区 TOP {results.length}
              </span>
              <Badge variant="secondary">{results.length} 站满足</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 max-h-[600px] overflow-y-auto">
            {results.length === 0 && (
              <p className="text-sm text-muted-foreground py-8 text-center">
                没有满足条件的港铁站。试试放宽通勤时间或提高预算。
              </p>
            )}
            {results.slice(0, 30).map((r, i) => (
              <div
                key={r.station.code}
                className="p-3 rounded-lg border bg-card hover:border-primary/40 transition-colors"
              >
                <div className="flex items-start justify-between mb-1">
                  <div>
                    <div className="font-semibold flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">#{i + 1}</span>
                      {r.station.nameZh}
                      <Badge variant="outline" className="text-[10px]">{r.district.nameZh}</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">{r.station.nameEn}</div>
                  </div>
                  <div className="text-right">
                    <div className={`text-xl font-bold ${r.score >= 70 ? 'text-emerald-500' : r.score >= 50 ? 'text-amber-500' : 'text-rose-500'}`}>
                      {r.score}
                    </div>
                    <div className="text-[10px] text-muted-foreground">性价比</div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-2 text-xs">
                  <Metric icon={<Clock className="h-3 w-3" />} label="通勤" value={`${r.mins} 分`} />
                  <Metric icon={<DollarSign className="h-3 w-3" />} label="月租" value={formatHKD(r.estRent)} />
                  <Metric icon={<Train className="h-3 w-3" />} label="车费" value={formatHKD(r.commuteFare)} />
                </div>
                <div className="mt-2 pt-2 border-t text-xs flex items-center justify-between">
                  <span className="text-muted-foreground">月总支出</span>
                  <span className="font-mono font-semibold text-primary">{formatHKD(r.totalMonthly)}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <p className="text-xs text-muted-foreground">
        通勤时间使用简化的港铁网络图（同线相邻站 2 分钟，换乘 +4 分钟，步行 5 分钟）。
        月租估算 = 该站所在区 RVD 2026 Q1 平均呎租 × 理想面积。实际个体单位差异较大，请配合
        <a href="/calculator" className="text-primary hover:underline mx-1">真实成本计算器</a>
        逐间核算。
      </p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground mb-1.5 block">{label}</label>
      {children}
    </div>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div>
      <div className="flex items-center gap-1 text-muted-foreground">{icon}{label}</div>
      <div className="font-mono mt-0.5">{value}</div>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="h-3 w-3 rounded-full" style={{ background: color }} />
      <span className="text-muted-foreground">{label}</span>
    </span>
  );
}
