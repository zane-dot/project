'use client';

import { Suspense, useMemo, useState } from 'react';
import { DISTRICTS } from '@/data/districts';
import { MTR_STATIONS } from '@/data/mtr-stations';
import { SAMPLE_LISTINGS, type Listing } from '@/data/sample-listings';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatHKD, formatArea, pricePerSqft } from '@/lib/utils';
import { Bed, Square, Train, MapPin, Search, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="container py-8 text-muted-foreground">載入中…</div>}>
      <SearchPageInner />
    </Suspense>
  );
}

function SearchPageInner() {
  const params = useSearchParams();
  const initialDistrict = params.get('district') ?? '';
  const [district, setDistrict] = useState(initialDistrict);
  const [maxRent, setMaxRent] = useState<number>(50000);
  const [minBeds, setMinBeds] = useState<number>(0);
  const [q, setQ] = useState('');

  const filtered = useMemo(() => {
    return SAMPLE_LISTINGS.filter((l) => {
      if (district && l.districtId !== district) return false;
      if (l.rent > maxRent) return false;
      // minBeds = -1 表示只看單人/劏房/開放式 (bedrooms === 0)
      if (minBeds === -1) {
        if (l.bedrooms !== 0) return false;
      } else if (l.bedrooms < minBeds) {
        return false;
      }
      if (q && !`${l.title} ${l.address}`.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [district, maxRent, minBeds, q]);

  return (
    <div className="container py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">搜索房源</h1>
        <p className="text-muted-foreground text-sm">
          示例數據集：{SAMPLE_LISTINGS.length} 條 · 點擊任一房源 →「在真實平台搜尋」可跳轉至 28Hse / Squarefoot 等真實房源
        </p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4 grid md:grid-cols-5 gap-3">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="關鍵字（標題、地址）"
              className="pl-9"
            />
          </div>
          <select
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">全部 18 區</option>
            {DISTRICTS.map((d) => (
              <option key={d.id} value={d.id}>
                {d.nameZh}
              </option>
            ))}
          </select>
          <select
            value={maxRent}
            onChange={(e) => setMaxRent(Number(e.target.value))}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value={8000}>≤ $8,000 (劏房預算)</option>
            <option value={15000}>≤ $15,000</option>
            <option value={25000}>≤ $25,000</option>
            <option value={40000}>≤ $40,000</option>
            <option value={50000}>≤ $50,000</option>
            <option value={100000}>≤ $100,000</option>
          </select>
          <select
            value={minBeds}
            onChange={(e) => setMinBeds(Number(e.target.value))}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value={0}>不限房型</option>
            <option value={-1}>單人 / 劏房 / 套房</option>
            <option value={1}>≥ 1 房</option>
            <option value={2}>≥ 2 房</option>
            <option value={3}>≥ 3 房</option>
          </select>
        </CardContent>
      </Card>

      <p className="text-sm text-muted-foreground mb-4">
        找到 <b className="text-foreground">{filtered.length}</b> 個結果
      </p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((l) => (
          <ListingCard key={l.id} listing={l} />
        ))}
      </div>

      {filtered.length === 0 && (
        <Card className="mt-8">
          <CardContent className="p-12 text-center text-muted-foreground">
            未找到符合條件的房源，試試放寬篩選條件。
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ListingCard({ listing }: { listing: Listing }) {
  const district = DISTRICTS.find((d) => d.id === listing.districtId);
  const station = MTR_STATIONS.find((s) => s.code === listing.nearestMtr);
  const psf = pricePerSqft(listing.rent, listing.sqft);
  const districtAvg = district?.avgPsf ?? 0;
  const valueScore = districtAvg > 0 ? Math.round(((districtAvg - psf) / districtAvg) * 100) : 0;

  return (
    <Link href={`/listings/${listing.id}`}>
      <Card className="overflow-hidden h-full hover:border-primary transition-colors cursor-pointer">
        {/* 图片占位 */}
        <div className="aspect-video bg-gradient-to-br from-primary/20 via-muted to-accent/20 relative">
          <div className="absolute top-3 left-3 flex gap-2">
            <Badge>{district?.nameZh}</Badge>
            {valueScore >= 5 && <Badge variant="accent">高性價比 +{valueScore}%</Badge>}
            {valueScore <= -10 && <Badge variant="destructive">高於市場 {Math.abs(valueScore)}%</Badge>}
          </div>
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold line-clamp-1 mb-1">{listing.title}</h3>
          <p className="text-xs text-muted-foreground flex items-center gap-1 mb-3">
            <MapPin className="h-3 w-3" />
            {listing.address}
          </p>
          <div className="flex items-baseline gap-1 mb-3">
            <span className="text-2xl font-bold text-primary">{formatHKD(listing.rent)}</span>
            <span className="text-xs text-muted-foreground">/ 月 · {formatHKD(psf)}/呎</span>
          </div>
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Bed className="h-3 w-3" /> {listing.bedrooms === 0 ? '開放式' : `${listing.bedrooms} 房`}
            </span>
            <span className="inline-flex items-center gap-1">
              <Square className="h-3 w-3" /> {formatArea(listing.sqft)}
            </span>
            {station && (
              <span className="inline-flex items-center gap-1">
                <Train className="h-3 w-3" /> {station.nameZh} · {listing.minutesToMtr} 分鐘
              </span>
            )}
          </div>
          <div className="mt-3 pt-3 border-t flex items-center gap-1 text-xs text-accent">
            <ExternalLink className="h-3 w-3" />
            <span>查看真實房源跳轉 →</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
