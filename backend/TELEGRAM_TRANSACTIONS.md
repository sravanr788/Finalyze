# Telegram Transaction Features - Setup Guide

This guide explains how to use the new transaction features in the Telegram bot.

## Features Overview

### 1. Dual-Mode Transaction Entry

**Manual Entry Mode**
- Step-by-step guided flow
- Button-driven interface
- Select type → category → enter amount → description → date → confirm

**NLP Mode (Quick Add)**
- Single text input
- AI-powered parsing using existing Groq service
- Supports multiple transactions in one message
- Examples:
  - "Coffee $5 at Starbucks"
  - "Lunch $25 and uber $15 yesterday"
  - "Monthly salary $4500"

### 2. Transaction Confirmation

- Preview before saving
- Shows all transaction details
- Options: Confirm, Edit, or Cancel
- Multi-transaction support for NLP mode

### 3. Database Integration

- Transactions saved to existing MongoDB
- Uses same Transaction model as website
- Automatically appears in website UI
- No frontend changes required

---

## Initial Setup

### Step 1: Link Telegram Account to Finalyze User

Before using transaction features, you need to link your Telegram account to your Finalyze user account.

#### Option A: Using the Helper Script

1. Get your Telegram ID and Chat ID:
   - Send `/start` to your bot
   - Check server logs for your IDs
   - Or use @userinfobot on Telegram

2. Find your Finalyze user email (the one you used for Google OAuth)

3. Run the linking script:
   ```bash
   cd backend
   node linkTelegramUser.js <telegramId> <chatId> <firstName> <userEmail>
   ```

   Example:
   ```bash
   node linkTelegramUser.js 123456789 123456789 "John" "john@example.com"
   ```

4. Verify the link:
   ```
   ✅ Telegram user linked successfully!
   📊 Mapping Details:
      Telegram ID: 123456789
      Chat ID: 123456789
      Name: John
      Linked to: John Doe (john@example.com)
   ```

#### Option B: Manual Database Entry

If you prefer, you can manually create the mapping in MongoDB:

```javascript
db.telegramusers.insertOne({
  telegramId: "123456789",
  chatId: "123456789",
  firstName: "John",
  userId: ObjectId("your_user_id_here"),
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
})
```

---

## Using the Bot

### Starting the Bot

1. Send `/start` to your bot
2. You'll see the main menu with options:
   - Add Transaction
   - View Balance
   - View Transactions
   - Settings

### Adding a Transaction (Manual Mode)

1. Click **"Add Transaction"**
2. Choose **"Manual Entry"**
3. Select transaction type: **Income** or **Expense**
4. Select category (e.g., Food, Transport, Shopping)
5. Enter amount: `25.50`
6. Enter description: `Lunch at cafe`
7. Select date: **Today**, **Yesterday**, or **Custom**
8. Review the confirmation preview:
   ```
   ━━━━━━━━━━━━━━━━
   Type: Expense
   Category: Food
   Amount: $25.50
   Description: Lunch at cafe
   Date: Today
   ━━━━━━━━━━━━━━━━
   ```
9. Click **"Confirm"** to save

### Adding a Transaction (NLP Mode)

1. Click **"Add Transaction"**
2. Choose **"Quick Add (Text)"**
3. Enter your transaction in natural language:
   ```
   Coffee $5 and lunch $12 yesterday
   ```
4. Bot parses and shows first transaction:
   ```
   Transaction 1/2
   ━━━━━━━━━━━━━━━━
   Type: Expense
   Category: Food
   Amount: $5.00
   Description: Coffee
   Date: Yesterday
   ━━━━━━━━━━━━━━━━
   ```
5. Click **"Confirm"** or **"Skip"**
6. Review and confirm remaining transactions
7. See success message: `✅ 2 transaction(s) saved successfully!`

### Viewing Balance

1. Click **"View Balance"**
2. See your financial summary:
   ```
   📊 Your Financial Summary
   
   Income: $4500.00
   Expenses: $1234.56
   Balance: $3265.44
   
   Total Transactions: 25
   ```

### Viewing Recent Transactions

