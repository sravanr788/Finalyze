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
          // Find or create user in DB
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

const FRONTEND_URL = process.env.FRONTEND_URL + '/dashboard';

// export const googleAuthCallback = (req, res) => {
//     try {
//         // Generate a short-lived access token
//         const accessToken = jwt.sign(
//             { userId: req.user._id, email: req.user.email },
//             process.env.JWT_SECRET,
//             { expiresIn: '15m' } // Short expiration time
//         );

//         // Generate a long-lived refresh token
//         const refreshToken = jwt.sign(
//             { userId: req.user._id },
//             process.env.REFRESH_TOKEN_SECRET,
//             { expiresIn: '7d' } // Long expiration time
//         );

//         // Send both tokens back to the client as a JSON response
//         res.status(200).json({
//             message: "Authentication successful.",
//             accessToken,
//             refreshToken
//         });
//         // res.cookie('accessToken', accessToken, {
//         //     httpOnly: true, // Prevents JavaScript from accessing the cookie
//         //     secure: true,   // Only send over HTTPS in production
//         //     sameSite: 'strict', // Prevents CSRF attacks
//         //     maxAge: 3600000 // Expires in 1 hour
//         //   });
        
//         //   res.redirect(FRONTEND_URL);

//     } catch (error) {
//         res.status(500).json({ message: 'Could not generate token.', error: error.message });
//     }
// };

export const googleAuthCallback = (req, res) => {
    console.log("Google callback hit");
    // console.log("req.user:", req.user);  // 👈 check if user is coming through

    try {
        if (!req.user) {
            return res.status(401).json({ message: "No user returned from Google." });
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
            secure: true,   // Only send over HTTPS in production
            sameSite: 'strict', // Prevents CSRF attacks
            maxAge: 3600000 // Expires in 1 hour
          });
        res.redirect(FRONTEND_URL);
    } catch (error) {
        console.error("Callback error:", error);
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
    res.clearCookie('accessToken');
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
