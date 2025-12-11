#!/usr/bin/env node

/**
 * Extract Content Outlines from CSV
 * Reads the Blog Topics CSV and generates markdown outline files
 * with proper H1/H2/H3 structure similar to reference outlines
 */

const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

const CSV_FILE = "/Users/yogs87/Downloads/PL/PL India- 36 Blog Topics Content Recommendations-Nov'25(Blog Topics-CR).csv";
const OUTLINE_DIR = path.join(__dirname, '../outlines');

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

function extractOutlines() {
  console.log('📖 Extracting Content Outlines from CSV...\n');

  // Read CSV file
  const csvContent = fs.readFileSync(CSV_FILE, 'utf-8');
  const records = parse(csvContent, {
    columns: false,
    skip_empty_lines: false,
    relax_column_count: true,
  });

  // Skip header row
  const dataRows = records.slice(1);

  let currentTopic = null;
  let currentSrNo = null;
  let outlineItems = [];
  let topicCount = 0;
  let currentH2Section = null;

  // Ensure outline directory exists
  if (!fs.existsSync(OUTLINE_DIR)) {
    fs.mkdirSync(OUTLINE_DIR, { recursive: true });
  }

  function saveOutline() {
    if (currentTopic && outlineItems.length > 0) {
      const slug = slugify(currentTopic);
      const filename = path.join(OUTLINE_DIR, `${slug}.md`);

      let markdown = `# ${currentTopic}\n\n`;
      markdown += `## Article Structure\n\n`;

      outlineItems.forEach((item, index) => {
        const { structure, tag, comments } = item;

        if (!structure || structure.trim() === '') return;

        // Clean structure text
        const cleanStructure = structure.trim();
        const cleanComments = comments && comments !== '—' && comments !== '�' ? comments.trim() : '';

        if (tag === 'H1') {
          // H1: Main title
          markdown += `### H1: ${cleanStructure}\n\n`;
          if (cleanComments) {
            markdown += `**${cleanComments}**\n\n`;
          }
        } else if (tag === 'H2') {
          // H2: Major sections
          markdown += `### H2: ${cleanStructure}\n\n`;
          currentH2Section = cleanStructure;

          // Add comment as instruction if available
          if (cleanComments) {
            if (cleanComments.toLowerCase().includes('table')) {
              markdown += `- Create a comparison table\n`;
            } else if (cleanComments.toLowerCase().includes('make') && cleanComments.toLowerCase().includes('h3')) {
              markdown += `**Give pointers and make them H3:**\n\n`;
            } else {
              markdown += `- ${cleanComments}\n`;
            }
          }
          markdown += `\n`;
        } else if (tag === 'H3') {
          // H3: Subsections (nested under H2)
          markdown += `#### H3: ${cleanStructure}\n\n`;
          if (cleanComments && cleanComments !== '—' && cleanComments !== '�') {
            markdown += `- ${cleanComments}\n`;
          }
          markdown += `\n`;
        } else if (tag === '—' || tag === '�' || !tag) {
          // Content instruction (not a header)
          if (cleanStructure.toLowerCase().includes('write introductory')) {
            markdown += `**Introductory Content:**\n`;
            if (cleanComments) {
              markdown += `- ${cleanComments}\n`;
            }
            markdown += `- Brief overview\n`;
            markdown += `- Why it matters for Indian investors\n`;
            markdown += `- Context and relevance\n\n`;
          } else {
            markdown += `- ${cleanStructure}\n`;
            if (cleanComments && !cleanComments.includes('—') && !cleanComments.includes('�')) {
              markdown += `  - ${cleanComments}\n`;
            }
          }
        }
      });

      // Add content guidelines at the end
      markdown += `## Content Guidelines\n\n`;
      markdown += `- Focus on Indian market context (NSE, BSE, Nifty, Sensex)\n`;
      markdown += `- Include practical examples with Indian instruments\n`;
      markdown += `- Use natural language (avoid keyword stuffing)\n`;
      markdown += `- Provide actionable insights for investors\n`;
      markdown += `- Add SEBI/RBI compliance disclaimer where applicable\n`;
      markdown += `- Include current market dynamics (Nov 2025)\n`;
      markdown += `- Mention PL Capital account opening where relevant\n`;
      markdown += `- Keep tone professional yet accessible\n`;

      fs.writeFileSync(filename, markdown, 'utf-8');
      console.log(`✅ Saved: ${slug}.md (${outlineItems.length} items)`);
      topicCount++;
    }
  }

  // Process each row
  dataRows.forEach((row) => {
    const srNo = row[1]?.trim();
    const topicName = row[2]?.trim();
    const contentStructure = row[12]?.trim();
    const headerTag = row[13]?.trim();
    const comments = row[14]?.trim();

    // New topic detected
    if (srNo && srNo !== '') {
      // Save previous topic
      saveOutline();

      // Start new topic
      currentSrNo = srNo;
      currentTopic = topicName;
      outlineItems = [];
      currentH2Section = null;
    }

    // Add outline item if content structure exists
    if (contentStructure && contentStructure !== '') {
      outlineItems.push({
        structure: contentStructure,
        tag: headerTag || '—',
        comments: comments || '',
      });
    }
  });

  // Save last topic
  saveOutline();

  console.log(`\n✅ Extraction Complete!`);
  console.log(`📁 Extracted ${topicCount} topic outlines`);
  console.log(`📂 Saved to: ${OUTLINE_DIR}`);
}

// Run extraction
try {
  extractOutlines();
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
