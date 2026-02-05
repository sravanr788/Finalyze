# Telegram Bot Setup Guide

This guide walks you through setting up the Telegram bot integration for Finalyze.

## Prerequisites

- Node.js and npm installed
- Telegram account
- Access to @BotFather on Telegram

## Step 1: Create Telegram Bots

You need to create **two separate bots** - one for development and one for production.

### Create Development Bot

1. Open Telegram and search for `@BotFather`
2. Send `/newbot` command
3. Follow the prompts:
   - **Bot name:** `Finalyze Dev Bot` (or any name you prefer)
   - **Username:** `finalyze_dev_bot` (must end with `_bot`)
4. Copy the bot token (looks like `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)
5. Save this as `TELEGRAM_BOT_TOKEN_DEV`

### Create Production Bot

1. Send `/newbot` to @BotFather again
2. Follow the prompts:
   - **Bot name:** `Finalyze` (or any name you prefer)
   - **Username:** `finalyze_bot` (must be unique and end with `_bot`)
3. Copy the bot token
4. Save this as `TELEGRAM_BOT_TOKEN_PROD`

## Step 2: Configure Environment Variables

### Development Environment

Add these to your `backend/.env` file:

```bash
NODE_ENV=development
TELEGRAM_BOT_TOKEN_DEV=your_dev_bot_token_here
TELEGRAM_BOT_TOKEN_PROD=your_prod_bot_token_here
TELEGRAM_WEBHOOK_DOMAIN=https://your-domain.com
```

**Note:** Even in development, you should set all variables. The `NODE_ENV` determines which token is used.

### Production Environment

Set these environment variables in your hosting platform (Vercel, Render, etc.):

```bash
NODE_ENV=production
TELEGRAM_BOT_TOKEN_PROD=your_prod_bot_token_here
TELEGRAM_WEBHOOK_DOMAIN=https://your-actual-domain.com
```

**Important:** `TELEGRAM_WEBHOOK_DOMAIN` must be:
- A valid HTTPS URL (HTTP not supported by Telegram)
- Your actual deployment domain
- Without trailing slash

## Step 3: Install Dependencies

```bash
cd backend
npm install
```

## Step 4: Test in Development Mode

### Start the Server

```bash
cd backend
npm start
```

### Expected Console Output

```
✅ Telegram config loaded: mode=development
Server is running on http://localhost:5000
✅ Telegram bot initialized successfully
✅ Telegram handlers registered (button-first UX)
🔄 Starting Telegram bot in DEVELOPMENT mode...
✅ Telegram bot started in DEVELOPMENT mode (polling)
⚠️ Note: 409 conflicts are expected if multiple instances run
```

### Test the Bot

1. Open Telegram and search for your dev bot username
2. Send `/start` command
3. You should see:
   - Welcome message
   - "Get Started" button
4. Click "Get Started"
5. You should see the main menu with buttons

### Common Development Issues

**Issue: 409 Conflict Error**
```
❌ Polling conflict detected (409):
Another instance is already polling this bot.
```

**Solution:** This is **expected behavior**. Only one instance can poll at a time. Stop any other running instances of the server.

**Issue: Missing Token Error**
```
❌ TELEGRAM_BOT_TOKEN_DEV is required in development mode.
```

**Solution:** Add `TELEGRAM_BOT_TOKEN_DEV` to your `.env` file.

## Step 5: Test in Production Mode (Local)

To test webhook mode locally, you need a public HTTPS URL. Use ngrok:

### Install ngrok

```bash
npm install -g ngrok
```

### Start ngrok

In a separate terminal:

```bash
ngrok http 5000
```

Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)

### Update Environment

In your `backend/.env`:

```bash
NODE_ENV=production
TELEGRAM_BOT_TOKEN_PROD=your_prod_bot_token_here
TELEGRAM_WEBHOOK_DOMAIN=https://abc123.ngrok.io
```

### Start the Server

```bash
cd backend
npm start
```

### Expected Console Output

```
✅ Telegram config loaded: mode=production
Server is running on http://localhost:5000
✅ Telegram bot initialized successfully
✅ Telegram handlers registered (button-first UX)
🔄 Registering Telegram webhook in PRODUCTION mode...
✅ Telegram webhook registered successfully
   Webhook URL: https://abc123.ngrok.io/api/telegram/webhook
📊 Webhook Info:
   URL: https://abc123.ngrok.io/api/telegram/webhook
   Pending updates: 0
   Last error: None
```

### Test the Bot

1. Open Telegram and search for your prod bot username
2. Send `/start` command
3. Interact with the bot via buttons
4. Check your server console for webhook logs:
   ```
   📨 Telegram webhook received
   ```

## Step 6: Deploy to Production

### Set Environment Variables

In your hosting platform dashboard, set:

```bash
NODE_ENV=production
TELEGRAM_BOT_TOKEN_PROD=your_prod_bot_token_here
TELEGRAM_WEBHOOK_DOMAIN=https://your-actual-domain.com
```

### Deploy

Deploy your application as usual. The bot will:
1. Automatically register the webhook on startup
2. Log webhook status to console
3. Start processing messages via webhook

### Verify Deployment

1. Check deployment logs for:
   ```
   ✅ Telegram webhook registered successfully
   ```
2. Send `/start` to your production bot
3. Verify it responds

## Troubleshooting

### Webhook Not Working

**Check webhook status manually:**

```bash
curl https://api.telegram.org/bot<YOUR_TOKEN>/getWebhookInfo
```

**Expected response:**
```json
{
  "ok": true,
  "result": {
    "url": "https://your-domain.com/api/telegram/webhook",
    "has_custom_certificate": false,
    "pending_update_count": 0
  }
}
```

**If URL is wrong, restart your server.** The bot automatically re-registers the webhook on startup.

### Bot Not Responding

1. **Check server logs** for errors
2. **Verify environment variables** are set correctly
3. **Test webhook endpoint:**
   ```bash
   curl https://your-domain.com/api/telegram/webhook
   ```
   Should return:
   ```json
   {
     "status": "active",
     "message": "Telegram webhook endpoint is ready",
     "mode": "production"
   }
   ```

### 409 Conflicts in Production

This should **never happen** in production (webhook mode). If it does:
1. Check `NODE_ENV` is set to `production`
2. Verify no other instances are running
3. Check server logs for mode confirmation

## Security Best Practices

1. **Never commit tokens** to version control
2. **Use separate bots** for dev and prod
3. **Rotate tokens** if compromised via @BotFather
4. **Monitor webhook logs** for suspicious activity
5. **Set webhook secret** (future enhancement)

## Next Steps

Now that the bot is running, you can:

1. **Connect to your database** - Link Telegram users to app users
2. **Implement transaction parsing** - Use existing AI service
3. **Add authentication** - Verify user identity
4. **Expand button flows** - Add more interactive features
5. **Add input validation** - Validate amounts, dates, etc.

## Support

If you encounter issues:
1. Check the console logs
2. Review the implementation plan
3. Test with the verification steps in the plan
4. Verify all environment variables are set correctly
