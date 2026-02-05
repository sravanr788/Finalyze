/**
 * Helper Script: Link Telegram User to Finalyze Account
 * 
 * This script creates a mapping between a Telegram user and a Finalyze user.
 * Run this to manually link accounts for testing or initial setup.
 * 
 * Usage:
 * node linkTelegramUser.js <telegramId> <chatId> <firstName> <userEmail>
 * 
 * Example:
 * node linkTelegramUser.js 123456789 `123456789 "John" "john@example.com"
 */

import { config } from 'dotenv';
config();

import mongoose from 'mongoose';
import TelegramUser from './src/models/TelegramUser.js';
import User from './src/models/User.js';
import { connectToDatabase } from './db.js';

async function linkTelegramUser(telegramId, chatId, firstName, userEmail) {
    try {
        await connectToDatabase();

        console.log('🔍 Looking for Finalyze user with email:', userEmail);

        // Find the Finalyze user by email
        const user = await User.findOne({ email: userEmail });

        if (!user) {
            console.error('❌ User not found with email:', userEmail);
            console.log('\nAvailable users:');
            const allUsers = await User.find({}).select('email displayName');
            allUsers.forEach(u => console.log(`  - ${u.email} (${u.displayName})`));
            process.exit(1);
        }

        console.log('✅ Found user:', user.displayName, `(${user.email})`);

        // Check if Telegram user already exists
        const existing = await TelegramUser.findOne({ telegramId: telegramId.toString() });

        if (existing) {
            console.log('⚠️  Telegram user already linked');
            console.log('   Updating mapping...');

            existing.chatId = chatId.toString();
            existing.firstName = firstName;
            existing.userId = user._id;
            existing.isActive = true;

            await existing.save();
            console.log('✅ Mapping updated successfully!');
        } else {
            // Create new mapping
            const telegramUser = new TelegramUser({
                telegramId: telegramId.toString(),
                chatId: chatId.toString(),
                firstName,
                userId: user._id,
                isActive: true
            });

            await telegramUser.save();
            console.log('✅ Telegram user linked successfully!');
        }

        console.log('\n📊 Mapping Details:');
        console.log(`   Telegram ID: ${telegramId}`);
        console.log(`   Chat ID: ${chatId}`);
        console.log(`   Name: ${firstName}`);
        console.log(`   Linked to: ${user.displayName} (${user.email})`);
        console.log(`   User ID: ${user._id}`);

        console.log('\n✅ Done! You can now use the Telegram bot.');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error linking Telegram user:', error);
        process.exit(1);
    }
}

// Parse command line arguments
const args = process.argv.slice(2);

if (args.length < 4) {
    console.log('Usage: node linkTelegramUser.js <telegramId> <chatId> <firstName> <userEmail>');
    console.log('\nExample:');
    console.log('  node linkTelegramUser.js 123456789 123456789 "John" "john@example.com"');
    console.log('\nTo get your Telegram ID and Chat ID:');
    console.log('  1. Send /start to your bot');
    console.log('  2. Check the server logs for the Telegram ID and Chat ID');
    console.log('  3. Or use @userinfobot on Telegram');
    process.exit(1);
}

const [telegramId, chatId, firstName, userEmail] = args;

linkTelegramUser(telegramId, chatId, firstName, userEmail);
