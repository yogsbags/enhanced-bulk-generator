#!/usr/bin/env node

/**
 * Prepare Validation Test Script
 * Temporarily changes some SEO-Ready content to Needs-SEO for validation testing
 */

const CSVDataManager = require('../core/csv-data-manager');

const csvManager = new CSVDataManager();
const content = csvManager.readCSV(csvManager.files.createdContent);

console.log(`\n🔧 Preparing Validation Test`);
console.log('='.repeat(60));

// Find SEO-Ready content
const seoReadyContent = content.filter(item => item.approval_status === 'SEO-Ready');

if (seoReadyContent.length === 0) {
  console.log('❌ No SEO-Ready content found to test with');
  console.log('💡 Create new content first: node main.js stage content');
  process.exit(1);
}

// Change the first 3 SEO-Ready items to Needs-SEO
const testCount = Math.min(3, seoReadyContent.length);
const testContentIds = seoReadyContent.slice(0, testCount).map(item => item.content_id);

console.log(`\n📝 Converting ${testCount} items from SEO-Ready to Needs-SEO for testing:`);

testContentIds.forEach(contentId => {
  csvManager.updateContentApprovalStatus(contentId, 'Needs-SEO');
  console.log(`   ✓ ${contentId} → Needs-SEO`);
});

console.log(`\n✅ Test preparation complete!`);
console.log(`\n🔍 Now run validation:`);
console.log(`   node main.js stage validation`);
console.log('\n' + '='.repeat(60) + '\n');
