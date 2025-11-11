# Railway Google Sheets Sync - OAuth Setup

## Why OAuth Instead of Service Account?

✅ **OAuth tokens are simpler for Railway:**
- No JSON parsing issues
- Three simple string environment variables
- No file path confusion
- Uses your personal Google account
- Full read/write access to your sheets

## Setup Steps

### 1. Generate OAuth Tokens

Run the token generation script locally:

```bash
GOOGLE_OAUTH_CLIENT_ID="your-client-id" \
GOOGLE_OAUTH_CLIENT_SECRET="your-client-secret" \
node scripts/get-google-refresh-token.js
```

This will open your browser for authorization and output the tokens you need for Railway.

### 2. Add to Railway Environment Variables

1. Go to your Railway project dashboard
2. Click on your service/deployment
3. Go to **Variables** tab
4. Click **+ New Variable** (repeat for each):

#### Variable 1:
- **Name**: `GOOGLE_CLIENT_ID`
- **Value**: `<your-client-id from step 1>`

#### Variable 2:
- **Name**: `GOOGLE_CLIENT_SECRET`
- **Value**: `<your-client-secret from step 1>`

#### Variable 3:
- **Name**: `GOOGLE_REFRESH_TOKEN`
- **Value**: `<your-refresh-token from step 1>`

5. **Important**: Remove or disable the old `GOOGLE_CREDENTIALS_JSON` variable (if it exists)
6. Railway will automatically redeploy with the new credentials

### 3. Verify Google Sheets Access

Make sure the Google Sheets spreadsheet is shared with your Google account (yogsbags@gmail.com):

1. Open: https://docs.google.com/spreadsheets/d/104GA_1AMKFgMEbEaU8oJHiP0hBX0fe8EmmQNt_ZnSC4
2. Click **Share** button
3. Add `yogsbags@gmail.com` with **Editor** access
4. Click **Done**

### 4. Expected Railway Logs

After Railway redeploys, you should see:

```
🔍 Checking for credentials...
   - OAuth tokens: SET
   - Service account JSON: NOT SET
   - Service account file: NOT SET
📝 Using OAuth refresh token (recommended for Railway)
   ✓ OAuth credentials configured
🔗 Connecting to Google Sheets API...
   ✓ Client authenticated successfully
📋 Fetching spreadsheet metadata...
   ✓ Spreadsheet found: "Enhanced Bulk Generator - Data"
🔄 Syncing sheet "research-gaps" (132 rows)...
✅ CSV sync completed successfully
```

## How It Works

The sync script now has **4 credential sources** with this priority:

1. ✅ **OAuth tokens** (GOOGLE_REFRESH_TOKEN) - **Railway recommended**
2. Service account JSON (GOOGLE_CREDENTIALS_JSON) - Legacy support
3. Service account file (GOOGLE_APPLICATION_CREDENTIALS) - Local only
4. Hardcoded local path - Development only

OAuth tokens (Priority 1) will be used on Railway, avoiding all the JSON parsing and file path issues!

## Testing Locally

Your local environment will continue using the hardcoded service account path, so no changes needed for local development.

## Troubleshooting

### Sync fails with "OAuth tokens: NOT SET"
- Check that all 3 Railway variables are set correctly
- Verify variable names match exactly (case-sensitive)
- Check Railway deployment logs for authentication errors

### Sync succeeds but Google Sheet not updating
- Verify the spreadsheet is shared with `yogsbags@gmail.com` (Editor access)
- Check the spreadsheet ID matches: `104GA_1AMKFgMEbEaU8oJHiP0hBX0fe8EmmQNt_ZnSC4`
- Try manually opening the spreadsheet to confirm access

### "Invalid refresh token" error
- The refresh token may have expired (rare, but possible)
- Re-run `node scripts/get-google-refresh-token.js` to get a new one
- Update the `GOOGLE_REFRESH_TOKEN` variable on Railway

## Security Notes

✅ **OAuth tokens**: Stored securely in Railway's encrypted environment variables
✅ **Personal account**: Uses your Google account (yogsbags@gmail.com)
✅ **Minimal permissions**: Only Google Sheets API access
✅ **No JSON files**: No service account JSON to manage or commit
✅ **Revokable**: Can revoke access at https://myaccount.google.com/permissions

---

**Last Updated**: 2025-11-11
**Related Files**:
- `scripts/sync-google-sheets.js` - Sync implementation with OAuth support
- `scripts/get-google-refresh-token.js` - Token generation script
- `frontend/backend/core/workflow-orchestrator.js` - Calls sync after each stage
