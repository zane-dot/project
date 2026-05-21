import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/auth';
import transactionRoutes from './routes/transactions';
import budgetRoutes from './routes/budgets';
import aiRoutes from './routes/ai';
import { logger } from './utils/logger';

// ---- Fail fast on missing critical config ----
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 16) {
  // eslint-disable-next-line no-console
  console.error('❌ JWT_SECRET is missing or too short (>=16 chars required).');
  process.exit(1);
}

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// ---- Security & infra middleware ----
app.use(helmet());

const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true); // allow same-origin / curl
      if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
  }),
);

app.use(express.json({ limit: '2mb' }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Basic rate limit (login / register more aggressively limited inside route)
app.use(
  '/api/',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);

// ---- Health ----
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ---- Routes ----
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/ai', aiRoutes);

// ---- 404 ----
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Not Found' });
});

// ---- Global error handler ----
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error & { status?: number }, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status && Number.isInteger(err.status) ? err.status : 500;
  if (status >= 500) {
    logger.error(err.stack || err.message);
  }
  res.status(status).json({
    error: status >= 500 ? 'Internal server error' : err.message || 'Error',
  });
});

app.listen(PORT, () => {
  logger.info(`🚀 Server running on http://localhost:${PORT}`);
});

export default app;
