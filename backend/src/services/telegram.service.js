/**
 * Telegram Bot Service
 * 
 * This service manages the Telegram bot lifecycle, command handlers, and
 * transaction flows. It supports both polling (development) and webhook (production) modes.
 * 
 * Features:
 * - Dual-mode transaction entry (Manual + NLP)
 * - User authentication and mapping
 * - Transaction confirmation previews
 * - Minimal emoji usage
 */

import { Telegraf } from 'telegraf';
import telegramConfig from '../config/telegram.config.js';
import sessionStore from '../utils/telegramSession.js';
import { getTelegramUser, requireAuth } from '../middlewares/telegramAuth.middleware.js';
import * as keyboards from '../utils/telegramKeyboards.js';
import * as validation from '../utils/telegramValidation.js';
import * as transactionController from '../controllers/telegramTransaction.controller.js';

class TelegramService {
    constructor() {
        this.bot = null;
        this.isInitialized = false;
    }

    /**
     * Initialize the Telegram bot instance
     */
    initialize() {
        if (this.isInitialized) {
            console.warn('⚠️ Telegram bot already initialized');
            return;
        }

        try {
            this.bot = new Telegraf(telegramConfig.botToken);

            // Global error handler
            this.bot.catch((err, ctx) => {
                console.error('❌ Telegram bot error:', err);
                console.error('Context:', ctx.update);
            });

            // Apply authentication middleware to all updates
            this.bot.use(getTelegramUser);

            // Register handlers
            this.registerHandlers();

            this.isInitialized = true;
            console.log('✅ Telegram bot initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize Telegram bot:', error);
            throw error;
        }
    }

