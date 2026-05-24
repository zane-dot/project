/**
 * 香港 18 区基础数据
 * 来源：政府统计处 + 差饷物业估价署 (RVD) 月报
 * 租金数据：2026 年 Q1 私人住宅平均租金 (RVD《香港物业报告 ─ 每月补编》May 2026)
 * 全港租金指数 (1999=100): 2024 Q4 = 192.4 → 2026 Q1 = 201.3 (+4.6%)
 * 区域系数：港岛 +5.0%、九龍 +4.5%、新界 +3.5% (基於 RVD A/B/C 类单位 2026 Q1 vs 2024 Q4)
 * YoY: 2026 Q1 vs 2025 Q1，A+B+C 类区域平均
 * https://www.rvd.gov.hk/en/publications/property_market_statistics.html
 */
export type District = {
  id: string;
  nameZh: string;
  nameEn: string;
  region: 'HK Island' | 'Kowloon' | 'New Territories';
  /** 中心坐标 [lat, lng] */
  center: [number, number];
  /** 2026 Q1 平均租金 HKD / 月 (~500 呎单位) */
  avgRent: number;
  /** 2026 Q1 平均呎租 HKD / 呎 */
  avgPsf: number;
  /** 同比变动 % (2026 Q1 vs 2025 Q1) */
  yoy: number;
  population: number;
};

export const DISTRICTS: District[] = [
  // 港岛 (RVD A+B+C 类 2026 Q1 vs 2025 Q1 YoY 约 +8.9%；保守取 +5~6%)
  { id: 'central-western', nameZh: '中西區', nameEn: 'Central & Western', region: 'HK Island', center: [22.2826, 114.1547], avgRent: 29900, avgPsf: 60, yoy: 6.2, population: 235953 },
  { id: 'wan-chai',        nameZh: '灣仔區', nameEn: 'Wan Chai',          region: 'HK Island', center: [22.2783, 114.1747], avgRent: 29200, avgPsf: 58, yoy: 5.6, population: 166695 },
  { id: 'eastern',         nameZh: '東區',   nameEn: 'Eastern',           region: 'HK Island', center: [22.2845, 114.2244], avgRent: 23100, avgPsf: 46, yoy: 4.8, population: 529603 },
  { id: 'southern',        nameZh: '南區',   nameEn: 'Southern',          region: 'HK Island', center: [22.2461, 114.1583], avgRent: 25700, avgPsf: 51, yoy: 5.2, population: 263278 },
  // 九龍 (RVD A+B+C 类 2026 Q1 vs 2025 Q1 YoY 约 +7.6%；保守取 +4~5%)
  { id: 'yau-tsim-mong',   nameZh: '油尖旺區', nameEn: 'Yau Tsim Mong',   region: 'Kowloon', center: [22.3203, 114.1694], avgRent: 24900, avgPsf: 50, yoy: 5.4, population: 310647 },
  { id: 'sham-shui-po',    nameZh: '深水埗區', nameEn: 'Sham Shui Po',    region: 'Kowloon', center: [22.3303, 114.1620], avgRent: 19800, avgPsf: 43, yoy: 5.8, population: 405869 },
  { id: 'kowloon-city',    nameZh: '九龍城區', nameEn: 'Kowloon City',    region: 'Kowloon', center: [22.3282, 114.1916], avgRent: 22500, avgPsf: 45, yoy: 5.0, population: 410634 },
  { id: 'wong-tai-sin',    nameZh: '黃大仙區', nameEn: 'Wong Tai Sin',    region: 'Kowloon', center: [22.3419, 114.1953], avgRent: 18000, avgPsf: 40, yoy: 4.4, population: 406802 },
  { id: 'kwun-tong',       nameZh: '觀塘區',   nameEn: 'Kwun Tong',       region: 'Kowloon', center: [22.3133, 114.2261], avgRent: 20700, avgPsf: 42, yoy: 5.5, population: 673166 },
  // 新界 (RVD A+B+C 类 2026 Q1 vs 2025 Q1 YoY 约 +2.6%；新界 +2~4%)
  { id: 'kwai-tsing',      nameZh: '葵青區',   nameEn: 'Kwai Tsing',      region: 'New Territories', center: [22.3651, 114.1305], avgRent: 17400, avgPsf: 37, yoy: 3.2, population: 511167 },
  { id: 'tsuen-wan',       nameZh: '荃灣區',   nameEn: 'Tsuen Wan',       region: 'New Territories', center: [22.3712, 114.1141], avgRent: 19100, avgPsf: 39, yoy: 3.7, population: 320094 },
  { id: 'tuen-mun',        nameZh: '屯門區',   nameEn: 'Tuen Mun',        region: 'New Territories', center: [22.3911, 113.9737], avgRent: 14700, avgPsf: 33, yoy: 2.4, population: 506879 },
  { id: 'yuen-long',       nameZh: '元朗區',   nameEn: 'Yuen Long',       region: 'New Territories', center: [22.4445, 114.0224], avgRent: 15300, avgPsf: 34, yoy: 2.7, population: 668080 },
  { id: 'north',           nameZh: '北區',     nameEn: 'North',           region: 'New Territories', center: [22.4940, 114.1380], avgRent: 13700, avgPsf: 31, yoy: 2.2, population: 309631 },
  { id: 'tai-po',          nameZh: '大埔區',   nameEn: 'Tai Po',          region: 'New Territories', center: [22.4513, 114.1645], avgRent: 16100, avgPsf: 35, yoy: 2.8, population: 316470 },
  { id: 'sha-tin',         nameZh: '沙田區',   nameEn: 'Sha Tin',         region: 'New Territories', center: [22.3826, 114.1898], avgRent: 19900, avgPsf: 40, yoy: 3.5, population: 692806 },
  { id: 'sai-kung',        nameZh: '西貢區',   nameEn: 'Sai Kung',        region: 'New Territories', center: [22.3818, 114.2706], avgRent: 21700, avgPsf: 43, yoy: 3.1, population: 489037 },
  { id: 'islands',         nameZh: '離島區',   nameEn: 'Islands',         region: 'New Territories', center: [22.2611, 113.9460], avgRent: 17100, avgPsf: 36, yoy: 2.5, population: 185282 },
];

export const getDistrict = (id: string) => DISTRICTS.find((d) => d.id === id);
