import { DISTRICTS } from '@/data/districts';
import { MTR_STATIONS, LINE_NAMES, type MtrLine } from '@/data/mtr-stations';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Database, ExternalLink } from 'lucide-react';

export const metadata = { title: '关于数据 · 来源透明' };

const SOURCES = [
  {
    name: '差饷物业估价署 (RVD)',
    desc: '私人住宅租金指数与平均呎租 (按区/面积)',
    url: 'https://www.rvd.gov.hk/en/property_market_statistics/index.html',
    used: '首页与 /insights 各区平均租金、呎租、同比变动',
  },
  {
    name: '港铁公司 (MTR)',
    desc: 'MTR 各线路、站点、坐标、出口、班次',
    url: 'https://data.gov.hk/tc-data/dataset/mtr-data-routes-fares-barrier-free-facilities',
    used: '地图、通勤计算、按 MTR 站点筛选',
  },
  {
    name: '地政总署 / 政府统计处',
    desc: '香港 18 区行政边界 GeoJSON、人口、面积',
    url: 'https://data.gov.hk/tc-data/dataset/hk-pland-pland-boundaries',
    used: '热力图、区域元数据',
  },
  {
    name: '教育局 (EDB)',
    desc: '中小学校网、学校列表、地址',
    url: 'https://www.edb.gov.hk/tc/about-edb/publications-stat/figures/index.html',
    used: '按校网筛选房源（v0.2 即将上线）',
  },
  {
    name: '土地注册处 (Land Registry)',
    desc: '私人住宅成交记录（公开脱敏）',
    url: 'https://www.landreg.gov.hk',
    used: '房源详情页历史成交参考',
  },
  {
    name: 'KMB / Citybus 开放 API',
    desc: '巴士实时到站、路线、站点',
    url: 'https://data.etabus.gov.hk',
    used: '通勤计算（v0.2 即将上线）',
  },
];

export default function AboutPage() {
  return (
    <div className="container py-12 max-w-5xl">
      <div className="mb-10">
        <Badge variant="accent" className="mb-4">
          <Database className="h-3 w-3 mr-1" /> 數據透明聲明
        </Badge>
        <h1 className="text-4xl font-bold mb-4">每個數字都可追溯</h1>
        <p className="text-lg text-muted-foreground">
          FlatHunt HK <strong>不爬取</strong>任何商業地產網站（如中原、美聯、28Hse 等）。
          所有區域層面的租金、人口、交通數據均來自香港特區政府公開發布的開放數據集，
          房源信息則由註冊用戶自主發布並負責。
        </p>
      </div>

      <h2 className="text-2xl font-bold mb-6">📚 數據來源清單</h2>
      <div className="grid gap-4 mb-12">
        {SOURCES.map((s) => (
          <Card key={s.name}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1 min-w-[260px]">
                  <h3 className="text-lg font-semibold mb-1">{s.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{s.desc}</p>
                  <p className="text-sm">
                    <span className="text-muted-foreground">用於：</span>
                    {s.used}
                  </p>
                </div>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                >
                  訪問來源 <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <h2 className="text-2xl font-bold mb-6">📊 數據覆蓋現狀</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        <StatBox value={DISTRICTS.length.toString()} label="覆蓋區數" />
        <StatBox value={MTR_STATIONS.length.toString()} label="MTR 站點" />
        <StatBox value={new Set(MTR_STATIONS.flatMap((s) => s.lines)).size.toString()} label="MTR 路線" />
        <StatBox value="2026 Q1" label="租金數據版本" />
      </div>

      <h2 className="text-2xl font-bold mb-6">🚇 MTR 路線覆蓋</h2>
      <div className="flex flex-wrap gap-2 mb-12">
        {(Object.keys(LINE_NAMES) as MtrLine[]).map((line) => (
          <Badge key={line} variant="outline" className="text-base py-1">
            {LINE_NAMES[line]}
          </Badge>
        ))}
      </div>

      <Card className="bg-muted/50">
        <CardContent className="p-6">
          <h3 className="font-semibold mb-2">⚖️ 法律聲明</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            本平台所有區域統計數據均根據《政府資料一線通》使用條款使用。
            房源信息由用戶自願發布，平台不對其真實性負責，但對虛假房源實行零容忍。
            如發現任何數據錯誤，歡迎在 GitHub 提交 Issue。
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function StatBox({ value, label }: { value: string; label: string }) {
  return (
    <Card>
      <CardContent className="p-6 text-center">
        <div className="text-3xl font-bold text-primary">{value}</div>
        <div className="text-sm text-muted-foreground mt-1">{label}</div>
      </CardContent>
    </Card>
  );
}
