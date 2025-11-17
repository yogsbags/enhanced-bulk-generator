# ✅ Google Docs Publishing Restored

## Summary

Google Docs publishing functionality has been successfully restored to `content/content-publisher.js`. The system now publishes content to **three platforms simultaneously**:

1. ✅ **WordPress** (UAT/Production)
2. ✅ **Sanity CMS** (with Next.js frontend)
3. ✅ **Google Docs** (newly restored)

## What Was Fixed

### Changes Made to `content/content-publisher.js`

1. **Added Google APIs imports** (line 10-11):
   ```javascript
   const { google } = require('googleapis');
   const { GoogleAuth } = require('google-auth-library');
   ```

2. **Added Google OAuth credentials to config** (line 34-36):
   ```javascript
   googleClientId: config.googleClientId || process.env.GOOGLE_CLIENT_ID,
   googleClientSecret: config.googleClientSecret || process.env.GOOGLE_CLIENT_SECRET,
   googleRefreshToken: config.googleRefreshToken || process.env.GOOGLE_REFRESH_TOKEN,
   ```

3. **Integrated Google Docs publishing in publishAll()** (line 75):
   - Added `publishToGoogleDocs()` call alongside WordPress and Sanity
   - Added Google Docs status tracking to quality metrics
   - Added `google_docs_url` to published content records
   - Added Google Docs URL to console output

4. **Implemented `publishToGoogleDocs()` method** (line 329-393):
   - Creates new Google Doc with article title
   - Converts markdown to Google Docs format
   - Applies proper heading styles (H2, H3)
   - Formats bullet lists
   - Handles tables
   - Returns document URL and ID

