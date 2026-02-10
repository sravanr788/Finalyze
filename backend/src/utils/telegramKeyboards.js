/**
 * Telegram Keyboard Builders
 * 
 * Dynamic inline keyboard generation with minimal emoji usage.
 * Only essential icons for better readability.
 */

import { Markup } from 'telegraf';

/**
 * Main menu keyboard (minimal emojis)
 */
export function getMainMenuKeyboard() {
    return Markup.inlineKeyboard([
        [Markup.button.callback('➕ Add Transaction', 'action_add_transaction')],
        [Markup.button.callback('📊 View Balance', 'action_view_balance')],
        [Markup.button.callback('View Transactions', 'action_view_transactions')],
        [Markup.button.callback('Settings', 'action_settings')]
    ]);
}

/**
 * Transaction entry mode selection
 */
export function getEntryModeKeyboard() {
    return Markup.inlineKeyboard([
        [Markup.button.callback('Manual Entry', 'mode_manual')],
        [Markup.button.callback('Quick Add (Text)', 'mode_nlp')],
        [Markup.button.callback('Back', 'action_main_menu')]
    ]);
}

/**
 * Transaction type selection (Income vs Expense)
 */
export function getTypeSelectionKeyboard() {
    return Markup.inlineKeyboard([
        [
            Markup.button.callback('Income', 'type_income'),
            Markup.button.callback('Expense', 'type_expense')
        ],
        [Markup.button.callback('Cancel', 'action_main_menu')]
    ]);
}

/**
 * Category selection keyboard
 * @param {string} type - 'income' or 'expense'
 */
export function getCategoryKeyboard(type) {
    if (type === 'income') {
        return Markup.inlineKeyboard([
            [
                Markup.button.callback('💰 Salary', 'cat_income_salary'),
                Markup.button.callback('💼 Business', 'cat_income_business')
            ],
            [
                Markup.button.callback('🎁 Gift', 'cat_income_gift'),
                Markup.button.callback('📈 Investment', 'cat_income_investment')
            ],
            [Markup.button.callback('Other', 'cat_income_other')],
            [Markup.button.callback('Back', 'action_add_transaction')]
        ]);
    } else {
        return Markup.inlineKeyboard([
            [
                Markup.button.callback('🍔 Food', 'cat_expense_food'),
                Markup.button.callback('🚗 Transport', 'cat_expense_transport')
            ],
            [
                Markup.button.callback('🛒 Shopping', 'cat_expense_shopping'),
                Markup.button.callback('🏠 Bills', 'cat_expense_bills')
            ],
            [
                Markup.button.callback('🎬 Entertainment', 'cat_expense_entertainment'),
                Markup.button.callback('💊 Health', 'cat_expense_health')
            ],
            [
                Markup.button.callback('📚 Education', 'cat_expense_education'),
                Markup.button.callback('Other', 'cat_expense_other')
            ],
            [Markup.button.callback('Back', 'action_add_transaction')]
        ]);
    }
}

/**
 * Date selection keyboard
 */
export function getDateSelectionKeyboard() {
    return Markup.inlineKeyboard([
        [
            Markup.button.callback('Today', 'date_today'),
            Markup.button.callback('Yesterday', 'date_yesterday')
        ],
        [Markup.button.callback('Custom Date', 'date_custom')],
        [Markup.button.callback('Cancel', 'action_main_menu')]
    ]);
}

/**
 * Confirmation keyboard
 */
export function getConfirmationKeyboard() {
    return Markup.inlineKeyboard([
        [
            Markup.button.callback('✅ Confirm', 'confirm_save'),
            Markup.button.callback('Edit', 'confirm_edit')
        ],
        [Markup.button.callback('Cancel', 'confirm_cancel')]
    ]);
}

/**
 * Multi-transaction confirmation keyboard (for NLP mode)
 * @param {number} current - Current transaction index (1-based)
 * @param {number} total - Total number of transactions
 */
export function getMultiConfirmationKeyboard(current, total) {
    const buttons = [
        [Markup.button.callback('✅ Confirm', `confirm_multi_${current}`)],
        [Markup.button.callback('Skip This', `skip_multi_${current}`)]
    ];

    if (current === total) {
        buttons.push([Markup.button.callback('Cancel All', 'cancel_all_multi')]);
    } else {
        buttons.push([Markup.button.callback('Cancel All', 'cancel_all_multi')]);
    }

    return Markup.inlineKeyboard(buttons);
}

/**
 * Back to main menu keyboard
 */
export function getBackToMenuKeyboard() {
    return Markup.inlineKeyboard([
        [Markup.button.callback('Main Menu', 'action_main_menu')]
    ]);
}

/**
 * Category name mapping (for display)
 */
export const CATEGORY_NAMES = {
    // Income categories
    'salary': 'Salary',
    'business': 'Business',
    'gift': 'Gift',
    'investment': 'Investment',
    'other': 'Other',

    // Expense categories
    'food': 'Food',
    'transport': 'Transport',
    'shopping': 'Shopping',
    'bills': 'Bills',
    'entertainment': 'Entertainment',
    'health': 'Health',
    'education': 'Education',

    // AI service categories (map to our categories)
    'Income': 'salary',
    'Groceries': 'food',
    'Food': 'food',
    'Transport': 'transport',
    'Shopping': 'shopping',
    'Entertainment': 'entertainment',
    'Bills': 'bills',
    'Health': 'health',
    'Other': 'other'
};

/**
 * Get display name for category
 */
export function getCategoryDisplayName(category) {
    return CATEGORY_NAMES[category] || category;
}
