import mongoose from 'mongoose';

/**
 * TelegramUser Model
 * 
 * Links Telegram users to Finalyze User accounts.
 * Enables transaction creation with proper user context.
 */
const telegramUserSchema = new mongoose.Schema({
    telegramId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    chatId: {
        type: String,
        required: true
    },
    username: {
        type: String,
        default: null
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        default: null
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Index for fast lookups
telegramUserSchema.index({ telegramId: 1, isActive: 1 });

const TelegramUser = mongoose.model('TelegramUser', telegramUserSchema);
export default TelegramUser;
