/**
 * Telegram Webhook Routes
 * 
 * This module defines the Express route for handling Telegram webhook updates.
 * 
 * Key Design Decisions:
 * - Fast HTTP 200 response: Always returns 200 within milliseconds
 * - Async processing: Bot logic runs asynchronously after response
 * - No business logic: Route only forwards to service layer
 * - Error resilience: Catches errors to prevent 500 responses to Telegram
 * 
 * Why this approach:
 * - Telegram requires fast responses (< 60 seconds, ideally < 1 second)
 * - Processing updates asynchronously prevents timeout issues
 * - Returning 200 even on errors prevents Telegram from retrying excessively
 */

import express from 'express';
import telegramService from '../services/telegram.service.js';

const router = express.Router();

/**
 * POST /api/telegram/webhook
 * 
 * Receives webhook updates from Telegram and forwards them to the bot service.
 * 
 * CRITICAL: This route must return HTTP 200 quickly (within milliseconds).
 * All bot processing happens asynchronously after the response is sent.
 */
router.post('/webhook', async (req, res) => {
    try {
        // Log incoming webhook (useful for debugging)
        console.log('📨 Telegram webhook received');

        // Immediately send 200 OK to Telegram
        // This is CRITICAL - Telegram expects fast responses
        res.status(200).send('OK');

        // Process the update asynchronously (after response is sent)
        // This prevents blocking the response if bot logic is slow
        setImmediate(async () => {
            try {
                await telegramService.handleUpdate(req.body);
            } catch (error) {
                // Log error but don't throw - response already sent
                console.error('❌ Error processing Telegram update:', error);
            }
        });

    } catch (error) {
        // Even if there's an error, return 200 to prevent Telegram retries
        console.error('❌ Error in webhook route:', error);
        res.status(200).send('OK');
    }
});

/**
 * GET /api/telegram/webhook
 * 
 * Health check endpoint for the webhook.
 * Useful for verifying the route is accessible.
 */
router.get('/webhook', (req, res) => {
    res.json({
        status: 'active',
        message: 'Telegram webhook endpoint is ready',
        mode: process.env.NODE_ENV || 'development'
    });
});

export default router;
