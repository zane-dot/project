# 🏠 FlatHunt HK

> **基於香港政府開放數據的租屋智能搜索平台**  
> 不爬虫、不假數、每一個數字都可追溯。

[![CI](https://github.com/zane-dot/project/actions/workflows/ci.yml/badge.svg)](https://github.com/zane-dot/project/actions/workflows/ci.yml)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![License](https://img.shields.io/badge/license-MIT-green)

![Hero Screenshot](https://via.placeholder.com/1200x600/f97316/ffffff?text=FlatHunt+HK+%C2%B7+%E6%90%B5%E5%B1%8B%E5%94%94%E5%86%8D%E9%9D%A0%E4%BC%B0)

## ✨ 為什麼這個項目值得看？

1. **解決真實香港痛點**：港漂、學生、新婚搵屋是高頻痛點，產品有真實用戶場景。
2. **數據合規可信**：所有區域數據來自香港特區政府開放數據集，**README 附完整來源清單**（[查看 /about 頁面](http://localhost:3000/about)），絕不爬取商業地產站。
3. **現代前端最佳實踐**：Next.js 14 App Router · RSC · TypeScript Strict · Tailwind · shadcn 風格組件 · Framer Motion · React Leaflet · Recharts · TanStack Query。
4. **產品感強**：港式霓虹 UI、深色模式、地圖熱力、租金洞察圖表、性價比評分 —— 一打開就能演示。
5. **SEO + 性能**：SSR + ISR + 圖片優化 + OG 圖 + 多語言 (zh-HK / zh-CN / en)，目標 Lighthouse 95+。

## 🎯 核心功能

| 功能 | 路徑 | 數據來源 |
|---|---|---|
| 🏘 房源搜索（區域 / MTR / 價格 / 房型） | `/search` | UGC + 200 條示例 |
| 📊 18 區租金洞察圖表 | `/insights` | 差餉物業估價署 (RVD) |
| 🗺 MTR 站點 + 區域熱力地圖 | `/map` | data.gov.hk · MTR · 地政總署 |
| 📑 房源詳情 + 性價比評分 | `/listings/[id]` | 算法：呎租 vs 區均價 |
| 🔐 用戶註冊 / 登錄 / 發布房源 | `/login` `/register` `/post` | JWT + bcrypt |
| 📚 數據透明聲明 | `/about` | — |

## 🛠 技術棧

| 層級 | 選型 | 原因 |
|---|---|---|
| 框架 | **Next.js 14 App Router** | RSC、SSR/ISR、SEO、Vercel 原生支援 |
| 語言 | **TypeScript (strict)** | 工程嚴謹度體現 |
| 樣式 | **Tailwind CSS** + 自定 design tokens | 快、可維護、暗色模式 |
| 組件 | **shadcn 風格**（Radix UI 原語） | 無樣式即用、可定制 |
| 圖表 | **Recharts** | 聲明式、React 友好 |
| 地圖 | **React Leaflet + OpenStreetMap** | 完全開源、無 API Key |
| 狀態 | **Zustand + TanStack Query** | 客戶端輕量 + 服務端數據 |
| 動畫 | **Framer Motion** | 微互動加分 |
| 表單 | **React Hook Form + Zod** | 性能 + 類型安全 |
| 後端 | **Next.js Route Handlers** | 全棧一體 |
| 資料庫 | **PostgreSQL 15 + Prisma 5** | 強類型 ORM |
| 認證 | **JWT (jose) + bcryptjs** | 無依賴第三方 |
| 部署 | **Docker · Vercel · GitHub Actions** | 多平台適配 |

## 🚀 快速啟動

### 方式 A：本地開發（推薦）

```bash
git clone https://github.com/zane-dot/project.git
cd project

# 1. 安裝依賴
npm install

# 2. 環境變數
cp .env.example .env

# 3. 啟動 Postgres
docker compose up -d postgres

# 4. 資料庫遷移 + 種子數據
npx prisma migrate dev --name init
npm run prisma:seed

# 5. 啟動 dev server
npm run dev
```

打開 <http://localhost:3000>

### 方式 B：一鍵 Docker

```bash
docker compose up -d --build
```

## 📁 項目結構

```
project/
├── src/
│   ├── app/                  # Next.js App Router 頁面
│   │   ├── page.tsx          # 首頁（Hero + 熱門區 + 性價比）
│   │   ├── search/           # 房源搜索 + 篩選
│   │   ├── listings/[id]/    # 房源詳情
│   │   ├── insights/         # 租金洞察圖表
│   │   ├── map/              # Leaflet 地圖
│   │   ├── about/            # 數據透明聲明
│   │   ├── login/ register/  # 認證
│   │   └── api/              # Route Handlers
│   ├── components/
│   │   ├── ui/               # 基礎組件 (button/card/input/badge)
│   │   ├── site/             # 站點級 (header/footer/theme-toggle)
│   │   └── map/              # Leaflet 地圖組件
│   ├── data/                 # 真實數據集（MTR、區、示例房源）
│   ├── lib/                  # utils、prisma、auth
│   └── types/
├── prisma/
│   └── schema.prisma
├── scripts/
│   └── fetch-open-data.ts    # 從 data.gov.hk 抓取數據
├── docker-compose.yml
├── Dockerfile
└── .github/workflows/ci.yml
```

## 📊 真實數據來源

| 數據 | 來源 | URL |
|---|---|---|
| MTR 站點 / 路線 | 港鐵公司 | https://data.gov.hk/tc-data/dataset/mtr-data-routes-fares-barrier-free-facilities |
| 18 區行政邊界 | 地政總署 | https://data.gov.hk/tc-data/dataset/hk-pland-pland-boundaries |
| 私人住宅租金統計 | 差餉物業估價署 (RVD) | https://www.rvd.gov.hk/en/property_market_statistics/index.html |
| 中小學校網 | 教育局 (EDB) | https://www.edb.gov.hk |
| 巴士實時到站 | KMB · Citybus API | https://data.etabus.gov.hk |
| 私人住宅成交記錄 | 土地註冊處 | https://www.landreg.gov.hk |

詳見 [/about](http://localhost:3000/about) 頁面。

## 🧪 測試 & 質量

```bash
npm run lint       # ESLint
npm run typecheck  # TypeScript 嚴格類型檢查
npm run build      # 生產構建 + 類型檢查
```

## 📈 性能目標

- Lighthouse Performance ≥ 95
- LCP < 1.2s
- CLS < 0.05
- 100% TypeScript strict 通過

## 📜 License

MIT © 2026 — Made with ❤️ for 香港
