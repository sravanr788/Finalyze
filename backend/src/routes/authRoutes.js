import express from 'express';
import passport from 'passport';
import { googleAuth, googleAuthCallback,refresh, logout, getProfile } from '../controllers/authController.js';
import isAuth from '../middlewares/authMiddleWare.js';

const router = express.Router();

// Google OAuth routes
router.get('/google', googleAuth);

// Google OAuth callback route
router.get('/google/callback',
    passport.authenticate('google', { 
        failureRedirect: 'http://localhost:3000/login?error=auth_failed',
        session: false 
    }),
    googleAuthCallback
);

// Refresh token route
router.post('/refresh', refresh);

// Logout route
router.post('/logout', logout);

// Get user profile
router.get('/profile', isAuth, getProfile);

export default router;