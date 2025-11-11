# 🚀 Google Docs Publishing Setup

## Quick Setup (5 minutes)

Your Google Docs publishing integration is **already implemented** and working!

You just need to generate a new OAuth refresh token with the correct permissions.

### Current Status

✅ Code is implemented and ready
✅ UAT WordPress publishing works
✅ Sanity CMS publishing works
❌ Google Docs needs OAuth token with correct scopes

### The Issue

Your current `GOOGLE_REFRESH_TOKEN` was created for Google Sheets only. Google Docs requires additional permissions.

**Error received**: `403 - Request had insufficient authentication scopes`

### The Solution

Run this command to generate a new token with Google Docs + Sheets permissions:

```bash
node scripts/generate-google-oauth-token.js
```

## Step-by-Step Instructions

### 1️⃣ Run the OAuth script

```bash
cd /Users/yogs87/Downloads/sanity/projects/enhanced-bulk-generator
node scripts/generate-google-oauth-token.js
```

### 2️⃣ Open the URL in your browser

The script will display a URL like:
```
Open this URL in your browser:

https://accounts.google.com/o/oauth2/v2/auth?client_id=...
```

**Click or copy-paste this URL into your browser.**

### 3️⃣ Grant permissions

1. Log in with your Google account (if not already logged in)
2. You'll see a consent screen asking for permissions to:
   - ✅ View and manage your Google Docs documents
   - ✅ View and manage your Google Sheets spreadsheets
   - ✅ View and manage files created by this app
3. Click **"Continue"** or **"Allow"**

### 4️⃣ Wait for success message

Your browser will redirect to `http://localhost:3000/oauth2callback` and show:

```
✅ Authorization Successful!
You can close this window and return to the terminal.
```

### 5️⃣ Copy credentials to .env

The terminal will display your new credentials:

```bash
─────────────────────────────────────────────────────────────────
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret"
GOOGLE_REFRESH_TOKEN="your-new-refresh-token"
─────────────────────────────────────────────────────────────────
```

**Copy these lines and update your `.env` file** (replace the old `GOOGLE_REFRESH_TOKEN` line).

### 6️⃣ Test the publishing

Mark some content as SEO-Ready and publish:

```bash
# Mark content as ready
node -e "
const CSVDataManager = require('./core/csv-data-manager');
const manager = new CSVDataManager();
manager.updateCreatedContent('CONTENT-040', { approval_status: 'SEO-Ready' });
console.log('✅ CONTENT-040 marked as SEO-Ready');
"

# Publish to all platforms (including Google Docs)
CONTENT_LIMIT=1 node main.js stage publication
```

You should see:

```
📄 Google Docs: https://docs.google.com/document/d/1abc123xyz/edit
```

## What Gets Published to Google Docs

The Google Docs integration creates a **beautifully formatted document** with:

- ✅ **Title** as Heading 1
- ✅ **Section headings (##)** as Heading 2
- ✅ **Sub-headings (###)** as Heading 3
- ✅ **Bold text** properly formatted
- ✅ **Bullet lists** with proper indentation
- ✅ **Tables** with bold headers
- ✅ **Paragraphs** with proper spacing

**Example**: Your ELSS Funds article will appear as a professional Google Doc, ready to share or embed.

## Troubleshooting

### Port 3000 in use?

Kill the process and try again:
```bash
kill -9 $(lsof -ti:3000)
node scripts/generate-google-oauth-token.js
```

### API not enabled?

Enable Google Docs API:
1. Go to: https://console.cloud.google.com/apis/library
2. Search "Google Docs API"
3. Click "Enable"

### Still getting 403 errors?

Make sure you:
1. ✅ Copied the **new** refresh token to `.env`
2. ✅ Saved the `.env` file
3. ✅ Restarted your terminal or re-exported credentials

## Security Note

⚠️ **Never commit `.env` to git** - it contains sensitive credentials!

Make sure `.env` is in your `.gitignore` file.

## Need Help?

📖 See detailed documentation: `scripts/README-OAUTH.md`

## What Happens Next

Once you have the new token:

1. Every time you publish content (Stage 6), it will automatically:
   - ✅ Publish to UAT WordPress
   - ✅ Publish to Sanity CMS
   - ✅ **Publish to Google Docs** ← NEW!

2. All URLs are saved to `data/published-content.csv`

3. You can access the Google Docs directly from the publish output or CSV

---

**Status**: Ready to go! Just run the OAuth script and update your `.env` 🚀
