import { config } from 'dotenv';
config();

import express from 'express';
import passport from 'passport';
import cors from 'cors';
import session from 'express-session';
import cookieParser from 'cookie-parser';

// Routes
import authRoutes from '../src/routes/authRoutes.js';
import analyticsRoutes from '../src/routes/analyticsRoutes.js';
import transactionRoutes from '../src/routes/TransactionRoutes.js';
import telegramRoutes from '../src/routes/telegramRoutes.js';

// Telegram
import telegramConfig from '../src/config/telegram.config.js';
import telegramService from '../src/services/telegram.service.js';

const app = express();

/* -------------------------------------------------------------------------- */
/*                                MIDDLEWARE                                  */
/* -------------------------------------------------------------------------- */

app.use(cors({
  origin: ['http://localhost:3000', process.env.FRONTEND_URL],
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

app.use(session({
  secret: process.env.SESSION_SECRET || 'default-secret',
  resave: false,
  saveUninitialized: true,
}));

app.use(passport.initialize());

/* -------------------------------------------------------------------------- */
/*                                   ROUTES                                   */
/* -------------------------------------------------------------------------- */

app.use('/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/telegram', telegramRoutes);

let telegramInitialized = false;

async function ensureTelegramInitialized() {
  if (telegramInitialized) return;
  telegramInitialized = true;

  try {
    telegramService.initialize();

    if (telegramConfig.usePolling) {
      console.log('🔄 Telegram bot in DEV mode (polling)');
      await telegramService.startPolling();
    } else if (telegramConfig.useWebhook) {
      console.log('🔄 Telegram bot in PROD mode (webhook)');
      await telegramService.registerWebhook();
    }
  } catch (err) {
    console.error('❌ Telegram init failed:', err.message);
  }
}

app.use(async (req, res, next) => {
  await ensureTelegramInitialized();
  next();
});

export default app;
