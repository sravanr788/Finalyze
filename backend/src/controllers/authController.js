import passport from 'passport';
import jwt from 'jsonwebtoken';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';
import mongoose from 'mongoose';

// Passport Configuration
passport.use(
    new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: '/auth/google/callback'
    },
        async (accessToken, refreshToken, profile, done) => {
            try {
                let user = await User.findOne({ googleId: profile.id });
                if (user) {
                    done(null, user);
                } else {
                    user = await User.create({
                        googleId: profile.id,
                        displayName: profile.displayName,
                        email: profile.emails[0].value,
                    });
                    done(null, user);
                }
            } catch (error) {
                console.error('Passport Google Strategy Error:', error);
                done(error, null);
            }
        })
);

export const googleAuth = (req, res, next) => {
    // Store the returnTo URL in the session
    const { returnTo } = req.query;
    if (returnTo) {
        req.session.returnTo = returnTo;
    }
    
    passport.authenticate('google', {
        scope: ['profile', 'email'],
        prompt: 'select_account',
        accessType: 'offline',
        session: false
    })(req, res, next);
};

const FRONTEND_URL = 'http://localhost:3000';

export const googleAuthCallback = (req, res) => {
    try {
        if (!req.user) {
            return res.redirect(`${FRONTEND_URL}?error=authentication_failed`);
        }

        // Generate access token
        const accessToken = jwt.sign(
            { userId: req.user._id, email: req.user.email },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Set HTTP-only cookie
        res.cookie('token', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 3600000, // 1 hour
            path: '/',
            domain: process.env.NODE_ENV === 'production' ? '.yourdomain.com' : 'localhost'
        });

        // Get the returnTo URL from the original auth request
        const returnTo = req.session.returnTo || FRONTEND_URL;
        delete req.session.returnTo;

        // Redirect back to the frontend
        res.redirect(returnTo);

    } catch (error) {
        res.status(500).json({ message: 'Could not generate token.', error: error.message });
    }
};

export const refresh = async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(401).json({ message: 'Refresh Token not found.' });
    }

    try {
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        const userId = new mongoose.Types.ObjectId(decoded.userId);
        const user = await User.findById(userId);

        if (!user) {
            return res.status(401).json({ message: 'Invalid refresh token.' });
        }

        const accessToken = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(200).json({
            message: 'Token refreshed successfully.',
            accessToken,
        });

    } catch (error) {
        res.status(401).json({ message: 'Failed to refresh token.' });
    }
};

export const logout = (req, res) => {
    res.clearCookie('token');
    res.status(200).json({ message: 'Successfully logged out.' });
};

export const getProfile = async (req, res) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ message: 'No token found, authorization denied.' });
    }

    try {
        const user = jwt.verify(token, process.env.JWT_SECRET);
        res.status(200).json({
            message: 'User profile retrieved successfully.',
            user: {
                id: user.userId,
                displayName: user.displayName,
                email: user.email
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to retrieve profile.', error: error.message });
    }
};
