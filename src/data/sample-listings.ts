/**
 * 示例房源數據集
 *
 * ⚠️ 重要聲明：
 * 本數據集中的所有房源均為 **示範資料 (demo)**，基於：
 *   - 香港真實 MTR 站點地理坐標 (港鐵公開數據)
 *   - RVD 2026 Q1 區域平均呎租 ± 隨機浮動
 *   - 香港 18 區行政區劃
 *
 * 每個示例房源附帶 `searchLinks`，點擊可跳轉至香港主流租屋平台
 * (28Hse / Squarefoot / Spacious / 中原) 對應條件的真實搜索結果頁。
 * 本平台僅提供 **租金洞察與搜索條件預設**，不抓取也不轉載第三方內容。
 */
import { DISTRICTS } from './districts';
import { MTR_STATIONS } from './mtr-stations';

export type SearchLink = {
  /** 平台顯示名 */
  name: string;
  /** 跳轉 URL */
  url: string;
  /** 平台 logo emoji */
  emoji: string;
};

export type Listing = {
  id: string;
  title: string;
  address: string;
  districtId: string;
  rent: number;       // HKD / 月
  sqft: number;
  bedrooms: number;
  bathrooms: number;
  floor: number;
  buildingAge: number;
  nearestMtr: string; // MTR station code
  minutesToMtr: number;
  lat: number;
  lng: number;
  features: string[];
  description: string;
  /** 跳轉至真實房源平台的搜索鏈接 */
  searchLinks: SearchLink[];
};

function pick<T>(arr: readonly T[], i: number): T {
  return arr[i % arr.length];
}

const BUILDING_TYPES = ['屋苑', '單棟住宅', '唐樓', '豪宅', '居屋', '服務式公寓'];
const SOLO_TYPES = ['劏房', '套房', '單身公寓', 'Co-living 共居', '服務式單人房', '迷你倉式公寓'];
const FEATURES_POOL = [
  ['會所', '泳池', '健身室'],
  ['海景', '高層', '開揚'],
  ['鄰近 MTR', '步行 5 分鐘'],
  ['校網優越', '34 校網'],
  ['新裝修', '即住即合'],
  ['免佣', '業主直租'],
  ['寵物友善'],
  ['全屋傢俬電器'],
];
const SOLO_FEATURES_POOL = [
  ['免按金', '短租可'],
  ['包水電上網', '即住'],
  ['獨立廁所', '獨立廚房'],
  ['女生限定', '安全屋苑'],
  ['共用客廳', '社區活動'],
  ['免佣', '業主直租'],
  ['步行 3 分鐘到 MTR'],
  ['全新裝修', '單人床+書桌'],
];

/**
 * 生成跳轉至香港主流租屋平台的搜尋連結
 * 使用 Google 站內搜尋 (site:) 確保鏈接永久有效，
 * 無需依賴第三方平台內部 URL 結構變動
 */
function buildSearchLinks(districtZh: string, mtrZh: string, bedrooms: number, sqft: number, rent: number): SearchLink[] {
  const rentK = Math.round(rent / 1000);
  const roomTerm = bedrooms === 0 ? '劏房 套房' : `${bedrooms}房`;
  const baseQuery = `${districtZh} ${mtrZh} 租 ${roomTerm} ${sqft}呎`;
  const ranged = `${districtZh} 租 ${roomTerm} ${rentK}000`;

  const mk = (site: string, q: string) =>
    `https://www.google.com/search?q=${encodeURIComponent(q + ' site:' + site)}`;

  return [
    { name: '28Hse 搜尋', emoji: '🏠', url: mk('28hse.com', baseQuery) },
    { name: 'Squarefoot 搜尋', emoji: '🏢', url: mk('squarefoot.com.hk', baseQuery) },
    { name: 'Spacious 搜尋', emoji: '🏘️', url: mk('spacious.hk', ranged) },
    { name: '中原地產搜尋', emoji: '🏛️', url: mk('hk.centanet.com', baseQuery) },
  ];
}

