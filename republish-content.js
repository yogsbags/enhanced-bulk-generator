#!/usr/bin/env node

/**
 * Direct content republisher - Updates CSV to mark content as SEO-Ready
 * so the main.js workflow can republish with fixed table rendering
 */

const fs = require('fs');
const { parse } = require('csv-parse/sync');
const { stringify } = require('csv-stringify/sync');

async function markContentForRepublishing() {
  console.log('🔄 Marking published content for republishing...\n');

  // Load created content
  const contentPath = 'data/created-content.csv';
  const contentData = fs.readFileSync(contentPath, 'utf-8');
  const records = parse(contentData, { columns: true, skip_empty_lines: true });

  // Filter content that was published and has tables
  const toRepublish = records.filter(record =>
    record.approval_status === 'Published' &&
    record.article_content &&
    record.article_content.includes('|') // Has tables
  );

  console.log(`📊 Found ${toRepublish.length} published articles with tables\n`);

  if (toRepublish.length === 0) {
    console.log('✅ No content needs republishing\n');
    return;
  }

  // Process first 5 articles
  const batchSize = Math.min(5, toRepublish.length);
  let updatedCount = 0;

  for (let i = 0; i < records.length; i++) {
    const record = records[i];

    // Check if this record should be marked for republishing
    const shouldRepublish = toRepublish.slice(0, batchSize).some(r => r.topic_id === record.topic_id);

    if (shouldRepublish) {
      records[i].approval_status = 'SEO-Ready';
      updatedCount++;
      console.log(`✏️  Marked ${record.topic_id} as SEO-Ready`);
    }
  }

  // Write updated CSV back
  const updatedCsv = stringify(records, {
    header: true,
    columns: Object.keys(records[0])
  });

  fs.writeFileSync(contentPath, updatedCsv);

  console.log(`\n✅ Updated ${updatedCount} articles to SEO-Ready status`);
  console.log(`\n📝 Next step: Run the publication workflow:`);
  console.log(`   node main.js stage publication\n`);
}

// Run the marker
markContentForRepublishing().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