    /**
     * Register all command handlers and button actions
     */
    registerHandlers() {
        // /start command - Entry point
        this.bot.on('message', async (ctx) => {
            console.log('🔥 Incoming message:', ctx.message.text);
            await ctx.reply('Bot is alive.');
        });

        this.bot.command('start', async (ctx) => {
            const userName = ctx.from.first_name || 'there';

            if (ctx.isAuthenticated) {
                // Authenticated user
                await ctx.reply(
                    `Welcome back, ${userName}! 💰\n\n` +
                    `Your AI-powered finance tracker.\n` +
                    `Track expenses, analyze spending, and gain financial insights.`,
                    keyboards.getMainMenuKeyboard()
                );
            } else {
                // New/unauthenticated user
                await ctx.reply(
                    `Welcome to Finalyze, ${userName}! 💰\n\n` +
                    `Your AI-powered finance tracker.\n\n` +
                    `🔐 To get started, please link your account.`,
                    {
                        reply_markup: {
                            inline_keyboard: [
                                [{ text: '🔗 Link Account', callback_data: 'action_link_account' }],
                                [{ text: '🌐 Visit Website', url: 'https://finalyzeai.vercel.app/' }]
                            ]
                        }
                    }
                );
            }
        });

        // Link Account flow
        this.bot.action('action_link_account', async (ctx) => {
            await ctx.answerCbQuery();

            if (ctx.isAuthenticated) {
                return ctx.editMessageText(
                    '✅ Your account is already linked!\n\n' +
                    `Email: ${ctx.telegramUser.userId.email}`,
                    keyboards.getMainMenuKeyboard()
                );
            }

            sessionStore.set(ctx.chat.id, {
                mode: 'linking',
                step: 'email_input'
            });

            await ctx.editMessageText(
                '🔗 Link Your Account\n\n' +
                'Please enter the email address you used to register on Finalyze:\n\n' +
                '📧 Example: john@example.com\n\n' +
                '⚠️ Make sure it matches your Finalyze account email.'
            );
        });

        // Main menu
        this.bot.action('action_main_menu', async (ctx) => {
            await ctx.answerCbQuery();
            await ctx.editMessageText(
                'What would you like to do?',
                keyboards.getMainMenuKeyboard()
            );
        });

        // Add Transaction - Show entry mode selection
        this.bot.action('action_add_transaction', requireAuth, async (ctx) => {
            await ctx.answerCbQuery();

            sessionStore.clear(ctx.chat.id);

            await ctx.editMessageText(
                'Choose how you want to add your transaction:',
                keyboards.getEntryModeKeyboard()
            );
        });

        // Manual entry mode
        this.bot.action('mode_manual', async (ctx) => {
            await ctx.answerCbQuery();

            sessionStore.set(ctx.chat.id, {
                mode: 'manual',
                step: 'type',
                tempTransaction: {}
            });

            await ctx.editMessageText(
                'Is this an income or expense?',
                keyboards.getTypeSelectionKeyboard()
            );
        });

        // NLP entry mode
        this.bot.action('mode_nlp', async (ctx) => {
            await ctx.answerCbQuery();

            sessionStore.set(ctx.chat.id, {
                mode: 'nlp',
                step: 'text_input'
            });

            await ctx.editMessageText(
                'Enter your transaction in natural language:\n\n' +
                'Examples:\n' +
                '• Coffee $5 at Starbucks\n' +
                '• Lunch $25 and uber $15 yesterday\n' +
                '• Monthly salary $4500',
                keyboards.getBackToMenuKeyboard()
            );
        });

        // === MANUAL ENTRY FLOW ===

        // Type selection
        this.bot.action(/^type_(income|expense)$/, async (ctx) => {
            await ctx.answerCbQuery();

            const type = ctx.match[1];
            const session = sessionStore.get(ctx.chat.id);

            if (!session || session.mode !== 'manual') {
                return ctx.editMessageText('Session expired. Please start again.', keyboards.getMainMenuKeyboard());
            }

            session.tempTransaction.type = type;
            session.step = 'category';
            sessionStore.set(ctx.chat.id, session);

            await ctx.editMessageText(
                `Select ${type} category:`,
                keyboards.getCategoryKeyboard(type)
            );
        });

        // Category selection
        this.bot.action(/^cat_(income|expense)_(.+)$/, async (ctx) => {
            await ctx.answerCbQuery();

            const [, type, category] = ctx.match;
            const session = sessionStore.get(ctx.chat.id);

            if (!session || session.mode !== 'manual') {
                return ctx.editMessageText('Session expired. Please start again.', keyboards.getMainMenuKeyboard());
            }

            session.tempTransaction.category = category;
            session.step = 'amount';
            sessionStore.set(ctx.chat.id, session);

            await ctx.editMessageText(
                `Category: ${keyboards.getCategoryDisplayName(category)}\n\n` +
                `Enter the amount:\n` +
                `Example: 50 or 123.45`,
                keyboards.getBackToMenuKeyboard()
            );
        });

        // Date selection
        this.bot.action(/^date_(today|yesterday|custom)$/, async (ctx) => {
            await ctx.answerCbQuery();

            const dateType = ctx.match[1];
            const session = sessionStore.get(ctx.chat.id);

            if (!session || session.mode !== 'manual') {
                return ctx.editMessageText('Session expired. Please start again.', keyboards.getMainMenuKeyboard());
            }

            if (dateType === 'custom') {
                session.step = 'custom_date';
                sessionStore.set(ctx.chat.id, session);

                return ctx.editMessageText(
                    'Enter date in format YYYY-MM-DD:\n' +
                    'Example: 2026-02-05',
                    keyboards.getBackToMenuKeyboard()
                );
            }

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (dateType === 'yesterday') {
                today.setDate(today.getDate() - 1);
            }

            session.tempTransaction.date = today;
            session.step = 'confirm';
            sessionStore.set(ctx.chat.id, session);

            await this.showConfirmation(ctx);
        });

        // === CONFIRMATION ===

        // Confirm and save
        this.bot.action('confirm_save', async (ctx) => {
            await ctx.answerCbQuery();

            const session = sessionStore.get(ctx.chat.id);
            if (!session || !session.tempTransaction) {
                return ctx.editMessageText('Session expired. Please start again.', keyboards.getMainMenuKeyboard());
            }

            try {
                await transactionController.createTransaction(
                    session.tempTransaction,
                    ctx.userId
                );

                sessionStore.clear(ctx.chat.id);

                await ctx.editMessageText(
                    '✅ Transaction saved successfully!\n\n' +
                    'Your transaction has been added to Finalyze.',
                    keyboards.getMainMenuKeyboard()
                );
            } catch (error) {
                console.error('Error saving transaction:', error);
                await ctx.editMessageText(
                    '❌ Failed to save transaction.\n\n' +
                    'Please try again.',
                    keyboards.getMainMenuKeyboard()
                );
            }
        });

        // Edit transaction
        this.bot.action('confirm_edit', async (ctx) => {
            await ctx.answerCbQuery();

            sessionStore.clear(ctx.chat.id);

            await ctx.editMessageText(
                'Transaction cancelled.\n\n' +
                'Start over to add a new transaction.',
                keyboards.getMainMenuKeyboard()
            );
        });

        // Cancel transaction
        this.bot.action('confirm_cancel', async (ctx) => {
            await ctx.answerCbQuery();

            sessionStore.clear(ctx.chat.id);

            await ctx.editMessageText(
                'Transaction cancelled.',
                keyboards.getMainMenuKeyboard()
            );
        });

        // === MULTI-TRANSACTION CONFIRMATION (NLP) ===

        this.bot.action(/^confirm_multi_(\d+)$/, async (ctx) => {
            await ctx.answerCbQuery();

            const index = parseInt(ctx.match[1]);
            const session = sessionStore.get(ctx.chat.id);

            if (!session || !session.parsedTransactions) {
                return ctx.editMessageText('Session expired. Please start again.', keyboards.getMainMenuKeyboard());
            }

            try {
                const transaction = session.parsedTransactions[index - 1];
                await transactionController.createTransaction(transaction, ctx.userId);

                session.savedCount = (session.savedCount || 0) + 1;

                // Show next transaction or completion
                if (index < session.parsedTransactions.length) {
                    await this.showMultiTransactionPreview(ctx, index + 1);
                } else {
                    sessionStore.clear(ctx.chat.id);
                    await ctx.editMessageText(
                        `✅ ${session.savedCount} transaction(s) saved successfully!`,
                        keyboards.getMainMenuKeyboard()
                    );
                }
            } catch (error) {
                console.error('Error saving transaction:', error);
                await ctx.reply('❌ Failed to save transaction. Continuing with next...');

                if (index < session.parsedTransactions.length) {
                    await this.showMultiTransactionPreview(ctx, index + 1);
                } else {
                    await ctx.reply('Process completed.', keyboards.getMainMenuKeyboard());
                }
            }
        });

        this.bot.action(/^skip_multi_(\d+)$/, async (ctx) => {
            await ctx.answerCbQuery();

            const index = parseInt(ctx.match[1]);
            const session = sessionStore.get(ctx.chat.id);

            if (!session || !session.parsedTransactions) {
                return ctx.editMessageText('Session expired.', keyboards.getMainMenuKeyboard());
            }

            if (index < session.parsedTransactions.length) {
                await this.showMultiTransactionPreview(ctx, index + 1);
            } else {
                const saved = session.savedCount || 0;
                sessionStore.clear(ctx.chat.id);
                await ctx.editMessageText(
                    saved > 0
                        ? `✅ ${saved} transaction(s) saved.`
                        : 'No transactions saved.',
                    keyboards.getMainMenuKeyboard()
                );
            }
        });

        this.bot.action('cancel_all_multi', async (ctx) => {
            await ctx.answerCbQuery();

            const session = sessionStore.get(ctx.chat.id);
            const saved = session?.savedCount || 0;

            sessionStore.clear(ctx.chat.id);

            await ctx.editMessageText(
                saved > 0
                    ? `Process cancelled. ${saved} transaction(s) were saved.`
                    : 'Process cancelled.',
                keyboards.getMainMenuKeyboard()
            );
        });

        // === VIEW BALANCE ===

        this.bot.action('action_view_balance', requireAuth, async (ctx) => {
            await ctx.answerCbQuery();

            try {
                const summary = await transactionController.getBalanceSummary(ctx.userId);

                await ctx.editMessageText(
                    '📊 Your Financial Summary\n\n' +
                    `Income: ₹${summary.income.toFixed(2)}\n` +
                    `Expenses: ₹${summary.expenses.toFixed(2)}\n` +
                    `Balance: ₹${summary.balance.toFixed(2)}\n\n` +
                    `Total Transactions: ${summary.totalTransactions}`,
                    keyboards.getMainMenuKeyboard()
                );
            } catch (error) {
                console.error('Error fetching balance:', error);
                await ctx.editMessageText(
                    '❌ Failed to fetch balance.',
                    keyboards.getMainMenuKeyboard()
                );
            }
        });

        // === VIEW TRANSACTIONS ===

        this.bot.action('action_view_transactions', requireAuth, async (ctx) => {
            await ctx.answerCbQuery();

            try {
                const transactions = await transactionController.getRecentTransactions(ctx.userId, 5);

                if (transactions.length === 0) {
                    return ctx.editMessageText(
                        'No transactions found.\n\n' +
                        'Add your first transaction to get started!',
                        keyboards.getMainMenuKeyboard()
                    );
                }

                let message = 'Recent Transactions:\n\n';
                transactions.forEach((t, i) => {
                    const sign = t.type === 'income' ? '+' : '-';
                    message += `${i + 1}. ${t.category} ${sign}₹${t.amount.toFixed(2)}\n`;
                    message += `   ${t.description}\n\n`;
                });

                await ctx.editMessageText(message, keyboards.getMainMenuKeyboard());
            } catch (error) {
                console.error('Error fetching transactions:', error);
                await ctx.editMessageText(
                    '❌ Failed to fetch transactions.',
                    keyboards.getMainMenuKeyboard()
                );
            }
        });

        // === SETTINGS ===

        this.bot.action('action_settings', async (ctx) => {
            await ctx.answerCbQuery();

            const status = ctx.isAuthenticated ? '✅ Linked' : '❌ Not Linked';

            await ctx.editMessageText(
                'Settings\n\n' +
                `Account Status: ${status}\n\n` +
                'More settings coming soon!',
                keyboards.getMainMenuKeyboard()
            );
        });

        // === TEXT MESSAGE HANDLER ===

        this.bot.on('text', async (ctx) => {
            const text = ctx.message.text;

            if (text.startsWith('/')) return;

            const session = sessionStore.get(ctx.chat.id);

            if (!session) {
                return ctx.reply(
                    'Use the buttons to navigate.\n\n' +
                    'Send /start to see the main menu.',
                    keyboards.getMainMenuKeyboard()
                );
            }

            // Handle email linking
            if (session.mode === 'linking' && session.step === 'email_input') {
                return this.handleEmailLinking(ctx, session, text);
            }

            // Handle based on current step
            if (session.mode === 'manual') {
                await this.handleManualInput(ctx, session, text);
            } else if (session.mode === 'nlp') {
                await this.handleNLPInput(ctx, session, text);
            }
        });

        console.log('✅ Telegram handlers registered (dual-mode transactions)');
    }

