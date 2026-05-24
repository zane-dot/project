import Link from 'next/link';
import { ArrowRight, Calculator, Train, TrendingUp, Database, Sparkles, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DISTRICTS } from '@/data/districts';
import { MTR_STATIONS } from '@/data/mtr-stations';
import { formatHKD } from '@/lib/utils';

export default function HomePage() {
  const cheapest = [...DISTRICTS].sort((a, b) => a.avgPsf - b.avgPsf).slice(0, 4);

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden border-b">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.15),transparent_50%)]" />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_bottom_right,hsl(var(--accent)/0.15),transparent_50%)]" />
        <div className="container py-20 md:py-28 text-center">
          <Badge variant="accent" className="mb-6 animate-fade-in">
            🇭🇰 香港租房决策中心 · 不是另一个房源平台
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 animate-fade-in">
            挂牌价 ≠ 真实月支出
            <br />
            <span className="text-primary neon-glow">先算账，再签约</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-in">
            28Hse 告诉你「月租 $15,000」，但代理佣金、差饷、管理费、通勤车费、按金机会成本加起来，
            <br className="hidden md:block" />
            <b className="text-foreground">真实月支出可能高出 30%</b>。我们帮你算清楚。
          </p>
          <div className="flex flex-wrap justify-center gap-3 animate-fade-in">
            <Link href="/calculator">
              <Button size="lg">
                <Calculator className="h-4 w-4" /> 算真实月支出 <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/commute">
              <Button size="lg" variant="outline">
                <Train className="h-4 w-4" /> 从公司反向找住区
              </Button>
            </Link>
            <Link href="/insights">
              <Button size="lg" variant="ghost">
                看 18 区数据 →
              </Button>
            </Link>
          </div>

          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            <Stat label="9 项成本" value="一键算清" />
            <Stat label="港铁站点" value={`${MTR_STATIONS.length}+`} />
            <Stat label="区均数据" value="RVD 2026 Q1" />
            <Stat label="法律风险" value="零爬虫" />
          </div>
        </div>
      </section>

      {/* 两个核心工具 */}
      <section className="container py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">两个决策工具，覆盖租房关键决策</h2>
          <p className="text-muted-foreground">不替你看房，但帮你避开几种常见亏损</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <ToolCard
            icon={<Calculator className="h-8 w-8" />}
            badge="工具 A"
            title="真实月支出计算器"
            desc="输入一间心仪房源的挂牌信息 + 你的通勤路线，1 秒得出 9 项成本分解、隐藏费用占比、性价比评分，并与该区 RVD 中位数对比。"
            bullets={[
              '代理佣金 / 差饷 / 印花税 / 按金机会成本 全部摊销',
              '与该区 2026 Q1 均价对比，识别「明显贵了」的盘',
              '内置港铁票价表，自动算月通勤车费',
            ]}
            href="/calculator"
            cta="开始计算"
          />
          <ToolCard
            icon={<Train className="h-8 w-8" />}
            badge="工具 B"
            title="通勤优先反向搜索"
            desc="传统平台让你先选区。我们反过来：输入你公司港铁站 + 通勤上限 + 预算，Dijkstra 算法在港铁网络上找出所有满足条件的住区，按总月支出排序。"
            bullets={[
              '等时圈地图：15 / 25 / 40 分钟一目了然',
              '考虑换乘成本，不是简单画圆',
              '月租 + 车费 综合排名，避开「便宜但车费补回去」的坑',
            ]}
            href="/commute"
            cta="开始反向搜索"
          />
        </div>
      </section>

      {/* 数据透明度 */}
      <section className="container py-16 border-t">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3">所有数据可追溯</h2>
          <p className="text-muted-foreground">不爬虫、不假数、不夸大 —— 每个数字都附来源</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          <DataCard
            icon={<Database className="h-6 w-6" />}
            title="差估署 RVD 月报"
            desc="2026 Q1 私人住宅租金指数、A/B/C 类单位呎租，全港 18 区均价"
          />
          <DataCard
            icon={<MapPin className="h-6 w-6" />}
            title="港铁公开数据"
            desc={`${MTR_STATIONS.length} 个港铁站坐标、线路拓扑、票价表（八达通成人价）`}
          />
          <DataCard
            icon={<TrendingUp className="h-6 w-6" />}
            title="法定费用公式"
            desc="《地产代理条例》《印花税条例》Cap.117《差饷条例》Cap.116 计算逻辑"
          />
        </div>
      </section>

      {/* 高性价比区域参考 */}
      <section className="container py-16 border-t">
        <h2 className="text-3xl font-bold mb-3 flex items-center gap-2">
          <Sparkles className="h-7 w-7 text-accent" /> 区均呎租最低 4 个区
        </h2>
        <p className="text-muted-foreground mb-8">想知道「便宜区到底有多便宜」可以从这里开始</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cheapest.map((d) => (
            <Link key={d.id} href={`/insights#${d.id}`}>
              <Card className="h-full hover:border-accent transition-colors cursor-pointer">
                <CardContent className="p-6 text-center">
                  <h3 className="text-lg font-bold mb-1">{d.nameZh}</h3>
                  <p className="text-xs text-muted-foreground mb-3">{d.region}</p>
                  <p className="text-3xl font-bold text-accent">HK${d.avgPsf}</p>
                  <p className="text-xs text-muted-foreground">/ 呎 · 月</p>
                  <p className="text-xs text-muted-foreground mt-2">~500 呎: {formatHKD(d.avgRent)}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container py-16 text-center">
        <Card className="bg-gradient-to-br from-primary/10 via-background to-accent/10 border-primary/20">
          <CardContent className="p-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">下次签租约前，先来这里算一次</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
              30 秒得出答案，可能帮你省下半年代理佣金。
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/calculator">
                <Button size="lg">
                  <Calculator className="h-4 w-4" /> 算真实月支出
                </Button>
              </Link>
              <Link href="/commute">
                <Button size="lg" variant="outline">
                  <Train className="h-4 w-4" /> 反向找住区
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <div className="text-2xl md:text-3xl font-bold text-primary">{value}</div>
      <div className="text-sm text-muted-foreground mt-1">{label}</div>
    </div>
  );
}

function ToolCard({
  icon,
  badge,
  title,
  desc,
  bullets,
  href,
  cta,
}: {
  icon: React.ReactNode;
  badge: string;
  title: string;
  desc: string;
  bullets: string[];
  href: string;
  cta: string;
}) {
  return (
    <Card className="border-2 hover:border-primary/40 transition-colors flex flex-col">
      <CardContent className="p-7 flex flex-col flex-1">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-14 w-14 rounded-lg bg-primary/10 text-primary flex items-center justify-center">{icon}</div>
          <Badge variant="secondary">{badge}</Badge>
        </div>
        <h3 className="text-2xl font-bold mb-2">{title}</h3>
        <p className="text-muted-foreground mb-4">{desc}</p>
        <ul className="space-y-2 mb-6 flex-1">
          {bullets.map((b) => (
            <li key={b} className="text-sm flex items-start gap-2">
              <span className="text-primary mt-1">▸</span>
              <span>{b}</span>
            </li>
          ))}
        </ul>
        <Link href={href}>
          <Button className="w-full">
            {cta} <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

function DataCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="h-10 w-10 rounded-lg bg-accent/10 text-accent flex items-center justify-center mb-3">{icon}</div>
        <h3 className="font-bold mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground">{desc}</p>
      </CardContent>
    </Card>
  );
}
