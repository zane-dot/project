# 💰 AI Finance Tracker

> 一个由 AI 驱动的个人财务管理系统，支持账单记录、预算管理、消费分析与 AI 智能洞察。

[![CI](https://github.com/zane-dot/project/actions/workflows/ci.yml/badge.svg)](https://github.com/zane-dot/project/actions/workflows/ci.yml)

## ✨ 功能特性

- 📝 **账单管理**：收支记录、分类标签、分页搜索、CSV 导入导出
- 📊 **数据可视化**：月度趋势图、分类占比饼图、收支对比柱状图
- 🤖 **AI 智能分析**：基于消费数据由 OpenAI / 内置规则引擎生成个性化建议
- 💡 **预算预警**：自定义分类月度预算上限，进度条 + 超支实时提醒
- 🔐 **用户认证**：JWT + bcrypt 密码哈希 + rate-limit 防暴力破解
- 🛡 **安全加固**：helmet、CORS 白名单、Zod 输入校验、统一错误处理

## 🛠 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | React 18 · TypeScript · Vite · Tailwind CSS · Recharts · Zustand · React Router · Axios |
| 后端 | Node.js 20 · Express · Prisma ORM · Zod · helmet · morgan · express-rate-limit |
| 数据库 | PostgreSQL 15 |
| AI | OpenAI Chat Completions（可选，未配置时自动回退到规则引擎） |
| 部署 | Docker Compose · Nginx · GitHub Actions CI |

## 🚀 快速启动

### 方式 A：一键 Docker（推荐）

```bash
git clone https://github.com/zane-dot/project.git
cd project

# 可选：导出你的 OpenAI Key（不设置则使用本地规则引擎）
export OPENAI_API_KEY="sk-..."
export JWT_SECRET="$(openssl rand -hex 32)"

docker compose up -d --build

# 首次启动后，进入 backend 容器写入演示数据（可选）
docker compose exec backend npx prisma db seed
```

打开：
- 前端：<http://localhost:5173>
- 后端 API：<http://localhost:3000>
- 健康检查：<http://localhost:3000/health>

**演示账号**（运行过 seed 后可用）：`demo@finance.app` / `demo1234`

### 方式 B：本地开发

```bash
# 1. 启动 Postgres（只跑数据库容器）
docker compose up -d postgres

# 2. 后端
cd backend
cp .env.example .env   # 修改 JWT_SECRET 与 OPENAI_API_KEY
npm install
npx prisma migrate dev --name init
npm run prisma:seed    # 可选：写入演示数据
npm run dev            # http://localhost:3000

# 3. 前端（新终端）
cd frontend
npm install
npm run dev            # http://localhost:5173
```

## 📁 项目结构

```
project/
├── frontend/                  # React 18 + TS + Tailwind
│   ├── src/
│   │   ├── pages/             # Dashboard / Transactions / Budgets / AIInsights / Login / Register / 404
│   │   ├── components/        # Layout / Sidebar / StatCard / Modal / EmptyState / ProtectedRoute / LoadingSpinner
│   │   ├── services/          # axios 实例 + auth/transactions/budgets/ai API 封装
│   │   ├── store/             # Zustand 全局状态（auth）
│   │   ├── types/             # 共享 TS 类型
│   │   └── utils/             # 格式化、分类常量
│   ├── Dockerfile             # 多阶段构建 → nginx
│   ├── nginx.conf             # SPA fallback + /api 反向代理
│   └── vite.config.ts
├── backend/                   # Express + Prisma
│   ├── src/
│   │   ├── routes/            # auth / transactions / budgets / ai
│   │   ├── controllers/       # 业务逻辑（含 CSV 导入导出）
│   │   ├── middleware/        # JWT 鉴权
│   │   └── utils/             # asyncHandler · Prisma 单例 · logger
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts            # 演示账号 + 3 个月模拟数据
│   └── Dockerfile
├── .github/workflows/ci.yml   # typecheck + build CI
└── docker-compose.yml
```

## 🌐 API 一览

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/auth/register` | 注册 |
| POST | `/api/auth/login` | 登录，返回 JWT |
| GET  | `/api/auth/me` | 当前用户 |
| GET  | `/api/transactions` | 分页查询（支持 `type`/`category`/`startDate`/`endDate`/`search`） |
| POST | `/api/transactions` | 新增 |
| PUT  | `/api/transactions/:id` | 更新 |
| DELETE | `/api/transactions/:id` | 删除 |
| GET  | `/api/transactions/summary` | 月度汇总（收入/支出/分类） |
| GET  | `/api/transactions/trends` | 近 N 月趋势 |
| POST | `/api/transactions/import` | CSV 批量导入 |
| GET  | `/api/transactions/export` | CSV 导出 |
| GET  | `/api/budgets` | 列出当月预算 + 实际花费 |
| POST | `/api/budgets` | 新增 / 更新 |
| DELETE | `/api/budgets/:id` | 删除 |
| GET  | `/api/ai/insights` | AI 财务洞察（自动回退） |

### CSV 格式

导入 CSV 表头：

```
date,type,amount,category,description
2025-05-12,EXPENSE,38.50,餐饮,午餐
2025-05-10,INCOME,12000,工资,
```

- `date` 任意可被 `Date.parse` 解析的格式
- `type` 必须为 `INCOME` 或 `EXPENSE`
- 单次最多 5000 行；行级错误会被跳过并随响应返回

## 🔐 环境变量

| 变量 | 默认 | 说明 |
|------|------|------|
| `DATABASE_URL` | — | PostgreSQL 连接串 |
| `JWT_SECRET` | — | 至少 16 字符的密钥（启动时强校验） |
| `JWT_EXPIRES_IN` | `7d` | JWT 有效期 |
| `OPENAI_API_KEY` | _空_ | 留空时 AI 洞察走规则引擎 |
| `OPENAI_MODEL` | `gpt-4o-mini` | OpenAI 模型名 |
| `CORS_ORIGIN` | `http://localhost:5173` | 逗号分隔的允许来源列表 |
| `PORT` | `3000` | 后端端口 |

## 🧪 验证 & CI

- 后端：`cd backend && npm run typecheck && npm run build`
- 前端：`cd frontend && npm run build`
- GitHub Actions 在每次 push / PR 时自动执行以上两步

## 🗺 路线图

- [ ] 多账户 / 子账户
- [ ] 周报邮件推送（cron + 邮件服务）
- [ ] 移动端 PWA
- [ ] 端到端测试（Playwright）

## 📄 License

MIT