    /**
     * Handle email linking process
     */
    async handleEmailLinking(ctx, session, text) {
        const { createTelegramUserMappingByEmail } = await import('../middlewares/telegramAuth.middleware.js');

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(text.trim())) {
            return ctx.reply(
                '❌ Invalid email format\\n\\n' +
                'Please enter a valid email address.\\n' +
                'Example: john@example.com'
            );
        }

        await ctx.reply('🔍 Verifying your email...');

        const result = await createTelegramUserMappingByEmail(ctx, text.trim());

        sessionStore.clear(ctx.chat.id);

        if (result.success) {
            // Refresh authentication state
            ctx.isAuthenticated = true;
            ctx.userId = result.user._id;

            await ctx.reply(
                result.message,
                keyboards.getMainMenuKeyboard()
            );
        } else {
            await ctx.reply(
                result.message,
                {
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: '🔗 Try Again', callback_data: 'action_link_account' }],
                            [{ text: '🌐 Register on Website', url: 'https://finalyzeai.vercel.app/' }]
                        ]
                    }
                }
            );
        }
    }

    /**
     * Handle manual entry text input
     */
    async handleManualInput(ctx, session, text) {
        if (session.step === 'amount') {
            const result = validation.validateAmount(text);

            if (!result.valid) {
                return ctx.reply(
                    validation.formatValidationError('Amount', result.error),
                    keyboards.getBackToMenuKeyboard()
                );
            }

            session.tempTransaction.amount = result.value;
            session.step = 'description';
            sessionStore.set(ctx.chat.id, session);

            return ctx.reply(
                'Enter a description:\n' +
                'Example: Lunch at cafe',
                keyboards.getBackToMenuKeyboard()
            );
        }

        if (session.step === 'description') {
            const result = validation.validateDescription(text);

            if (!result.valid) {
                return ctx.reply(
                    validation.formatValidationError('Description', result.error),
                    keyboards.getBackToMenuKeyboard()
                );
            }

            session.tempTransaction.description = result.value;
            session.step = 'date';
            sessionStore.set(ctx.chat.id, session);

            return ctx.reply(
                'Select transaction date:',
                keyboards.getDateSelectionKeyboard()
            );
        }

        if (session.step === 'custom_date') {
            const result = validation.validateDate(text);

            if (!result.valid) {
                return ctx.reply(
                    validation.formatValidationError('Date', result.error),
                    keyboards.getBackToMenuKeyboard()
                );
            }

            session.tempTransaction.date = result.value;
            session.step = 'confirm';
            sessionStore.set(ctx.chat.id, session);

            return this.showConfirmation(ctx);
        }
    }

    /**
     * Handle NLP text input
     */
    async handleNLPInput(ctx, session, text) {
        if (session.step !== 'text_input') return;

        try {
            await ctx.reply('Parsing your transaction...');

            const parsedTransactions = await transactionController.parseNLPTransaction(text);

            if (parsedTransactions.length === 0) {
                return ctx.reply(
                    '❌ Could not parse any transactions.\n\n' +
                    'Please try again or use manual entry.',
                    keyboards.getMainMenuKeyboard()
                );
            }

            session.parsedTransactions = parsedTransactions;
            session.savedCount = 0;
            session.step = 'confirm_multi';
            sessionStore.set(ctx.chat.id, session);

            await this.showMultiTransactionPreview(ctx, 1);

        } catch (error) {
            console.error('Error parsing NLP input:', error);
            return ctx.reply(
                '❌ Failed to parse transaction.\n\n' +
                'Please try again or use manual entry.',
                keyboards.getMainMenuKeyboard()
            );
        }
    }

    /**
     * Show confirmation preview for manual entry
     */
    async showConfirmation(ctx) {
        const session = sessionStore.get(ctx.chat.id);
        const preview = transactionController.formatTransactionPreview(session.tempTransaction);

        return ctx.reply(
            preview,
            keyboards.getConfirmationKeyboard()
        );
    }

    /**
     * Show multi-transaction preview for NLP entry
     */
    async showMultiTransactionPreview(ctx, index) {
        const session = sessionStore.get(ctx.chat.id);
        const transaction = session.parsedTransactions[index - 1];
        const total = session.parsedTransactions.length;

        const preview = transactionController.formatTransactionPreview(transaction, index, total);

        return ctx.reply(
            preview,
            keyboards.getMultiConfirmationKeyboard(index, total)
        );
    }

    /**
     * Start bot in polling mode (development only)
     */
    async startPolling() {
        if (!this.isInitialized) {
            throw new Error('Bot not initialized. Call initialize() first.');
        }

        if (!telegramConfig.usePolling) {
            throw new Error('Polling mode is only available in development');
        }

        try {
            await this.bot.launch();
            console.log('✅ Telegram bot started in DEVELOPMENT mode (polling)');
        } catch (error) {
            if (error.response && error.response.error_code === 409) {
                console.error(
                    '❌ Polling conflict detected (409):\n' +
                    'Another instance is already polling this bot.\n' +
                    'Stop the other instance before starting a new one.'
                );
            } else {
                console.error('❌ Failed to start polling:', error);
            }
            throw error;
        }
    }


    /**
     * Handle incoming webhook update (production mode)
     */
    async handleUpdate(update) {
        try {
            if (!this.isInitialized) {
                console.log('⚡ Lazy initializing Telegram bot...');
                this.initialize();
            }

            await this.bot.handleUpdate(update);
        } catch (error) {
            console.error('❌ Error handling webhook update:', error);
        }
    }

    /**
     * Graceful shutdown
     */
    async stop() {
        if (this.bot && this.isInitialized) {
            try {
                await this.bot.stop();
                console.log('✅ Telegram bot stopped gracefully');
            } catch (error) {
                console.error('❌ Error stopping bot:', error);
            }
        }
    }
}

// Export singleton instance
const telegramService = new TelegramService();
export default telegramService;
