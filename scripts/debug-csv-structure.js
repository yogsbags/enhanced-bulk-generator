#!/usr/bin/env node

const fs = require('fs');
const { parse } = require('csv-parse/sync');

const CSV_FILE = "/Users/yogs87/Downloads/PL/PL India- 36 Blog Topics Content Recommendations-Nov'25(Blog Topics-CR).csv";

const csvContent = fs.readFileSync(CSV_FILE, 'utf-8');
const records = parse(csvContent, {
  columns: false,
  skip_empty_lines: false,
  relax_column_count: true,
});

// Print first topic's data (rows 2-30)
console.log('First topic structure:\n');
for (let i = 1; i < 30; i++) {
  const row = records[i];
  const srNo = row[1]?.trim();
  const topicName = row[2]?.trim();
  const contentStructure = row[12]?.trim();
  const headerTag = row[13]?.trim();
  const comments = row[14]?.trim();

  if (srNo || topicName || contentStructure || headerTag || comments) {
    console.log(`Row ${i + 1}:`);
    console.log(`  Sr.No: "${srNo}"`);
    console.log(`  Topic: "${topicName}"`);
    console.log(`  Structure: "${contentStructure}"`);
    console.log(`  Header: "${headerTag}"`);
    console.log(`  Comments: "${comments}"`);
    console.log('');
  }
}