1. Click **"View Transactions"**
2. See your last 5 transactions:
   ```
   Recent Transactions:
   
   1. Food -$25.50
      Lunch at cafe
   
   2. Transport -$15.00
      Uber ride
   
   3. Salary +$4500.00
      Monthly salary
   ```

---

## Category Mapping

The bot uses the following categories:

### Income Categories
- 💰 Salary
- 💼 Business
- 🎁 Gift
- 📈 Investment
- Other

### Expense Categories
- 🍔 Food (includes Groceries)
- 🚗 Transport
- 🛒 Shopping
- 🏠 Bills (includes Utilities)
- 🎬 Entertainment
- 💊 Health
- 📚 Education
- Other

**Note:** The AI service automatically maps its categories to these standard categories.

---

## Validation Rules

### Amount
- Must be a positive number
- Accepts formats: `50`, `123.45`, `$50`, `₹123.45`
- Maximum: 1,000,000,000
- Rounded to 2 decimal places

### Description
- Required (cannot be empty)
- Maximum 200 characters
- Trimmed of whitespace

### Date
- Cannot be in the future
- Accepts:
  - "today"
  - "yesterday"
  - YYYY-MM-DD (e.g., 2026-02-05)
  - DD/MM/YYYY (e.g., 05/02/2026)

---

## Troubleshooting

### "Account Not Linked" Error

**Problem:** Bot shows "⚠️ Account Not Linked" when trying to add transactions.

**Solution:**
1. Verify you've run the linking script
2. Check that your Telegram ID matches
3. Ensure the user email exists in the database
4. Check server logs for errors

### NLP Parsing Fails

**Problem:** Bot says "❌ Could not parse any transactions"

**Solution:**
1. Try simpler format: "Coffee $5"
2. Include amount with $ symbol
3. Be specific about the item
4. Use manual entry mode instead

### Session Expired

**Problem:** Bot says "Session expired. Please start again."

**Solution:**
- Sessions expire after 30 minutes of inactivity
- Click "Main Menu" and start over
- This is normal behavior to prevent stale data

### Transaction Not Appearing in Website

**Problem:** Transaction saved in bot but not visible on website.

**Solution:**
1. Refresh the website
2. Check that you're logged in with the same account
3. Verify the transaction was actually saved (check "View Transactions" in bot)
4. Check server logs for database errors

---

## Technical Details

### Session Management

- Sessions stored in-memory (cleared on server restart)
- 30-minute timeout for inactive sessions
- Auto-cleanup every 5 minutes
- View active sessions: Check `sessionStore.getStats()`

### Database Schema

**TelegramUser Collection:**
```javascript
{
  telegramId: String (unique),
  chatId: String,
  username: String,
  firstName: String,
  lastName: String,
  userId: ObjectId (ref: User),
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

**Transaction Collection:** (existing)
```javascript
{
  userId: ObjectId (ref: User),
  amount: Number,
  type: String (income/expense),
  category: String,
  description: String,
  date: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### API Integration

The bot uses existing backend services:
- `aiService.js` - For NLP parsing
- `Transaction` model - For database operations
- `User` model - For user authentication

No changes required to website frontend!

---

## Development Tips

### Testing NLP Parsing

```bash
# Test the AI service directly
node -e "
import('./src/services/aiService.js').then(async (m) => {
  const result = await m.default('Coffee \$5 and lunch \$12', '2026-02-05');
  console.log(JSON.stringify(result, null, 2));
});
"
```

### Viewing Session Data

Add this to your bot for debugging:

```javascript
bot.command('debug', async (ctx) => {
  const stats = sessionStore.getStats();
  await ctx.reply(JSON.stringify(stats, null, 2));
});
```

### Manual Database Queries

```javascript
// Find all Telegram users
db.telegramusers.find().pretty()

// Find transactions for a specific user
db.transactions.find({ userId: ObjectId("...") }).sort({ date: -1 })

// Check if Telegram user is linked
db.telegramusers.findOne({ telegramId: "123456789" })
```

---

## Next Steps

1. **Test the bot** with both manual and NLP modes
2. **Link your account** using the helper script
3. **Add some transactions** and verify they appear on the website
4. **Provide feedback** on the UX and any issues

For support, check the server logs or contact the development team.
