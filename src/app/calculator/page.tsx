'use client';

import { useMemo, useState } from 'react';
import { Calculator, AlertTriangle, TrendingDown, TrendingUp, Info, Train, Wallet, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DISTRICTS } from '@/data/districts';
import { MTR_STATIONS } from '@/data/mtr-stations';
import { calcCost, valueScore, type CostInput } from '@/lib/cost';
import { shortestTimesFrom, monthlyCommuteFare } from '@/lib/commute';
import { formatHKD } from '@/lib/utils';

export default function CalculatorPage() {
  const [rent, setRent] = useState(15000);
  const [sqft, setSqft] = useState(380);
  const [districtId, setDistrictId] = useState('sham-shui-po');
  const [homeMtr, setHomeMtr] = useState('SSP');
  const [workMtr, setWorkMtr] = useState('CEN');
  const [household, setHousehold] = useState(2);
  const [buildingAge, setBuildingAge] = useState<CostInput['buildingAge']>('mid');
  const [payAgentFee, setPayAgentFee] = useState(true);

  const district = DISTRICTS.find((d) => d.id === districtId)!;

  // 通勤时间（分钟）
  const commuteMins = useMemo(() => {
    const map = shortestTimesFrom(homeMtr);
    return map.get(workMtr) ?? 60;
  }, [homeMtr, workMtr]);

  const commuteFare = monthlyCommuteFare(commuteMins, homeMtr, workMtr);

  const cost = useMemo(
    () =>
      calcCost({
        monthlyRent: rent,
        sqft,
        buildingAge,
        household,
        monthlyCommuteFare: commuteFare,
        districtAvgPsf: district.avgPsf,
        payAgentFee,
      }),
    [rent, sqft, buildingAge, household, commuteFare, district.avgPsf, payAgentFee],
  );

  const score = valueScore(cost);
  const scoreColor = score >= 70 ? 'text-emerald-500' : score >= 50 ? 'text-amber-500' : 'text-rose-500';
  const scoreLabel = score >= 70 ? '性价比好' : score >= 50 ? '中等' : '不划算';

  const rows: { label: string; amount: number; note?: string; icon?: React.ReactNode }[] = [
    { label: '挂牌月租', amount: cost.rent, icon: <Wallet className="h-4 w-4" /> },
    { label: '地产代理佣金 (半月租 ÷ 24 月)', amount: cost.agentFee, note: payAgentFee ? '业主直租可免' : '已勾选业主直租' },
    { label: '差饷 (应课租值 × 5%)', amount: cost.rates, note: '差估署 / 法定由业主缴，部分租约转嫁租客' },
    { label: '管理费', amount: cost.managementFee, note: `${buildingAge === 'new' ? '$4.5' : buildingAge === 'mid' ? '$3.5' : '$2.5'}/呎 × ${sqft} 呎` },
    { label: '印花税 (24 月摊销)', amount: cost.stampDuty, note: '《印花税条例》租客付 50%' },
    { label: '水电煤', amount: cost.utilities, note: `基础 + ${household} 人` },
    { label: '宽频上网', amount: cost.internet, note: '香港宽频 / 中移 均价' },
    { label: '按金机会成本', amount: cost.depositOpportunityCost, note: '2 月按金 × 4% 年化 / 12' },
    { label: '通勤车费 (来回 × 22 天)', amount: cost.commute, note: `${commuteMins} 分钟 · 单程 HK$${(cost.commute / 44).toFixed(2)}（港铁真实票价）`, icon: <Train className="h-4 w-4" /> },
  ];

  return (
    <div className="container py-10 space-y-8">
      <div>
        <Badge variant="accent" className="mb-3">真实月支出 · 决策工具</Badge>
        <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center gap-2">
          <Calculator className="h-8 w-8 text-primary" />
          香港租房真实成本计算器
        </h1>
        <p className="text-muted-foreground max-w-3xl">
          挂牌价 ≠ 你每月真正掏的钱。这里把代理佣金、差饷、管理费、印花税、按金机会成本、通勤车费全部加回来，
          再和该区市场中位数比较，帮你判断「这间房到底值不值」。
        </p>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* 输入面板 */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Info className="h-4 w-4 text-accent" />
              输入房源信息
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Field label="挂牌月租 (HK$)">
              <Input type="number" value={rent} onChange={(e) => setRent(Number(e.target.value))} min={0} step={500} />
            </Field>
            <Field label="实用面积 (呎)">
              <Input type="number" value={sqft} onChange={(e) => setSqft(Number(e.target.value))} min={50} step={10} />
            </Field>
            <Field label="所在区域">
              <select
                value={districtId}
                onChange={(e) => setDistrictId(e.target.value)}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                {DISTRICTS.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.nameZh} (区均 HK${d.avgPsf}/呎)
                  </option>
                ))}
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="最近港铁站">
                <select
                  value={homeMtr}
                  onChange={(e) => setHomeMtr(e.target.value)}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  {MTR_STATIONS.map((s) => (
                    <option key={s.code} value={s.code}>{s.nameZh}</option>
                  ))}
                </select>
              </Field>
              <Field label="公司港铁站">
                <select
                  value={workMtr}
                  onChange={(e) => setWorkMtr(e.target.value)}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  {MTR_STATIONS.map((s) => (
                    <option key={s.code} value={s.code}>{s.nameZh}</option>
                  ))}
                </select>
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="家庭人数">
                <Input type="number" value={household} onChange={(e) => setHousehold(Number(e.target.value))} min={1} max={8} />
              </Field>
              <Field label="楼龄">
                <select
                  value={buildingAge}
                  onChange={(e) => setBuildingAge(e.target.value as CostInput['buildingAge'])}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="new">新楼 (&lt; 10 年)</option>
                  <option value="mid">中楼 (10-30 年)</option>
                  <option value="old">旧楼 (&gt; 30 年)</option>
                </select>
              </Field>
            </div>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={payAgentFee}
                onChange={(e) => setPayAgentFee(e.target.checked)}
                className="h-4 w-4 accent-primary"
              />
              <span>需要支付地产代理佣金（业主直租可取消）</span>
            </label>
          </CardContent>
        </Card>

        {/* 结果面板 */}
        <div className="lg:col-span-3 space-y-4">
          {/* 总结卡 */}
          <Card className="border-primary/40 bg-gradient-to-br from-primary/5 to-accent/5">
            <CardContent className="pt-6">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">真实月支出</div>
                  <div className="text-3xl font-bold text-primary">{formatHKD(cost.total)}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    挂牌 + <b>HK${(cost.total - cost.rent).toLocaleString()}</b> 隐藏成本
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">隐藏成本占比</div>
                  <div className="text-3xl font-bold text-accent">{cost.hiddenCostPct.toFixed(1)}%</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    平台不会主动告诉你
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">综合性价比</div>
                  <div className={`text-3xl font-bold ${scoreColor}`}>{score}</div>
                  <div className="text-xs text-muted-foreground mt-1">{scoreLabel} (满分 100)</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 区均对比 */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">本房挂牌呎租 vs {district.nameZh}区均</div>
                  <div className="flex items-baseline gap-3">
                    <span className="text-2xl font-bold">HK${cost.listingPsf.toFixed(1)}/呎</span>
                    <span className="text-sm text-muted-foreground">区均 HK${district.avgPsf}/呎</span>
                  </div>
                </div>
                <Badge
                  variant={cost.vsDistrictPct > 10 ? 'destructive' : cost.vsDistrictPct < -5 ? 'success' : 'secondary'}
                  className="text-base px-3 py-1"
                >
                  {cost.vsDistrictPct > 0 ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
                  {cost.vsDistrictPct > 0 ? '贵' : '便宜'} {Math.abs(cost.vsDistrictPct).toFixed(1)}%
                </Badge>
              </div>
              {cost.vsDistrictPct > 15 && (
                <div className="mt-3 flex items-start gap-2 text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 p-3 rounded-md">
                  <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>该房比 {district.nameZh}区均高出 {cost.vsDistrictPct.toFixed(0)}%，建议议价 5-10% 或多看几间对比。</span>
                </div>
              )}
              {cost.vsDistrictPct < -5 && (
                <div className="mt-3 flex items-start gap-2 text-sm text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 p-3 rounded-md">
                  <Sparkles className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>该房低于市场价 {Math.abs(cost.vsDistrictPct).toFixed(0)}%，但要看清是否有隐性问题（楼龄、座向、噪音）。</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 成本分解 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">9 项成本分解</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {rows.map((r) => (
                <div key={r.label} className="flex items-center justify-between py-2 border-b last:border-0 text-sm">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {r.icon}
                      <span>{r.label}</span>
                    </div>
                    {r.note && <div className="text-xs text-muted-foreground mt-0.5 ml-6">{r.note}</div>}
                  </div>
                  <div className="font-mono font-semibold">{formatHKD(r.amount)}</div>
                </div>
              ))}
              <div className="flex items-center justify-between pt-3 mt-2 border-t-2 border-primary/30 text-base font-bold">
                <span>真实月支出</span>
                <span className="font-mono text-primary">{formatHKD(cost.total)}</span>
              </div>
            </CardContent>
          </Card>

          <p className="text-xs text-muted-foreground px-1">
            注：本计算仅供参考。各项基于《地产代理条例》、《印花税条例》Cap.117、差估署 2026 Q1 数据及香港宽频 / 港铁公开票价估算。
            实际数字以业主报价、租约条款、单位实测为准。
          </p>
        </div>
      </div>
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
