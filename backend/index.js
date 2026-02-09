import { config } from 'dotenv';
config();

import express from 'express';
import passport from 'passport';
import cors from 'cors';
import cookieParser from 'cookie-parser';

// Routes
import authRoutes from './src/routes/authRoutes.js';
import analyticsRoutes from './src/routes/analyticsRoutes.js';
import transactionRoutes from './src/routes/TransactionRoutes.js';
import telegramRoutes from './src/routes/telegramRoutes.js';


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

app.use(passport.initialize());

/* -------------------------------------------------------------------------- */
/*                                   ROUTES                                   */
/* -------------------------------------------------------------------------- */

app.use('/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/telegram', telegramRoutes);

export default app;
