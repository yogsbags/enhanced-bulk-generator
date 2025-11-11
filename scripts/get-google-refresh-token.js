#!/usr/bin/env node

/**
 * Generate Google OAuth Refresh Token
 *
 * This script helps you get a refresh token for Google Sheets API access.
 * Run once locally, then use the tokens on Railway.
 */

const { google } = require('googleapis');
const http = require('http');
const url = require('url');
const { default: open } = require('open');

// Get credentials from environment variables (set these before running)
const CLIENT_ID = process.env.GOOGLE_OAUTH_CLIENT_ID || 'YOUR_CLIENT_ID_HERE';
const CLIENT_SECRET = process.env.GOOGLE_OAUTH_CLIENT_SECRET || 'YOUR_CLIENT_SECRET_HERE';
const REDIRECT_URI = 'http://localhost:3000/oauth2callback';
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

async function getRefreshToken() {
  console.log('🔐 Google OAuth Refresh Token Generator\n');

  const oauth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI
  );

  // Generate auth URL
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent' // Force to get refresh token
  });

  console.log('📋 Step 1: Opening browser for authorization...\n');

  // Create local server to receive the callback
  const server = http.createServer(async (req, res) => {
    if (req.url.startsWith('/oauth2callback')) {
      const qs = new url.URL(req.url, 'http://localhost:3000').searchParams;
      const code = qs.get('code');

      if (code) {
        res.end('✅ Authorization successful! You can close this window and return to the terminal.');

        try {
          // Exchange code for tokens
          const { tokens } = await oauth2Client.getToken(code);

          console.log('\n✅ SUCCESS! Here are your tokens:\n');
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          console.log('\n📝 Add these to Railway environment variables:\n');
          console.log(`GOOGLE_CLIENT_ID="${CLIENT_ID}"`);
          console.log(`GOOGLE_CLIENT_SECRET="${CLIENT_SECRET}"`);
          console.log(`GOOGLE_REFRESH_TOKEN="${tokens.refresh_token}"`);
          console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
          console.log('💡 Full token details:');
          console.log(JSON.stringify(tokens, null, 2));
          console.log('\n✅ Setup complete! You can now use these tokens on Railway.\n');

        } catch (error) {
          console.error('❌ Error getting tokens:', error.message);
        }

        server.close();
        process.exit(0);
      } else {
        res.end('❌ Authorization failed. No code received.');
        server.close();
        process.exit(1);
      }
    }
  });

  server.listen(3000, () => {
    console.log('🌐 Local server started on http://localhost:3000\n');
    console.log('🔗 Opening authorization URL in browser...\n');
    open(authUrl);
    console.log('If browser doesn\'t open, visit this URL manually:\n');
    console.log(authUrl);
    console.log('\n⏳ Waiting for authorization...\n');
  });
}

getRefreshToken().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
