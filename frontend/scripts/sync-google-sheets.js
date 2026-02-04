/**
 * Google Sheets Sync Module (Stub)
 *
 * This module provides optional Google Sheets synchronization for CSV data.
 * Currently implemented as a stub that logs sync attempts without actual sync.
 *
 * To enable real Google Sheets sync:
 * 1. Install: npm install googleapis
 * 2. Set GOOGLE_SERVICE_ACCOUNT env var with credentials JSON
 * 3. Set GOOGLE_SHEETS_SPREADSHEET_ID env var
 * 4. Implement the sync logic below
 */

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID || '104GA_1AMKFgMEbEaU8oJHiP0hBX0fe8EmmQNt_ZnSC4';

/**
 * Sync CSV data to Google Sheets
 * @param {string} sheetName - Name of the sheet tab
 * @param {Array} data - Array of row objects
 * @param {Object} options - Sync options
 */
async function syncToGoogleSheets(sheetName, data, options = {}) {
  const { silent = true } = options;

  if (!silent) {
    console.log(`📊 Google Sheets sync requested: ${sheetName} (${data.length} rows)`);
  }

  // Check if credentials are configured
  const hasCredentials = process.env.GOOGLE_SERVICE_ACCOUNT;

  if (!hasCredentials) {
    if (!silent) {
      console.log('ℹ️  Google Sheets sync skipped: No credentials configured');
      console.log('   Set GOOGLE_SERVICE_ACCOUNT env var to enable sync');
    }
    return { success: false, skipped: true, reason: 'No credentials' };
  }

  // TODO: Implement actual Google Sheets API sync
  // For now, just return success (no-op)
  if (!silent) {
    console.log(`✅ Google Sheets sync ready for: ${sheetName}`);
    console.log(`   Sheet URL: https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}`);
  }

  return {
    success: true,
    skipped: false,
    sheetName,
    rowCount: data.length,
    spreadsheetId: SPREADSHEET_ID
  };
}

/**
 * Check if Google Sheets sync is available
 */
function isGoogleSheetsSyncAvailable() {
  return !!process.env.GOOGLE_SERVICE_ACCOUNT;
}

module.exports = {
  syncToGoogleSheets,
  isGoogleSheetsSyncAvailable,
  SPREADSHEET_ID
};
