# 💰 AI Finance Tracker

> 一个由 AI 驱动的个人财务管理系统，支持账单记录、预算管理、消费分析与 AI 智能洞察。

## ✨ 功能特性

- 📝 **账单管理**：收支记录、分类标签、CSV 导入导出
- 📊 **数据可视化**：月度趋势、分类占比、收支对比
- 🤖 **AI 智能分析**：基于消费数据生成个性化建议
- 💡 **预算预警**：自定义预算上限，超支实时提醒
- 🔐 **用户认证**：JWT + 安全的密码加密

## 🛠 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | React 18 + TypeScript + Tailwind CSS + Recharts |
| 后端 | Node.js + Express + Prisma ORM |
| 数据库 | PostgreSQL |
| AI | OpenAI API (GPT-4) |
| 部署 | Docker Compose |

## 🚀 快速启动

### 前置要求
- Docker & Docker Compose
- Node.js >= 18
- OpenAI API Key

### 启动步骤

```bash
# 1. 克隆项目
git clone https://github.com/zane-dot/project.git
cd project

# 2. 配置环境变量
cp backend/.env.example backend/.env
# 编辑 .env 填入你的 OpenAI API Key 和数据库信息

# 3. 一键启动（Docker）
docker-compose up -d

# 4. 初始化数据库
cd backend && npx prisma migrate dev

# 5. 访问应用
# 前端: http://localhost:5173
# 后端 API: http://localhost:3000
```

### 本地开发

```bash
# 后端
cd backend
npm install
npm run dev

# 前端（新终端）
cd frontend
npm install
npm run dev
```

## 📁 项目结构

```
project/
├── frontend/          # React 前端
│   └── src/
│       ├── pages/     # 页面组件
│       ├── components/# 公共组件
│       ├── hooks/     # 自定义 Hook
│       └── services/  # API 请求封装
├── backend/           # Node.js 后端
│   └── src/
│       ├── routes/    # 路由定义
│       ├── controllers/# 业务逻辑
│       ├── middleware/ # 中间件
│       └── utils/     # 工具函数
│   └── prisma/        # 数据库 Schema
└── docker-compose.yml
```

## 📸 截图预览

> Dashboard、Analytics、AI Insights 页面展示消费趋势与 AI 建议。

## 📄 License

MIT