function gen(seed: number, districtId: string, mtrCode: string): Listing {
  const d = DISTRICTS.find((x) => x.id === districtId)!;
  const s = MTR_STATIONS.find((x) => x.code === mtrCode)!;
  // 加入單人單位尺寸：劏房 80-150呎、套房 150-250呎、單身公寓 200-300呎
  const sqftBase = pick([90, 120, 150, 180, 220, 280, 350, 420, 500, 650, 780, 900, 1100], seed);
  const sqft = sqftBase + (seed % 7) * 5;
  const isSolo = sqft < 280;
  // 劏房/套房通常每呎更貴 (空間切割)，加 20-40% 溢價
  const soloPremium = isSolo ? 1.2 + ((seed % 5) * 0.05) : 1;
  const psfNoise = 1 + ((seed % 11) - 5) / 50; // ±10%
  const rent = Math.round((d.avgPsf * psfNoise * soloPremium * sqft) / 100) * 100;
  // bedrooms: 劏房/套房 = 0 (studio/開放式)，>280呎才算 1 房
  const bedrooms = sqft < 200 ? 0 : sqft < 350 ? 1 : sqft < 600 ? 2 : sqft < 900 ? 3 : 4;
  const buildingType = isSolo ? pick(SOLO_TYPES, seed) : pick(BUILDING_TYPES, seed);
  const feature = isSolo ? pick(SOLO_FEATURES_POOL, seed) : pick(FEATURES_POOL, seed);
  const roomLabel = bedrooms === 0 ? '開放式' : `${bedrooms}房`;
  return {
    id: `${districtId}-${mtrCode}-${seed}`,
    title: `${d.nameZh}${buildingType} · ${roomLabel}${feature[0]}`,
    address: `${d.nameZh}${s.nameZh}站附近 ${(seed * 7) % 30 + 1}號`,
    districtId,
    rent,
    sqft,
    bedrooms,
    bathrooms: bedrooms >= 3 ? 2 : 1,
    floor: ((seed * 13) % 40) + 3,
    buildingAge: (seed * 3) % 35 + 2,
    nearestMtr: mtrCode,
    minutesToMtr: ((seed * 2) % 10) + 1,
    lat: s.lat + ((seed % 7) - 3) * 0.002,
    lng: s.lng + ((seed % 5) - 2) * 0.002,
    features: feature,
    description: isSolo
      ? `位於${d.nameZh}核心地段，${buildingType}適合單身上班族 / 學生 / 短期工作。鄰近${s.nameZh}站步行約 ${((seed * 2) % 10) + 1} 分鐘。單位實用率高，傢俬電器齊全，即住即合。月租已包水電上網 (視乎業主)，無需額外設定。`
      : `位於${d.nameZh}核心地段，鄰近${s.nameZh}站，步行約 ${((seed * 2) % 10) + 1} 分鐘即達。單位實用率高，間隔四正，光線充足。${buildingType}設施齊全，鄰近商場、街市、學校。歡迎預約睇樓。`,
    searchLinks: buildSearchLinks(d.nameZh, s.nameZh, bedrooms, sqft, rent),
  };
}

// MTR 站點 -> 行政區映射 (基於港鐵實際走線)
const STATION_DISTRICT: Array<[string, string]> = [
  ['CEN', 'central-western'], ['ADM', 'central-western'], ['SHW', 'central-western'],
  ['KET', 'central-western'], ['HKU', 'central-western'],
  ['WAC', 'wan-chai'], ['CAB', 'wan-chai'],
  ['TIH', 'eastern'], ['NOP', 'eastern'], ['QUB', 'eastern'],
  ['TAK', 'eastern'], ['SWH', 'eastern'], ['SKW', 'eastern'], ['HFC', 'eastern'], ['CHW', 'eastern'],
  ['TST', 'yau-tsim-mong'], ['JOR', 'yau-tsim-mong'], ['YMT', 'yau-tsim-mong'],
  ['MOK', 'yau-tsim-mong'], ['PRE', 'yau-tsim-mong'], ['ETS', 'yau-tsim-mong'], ['AUS', 'yau-tsim-mong'],
  ['SSP', 'sham-shui-po'], ['CSW', 'sham-shui-po'], ['LCK', 'sham-shui-po'], ['MEF', 'sham-shui-po'], ['NAC', 'sham-shui-po'],
  ['KOT', 'kowloon-city'], ['HUH', 'kowloon-city'], ['SUW', 'kowloon-city'], ['HOM', 'kowloon-city'], ['TKW', 'kowloon-city'],
  ['WTS', 'wong-tai-sin'], ['DIH', 'wong-tai-sin'], ['LOF', 'wong-tai-sin'], ['CHH', 'wong-tai-sin'],
  ['KWT', 'kwun-tong'], ['LAT', 'kwun-tong'], ['KOB', 'kwun-tong'], ['NTK', 'kwun-tong'], ['KWB', 'kwun-tong'],
  ['TKO', 'sai-kung'], ['HAH', 'sai-kung'], ['POA', 'sai-kung'], ['TIK', 'sai-kung'], ['LHP', 'sai-kung'],
  ['KWF', 'kwai-tsing'], ['KWH', 'kwai-tsing'], ['LAK', 'kwai-tsing'],
  ['TSW', 'tsuen-wan'], ['TWH', 'tsuen-wan'], ['TWW', 'tsuen-wan'],
  ['SHT', 'sha-tin'], ['TAW', 'sha-tin'], ['CKT', 'sha-tin'], ['STW', 'sha-tin'], ['FOT', 'sha-tin'],
  ['TAP', 'tai-po'], ['TWO', 'tai-po'], ['UNI', 'tai-po'],
  ['FAN', 'north'], ['SHS', 'north'],
  ['YUL', 'yuen-long'], ['LOP', 'yuen-long'], ['TIS', 'yuen-long'], ['KSR', 'yuen-long'],
  ['TUM', 'tuen-mun'], ['SIH', 'tuen-mun'],
  ['TUC', 'islands'], ['SUN', 'islands'], ['DIS', 'islands'], ['AIR', 'islands'],
];

// 過濾掉 MTR_STATIONS 中不存在的代碼 (避免渲染崩潰)
const VALID_STATIONS = STATION_DISTRICT.filter(([code]) =>
  MTR_STATIONS.some((s) => s.code === code),
);

// 每個站點生成 10 個房源 (含劏房/套房/單身公寓) -> 約 400-600 條
export const SAMPLE_LISTINGS: Listing[] = VALID_STATIONS.flatMap(([mtr, dist], idx) =>
  Array.from({ length: 10 }, (_, j) => gen(idx * 23 + j * 7 + 3, dist, mtr)),
);
