import express from 'express';
import passport from 'passport';
import { googleAuth, googleAuthCallback,refresh, logout, getProfile } from '../controllers/authController.js';
import isAuth from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/google', googleAuth);
router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: process.env.FRONTEND_URL, session: false }),
    googleAuthCallback
);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.get('/profile', isAuth, getProfile);

export default router;