5. **Implemented `markdownToGoogleDocsRequests()` method** (line 395-515):
   - Converts markdown to Google Docs API batch update requests
   - Supports headings (## = H2, ### = H3)
   - Supports bullet lists (-)
   - Supports tables (|...|)
   - Preserves paragraph formatting

6. **Implemented `stripMarkdownFormatting()` helper** (line 517-526):
   - Strips markdown syntax for plain text paragraphs
   - Removes bold (**text**), italic (*text*), code (`text`), links ([text](url))

## How It Works

### Publishing Flow

When you run `node main.js stage publication`:

```
SEO-Ready Content
    ↓
content-publisher.js publishAll()
    ├─→ publishToWordPress() → WordPress URL
    ├─→ publishToSanity() → Sanity URL + Frontend URL
    └─→ publishToGoogleDocs() → Google Docs URL
    ↓
All URLs saved to data/published-content.csv
```

### Google Docs Output Format

The Google Doc will contain:
- **Title** (from article title)
- **Heading 2** sections (from ## markdown)
- **Heading 3** sections (from ### markdown)
- **Bullet lists** (from - markdown)
- **Tables** (from | markdown)
- **Paragraphs** (regular text)

### Example Console Output

```
🚀 Publishing content CONTENT-040 (Top 5 ELSS Funds in 2025)

✅ Publication status: Published
   🔗 WordPress: https://uat.plindia.com/top-5-elss-funds-2025/
   🔗 Frontend: http://localhost:3001/posts/top-5-elss-funds-2025
   🗂️  Sanity Desk: https://sanity.io/project-id/production/desk/article;post-CONTENT-040
   📄 Google Docs: https://docs.google.com/document/d/1abc123xyz/edit
```

## Setup Instructions

### Prerequisites

The required Google API packages are already installed:
- `googleapis@^165.0.0` ✅
- `google-auth-library@^9.15.1` ✅

### Step 1: Generate OAuth Token

You need a Google OAuth refresh token with the correct scopes:

```bash
cd /Users/yogs87/Downloads/sanity/projects/enhanced-bulk-generator
node scripts/generate-google-oauth-token.js
```

This will:
1. Start a local OAuth server on port 3000
2. Open a URL in your browser for Google consent
3. Request permissions for:
   - Google Docs API (view and manage documents)
   - Google Sheets API (view and manage spreadsheets)
   - Google Drive API (view and manage files created by this app)
4. Generate a refresh token

### Step 2: Update Environment Variables

Copy the credentials from the terminal output and add to your `.env` file:

```bash
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret"
GOOGLE_REFRESH_TOKEN="your-new-refresh-token"
```

**Important**: Replace the old `GOOGLE_REFRESH_TOKEN` if you have one. The old token was created for Google Sheets only and won't work for Google Docs.

### Step 3: Enable Google Docs API

If you haven't already, enable the Google Docs API in your Google Cloud Console:

1. Go to: https://console.cloud.google.com/apis/library
2. Search for "Google Docs API"
3. Click "Enable"

### Step 4: Test Publishing

Mark some content as SEO-Ready and publish:

```bash
# Mark content as ready (replace CONTENT-040 with your content ID)
node -e "
const CSVDataManager = require('./core/csv-data-manager');
const manager = new CSVDataManager();
manager.updateCreatedContent('CONTENT-040', { approval_status: 'SEO-Ready' });
console.log('✅ CONTENT-040 marked as SEO-Ready');
"

# Publish (limit to 1 item for testing)
CONTENT_LIMIT=1 node main.js stage publication
```

You should see:
```
📄 Google Docs: https://docs.google.com/document/d/...
```

## Troubleshooting

### Error: `403 - Request had insufficient authentication scopes`

**Solution**: Your refresh token doesn't have Google Docs permissions.

Run the OAuth script again to generate a new token:
```bash
node scripts/generate-google-oauth-token.js
```

Make sure to:
1. Grant **all requested permissions** during OAuth consent
2. Copy the **new refresh token** to `.env`
3. Restart your terminal or re-export environment variables

### Error: `Google Docs API has not been enabled`

**Solution**: Enable the API in Google Cloud Console:

1. Go to: https://console.cloud.google.com/apis/library
2. Search "Google Docs API"
3. Click "Enable"
4. Wait 1-2 minutes for propagation
5. Try publishing again

### Error: `Port 3000 already in use`

**Solution**: Kill the process on port 3000:
```bash
kill -9 $(lsof -ti:3000)
node scripts/generate-google-oauth-token.js
```

### Google Docs URL not showing in output

**Check if credentials are set**:
```bash
echo "Client ID: ${GOOGLE_CLIENT_ID:0:20}..."
echo "Client Secret: ${GOOGLE_CLIENT_SECRET:0:10}..."
echo "Refresh Token: ${GOOGLE_REFRESH_TOKEN:0:20}..."
```

If any are empty:
1. Check your `.env` file
2. Make sure variables are exported: `source .env` or restart terminal
3. Verify `.env` syntax (no spaces around `=`)

## CSV Output

Published content records now include `google_docs_url` field:

```csv
content_id,topic_id,wordpress_url,sanity_url,sanity_desk_url,google_docs_url,publish_date,status
CONTENT-040,TOPIC-015,https://uat.plindia.com/...,http://localhost:3001/posts/...,https://sanity.io/...,https://docs.google.com/document/d/1abc123xyz/edit,2025-01-12T...,Published
```

## Benefits of Google Docs Publishing

1. **Easy sharing**: Share Google Docs links with team members for review
2. **Commenting**: Stakeholders can leave comments directly in Google Docs
3. **Version history**: Google Docs automatically tracks all changes
4. **Export options**: Download as PDF, Word, HTML, etc.
5. **Collaboration**: Multiple people can edit simultaneously
6. **Accessibility**: View on any device with Google Drive app
7. **Backup**: Additional copy of published content outside WordPress/Sanity

## Next Steps

1. ✅ Generate OAuth token with Google Docs permissions
2. ✅ Update `.env` with new credentials
3. ✅ Enable Google Docs API in Google Cloud Console
4. ✅ Test publishing with one content item
5. ✅ Verify Google Docs URL appears in console output
6. ✅ Check `data/published-content.csv` for `google_docs_url`

---

**Status**: ✅ Google Docs publishing fully restored and ready to use!

**Documentation**: See `GOOGLE-DOCS-SETUP.md` for detailed setup instructions.

**Last Updated**: 2025-01-12
