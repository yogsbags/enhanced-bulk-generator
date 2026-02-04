#!/usr/bin/env node

/**
 * Sync Enhanced Bulk Generator CSVs to a Google Spreadsheet.
 * Backend copy: used when running from frontend/backend (e.g. Railway).
 * CSV directory defaults to backend/data; callers can pass options.csvDir.
 *
 * Usage (OAuth - Recommended for Railway):
 *   GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN
 *
 * Usage (Service Account):
 *   GOOGLE_CREDENTIALS_JSON='{"type":"service_account",...}'
 */

const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const { GoogleAuth } = require('google-auth-library');

const SPREADSHEET_ID = '104GA_1AMKFgMEbEaU8oJHiP0hBX0fe8EmmQNt_ZnSC4';
const CSV_DIR = path.join(__dirname, '..', 'data');
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

async function syncToGoogleSheets(options = {}) {
  const csvDir = options.csvDir || CSV_DIR;
  const spreadsheetId = options.spreadsheetId || SPREADSHEET_ID;
  const silent = options.silent || false;

  const log = (...args) => {
    if (!silent) console.log(...args);
  };

  try {
    let auth;

    log('🔍 Checking for credentials...');
    const refreshToken = process.env.GOOGLE_REFRESH_TOKEN || process.env.GOOGLE_SHEETS_REFRESH_TOKEN;
    log(`   - OAuth tokens: ${refreshToken ? 'SET' : 'NOT SET'}`);
    log(`   - Service account JSON: ${process.env.GOOGLE_CREDENTIALS_JSON ? 'SET (length: ' + process.env.GOOGLE_CREDENTIALS_JSON.length + ')' : 'NOT SET'}`);
    log(`   - Service account file: ${process.env.GOOGLE_APPLICATION_CREDENTIALS ? 'SET' : 'NOT SET'}`);

    if (refreshToken && process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
      log('📝 Using OAuth refresh token (recommended for Railway)');
      auth = new GoogleAuth({
        credentials: {
          type: 'authorized_user',
          client_id: process.env.GOOGLE_CLIENT_ID,
          client_secret: process.env.GOOGLE_CLIENT_SECRET,
          refresh_token: refreshToken
        },
        scopes: SCOPES
      });
      log('   ✓ OAuth credentials configured');
    } else if (process.env.GOOGLE_CREDENTIALS_JSON) {
      log('📝 Using GOOGLE_CREDENTIALS_JSON environment variable');
      try {
        const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS_JSON);
        log(`   ✓ Service account: ${credentials.client_email || 'unknown'}`);
        auth = new GoogleAuth({ credentials, scopes: SCOPES });
      } catch (parseError) {
        log(`   ✗ Failed to parse GOOGLE_CREDENTIALS_JSON: ${parseError.message}`);
        throw new Error(`Invalid GOOGLE_CREDENTIALS_JSON: ${parseError.message}`);
      }
    } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS && fs.existsSync(process.env.GOOGLE_APPLICATION_CREDENTIALS)) {
      log('📝 Using GOOGLE_APPLICATION_CREDENTIALS file path');
      auth = new GoogleAuth({ scopes: SCOPES });
    } else {
      log('⚠️  No Google credentials found. Sync skipped.');
      log('💡 For Railway: Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN');
      log('💡 Or set GOOGLE_CREDENTIALS_JSON for service account');
      return { success: true, skipped: true, reason: 'No credentials configured' };
    }

    log('🔗 Connecting to Google Sheets API...');
    const client = await auth.getClient();
    log('   ✓ Client authenticated successfully');

    log('📋 Fetching spreadsheet metadata...');
    log(`   - Spreadsheet ID: ${spreadsheetId}`);
    const spreadsheet = await client.request({
      url: `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`,
      method: 'GET'
    });
    log(`   ✓ Spreadsheet found: "${spreadsheet.data.properties?.title || 'Unknown'}"`);

    const existingSheets = new Map(
      (spreadsheet.data.sheets || []).map(sheet => [sheet.properties.title, sheet.properties.sheetId])
    );
    log(`   ✓ Found ${existingSheets.size} existing sheets`);

    log('📂 Scanning for CSV files...');
    log(`   - CSV directory: ${csvDir}`);
    const csvFiles = fs
      .readdirSync(csvDir)
      .filter(file => file.endsWith('.csv') && !file.endsWith('.bak'));
    log(`   ✓ Found ${csvFiles.length} CSV files to sync`);

    if (csvFiles.length === 0) {
      log('⚠️  No CSV files found to sync.');
      return { success: true, syncedSheets: 0 };
    }

    let syncedCount = 0;
    const errors = [];

    for (const file of csvFiles) {
      const sheetName = path.basename(file, '.csv');
      const csvPath = path.join(csvDir, file);

      try {
        log(`\n📊 Processing "${file}"...`);
        const raw = fs.readFileSync(csvPath, 'utf8');
        log(`   ✓ Read CSV file (${raw.length} bytes)`);

        const rows = parse(raw, {
          columns: false,
          skip_empty_lines: false
        });
        log(`   ✓ Parsed ${rows.length} rows`);

        const values = rows.length > 0 ? rows : [[]];

        if (!existingSheets.has(sheetName)) {
          log(`   📄 Creating new sheet "${sheetName}"...`);
          await client.request({
            url: `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`,
            method: 'POST',
            data: {
              requests: [
                {
                  addSheet: {
                    properties: {
                      title: sheetName
                    }
                  }
                }
              ]
            }
          });
          log(`   ✓ Sheet created`);
        }

        const encodedSheetName = encodeURIComponent(sheetName);

        log(`   🔄 Clearing existing data...`);
        await client.request({
          url: `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodedSheetName}:clear`,
          method: 'POST'
        });
        log(`   ✓ Sheet cleared`);

        log(`   📝 Uploading ${values.length} rows...`);
        await client.request({
          url: `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodedSheetName}?valueInputOption=RAW`,
          method: 'PUT',
          data: { values }
        });
        log(`   ✅ Synced successfully!`);

        syncedCount++;
      } catch (fileError) {
        log(`   ❌ Error syncing "${sheetName}": ${fileError.message}`);
        errors.push({ file: sheetName, error: fileError.message });
      }
    }

    log(`\n✅ CSV sync completed successfully. Synced ${syncedCount}/${csvFiles.length} sheet(s).`);
    if (errors.length > 0) {
      log(`⚠️  ${errors.length} error(s) occurred:`);
      errors.forEach(e => log(`   - ${e.file}: ${e.error}`));
    }
    return { success: true, syncedSheets: syncedCount, errors: errors.length > 0 ? errors : undefined };

  } catch (error) {
    console.error('❌ Sync failed:', error.message);
    return { success: false, error: error.message };
  }
}

function getSheetUrl(sheetName, spreadsheetId = SPREADSHEET_ID) {
  const baseUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}`;
  if (sheetName) {
    return `${baseUrl}/edit#gid=0&range=A1`;
  }
  return `${baseUrl}/edit`;
}

function getAllSheetUrls(spreadsheetId = SPREADSHEET_ID) {
  const baseUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;
  return {
    'research-gaps': `${baseUrl}#gid=0`,
    'quick-wins': `${baseUrl}#gid=1`,
    'generated-topics': `${baseUrl}#gid=2`,
    'topic-research': `${baseUrl}#gid=3`,
    'created-content': `${baseUrl}#gid=4`,
    'published-content': `${baseUrl}#gid=5`,
    'workflow-status': `${baseUrl}#gid=6`,
    'master-research': `${baseUrl}#gid=7`,
    '_default': baseUrl
  };
}

module.exports = {
  syncToGoogleSheets,
  getSheetUrl,
  getAllSheetUrls,
  SPREADSHEET_ID
};

if (require.main === module) {
  syncToGoogleSheets()
    .then(result => { if (!result.success && !result.skipped) process.exit(1); })
    .catch(err => { console.error('❌ Sync failed:', err.message); process.exit(1); });
}
