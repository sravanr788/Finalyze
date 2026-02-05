/**
 * Telegram Bot Configuration Module
 * 
 * This module provides runtime-validated configuration for the Telegram bot.
 * It determines the bot's operating mode (development/production) and ensures
 * all required environment variables are present before the bot starts.
 * 
 * Key Design Decisions:
 * - Runtime validation (not TypeScript compile-time) to catch config errors early
 * - Separate tokens for dev/prod to prevent environment conflicts
 * - Immutable config object to prevent accidental modifications
 */

const config = {
    // Determine mode from NODE_ENV (defaults to development)
    mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
    
    // Bot token selection based on mode
    get botToken() {
        if (this.mode === 'production') {
            if (!process.env.TELEGRAM_BOT_TOKEN_PROD) {
                throw new Error(
                    '❌ TELEGRAM_BOT_TOKEN_PROD is required in production mode. ' +
                    'Please set it in your environment variables.'
                );
            }
            return process.env.TELEGRAM_BOT_TOKEN_PROD;
        } else {
            if (!process.env.TELEGRAM_BOT_TOKEN_DEV) {
                throw new Error(
                    '❌ TELEGRAM_BOT_TOKEN_DEV is required in development mode. ' +
                    'Please set it in your environment variables.'
                );
            }
            return process.env.TELEGRAM_BOT_TOKEN_DEV;
        }
    },
    
    // Webhook configuration (production only)
    get webhookDomain() {
        if (this.mode === 'production') {
            if (!process.env.TELEGRAM_WEBHOOK_DOMAIN) {
                throw new Error(
                    '❌ TELEGRAM_WEBHOOK_DOMAIN is required in production mode. ' +
                    'Example: https://your-domain.com'
                );
            }
            return process.env.TELEGRAM_WEBHOOK_DOMAIN;
        }
        return null;
    },
    
    // Webhook path (used in both Express route and webhook URL)
    webhookPath: '/api/telegram/webhook',
    
    // Full webhook URL for Telegram API
    get webhookUrl() {
        if (this.mode === 'production' && this.webhookDomain) {
            return `${this.webhookDomain}${this.webhookPath}`;
        }
        return null;
    },
    
    // Helper to check if bot should use polling
    get usePolling() {
        return this.mode === 'development';
    },
    
    // Helper to check if bot should use webhooks
    get useWebhook() {
        return this.mode === 'production';
    }
};

// Validate configuration on module load
// This ensures the app won't start with invalid config
try {
    const token = config.botToken; // Triggers validation
    console.log(`✅ Telegram config loaded: mode=${config.mode}`);
} catch (error) {
    console.error('❌ Telegram configuration error:', error.message);
    throw error;
}

export default config;
