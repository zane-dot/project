/**
 * 港铁通勤时间估算器
 * 使用 Dijkstra 在 MTR 网络上算最短时间
 *
 * 模型：
 * - 同线相邻站之间 = 2 分钟（含进出站、停靠）
 * - 换乘站之间 = 4 分钟（换乘步行 + 等车）
 * - 走到 / 离开车站 = 5 分钟（默认步行）
 *
 * 真实票价：港铁 2026 票价表（成人八达通），按区间近似
 */

import { MTR_STATIONS, type MtrLine, type MtrStation } from '@/data/mtr-stations';

/** 各线路从起点到终点的站序（用于推导相邻关系） */
const LINE_ORDER: Record<MtrLine, string[]> = {
  // 港岛线 西 → 东（节选）
  ISL: ['CEN', 'ADM', 'WAC', 'CAB', 'TIH', 'FOH', 'NOP', 'QUB', 'TAK', 'SWH'],
  // 荃湾线 中环 → 荃湾
  TWL: ['CEN', 'ADM', 'TST', 'JOR', 'YMT', 'MOK', 'PRE', 'SSP', 'CSW', 'LCK', 'MEF', 'LAK', 'KWF', 'KWH', 'TWH', 'TSW'],
  // 观塘线 油麻地 → 调景岭
  KTL: ['YMT', 'MOK', 'PRE', 'KOT', 'LOF', 'WTS', 'DIH', 'CHH', 'KOB', 'NTK', 'KWT', 'LAT', 'YAT'],
  // 将军澳线 北角 → 宝琳
  TKL: ['NOP', 'QUB', 'YAT', 'TIK', 'TKO', 'HAH', 'POA'],
  // 东涌线 香港 → 东涌
  TCL: ['HOK', 'KOW', 'OLY', 'NAC', 'LAK', 'TUC'],
  // 机场快线 香港 → 机场
  AEL: ['HOK', 'KOW', 'AIR'],
  // 屯马线 屯门 → 红磡（节选）
  TML: ['TUM', 'YUL', 'NAC', 'MEF', 'TAW', 'DIH', 'HUH'],
  // 东铁线 上水 → 金钟（节选）
  EAL: ['SHS', 'FAN', 'TAP', 'SHT', 'TAW', 'KOT', 'HUH', 'ADM'],
  // 南港岛线 金钟 → 海怡半岛（节选，简化为金钟单端）
  SIL: ['ADM'],
};

const STATION_MAP = new Map<string, MtrStation>(MTR_STATIONS.map((s) => [s.code, s]));

type Edge = { to: string; mins: number; transfer: boolean };

/** 两点经纬度距离（km），Haversine 公式 */
function distKm(a: MtrStation, b: MtrStation): number {
  const R = 6371;
  const toRad = (x: number) => (x * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** 两站之间通勤时间：1 分停靠 + 1.6 min/km（港铁平均 40 km/h 含停站） */
function edgeMins(a: MtrStation, b: MtrStation): number {
  const km = distKm(a, b);
  return Math.max(2, Math.round(1 + km * 1.6));
}

/** 建图：每条边表示两站之间的耗时 */
function buildGraph(): Map<string, Edge[]> {
  const g = new Map<string, Edge[]>();
  const add = (a: string, b: string, mins: number, transfer = false) => {
    if (!STATION_MAP.has(a) || !STATION_MAP.has(b)) return;
    if (!g.has(a)) g.set(a, []);
    g.get(a)!.push({ to: b, mins, transfer });
  };

  // 同线相邻：根据真实经纬度距离估算耗时
  for (const order of Object.values(LINE_ORDER)) {
    for (let i = 0; i < order.length - 1; i++) {
      const sa = STATION_MAP.get(order[i]);
      const sb = STATION_MAP.get(order[i + 1]);
      if (!sa || !sb) continue;
      const m = edgeMins(sa, sb);
      add(order[i], order[i + 1], m);
      add(order[i + 1], order[i], m);
    }
  }

  return g;
}

const GRAPH = buildGraph();

/** Dijkstra 算从 origin 到所有站的最短分钟数 */
export function shortestTimesFrom(originCode: string, walkMinsToOrigin = 5): Map<string, number> {
  const dist = new Map<string, number>();
  dist.set(originCode, walkMinsToOrigin);

  const visited = new Set<string>();
  const queue: { code: string; mins: number; prevLine: MtrLine | null }[] = [
    { code: originCode, mins: walkMinsToOrigin, prevLine: null },
  ];

  while (queue.length) {
    // 取 mins 最小的
    queue.sort((a, b) => a.mins - b.mins);
    const cur = queue.shift()!;
    if (visited.has(cur.code)) continue;
    visited.add(cur.code);

    const edges = GRAPH.get(cur.code) || [];
    const curStation = STATION_MAP.get(cur.code);
    if (!curStation) continue;

    for (const e of edges) {
      const nextStation = STATION_MAP.get(e.to);
      if (!nextStation) continue;
      // 判断是否换乘：当前所在线 与 即将走的边的线是否一致
      const sharedLines = curStation.lines.filter((l) => nextStation.lines.includes(l));
      // 用最简模型：只要任意共线就视为「不换乘」，否则按换乘 +4 分
      const isTransfer = cur.prevLine !== null && !sharedLines.includes(cur.prevLine);
      const nextLine = sharedLines[0] || null;
      const cost = e.mins + (isTransfer ? 4 : 0);
      const nd = cur.mins + cost;
      const prev = dist.get(e.to);
      if (prev === undefined || nd < prev) {
        dist.set(e.to, nd);
        queue.push({ code: e.to, mins: nd, prevLine: nextLine });
      }
    }
  }

  return dist;
}

/** 估算单程港铁票价（HKD），按距离粗略分段（仅作为查表不命中时的备用） */
export function estimateFare(mins: number): number {
  if (mins <= 8) return 5;
  if (mins <= 15) return 8;
  if (mins <= 25) return 12;
  if (mins <= 40) return 18;
  if (mins <= 60) return 25;
  return 35;
}

import faresData from '@/data/mtr-fares.json';
const FARES = faresData as Record<string, number>;

/** 真实单程港铁成人八达通票价（来自港铁 opendata.mtr.com.hk）。查不到则按时长估算 */
export function lookupFare(originCode: string, destCode: string, fallbackMins: number): number {
  const o = STATION_MAP.get(originCode);
  const d = STATION_MAP.get(destCode);
  if (!o || !d) return estimateFare(fallbackMins);
  const key = `${o.nameEn}|${d.nameEn}`;
  const fare = FARES[key];
  return typeof fare === 'number' && fare > 0 ? fare : estimateFare(fallbackMins);
}

/** 月度通勤成本 = 往返 × 22 工作日。优先用真实票价，否则按时长估算 */
export function monthlyCommuteFare(oneWayMins: number, originCode?: string, destCode?: string): number {
  const fare = originCode && destCode
    ? lookupFare(originCode, destCode, oneWayMins)
    : estimateFare(oneWayMins);
  return Math.round(fare * 2 * 22);
}
