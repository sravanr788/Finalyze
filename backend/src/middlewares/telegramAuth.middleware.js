/**
 * Telegram Authentication Middleware
 * 
 * Verifies that Telegram users are mapped to Finalyze accounts.
 * Attaches user context to bot context for transaction operations.
 */

import TelegramUser from '../models/TelegramUser.js';
import { connectToDatabase } from '../../db.js';

/**
 * Get or create Telegram user mapping
 * This middleware attaches telegramUser and userId to context
 */
export async function getTelegramUser(ctx, next) {
    await connectToDatabase();

    try {
        const telegramId = ctx.from?.id?.toString();
        const chatId = ctx.chat?.id?.toString();

        if (!telegramId || !chatId) {
            console.error('Missing Telegram ID or Chat ID');
            return next();
        }

        // Try to find existing mapping
        let telegramUser = await TelegramUser.findOne({
            telegramId,
            isActive: true
        }).populate('userId');

        // Attach to context
        ctx.telegramUser = telegramUser;
        ctx.userId = telegramUser?.userId?._id;
        ctx.isAuthenticated = !!telegramUser;

        return next();
    } catch (error) {
        console.error('Error in getTelegramUser middleware:', error);
        ctx.isAuthenticated = false;
        return next();
    }
}

/**
 * Require authentication
 * Use this middleware for actions that need a mapped user
 */
export function requireAuth(ctx, next) {
    if (!ctx.isAuthenticated) {
        ctx.reply(
            '💰 Welcome to Finalyze!\n\n' +
            ' To use this bot, you need a Finalyze account.\n\n' +
            '📝 **New User?**\n' +
            'Register at: https://finalyzeai.vercel.app/\n\n' +
            ' **Already have an account?**\n' +
            'Click "Link Account" below to connect your Telegram.\n\n' +
            '❓ **Need help?**\n' +
            'Contact admin for assistance.',
            {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: '🔗 Link Account', callback_data: 'action_link_account' }],
                        [{ text: '🌐 Visit Website', url: 'https://finalyzeai.vercel.app/' }]
                    ]
                }
            }
        );
        return;
    }

    return next();
}

/**
 * Create a new Telegram user mapping by email
 * This is a helper function, not middleware
 */
export async function createTelegramUserMappingByEmail(ctx, email) {
    await connectToDatabase();

    try {
        const User = (await import('../models/User.js')).default;

        // Find user by email
        const user = await User.findOne({ email: email.toLowerCase().trim() });

        if (!user) {
            return {
                success: false,
                message: '❌ Email not found\n\n' +
                    'This email is not registered with Finalyze.\n\n' +
                    'Please:\n' +
                    '1. Check your email spelling\n' +
                    '2. Register at https://finalyzeai.vercel.app/\n' +
                    '3. Try again with the correct email'
            };
        }

        // Check if already mapped
        const existing = await TelegramUser.findOne({
            telegramId: ctx.from.id.toString()
        });

        if (existing) {
            // Update existing mapping
            existing.userId = user._id;
            existing.chatId = ctx.chat.id.toString();
            existing.firstName = ctx.from.first_name;
            existing.lastName = ctx.from.last_name || null;
            existing.username = ctx.from.username || null;
            existing.isActive = true;
            await existing.save();

            console.log(`✅ Updated Telegram user mapping: ${ctx.from.id} → ${user.email}`);
        } else {
            // Create new mapping
            const telegramUser = new TelegramUser({
                telegramId: ctx.from.id.toString(),
                chatId: ctx.chat.id.toString(),
                firstName: ctx.from.first_name,
                lastName: ctx.from.last_name || null,
                username: ctx.from.username || null,
                userId: user._id,
                isActive: true
            });

            await telegramUser.save();
            console.log(`✅ Created Telegram user mapping: ${ctx.from.id} → ${user.email}`);
        }

        return {
            success: true,
            user,
            message: `✅ Account Linked Successfully!\n\n` +
                `Welcome, ${user.displayName || user.email}!\n\n` +
                `Your Telegram is now connected to Finalyze.\n` +
                `You can start adding transactions!`
        };
    } catch (error) {
        console.error('Error creating Telegram user mapping:', error);
        return {
            success: false,
            message: '❌ Something went wrong\n\n' +
                'Please try again or contact admin.'
        };
    }
}
