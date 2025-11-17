#!/usr/bin/env node

/**
 * Check Content Status Script
 * Displays approval statuses in created-content.csv
 */

const CSVDataManager = require('../core/csv-data-manager');

const csvManager = new CSVDataManager();
const content = csvManager.readCSV(csvManager.files.createdContent);

console.log(`\n📊 Content Status Report`);
console.log('='.repeat(60));
console.log(`Total content items: ${content.length}`);

// Count by approval_status
const statusCounts = {};
content.forEach(item => {
  const status = item.approval_status || 'Unknown';
  statusCounts[status] = (statusCounts[status] || 0) + 1;
});

console.log(`\n📋 Approval Status Breakdown:`);
Object.entries(statusCounts)
  .sort((a, b) => b[1] - a[1])
  .forEach(([status, count]) => {
    console.log(`   ${status}: ${count}`);
  });

console.log('\n' + '='.repeat(60) + '\n');

// Find first few content items for reference
console.log('📝 Sample Content Items (first 5):');
content.slice(0, 5).forEach((item, idx) => {
  console.log(`   ${idx + 1}. ${item.content_id} | Topic: ${item.topic_id} | Status: ${item.approval_status}`);
});

console.log('\n');
