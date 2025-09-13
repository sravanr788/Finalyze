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

// MongoDB Connection
const mongoURI = process.env.MONGO_URI;
mongoose.connect(mongoURI)
    .then(() => console.log('MongoDB connected successfully'))
    .catch(err => console.error('MongoDB connection error:', err));

// Server Setup
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});