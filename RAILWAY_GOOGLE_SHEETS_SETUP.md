# Railway Google Sheets Sync Setup

## Issue
Google Sheets sync works locally but fails on Railway because the credentials file path (`/Users/yogs87/Downloads/PL/website-project-473310-2de85d4e7a7c.json`) doesn't exist on the Railway server.

## Solution
Use environment variable with JSON credentials instead of file path.

## Railway Setup Steps

### 1. Get the Credentials JSON Content

On your local machine, copy the entire contents of the credentials file:

```bash
cat /Users/yogs87/Downloads/PL/website-project-473310-2de85d4e7a7c.json
```

You'll see something like:
```json
{
  "type": "service_account",
  "project_id": "website-project-473310",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "...",
  "client_id": "...",
  ...
}
```

Copy the **entire JSON object** (all of it, including the outer `{ }` braces).

### 2. Add to Railway Environment Variables

1. Go to your Railway project dashboard
2. Click on your service/deployment
3. Go to **Variables** tab
4. Click **+ New Variable**
5. Set:
   - **Variable Name**: `GOOGLE_CREDENTIALS_JSON`
   - **Value**: Paste the entire JSON content you copied above
6. Click **Add**
7. Railway will automatically redeploy

### 3. Verify Sync is Working

After Railway redeploys:

1. Run a workflow stage (e.g., Stage 1: SEO Research)
2. Check the deployment logs for:
   ```
   📝 Using GOOGLE_CREDENTIALS_JSON environment variable
   🔄 Syncing sheet "research-gaps" (132 rows)...
   ✅ CSV sync completed successfully
   ```
3. Click the **📊 Google Sheets** button in the UI
4. Verify the Google Sheet has the latest data

## Alternative: Using GOOGLE_APPLICATION_CREDENTIALS (File Path)

If you prefer using a file path on Railway:

1. Commit the credentials JSON file to your repo (in a secure location)
2. Set environment variable:
   - **Variable Name**: `GOOGLE_APPLICATION_CREDENTIALS`
   - **Value**: `/app/path/to/credentials.json` (Railway's container path)

**Note**: This is less secure as credentials are committed to git. Using `GOOGLE_CREDENTIALS_JSON` is recommended.

## Testing Locally

The code automatically detects your environment:

- **Railway/Production**: Uses `GOOGLE_CREDENTIALS_JSON` env var
- **Local Dev**: Uses hardcoded file path `/Users/yogs87/Downloads/PL/website-project-473310-2de85d4e7a7c.json`

No local changes needed!

## Troubleshooting

### Sync fails with "No credentials found"
- Check that `GOOGLE_CREDENTIALS_JSON` is set in Railway Variables
- Verify the JSON is valid (no extra quotes or escaping)
- Check deployment logs for authentication errors

### Sync succeeds but Google Sheet not updating
- Verify the service account email has **Editor** access to the spreadsheet
- Share the sheet with: `<service-account-email>@<project-id>.iam.gserviceaccount.com`
- Check the spreadsheet ID matches: `104GA_1AMKFgMEbEaU8oJHiP0hBX0fe8EmmQNt_ZnSC4`

### JSON parsing error
- Make sure you copied the entire JSON object including outer `{ }`
- Don't add extra quotes around the JSON in Railway
- The JSON should be pasted directly as the variable value

## Security Notes

- ✅ **GOOGLE_CREDENTIALS_JSON**: Credentials stored securely in Railway's encrypted environment variables
- ❌ **Committing credentials**: Never commit the JSON file to git (it's in .gitignore)
- ✅ **Service account**: Using a service account (not personal Google account) is best practice
- ✅ **Minimal permissions**: Service account only needs Sheets API access, nothing else

---

**Last Updated**: 2025-11-10
**Related Files**:
- `scripts/sync-google-sheets.js` - Sync implementation
- `frontend/backend/core/workflow-orchestrator.js` - Calls sync after each stage
