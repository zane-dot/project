import { notFound } from 'next/navigation';
import Link from 'next/link';
import { SAMPLE_LISTINGS } from '@/data/sample-listings';
import { DISTRICTS } from '@/data/districts';
import { MTR_STATIONS, LINE_NAMES, type MtrLine } from '@/data/mtr-stations';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatHKD, formatArea, pricePerSqft } from '@/lib/utils';
import { Bed, Square, Train, MapPin, Building, Calendar, Bath, ArrowLeft, ExternalLink, Info } from 'lucide-react';

export default function ListingDetail({ params }: { params: { id: string } }) {
  const listing = SAMPLE_LISTINGS.find((l) => l.id === params.id);
  if (!listing) notFound();

  const district = DISTRICTS.find((d) => d.id === listing.districtId)!;
  const station = MTR_STATIONS.find((s) => s.code === listing.nearestMtr)!;
  const psf = pricePerSqft(listing.rent, listing.sqft);
  const diffPct = Math.round(((psf - district.avgPsf) / district.avgPsf) * 100);

  return (
    <div className="container py-8 max-w-6xl">
      <Link href="/search" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="h-4 w-4" /> 返回搜索
      </Link>

      {/* 示範資料聲明 Banner */}
      <Card className="mb-6 border-accent/40 bg-accent/5">
        <CardContent className="p-4 flex items-start gap-3">
          <Info className="h-5 w-5 text-accent shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold mb-1">示範資料 · 用於展示篩選與市場對比邏輯</p>
            <p className="text-muted-foreground">
              本平台不刊登實際房源，請使用下方「在真實平台搜尋」按鈕跳轉至 28Hse / Squarefoot / Spacious / 中原 查看當前真實房源。
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="aspect-[21/9] rounded-xl bg-gradient-to-br from-primary/30 via-muted to-accent/30 mb-6" />

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <div className="flex gap-2 mb-3 flex-wrap">
              <Badge>{district.nameZh}</Badge>
              {listing.features.map((f) => (
                <Badge key={f} variant="secondary">{f}</Badge>
              ))}
            </div>
            <h1 className="text-3xl font-bold mb-2">{listing.title}</h1>
            <p className="text-muted-foreground flex items-center gap-1">
              <MapPin className="h-4 w-4" /> {listing.address}
            </p>
          </div>

          <Card>
            <CardContent className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              <Spec icon={<Bed />} label="睡房" value={listing.bedrooms === 0 ? '開放式' : `${listing.bedrooms} 間`} />
              <Spec icon={<Bath />} label="浴室" value={`${listing.bathrooms} 間`} />
              <Spec icon={<Square />} label="實用面積" value={formatArea(listing.sqft)} />
              <Spec icon={<Building />} label="樓層" value={`${listing.floor} / 高層`} />
              <Spec icon={<Calendar />} label="樓齡" value={`${listing.buildingAge} 年`} />
              <Spec icon={<Train />} label="近 MTR" value={`${station.nameZh} ${listing.minutesToMtr} 分鐘`} />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-3">房源描述</h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{listing.description}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-3">📊 區域數據對比 (來源：RVD 2026 Q1)</h2>
              <div className="grid sm:grid-cols-3 gap-4 text-center">
                <Stat label="本單位呎租" value={formatHKD(psf)} highlight />
                <Stat label={`${district.nameZh}平均呎租`} value={formatHKD(district.avgPsf)} />
                <Stat
                  label="與市場對比"
                  value={`${diffPct > 0 ? '+' : ''}${diffPct}%`}
                  highlight={diffPct < 0}
                  warning={diffPct > 10}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card className="sticky top-20">
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground mb-1">參考月租</p>
              <p className="text-4xl font-bold text-primary mb-1">{formatHKD(listing.rent)}</p>
              <p className="text-sm text-muted-foreground mb-6">{formatHKD(psf)} / 呎</p>

              <div className="space-y-2 mb-6">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  🔗 在真實平台搜尋類似房源
                </p>
                {listing.searchLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <Button variant="outline" className="w-full justify-between" size="sm">
                      <span className="flex items-center gap-2">
                        <span>{link.emoji}</span>
                        {link.name}
                      </span>
                      <ExternalLink className="h-3.5 w-3.5 opacity-60" />
                    </Button>
                  </a>
                ))}
              </div>

              <div className="pt-6 border-t text-xs text-muted-foreground space-y-1">
                <p>📍 鄰近交通</p>
                <p>• {station.nameZh} ({LINE_NAMES[station.lines[0] as MtrLine]}) · 步行 {listing.minutesToMtr} 分鐘</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Spec({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <div className="text-primary mt-0.5">{icon}</div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-medium text-sm">{value}</p>
      </div>
    </div>
  );
}

function Stat({ label, value, highlight, warning }: { label: string; value: string; highlight?: boolean; warning?: boolean }) {
  return (
    <div>
      <p className={`text-2xl font-bold ${warning ? 'text-destructive' : highlight ? 'text-primary' : 'text-foreground'}`}>{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{label}</p>
    </div>
  );
}
