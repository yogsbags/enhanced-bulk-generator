# Google OAuth Token Generator

This script helps you obtain a Google OAuth refresh token with the correct scopes for **Google Docs** and **Google Sheets** APIs.

## Why You Need This

The Google Docs publishing integration requires OAuth authentication with these scopes:
- `https://www.googleapis.com/auth/documents` - Google Docs API
- `https://www.googleapis.com/auth/spreadsheets` - Google Sheets API
- `https://www.googleapis.com/auth/drive.file` - Google Drive API

If you're getting a `403 - insufficient authentication scopes` error, your current refresh token doesn't have these permissions.

## Prerequisites

1. **Google Cloud Project** with Google Docs API and Google Sheets API enabled
2. **OAuth 2.0 Client ID** (Web application type)
   - Go to: https://console.cloud.google.com/apis/credentials
   - Create credentials → OAuth client ID → Web application
   - Add redirect URI: `http://localhost:3000/oauth2callback`
3. **Client ID and Client Secret** from your OAuth credentials

## Quick Start

### Step 1: Run the script

```bash
cd /Users/yogs87/Downloads/sanity/projects/enhanced-bulk-generator
node scripts/generate-google-oauth-token.js
```

### Step 2: Open the authorization URL

The script will display a URL like:

```
https://accounts.google.com/o/oauth2/v2/auth?client_id=...
```

**Copy this URL and open it in your browser.**

### Step 3: Grant permissions

1. Log in with your Google account
2. Click "Continue" or "Allow" when prompted
3. Grant access to:
   - View and manage Google Docs
   - View and manage Google Sheets
   - View and manage files created by this app

### Step 4: Automatic callback

The browser will redirect to `http://localhost:3000/oauth2callback` and show:

```
✅ Authorization Successful!
You can close this window and return to the terminal.
```

### Step 5: Copy credentials to .env

The script will output your credentials:

```bash
GOOGLE_CLIENT_ID="452919317535-..."
GOOGLE_CLIENT_SECRET="GOCSPX-..."
GOOGLE_REFRESH_TOKEN="1//0gk32V..."
```

**Copy these lines and add them to your `.env` file.**

## Troubleshooting

### Port 3000 is already in use

**Error**: `❌ Port 3000 is already in use`

**Solution**: Stop any process using port 3000 or modify the script to use a different port:

```bash
# Find process on port 3000
lsof -ti:3000

# Kill the process
kill -9 $(lsof -ti:3000)
```

### Redirect URI mismatch

**Error**: `redirect_uri_mismatch`

**Solution**: Ensure your Google Cloud OAuth client has this redirect URI configured:
- `http://localhost:3000/oauth2callback`

Go to: https://console.cloud.google.com/apis/credentials → Select your OAuth client → Add redirect URI

### API not enabled

**Error**: `API has not been used in project` or `403 disabled`

**Solution**: Enable the Google Docs API in your Google Cloud project:

1. Go to: https://console.cloud.google.com/apis/library
2. Search for "Google Docs API"
3. Click "Enable"
4. Repeat for "Google Sheets API" if needed

### No refresh token received

**Error**: Response doesn't contain `refresh_token`

**Solution**: The script includes `prompt=consent` to force the consent screen, but if you've already authorized this app:

1. Go to: https://myaccount.google.com/permissions
2. Find your application
3. Click "Remove Access"
4. Run the script again

## Security Notes

- **Never commit your refresh token to git** - it's as sensitive as a password
- Add `.env` to your `.gitignore` file
- Refresh tokens don't expire unless revoked or unused for 6 months
- You can revoke access anytime at: https://myaccount.google.com/permissions

## Testing the New Token

After updating your `.env` file:

```bash
# Export the new credentials
export $(cat .env | grep GOOGLE_ | xargs)

# Test publishing
CONTENT_LIMIT=1 node main.js stage publication
```

You should see:
```
📄 Google Docs: https://docs.google.com/document/d/{documentId}/edit
```

## Advanced: Using Different Credentials

If you want to use different Google OAuth credentials (not the defaults), set them before running:

```bash
export GOOGLE_CLIENT_ID="your-client-id"
export GOOGLE_CLIENT_SECRET="your-client-secret"
node scripts/generate-google-oauth-token.js
```

## What This Script Does

1. **Starts a local HTTP server** on port 3000
2. **Generates an OAuth authorization URL** with the correct scopes
3. **Waits for Google to redirect** back with an authorization code
4. **Exchanges the code** for an access token and refresh token
5. **Displays the credentials** for you to copy to `.env`

## OAuth Flow Diagram

```
User
  ↓
[1] Run script → Generate auth URL
  ↓
[2] Open URL in browser → Google login
  ↓
[3] Grant permissions → Google consent screen
  ↓
[4] Redirect to localhost:3000 → Authorization code
  ↓
[5] Script exchanges code → Access + Refresh tokens
  ↓
[6] Copy to .env → Ready to publish!
```

## Related Documentation

- Google OAuth 2.0: https://developers.google.com/identity/protocols/oauth2
- Google Docs API: https://developers.google.com/docs/api
- Google Sheets API: https://developers.google.com/sheets/api
