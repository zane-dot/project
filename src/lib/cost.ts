/**
 * 香港租房「真实月支出」计算器
 *
 * 输入：挂牌月租、呎数、楼龄、家庭人数、通勤时间
 * 输出：8 项成本分解 + 总额 + vs 区均对比
 *
 * 公式来源：
 * - 地产代理佣金：业主 / 租客各付半月租金（《地产代理条例》业界惯例）
 * - 差饷：应课差饷租值的 5%（差估署），简化为 月租 × 5%
 * - 印花税（釐印费）：2 年期租约 = 年租 × 0.5%，业主与租客各付一半（《印花税条例》Cap.117）
 * - 管理费：约 $3-5/呎/月（住宅楼龄差异）
 * - 水电煤：基础 $600 + $300/人
 * - 上网：固网宽频均价 $250/月
 * - 按金机会成本：2 月按金 × 4% 年化 / 12
 * - 通勤车费：港铁真实成人八达通票价（opendata.mtr.com.hk 的 mtr_lines_fares.csv），
 *   按 monthlyCommuteFare(mins, originCode, destCode) 单程往返 × 22 工作日
 */

export type CostInput = {
  /** 挂牌月租 HKD */
  monthlyRent: number;
  /** 单位呎数 */
  sqft: number;
  /** 楼龄分类影响管理费 */
  buildingAge: 'new' | 'mid' | 'old';
  /** 家庭人数（影响水电煤） */
  household: number;
  /** 月通勤车费 HKD（来回 × 22 工作日） */
  monthlyCommuteFare: number;
  /** 该区平均呎租 HKD/呎，用于对比 */
  districtAvgPsf: number;
  /** 是否需要交代理佣金（部分业主直租可免） */
  payAgentFee: boolean;
};

export type CostBreakdown = {
  rent: number;
  agentFee: number; // 按 24 月租约摊销
  rates: number;
  managementFee: number;
  stampDuty: number; // 按 24 月摊销
  utilities: number;
  internet: number;
  depositOpportunityCost: number;
  commute: number;
  total: number;
  /** 该房挂牌呎租 */
  listingPsf: number;
  /** 与区均价差 % (正 = 贵) */
  vsDistrictPct: number;
  /** 隐藏成本占比 % = (total - rent) / total */
  hiddenCostPct: number;
};

const MGMT_PSF: Record<CostInput['buildingAge'], number> = {
  new: 4.5,
  mid: 3.5,
  old: 2.5,
};

export function calcCost(input: CostInput): CostBreakdown {
  const {
    monthlyRent: rent,
    sqft,
    buildingAge,
    household,
    monthlyCommuteFare: commute,
    districtAvgPsf,
    payAgentFee,
  } = input;

  // 代理佣金：半月租金 / 24 月摊销
  const agentFee = payAgentFee ? Math.round((rent * 0.5) / 24) : 0;

  // 差饷：月租 × 5%（差估署典型比例）
  const rates = Math.round(rent * 0.05);

  // 管理费：呎数 × 楼龄系数
  const managementFee = Math.round(sqft * MGMT_PSF[buildingAge]);

  // 印花税：年租 × 0.5%，租客承担 50%，按 24 月摊销
  const stampDuty = Math.round((rent * 12 * 0.005 * 0.5) / 24);

  // 水电煤：$600 + $300/人
  const utilities = 600 + household * 300;

  // 宽频
  const internet = 250;

  // 按金机会成本：2 月租金 × 4% / 12
  const depositOpportunityCost = Math.round((rent * 2 * 0.04) / 12);

  const total =
    rent + agentFee + rates + managementFee + stampDuty + utilities + internet + depositOpportunityCost + commute;

  const listingPsf = sqft > 0 ? rent / sqft : 0;
  const vsDistrictPct = districtAvgPsf > 0 ? ((listingPsf - districtAvgPsf) / districtAvgPsf) * 100 : 0;
  const hiddenCostPct = total > 0 ? ((total - rent) / total) * 100 : 0;

  return {
    rent,
    agentFee,
    rates,
    managementFee,
    stampDuty,
    utilities,
    internet,
    depositOpportunityCost,
    commute,
    total,
    listingPsf,
    vsDistrictPct,
    hiddenCostPct,
  };
}

/** 给一个房产打综合性价比分（0-100） */
export function valueScore(c: CostBreakdown): number {
  // 价差越低分越高；hidden cost 占比合理则加分；通勤负担在 total 占比低则加分
  const psfPenalty = Math.max(-30, Math.min(30, c.vsDistrictPct)); // -30~30
  const psfScore = 50 - psfPenalty; // 平均价 = 50，便宜 30% = 80，贵 30% = 20
  const commuteShare = c.total > 0 ? (c.commute / c.total) * 100 : 0;
  const commuteScore = Math.max(0, 30 - commuteShare); // 通勤占比 <30% 才得分
  const hiddenScore = Math.max(0, 20 - Math.max(0, c.hiddenCostPct - 20)); // 隐藏成本 <20% 加满分
  return Math.round(Math.max(0, Math.min(100, psfScore * 0.6 + commuteScore + hiddenScore)));
}
