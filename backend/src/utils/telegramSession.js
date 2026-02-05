/**
 * Telegram Session Management
 * 
 * In-memory session store for tracking user state during transaction entry flows.
 * Sessions are temporary and cleared on server restart (acceptable for this use case).
 */

class TelegramSessionStore {
    constructor() {
        this.sessions = new Map();
        this.SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

        // Auto-cleanup expired sessions every 5 minutes
        setInterval(() => this.cleanupExpiredSessions(), 5 * 60 * 1000);
    }

    /**
     * Get session for a chat
     */
    get(chatId) {
        const session = this.sessions.get(chatId.toString());

        // Check if session expired
        if (session && Date.now() - session.timestamp > this.SESSION_TIMEOUT) {
            this.clear(chatId);
            return null;
        }

        return session;
    }

    /**
     * Set or update session
     */
    set(chatId, data) {
        this.sessions.set(chatId.toString(), {
            ...data,
            timestamp: Date.now()
        });
    }

    /**
     * Update specific fields in session
     */
    update(chatId, updates) {
        const existing = this.get(chatId) || {};
        this.set(chatId, {
            ...existing,
            ...updates
        });
    }

    /**
     * Clear session for a chat
     */
    clear(chatId) {
        this.sessions.delete(chatId.toString());
    }

    /**
     * Check if session exists and is valid
     */
    has(chatId) {
        return this.get(chatId) !== null;
    }

    /**
     * Get current flow mode
     */
    getMode(chatId) {
        const session = this.get(chatId);
        return session?.mode || null;
    }

    /**
     * Get current step in flow
     */
    getStep(chatId) {
        const session = this.get(chatId);
        return session?.step || null;
    }

    /**
     * Get temporary transaction data
     */
    getTempTransaction(chatId) {
        const session = this.get(chatId);
        return session?.tempTransaction || null;
    }

    /**
     * Set temporary transaction data
     */
    setTempTransaction(chatId, transactionData) {
        this.update(chatId, {
            tempTransaction: transactionData
        });
    }

    /**
     * Cleanup expired sessions
     */
    cleanupExpiredSessions() {
        const now = Date.now();
        let cleaned = 0;

        for (const [chatId, session] of this.sessions.entries()) {
            if (now - session.timestamp > this.SESSION_TIMEOUT) {
                this.sessions.delete(chatId);
                cleaned++;
            }
        }

        if (cleaned > 0) {
            console.log(`🧹 Cleaned up ${cleaned} expired Telegram sessions`);
        }
    }

    /**
     * Get session statistics (for debugging)
     */
    getStats() {
        return {
            activeSessions: this.sessions.size,
            sessions: Array.from(this.sessions.entries()).map(([chatId, session]) => ({
                chatId,
                mode: session.mode,
                step: session.step,
                age: Math.floor((Date.now() - session.timestamp) / 1000) + 's'
            }))
        };
    }
}

// Export singleton instance
const sessionStore = new TelegramSessionStore();
export default sessionStore;
