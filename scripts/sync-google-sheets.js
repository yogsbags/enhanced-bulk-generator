#!/usr/bin/env node

/**
 * Sync Enhanced Bulk Generator CSVs to a Google Spreadsheet.
 *
 * Usage:
 *   GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json \
 *   node scripts/sync-google-sheets.js
 *
 * Requirements:
 *   - A Google Cloud service account with Sheets API access.
 *   - The spreadsheet must be shared with the service account email.
 *   - Environment variable GOOGLE_APPLICATION_CREDENTIALS pointing to the JSON key.
 *
 * The script reads every *.csv file under ../data (excluding .bak files)
 * and uploads each as a sheet in the target spreadsheet, using the CSV
 * filename (without extension) as the sheet title.
 *
 * Existing sheets with the same name are cleared and replaced in full.
 * Sheets not present in the spreadsheet are created automatically.
 *
 * This script does not modify any existing workflow code.
 */

const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const { GoogleAuth } = require('google-auth-library');

const SPREADSHEET_ID = '104GA_1AMKFgMEbEaU8oJHiP0hBX0fe8EmmQNt_ZnSC4';
const CSV_DIR = path.join(__dirname, '..', 'data');
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

// Hardcoded credentials path (fallback if env var not set)
const HARDCODED_CREDENTIALS_PATH = '/Users/yogs87/Downloads/PL/website-project-473310-2de85d4e7a7c.json';

/**
 * Sync all CSV files to Google Sheets
 * @param {Object} options - Configuration options
 * @param {string} options.csvDir - Directory containing CSV files (defaults to ../data)
 * @param {string} options.spreadsheetId - Google Sheets spreadsheet ID
 * @param {boolean} options.silent - Suppress console output (default: false)
 * @returns {Promise<Object>} Sync results with status
 */
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
    log(`   - GOOGLE_CREDENTIALS_JSON env var: ${process.env.GOOGLE_CREDENTIALS_JSON ? 'SET (length: ' + process.env.GOOGLE_CREDENTIALS_JSON.length + ')' : 'NOT SET'}`);
    log(`   - GOOGLE_APPLICATION_CREDENTIALS: ${process.env.GOOGLE_APPLICATION_CREDENTIALS || 'NOT SET'}`);
    log(`   - Hardcoded path exists: ${fs.existsSync(HARDCODED_CREDENTIALS_PATH)}`);

    // Try to use GOOGLE_CREDENTIALS_JSON environment variable (for Railway/cloud deployments)
    if (process.env.GOOGLE_CREDENTIALS_JSON) {
      log('📝 Using GOOGLE_CREDENTIALS_JSON environment variable');
      try {
        const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS_JSON);
        log(`   ✓ Parsed JSON successfully`);
        log(`   ✓ Service account: ${credentials.client_email || 'unknown'}`);
        log(`   ✓ Project ID: ${credentials.project_id || 'unknown'}`);
        auth = new GoogleAuth({
          credentials,
          scopes: SCOPES
        });
        log('   ✓ GoogleAuth initialized');
      } catch (parseError) {
        log(`   ✗ Failed to parse GOOGLE_CREDENTIALS_JSON: ${parseError.message}`);
        throw new Error(`Invalid GOOGLE_CREDENTIALS_JSON: ${parseError.message}`);
      }
    }
    // Try file path from GOOGLE_APPLICATION_CREDENTIALS env var
    else if (process.env.GOOGLE_APPLICATION_CREDENTIALS && fs.existsSync(process.env.GOOGLE_APPLICATION_CREDENTIALS)) {
      log('📝 Using GOOGLE_APPLICATION_CREDENTIALS file path');
      process.env.GOOGLE_APPLICATION_CREDENTIALS = process.env.GOOGLE_APPLICATION_CREDENTIALS;
      auth = new GoogleAuth({ scopes: SCOPES });
    }
    // Try hardcoded local path
    else if (fs.existsSync(HARDCODED_CREDENTIALS_PATH)) {
      log('📝 Using hardcoded credentials path (local dev)');
      process.env.GOOGLE_APPLICATION_CREDENTIALS = HARDCODED_CREDENTIALS_PATH;
      auth = new GoogleAuth({ scopes: SCOPES });
    }
    // No credentials available - fail gracefully
    else {
      log('⚠️  No Google credentials found. Sync skipped.');
      log('💡 Set GOOGLE_CREDENTIALS_JSON or GOOGLE_APPLICATION_CREDENTIALS environment variable');
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
          data: {
            values
          }
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

/**
 * Get Google Sheets URL for a specific sheet
 * @param {string} sheetName - Name of the sheet (CSV filename without extension)
 * @param {string} spreadsheetId - Optional spreadsheet ID (defaults to SPREADSHEET_ID)
 * @returns {string} Direct URL to the sheet
 */
function getSheetUrl(sheetName, spreadsheetId = SPREADSHEET_ID) {
  // Get the sheet ID by encoding the sheet name
  const gid = 0; // Default to first sheet, could be enhanced to track actual sheet IDs
  const baseUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}`;

  if (sheetName) {
    // URL with sheet name for better UX
    return `${baseUrl}/edit#gid=${gid}&range=A1`;
  }

  return `${baseUrl}/edit`;
}

/**
 * Get all sheet URLs mapped by CSV filename
 * @param {string} spreadsheetId - Optional spreadsheet ID (defaults to SPREADSHEET_ID)
 * @returns {Object} Map of sheet names to URLs
 */
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
    // Generic fallback
    '_default': baseUrl
  };
}

// Export for module usage
module.exports = {
  syncToGoogleSheets,
  getSheetUrl,
  getAllSheetUrls,
  SPREADSHEET_ID
};

// CLI usage
async function main() {
  const result = await syncToGoogleSheets();
  if (!result.success) {
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(err => {
    console.error('❌ Sync failed:', err.message);
    process.exit(1);
  });
}
