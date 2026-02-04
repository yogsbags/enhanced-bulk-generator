const fs = require('fs');
const { parse } = require('csv-parse/sync');

const csvPath = 'topic-research.csv';
const cleanPath = 'topic-research-clean.csv';

console.log('Reading CSV file...');
const csvContent = fs.readFileSync(csvPath, 'utf-8');
const lines = csvContent.split('\n');

console.log(`Total lines: ${lines.length}`);

const header = lines[0];
const goodRecords = [];
const badRecords = [];

// Try to parse each line individually
for (let i = 1; i < lines.length; i++) {
  if (!lines[i].trim()) continue; // Skip empty lines

  try {
    // Try to parse this line with the header
    const testCSV = header + '\n' + lines[i];
    const parsed = parse(testCSV, {
      columns: true,
      skip_empty_lines: true,
      relax_quotes: true,
      trim: true,
    });

    // Check if it has the expected number of columns (16)
    const record = parsed[0];
    const columnCount = Object.keys(record).length;

    if (columnCount === 16 && record.topic_research_id) {
      goodRecords.push(lines[i]);
    } else {
      badRecords.push({ line: i + 1, id: record.topic_research_id || 'unknown', columns: columnCount });
      console.log(`❌ Line ${i + 1}: Invalid column count (${columnCount}), ID: ${record.topic_research_id || 'unknown'}`);
    }
  } catch (error) {
    badRecords.push({ line: i + 1, error: error.message });
    console.log(`❌ Line ${i + 1}: ${error.message.substring(0, 80)}`);
  }
}

console.log(`\n✅ Good records: ${goodRecords.length}`);
console.log(`❌ Bad records: ${badRecords.length}`);

// Write clean CSV
const cleanCSV = header + '\n' + goodRecords.join('\n');
fs.writeFileSync(cleanPath, cleanCSV);

console.log(`\n✅ Clean CSV saved to: ${cleanPath}`);
console.log(`Original size: ${Math.round(csvContent.length / 1024)} KB`);
console.log(`Clean size: ${Math.round(cleanCSV.length / 1024)} KB`);

// Save report of bad records
const report = `Bad Records Report
==================
Total bad records: ${badRecords.length}

${badRecords.map(r => `Line ${r.line}: ${r.id || r.error}`).join('\n')}
`;

fs.writeFileSync('topic-research-cleanup-report.txt', report);
console.log(`\n📊 Cleanup report saved to: topic-research-cleanup-report.txt`);
