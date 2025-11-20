import passport from 'passport';
import jwt from 'jsonwebtoken';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';
import mongoose from 'mongoose';
import { connectToDatabase } from '../../db.js';
// Passport Configuration
passport.use(
    new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.BACKEND_URL + '/auth/google/callback'
    },
    async (accessToken, refreshToken, profile, done) => {
        try {
          // Find or create user in DB
          await connectToDatabase();
          let user = await User.findOne({ googleId: profile.id });
  
          if (!user) {
            user = await User.create({
              googleId: profile.id,
              displayName: profile.displayName,
              email: profile.emails?.[0]?.value,
              picture: profile.photos?.[0]?.value,
            });
          }
  
          return done(null, user);
        } catch (err) {
          return done(err, null);
        }
      }
    )
);

passport.serializeUser((user, done) => {
    done(null, user.id); // serialize by Mongo ID
  });
  
passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });

export const googleAuth = passport.authenticate("google", {
    scope: ['profile', 'email'],
    prompt: 'select_account',
});

export const googleAuthCallback = async (req, res) => {
    await connectToDatabase();
    console.log("Google callback hit");
    try {
        if (!req.user) {
            return res.status(401).json({ message: "No user returned from Google." });
        }

            // Make sure user has required fields
    const userId = req.user._id;
    const email = req.user.email;
    if (!userId || !email) {
      console.error("Google callback: user missing _id or email", req.user);
      return res.status(500).json({ message: "User data incomplete." });
    }

        const accessToken = jwt.sign(
            { userId: req.user._id },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        const refreshToken = jwt.sign(
            { userId: req.user._id },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: '7d' }
        );

        res.cookie('accessToken', accessToken, {
            httpOnly: true, // Prevents JavaScript from accessing the cookie
            sameSite: 'none',
            secure: true,
            maxAge: 3600000 // Expires in 1 hour
          });
        
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            sameSite: 'none',
            secure: true,
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        return res.redirect(process.env.FRONTEND_URL + '/dashboard');
    } catch (error) {
        console.error("Callback error:", error);
        res.status(500).json({
            message: 'Could not generate token.',
            error: error.message
        });
    }
};

export const refresh = async (req, res) => {
    await connectToDatabase();
    const refreshToken = req.cookies?.refreshToken;

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

        const newAccessToken = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.cookie('accessToken', newAccessToken, {
            httpOnly: true,
            sameSite: 'none',
            secure: true,
            maxAge: 15 * 60 * 1000
        });


        res.status(200).json({
            message: 'Token refreshed successfully.',
        });

    } catch (error) {
        res.status(401).json({ message: 'Failed to refresh token.' });
    }
};

export const logout = (req, res) => {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.status(200).json({ message: 'Successfully logged out.' });
};

export const getProfile = async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        res.status(200).json({
            message: 'User profile retrieved successfully.',
            user: {
                id: user._id,
                displayName: user.displayName,
                email: user.email
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to retrieve profile.', error: error.message });
    }
};
