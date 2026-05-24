/**
 * 港铁站点真实数据（节选主要换乘 / 商业站点）
 * 来源：港铁公司公开资料 https://www.mtr.com.hk
 * data.gov.hk: https://data.gov.hk/tc-data/dataset/mtr-data-routes-fares-barrier-free-facilities
 */
export type MtrLine =
  | 'ISL'  // 港岛线
  | 'TWL'  // 荃湾线
  | 'KTL'  // 观塘线
  | 'TKL'  // 将军澳线
  | 'TCL'  // 东涌线
  | 'AEL'  // 机场快线
  | 'TML'  // 屯马线
  | 'EAL'  // 东铁线
  | 'SIL'; // 南港岛线

export const LINE_COLORS: Record<MtrLine, string> = {
  ISL: '#0860a8',
  TWL: '#e60012',
  KTL: '#00a040',
  TKL: '#7e3c97',
  TCL: '#f3982d',
  AEL: '#00888e',
  TML: '#9c2e00',
  EAL: '#5eb6e4',
  SIL: '#bac429',
};

export const LINE_NAMES: Record<MtrLine, string> = {
  ISL: '港島綫',
  TWL: '荃灣綫',
  KTL: '觀塘綫',
  TKL: '將軍澳綫',
  TCL: '東涌綫',
  AEL: '機場快綫',
  TML: '屯馬綫',
  EAL: '東鐵綫',
  SIL: '南港島綫',
};

export type MtrStation = {
  code: string;
  nameZh: string;
  nameEn: string;
  lat: number;
  lng: number;
  lines: MtrLine[];
};

