import { config } from 'dotenv';
config();

import express from 'express';
import mongoose from 'mongoose';
import passport from 'passport';
import cors from 'cors';
import session from 'express-session';
import cookieParser from 'cookie-parser';

import authRoutes from './src/routes/authRoutes.js';
import analyticsRoutes from './src/routes/analyticsRoutes.js';
import transactionRoutes from './src/routes/TransactionRoutes.js';
import telegramRoutes from './src/routes/telegramRoutes.js';

import telegramConfig from './src/config/telegram.config.js';
import telegramService from './src/services/telegram.service.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: ['http://localhost:3000',process.env.FRONTEND_URL],
    credentials: true,
}));
app.use(express.json());
app.use(session({
    secret: process.env.SESSION_SECRET || 'default-secret',
    resave: false,
    saveUninitialized: true,
}));

app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());

// Route handlers
app.use('/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/telegram', telegramRoutes);

// Server Setup
const server = app.listen(PORT, async () => {
    console.log(`Server is running on http://localhost:${PORT}`);

    // Initialize Telegram bot after server starts
    try {
        telegramService.initialize();

        if (telegramConfig.usePolling) {
            // Development mode: Start polling
            console.log('🔄 Starting Telegram bot in DEVELOPMENT mode...');
            await telegramService.startPolling();
        } else if (telegramConfig.useWebhook) {
            // Production mode: Register webhook
            console.log('🔄 Registering Telegram webhook in PRODUCTION mode...');
            await telegramService.registerWebhook();
        }
    } catch (error) {
        console.error('❌ Failed to start Telegram bot:', error.message);
        // Don't crash the server if Telegram bot fails
        // Other routes should still work
    }
});

// Graceful shutdown handlers
// These ensure the bot stops cleanly when the server is terminated
const gracefulShutdown = async (signal) => {
    console.log(`\n${signal} received. Starting graceful shutdown...`);

    try {
        // Stop Telegram bot
        await telegramService.stop();

        // Close Express server
        server.close(() => {
            console.log('✅ Server closed');
            process.exit(0);
        });

        // Force exit after 10 seconds if graceful shutdown fails
        setTimeout(() => {
            console.error('⚠️ Forced shutdown after timeout');
            process.exit(1);
        }, 10000);
    } catch (error) {
        console.error('❌ Error during shutdown:', error);
        process.exit(1);
    }
};

// Register shutdown handlers
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
