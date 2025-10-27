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

async function main() {
  const credentialPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (!credentialPath || !fs.existsSync(credentialPath)) {
    throw new Error('GOOGLE_APPLICATION_CREDENTIALS is not set or file not found.');
  }

  const auth = new GoogleAuth({ scopes: SCOPES });
  const client = await auth.getClient();

  const spreadsheet = await client.request({
    url: `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}`,
    method: 'GET'
  });

  const existingSheets = new Map(
    (spreadsheet.data.sheets || []).map(sheet => [sheet.properties.title, sheet.properties.sheetId])
  );

  const csvFiles = fs
    .readdirSync(CSV_DIR)
    .filter(file => file.endsWith('.csv') && !file.endsWith('.bak'));

  if (csvFiles.length === 0) {
    console.log('No CSV files found to sync.');
    return;
  }

  for (const file of csvFiles) {
    const sheetName = path.basename(file, '.csv');
    const csvPath = path.join(CSV_DIR, file);
    const raw = fs.readFileSync(csvPath, 'utf8');

    const rows = parse(raw, {
      columns: false,
      skip_empty_lines: false
    });

    const values = rows.length > 0 ? rows : [[]];

    if (!existingSheets.has(sheetName)) {
      console.log(`Creating sheet "${sheetName}"...`);
      await client.request({
        url: `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}:batchUpdate`,
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
    }

    const encodedSheetName = encodeURIComponent(sheetName);

    console.log(`Clearing sheet "${sheetName}"...`);
    await client.request({
      url: `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodedSheetName}:clear`,
      method: 'POST'
    });

    console.log(`Updating sheet "${sheetName}" with ${values.length} rows...`);
    await client.request({
      url: `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodedSheetName}?valueInputOption=RAW`,
      method: 'PUT',
      data: {
        values
      }
    });
  }

  console.log('✅ CSV sync completed successfully.');
}

main().catch(err => {
  console.error('❌ Sync failed:', err.message);
  process.exit(1);
});