export const MTR_STATIONS: MtrStation[] = [
  // 港岛线 / 荃湾线 核心
  { code: 'CEN', nameZh: '中環', nameEn: 'Central',       lat: 22.2819, lng: 114.1582, lines: ['ISL', 'TWL'] },
  { code: 'ADM', nameZh: '金鐘', nameEn: 'Admiralty',     lat: 22.2796, lng: 114.1647, lines: ['ISL', 'TWL', 'SIL', 'EAL'] },
  { code: 'WAC', nameZh: '灣仔', nameEn: 'Wan Chai',      lat: 22.2776, lng: 114.1731, lines: ['ISL'] },
  { code: 'CAB', nameZh: '銅鑼灣', nameEn: 'Causeway Bay',lat: 22.2802, lng: 114.1851, lines: ['ISL'] },
  { code: 'TIH', nameZh: '天后', nameEn: 'Tin Hau',       lat: 22.2826, lng: 114.1918, lines: ['ISL'] },
  { code: 'FOH', nameZh: '炮台山', nameEn: 'Fortress Hill',lat:22.2880, lng: 114.1937, lines: ['ISL'] },
  { code: 'NOP', nameZh: '北角', nameEn: 'North Point',   lat: 22.2911, lng: 114.2003, lines: ['ISL', 'TKL'] },
  { code: 'QUB', nameZh: '鰂魚涌', nameEn: 'Quarry Bay',  lat: 22.2879, lng: 114.2096, lines: ['ISL', 'TKL'] },
  { code: 'TAK', nameZh: '太古', nameEn: 'Tai Koo',       lat: 22.2845, lng: 114.2164, lines: ['ISL'] },
  { code: 'SWH', nameZh: '西灣河', nameEn: 'Sai Wan Ho',  lat: 22.2818, lng: 114.2222, lines: ['ISL'] },
  // 九龙核心
  { code: 'TST', nameZh: '尖沙咀', nameEn: 'Tsim Sha Tsui', lat: 22.2976, lng: 114.1722, lines: ['TWL'] },
  { code: 'JOR', nameZh: '佐敦',   nameEn: 'Jordan',         lat: 22.3050, lng: 114.1714, lines: ['TWL'] },
  { code: 'YMT', nameZh: '油麻地', nameEn: 'Yau Ma Tei',     lat: 22.3133, lng: 114.1706, lines: ['TWL', 'KTL'] },
  { code: 'MOK', nameZh: '旺角',   nameEn: 'Mong Kok',       lat: 22.3192, lng: 114.1693, lines: ['TWL', 'KTL'] },
  { code: 'PRE', nameZh: '太子',   nameEn: 'Prince Edward',  lat: 22.3247, lng: 114.1683, lines: ['TWL', 'KTL'] },
  { code: 'SSP', nameZh: '深水埗', nameEn: 'Sham Shui Po',   lat: 22.3306, lng: 114.1626, lines: ['TWL'] },
  { code: 'CSW', nameZh: '長沙灣', nameEn: 'Cheung Sha Wan', lat: 22.3358, lng: 114.1564, lines: ['TWL'] },
  { code: 'LCK', nameZh: '荔枝角', nameEn: 'Lai Chi Kok',    lat: 22.3375, lng: 114.1481, lines: ['TWL'] },
  { code: 'MEF', nameZh: '美孚',   nameEn: 'Mei Foo',        lat: 22.3375, lng: 114.1379, lines: ['TWL', 'TML'] },
  { code: 'LAK', nameZh: '荔景',   nameEn: 'Lai King',       lat: 22.3486, lng: 114.1262, lines: ['TWL', 'TCL'] },
  { code: 'KWF', nameZh: '葵芳',   nameEn: 'Kwai Fong',      lat: 22.3568, lng: 114.1280, lines: ['TWL'] },
  { code: 'KWH', nameZh: '葵興',   nameEn: 'Kwai Hing',      lat: 22.3631, lng: 114.1314, lines: ['TWL'] },
  { code: 'TWH', nameZh: '大窩口', nameEn: 'Tai Wo Hau',     lat: 22.3705, lng: 114.1250, lines: ['TWL'] },
  { code: 'TSW', nameZh: '荃灣',   nameEn: 'Tsuen Wan',      lat: 22.3736, lng: 114.1175, lines: ['TWL'] },
  // 观塘线
  { code: 'KOT', nameZh: '九龍塘', nameEn: 'Kowloon Tong',   lat: 22.3372, lng: 114.1762, lines: ['KTL', 'EAL'] },
  { code: 'LOF', nameZh: '樂富',   nameEn: 'Lok Fu',         lat: 22.3382, lng: 114.1869, lines: ['KTL'] },
  { code: 'WTS', nameZh: '黃大仙', nameEn: 'Wong Tai Sin',   lat: 22.3417, lng: 114.1933, lines: ['KTL'] },
  { code: 'DIH', nameZh: '鑽石山', nameEn: 'Diamond Hill',   lat: 22.3397, lng: 114.2014, lines: ['KTL', 'TML'] },
  { code: 'CHH', nameZh: '彩虹',   nameEn: 'Choi Hung',      lat: 22.3349, lng: 114.2086, lines: ['KTL'] },
  { code: 'KOB', nameZh: '九龍灣', nameEn: 'Kowloon Bay',    lat: 22.3232, lng: 114.2140, lines: ['KTL'] },
  { code: 'NTK', nameZh: '牛頭角', nameEn: 'Ngau Tau Kok',   lat: 22.3158, lng: 114.2189, lines: ['KTL'] },
  { code: 'KWT', nameZh: '觀塘',   nameEn: 'Kwun Tong',      lat: 22.3120, lng: 114.2266, lines: ['KTL'] },
  { code: 'LAT', nameZh: '藍田',   nameEn: 'Lam Tin',        lat: 22.3068, lng: 114.2329, lines: ['KTL'] },
  { code: 'YAT', nameZh: '油塘',   nameEn: 'Yau Tong',       lat: 22.2982, lng: 114.2370, lines: ['KTL', 'TKL'] },
  // 将军澳线
  { code: 'TIK', nameZh: '調景嶺', nameEn: 'Tiu Keng Leng',  lat: 22.3043, lng: 114.2526, lines: ['TKL'] },
  { code: 'TKO', nameZh: '將軍澳', nameEn: 'Tseung Kwan O',  lat: 22.3076, lng: 114.2599, lines: ['TKL'] },
  { code: 'HAH', nameZh: '坑口',   nameEn: 'Hang Hau',       lat: 22.3155, lng: 114.2644, lines: ['TKL'] },
  { code: 'POA', nameZh: '寶琳',   nameEn: 'Po Lam',         lat: 22.3225, lng: 114.2576, lines: ['TKL'] },
  // 东涌线 / 机场快线
  { code: 'HOK', nameZh: '香港',   nameEn: 'Hong Kong',      lat: 22.2848, lng: 114.1581, lines: ['TCL', 'AEL'] },
  { code: 'KOW', nameZh: '九龍',   nameEn: 'Kowloon',        lat: 22.3046, lng: 114.1614, lines: ['TCL', 'AEL'] },
  { code: 'OLY', nameZh: '奧運',   nameEn: 'Olympic',        lat: 22.3179, lng: 114.1601, lines: ['TCL'] },
  { code: 'NAC', nameZh: '南昌',   nameEn: 'Nam Cheong',     lat: 22.3268, lng: 114.1539, lines: ['TCL', 'TML'] },
  { code: 'TUC', nameZh: '東涌',   nameEn: 'Tung Chung',     lat: 22.2895, lng: 113.9412, lines: ['TCL'] },
  { code: 'AIR', nameZh: '機場',   nameEn: 'Airport',        lat: 22.3158, lng: 113.9365, lines: ['AEL'] },
  // 屯马线 / 东铁线（节选）
  { code: 'SHT', nameZh: '沙田',   nameEn: 'Sha Tin',        lat: 22.3815, lng: 114.1869, lines: ['EAL'] },
  { code: 'TAW', nameZh: '大圍',   nameEn: 'Tai Wai',        lat: 22.3725, lng: 114.1786, lines: ['EAL', 'TML'] },
  { code: 'TAP', nameZh: '大埔墟', nameEn: 'Tai Po Market',  lat: 22.4445, lng: 114.1707, lines: ['EAL'] },
  { code: 'FAN', nameZh: '粉嶺',   nameEn: 'Fanling',        lat: 22.4920, lng: 114.1387, lines: ['EAL'] },
  { code: 'SHS', nameZh: '上水',   nameEn: 'Sheung Shui',    lat: 22.5017, lng: 114.1281, lines: ['EAL'] },
  { code: 'YUL', nameZh: '元朗',   nameEn: 'Yuen Long',      lat: 22.4459, lng: 114.0353, lines: ['TML'] },
  { code: 'TUM', nameZh: '屯門',   nameEn: 'Tuen Mun',       lat: 22.3946, lng: 113.9734, lines: ['TML'] },
  { code: 'HUH', nameZh: '紅磡',   nameEn: 'Hung Hom',       lat: 22.3030, lng: 114.1818, lines: ['TML', 'EAL'] },
];
