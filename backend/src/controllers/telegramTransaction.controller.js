/**
 * Telegram Transaction Controller
 * 
 * Business logic for Telegram transaction operations.
 * Integrates with existing Transaction model and AI service.
 */

import Transaction from '../models/Transaction.js';
import aiParser from '../services/aiService.js';
import { connectToDatabase } from '../../db.js';
import { CATEGORY_NAMES } from '../utils/telegramKeyboards.js';

/**
 * Parse transaction using NLP (AI service)
 * @param {string} text - Natural language transaction text
 * @returns {Array} Parsed transactions
 */
export async function parseNLPTransaction(text) {
    try {
        const today = new Date().toISOString().split('T')[0];
        const parsedTransactions = await aiParser(text, today);

        // Map AI categories to our category names
        return parsedTransactions.map(t => ({
            amount: t.amount,
            type: t.type,
            category: mapAICategory(t.category),
            description: t.description || text,
            date: t.date ? new Date(t.date) : new Date(),
            confidence: t.confidence
        }));
    } catch (error) {
        console.error('Error parsing NLP transaction:', error);
        throw new Error('Failed to parse transaction. Please try again or use manual entry.');
    }
}

/**
 * Map AI service category to our category names
 */
function mapAICategory(aiCategory) {
    const mapped = CATEGORY_NAMES[aiCategory];
    if (mapped) {
        return mapped.toLowerCase();
    }

    // Default mapping
    const lower = aiCategory.toLowerCase();
    if (lower.includes('food') || lower.includes('groceries')) return 'food';
    if (lower.includes('transport') || lower.includes('travel')) return 'transport';
    if (lower.includes('shop')) return 'shopping';
    if (lower.includes('bill') || lower.includes('utilities')) return 'bills';
    if (lower.includes('entertainment') || lower.includes('fun')) return 'entertainment';
    if (lower.includes('health') || lower.includes('medical')) return 'health';
    if (lower.includes('education') || lower.includes('learning')) return 'education';
    if (lower.includes('salary') || lower.includes('income')) return 'salary';

    return 'other';
}

/**
 * Create a transaction in the database
 * @param {Object} transactionData - Transaction data
 * @param {string} userId - User ID
 * @returns {Object} Saved transaction
 */
export async function createTransaction(transactionData, userId) {
    await connectToDatabase();

    try {
        const transaction = new Transaction({
            userId,
            amount: transactionData.amount,
            type: transactionData.type,
            category: capitalizeCategory(transactionData.category),
            description: transactionData.description,
            date: transactionData.date || new Date()
        });

        const saved = await transaction.save();
        console.log(`✅ Transaction created: ${saved._id} for user ${userId}`);

        return saved;
    } catch (error) {
        console.error('Error creating transaction:', error);
        throw new Error('Failed to save transaction. Please try again.');
    }
}

/**
 * Capitalize category for database storage
 */
function capitalizeCategory(category) {
    if (!category) return 'Other';
    return category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
}

/**
 * Format transaction for preview display
 * @param {Object} transaction - Transaction data
 * @param {number} index - Transaction index (for multi-transaction)
 * @param {number} total - Total transactions (for multi-transaction)
 * @returns {string} Formatted preview text
 */
export function formatTransactionPreview(transaction, index = null, total = null) {
    const header = index && total
        ? `Transaction ${index}/${total}\n━━━━━━━━━━━━━━━━\n`
        : '━━━━━━━━━━━━━━━━\n';

    const typeLabel = transaction.type === 'income' ? 'Income' : 'Expense';
    const categoryLabel = capitalizeCategory(transaction.category);
    const amountLabel = `₹${transaction.amount.toFixed(2)}`;
    const dateLabel = formatDate(transaction.date);

    return (
        header +
        `Type: ${typeLabel}\n` +
        `Category: ${categoryLabel}\n` +
        `Amount: ${amountLabel}\n` +
        `Description: ${transaction.description}\n` +
        `Date: ${dateLabel}\n` +
        `━━━━━━━━━━━━━━━━`
    );
}

/**
 * Format date for display
 */
function formatDate(date) {
    const d = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const transactionDate = new Date(d);
    transactionDate.setHours(0, 0, 0, 0);

    const diffTime = today - transactionDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';

    // Format as "Feb 5, 2026"
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return d.toLocaleDateString('en-US', options);
}

/**
 * Validate manual transaction input
 * @param {Object} data - Transaction data to validate
 * @returns {Object} { valid: boolean, errors: Array }
 */
export function validateManualInput(data) {
    const errors = [];

    if (!data.amount || data.amount <= 0) {
        errors.push('Amount must be greater than 0');
    }

    if (!data.type || !['income', 'expense'].includes(data.type)) {
        errors.push('Type must be income or expense');
    }

    if (!data.category) {
        errors.push('Category is required');
    }

    if (!data.description || data.description.trim().length === 0) {
        errors.push('Description is required');
    }

    return {
        valid: errors.length === 0,
        errors
    };
}

/**
 * Get user's recent transactions
 * @param {string} userId - User ID
 * @param {number} limit - Number of transactions to fetch
 * @returns {Array} Recent transactions
 */
export async function getRecentTransactions(userId, limit = 5) {
    await connectToDatabase();

    try {
        const transactions = await Transaction
            .find({ userId })
            .sort({ date: -1 })
            .limit(limit);

        return transactions;
    } catch (error) {
        console.error('Error fetching recent transactions:', error);
        return [];
    }
}

/**
 * Get user's balance summary
 * @param {string} userId - User ID
 * @returns {Object} Balance summary
 */
export async function getBalanceSummary(userId) {
    await connectToDatabase();

    try {
        const transactions = await Transaction.find({ userId });

        const income = transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);

        const expenses = transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);

        return {
            income,
            expenses,
            balance: income - expenses,
            totalTransactions: transactions.length
        };
    } catch (error) {
        console.error('Error fetching balance summary:', error);
        return {
            income: 0,
            expenses: 0,
            balance: 0,
            totalTransactions: 0
        };
    }
}
