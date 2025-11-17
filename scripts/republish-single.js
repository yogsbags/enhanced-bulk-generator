#!/usr/bin/env node

/**
 * Republish Single Article to Google Docs
 * Targets a specific content_id for republishing
 */

require('dotenv').config();
const GoogleDocsPublisher = require('./publish-to-google-docs');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parse/sync');

async function republishSingle(contentId) {
  console.log(`\n📄 REPUBLISHING ${contentId} TO GOOGLE DOCS`);
  console.log('='.repeat(60));

  // Load CSV
  const csvPath = path.join(__dirname, '../data/created-content.csv');
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const records = csv.parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    relax_quotes: true,
    quote: '"',
    escape: '"'
  });

  // Find the target article
  const article = records.find(r => r.content_id === contentId);
  if (!article) {
    console.error(`❌ ${contentId} not found in created-content.csv`);
    process.exit(1);
  }

  console.log(`\n✅ Found article: ${article.title || contentId}`);
  console.log(`   Word count: ${article.word_count || 'N/A'}`);
  console.log(`   Old Google Docs URL: ${article.google_docs_url || 'None'}`);

  // Initialize publisher
  const publisher = new GoogleDocsPublisher();

  // Publish the article
  console.log('\n🚀 Publishing to Google Docs...');
  const result = await publisher.publishArticle(article);

  if (result.success) {
    console.log(`\n✅ Successfully published!`);
    console.log(`   New URL: ${result.url}`);
    console.log(`   Document ID: ${result.documentId}`);

    // Update CSV with new URL
    const articleIndex = records.findIndex(r => r.content_id === contentId);
    records[articleIndex].google_docs_url = result.url;

    // Update seo_metadata
    const seoMetadata = JSON.parse(records[articleIndex].seo_metadata || '{}');
    seoMetadata.google_docs_url = result.url;
    seoMetadata.google_docs_id = result.documentId;
    seoMetadata.last_updated = new Date().toISOString();
    records[articleIndex].seo_metadata = JSON.stringify(seoMetadata);

    // Save CSV
    const { stringify } = require('csv-stringify/sync');
    const csvOutput = stringify(records, {
      header: true,
      quoted: true,
      quoted_empty: true
    });

    fs.writeFileSync(csvPath, csvOutput, 'utf-8');
    console.log('\n✅ Updated created-content.csv with new URL');

  } else {
    console.error(`\n❌ Publishing failed: ${result.error}`);
    process.exit(1);
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ Republishing complete!');
  console.log('='.repeat(60) + '\n');
}

// CLI
const contentId = process.argv[2] || 'CONTENT-009';
republishSingle(contentId).catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
