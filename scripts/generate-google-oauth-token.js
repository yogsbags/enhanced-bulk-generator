#!/usr/bin/env node

/**
 * Google OAuth Token Generator for Google Docs + Sheets API
 *
 * This script helps you obtain a refresh token with the correct scopes
 * for both Google Docs and Google Sheets APIs.
 *
 * Usage:
 *   1. node scripts/generate-google-oauth-token.js
 *   2. Open the URL in your browser
 *   3. Grant permissions
 *   4. Copy the authorization code from the redirect URL
 *   5. Paste it back into this script
 *   6. Save the refresh token to your .env file
 */

const http = require('http');
const url = require('url');
const https = require('https');
const readline = require('readline');

// OAuth Configuration
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = 'http://localhost:3000/oauth2callback';

// Scopes needed for Google Docs + Sheets
const SCOPES = [
  'https://www.googleapis.com/auth/documents',      // Google Docs API
  'https://www.googleapis.com/auth/spreadsheets',   // Google Sheets API
  'https://www.googleapis.com/auth/drive.file'      // Google Drive (for created files)
];

console.log('╔═══════════════════════════════════════════════════════════════╗');
console.log('║   Google OAuth 2.0 Refresh Token Generator                   ║');
console.log('║   Scopes: Google Docs + Google Sheets + Drive                ║');
console.log('╚═══════════════════════════════════════════════════════════════╝');
console.log();

// Step 1: Generate authorization URL
const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams({
  client_id: CLIENT_ID,
  redirect_uri: REDIRECT_URI,
  response_type: 'code',
  scope: SCOPES.join(' '),
  access_type: 'offline',  // Required to get refresh token
  prompt: 'consent'        // Force consent screen to ensure refresh token
}).toString()}`;

console.log('📋 Step 1: Authorize this application');
console.log('─────────────────────────────────────────────────────────────────');
console.log();
console.log('Open this URL in your browser:');
console.log();
console.log('\x1b[36m%s\x1b[0m', authUrl);
console.log();
console.log('This will open Google\'s OAuth consent screen.');
console.log();

// Step 2: Start local server to receive the callback
let server;
let authCode = null;

const startServer = () => {
  return new Promise((resolve, reject) => {
    server = http.createServer((req, res) => {
      const parsedUrl = url.parse(req.url, true);

      if (parsedUrl.pathname === '/oauth2callback') {
        authCode = parsedUrl.query.code;

        if (authCode) {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(`
            <html>
              <head><title>Authorization Successful</title></head>
              <body style="font-family: Arial, sans-serif; padding: 40px; text-align: center;">
                <h1 style="color: #4CAF50;">✅ Authorization Successful!</h1>
                <p>You can close this window and return to the terminal.</p>
              </body>
            </html>
          `);

          // Close server after receiving code
          setTimeout(() => {
            server.close();
            resolve(authCode);
          }, 1000);
        } else {
          res.writeHead(400, { 'Content-Type': 'text/html' });
          res.end(`
            <html>
              <head><title>Authorization Failed</title></head>
              <body style="font-family: Arial, sans-serif; padding: 40px; text-align: center;">
                <h1 style="color: #f44336;">❌ Authorization Failed</h1>
                <p>No authorization code received. Please try again.</p>
              </body>
            </html>
          `);
          server.close();
          reject(new Error('No authorization code received'));
        }
      }
    });

    server.listen(3000, () => {
      console.log('🔄 Waiting for authorization...');
      console.log('   (Local server started on http://localhost:3000)');
      console.log();
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error('❌ Port 3000 is already in use. Please free the port and try again.');
        reject(err);
      } else {
        reject(err);
      }
    });
  });
};

// Step 3: Exchange authorization code for tokens
const exchangeCodeForTokens = (code) => {
  return new Promise((resolve, reject) => {
    const postData = new URLSearchParams({
      code: code,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      redirect_uri: REDIRECT_URI,
      grant_type: 'authorization_code'
    }).toString();

    const options = {
      hostname: 'oauth2.googleapis.com',
      port: 443,
      path: '/token',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': postData.length
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`Token exchange failed (${res.statusCode}): ${data}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
};

// Main execution
(async () => {
  try {
    // Wait for user to authorize and receive code
    const code = await startServer();

    console.log();
    console.log('✅ Authorization code received!');
    console.log();
    console.log('📋 Step 2: Exchanging code for tokens...');
    console.log('─────────────────────────────────────────────────────────────────');
    console.log();

    // Exchange code for tokens
    const tokens = await exchangeCodeForTokens(code);

    console.log('✅ Tokens obtained successfully!');
    console.log();
    console.log('╔═══════════════════════════════════════════════════════════════╗');
    console.log('║   COPY THESE CREDENTIALS TO YOUR .env FILE                   ║');
    console.log('╚═══════════════════════════════════════════════════════════════╝');
    console.log();
    console.log('Add these lines to your .env file:');
    console.log();
    console.log('─────────────────────────────────────────────────────────────────');
    console.log(`GOOGLE_CLIENT_ID="${CLIENT_ID}"`);
    console.log(`GOOGLE_CLIENT_SECRET="${CLIENT_SECRET}"`);
    console.log(`GOOGLE_REFRESH_TOKEN="${tokens.refresh_token}"`);
    console.log('─────────────────────────────────────────────────────────────────');
    console.log();
    console.log('📝 Token Details:');
    console.log(`   Access Token: ${tokens.access_token.substring(0, 30)}...`);
    console.log(`   Refresh Token: ${tokens.refresh_token.substring(0, 30)}...`);
    console.log(`   Expires In: ${tokens.expires_in} seconds`);
    console.log(`   Scopes: ${tokens.scope}`);
    console.log();
    console.log('✅ You can now use these credentials for Google Docs + Sheets publishing!');
    console.log();

  } catch (error) {
    console.error();
    console.error('❌ Error:', error.message);
    console.error();
    process.exit(1);
  }
})();
