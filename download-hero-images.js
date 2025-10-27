#!/usr/bin/env node

/**
 * Download all hero images from URLs to local storage
 * This prevents expired DALL-E URLs from breaking the publish workflow
 */

const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const { parse } = require('csv-parse/sync');
const { stringify } = require('csv-stringify/sync');

const OUTPUT_DIR = path.resolve(__dirname, 'data/hero-images');
const CSV_PATH = 'data/created-content.csv';

async function downloadImage(url, filename) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const buffer = await response.buffer();
    const filepath = path.join(OUTPUT_DIR, filename);

    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    fs.writeFileSync(filepath, buffer);
    return filepath;
  } catch (error) {
    throw new Error(`Failed to download: ${error.message}`);
  }
}

async function main() {
  console.log('📥 Downloading hero images...\n');

  const csvData = fs.readFileSync(CSV_PATH, 'utf-8');
  const records = parse(csvData, { columns: true, skip_empty_lines: true });

  let downloaded = 0;
  let skipped = 0;
  let failed = 0;

  for (const record of records) {
    try {
      const heroData = JSON.parse(record.hero_image || '{}');

      if (!heroData.url) {
        skipped++;
        continue;
      }

      // Check if already has local_path
      if (heroData.local_path && fs.existsSync(heroData.local_path)) {
        console.log(`✓ ${record.content_id}: Already downloaded`);
        skipped++;
        continue;
      }

      // Download the image
      const filename = `${record.content_id}-hero.png`;
      console.log(`⬇️  ${record.content_id}: Downloading...`);

      const localPath = await downloadImage(heroData.url, filename);

      // Update record
      heroData.local_path = localPath;
      record.hero_image = JSON.stringify(heroData);

      console.log(`✅ ${record.content_id}: Saved to ${localPath}`);
      downloaded++;

    } catch (error) {
      console.error(`❌ ${record.content_id}: ${error.message}`);
      failed++;
    }
  }

  // Write updated CSV
  if (downloaded > 0) {
    const updatedCsv = stringify(records, {
      header: true,
      columns: Object.keys(records[0])
    });

    fs.writeFileSync(CSV_PATH, updatedCsv);
    console.log(`\n💾 Updated ${CSV_PATH}`);
  }

  console.log(`\n📊 Summary:`);
  console.log(`   ✅ Downloaded: ${downloaded}`);
  console.log(`   ⏭️  Skipped: ${skipped}`);
  console.log(`   ❌ Failed: ${failed}`);
}

main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
