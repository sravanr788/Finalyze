/**
 * Telegram Input Validation Utilities
 * 
 * Validates user inputs during manual transaction entry.
 * Provides user-friendly error messages.
 */

/**
 * Validate amount input
 * @param {string} text - User input
 * @returns {Object} { valid: boolean, value?: number, error?: string }
 */
export function validateAmount(text) {
    // Remove common currency symbols and whitespace
    const cleaned = text.trim().replace(/[$€£¥₹,]/g, '');

    // Check if it's a valid number
    const num = parseFloat(cleaned);

    if (isNaN(num)) {
        return {
            valid: false,
            error: 'Please enter a valid number (e.g., 50 or 123.45)'
        };
    }

    if (num <= 0) {
        return {
            valid: false,
            error: 'Amount must be greater than 0'
        };
    }

    if (num > 1000000000) {
        return {
            valid: false,
            error: 'Amount is too large'
        };
    }

    // Round to 2 decimal places
    const rounded = Math.round(num * 100) / 100;

    return {
        valid: true,
        value: rounded
    };
}

/**
 * Validate description input
 * @param {string} text - User input
 * @returns {Object} { valid: boolean, value?: string, error?: string }
 */
export function validateDescription(text) {
    const trimmed = text.trim();

    if (trimmed.length === 0) {
        return {
            valid: false,
            error: 'Description cannot be empty'
        };
    }

    if (trimmed.length > 200) {
        return {
            valid: false,
            error: 'Description is too long (max 200 characters)'
        };
    }

    return {
        valid: true,
        value: trimmed
    };
}

/**
 * Validate and parse date input
 * @param {string} text - User input (e.g., "today", "yesterday", "2026-02-05")
 * @returns {Object} { valid: boolean, value?: Date, error?: string }
 */
export function validateDate(text) {
    const trimmed = text.trim().toLowerCase();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Handle relative dates
    if (trimmed === 'today') {
        return { valid: true, value: today };
    }

    if (trimmed === 'yesterday') {
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        return { valid: true, value: yesterday };
    }

    // Try to parse as ISO date (YYYY-MM-DD)
    const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (isoMatch) {
        const [, year, month, day] = isoMatch;
        const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));

        if (isNaN(date.getTime())) {
            return {
                valid: false,
                error: 'Invalid date format. Use YYYY-MM-DD (e.g., 2026-02-05)'
            };
        }

        // Don't allow future dates
        if (date > today) {
            return {
                valid: false,
                error: 'Date cannot be in the future'
            };
        }

        return { valid: true, value: date };
    }

    // Try to parse as common formats (DD/MM/YYYY or MM/DD/YYYY)
    const slashMatch = trimmed.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
    if (slashMatch) {
        const [, part1, part2, year] = slashMatch;
        // Assume DD/MM/YYYY format
        const date = new Date(parseInt(year), parseInt(part2) - 1, parseInt(part1));

        if (isNaN(date.getTime())) {
            return {
                valid: false,
                error: 'Invalid date. Use DD/MM/YYYY or YYYY-MM-DD'
            };
        }

        if (date > today) {
            return {
                valid: false,
                error: 'Date cannot be in the future'
            };
        }

        return { valid: true, value: date };
    }

    return {
        valid: false,
        error: 'Invalid date format. Use "today", "yesterday", or YYYY-MM-DD'
    };
}

/**
 * Format validation error for display
 * @param {string} field - Field name
 * @param {string} error - Error message
 * @returns {string} Formatted error message
 */
export function formatValidationError(field, error) {
    return `❌ ${field}: ${error}\n\nPlease try again.`;
}
