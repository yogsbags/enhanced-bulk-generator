#!/usr/bin/env node

/**
 * Keyword Counter - Verifies exact keyword mentions in generated articles
 * Usage: node scripts/count-keywords.js <markdown-file> <keyword>
 * Example: node scripts/count-keywords.js "docs/articles/technical analysis/what-is-technical-analysis.md" "technical analysis"
 */

const fs = require('fs');
const path = require('path');

// Get arguments
const args = process.argv.slice(2);
if (args.length < 2) {
  console.error('Usage: node count-keywords.js <markdown-file> <keyword>');
  console.error('Example: node count-keywords.js "article.md" "technical analysis"');
  process.exit(1);
}

const filePath = args[0];
const keyword = args[1].toLowerCase();

// Read file
if (!fs.existsSync(filePath)) {
  console.error(`❌ File not found: ${filePath}`);
  process.exit(1);
}

const content = fs.readFileSync(filePath, 'utf-8');

// Split into sections for detailed analysis
const sections = {
  title: '',
  researchVerification: '',
  summary: '',
  introduction: '',
  mainContent: '',
  conclusion: '',
  faqs: '',
  seoMetadata: ''
};

// Extract sections using markers
const lines = content.split('\n');
let currentSection = 'title';
let inResearchVerification = false;
let inSeoMetadata = false;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];

  // Detect section boundaries
  if (line.startsWith('# ') && i === 0) {
    sections.title = line;
    continue;
  }

  if (line.includes('RESEARCH VERIFICATION') || line.includes('### RESEARCH VERIFICATION')) {
    inResearchVerification = true;
    currentSection = 'researchVerification';
    continue;
  }

  if (inResearchVerification && line.trim() === '---') {
    inResearchVerification = false;
    continue;
  }

  if (line.startsWith('## Summary')) {
    currentSection = 'summary';
    continue;
  }

  if (line.startsWith('## Introduction') || (currentSection === 'summary' && line.startsWith('## ') && !line.includes('Summary'))) {
    currentSection = 'introduction';
  }

  if (line.startsWith('## Conclusion')) {
    currentSection = 'conclusion';
    continue;
  }

  if (line.startsWith('## FAQs') || line.includes('## FAQs on')) {
    currentSection = 'faqs';
    continue;
  }

  if (line.startsWith('## SEO Metadata') || line.includes('### SEO Meta')) {
    inSeoMetadata = true;
    currentSection = 'seoMetadata';
    continue;
  }

  // Assign to main content if not in special sections
  if (currentSection === 'introduction' && line.startsWith('## ') && !line.includes('Introduction')) {
    currentSection = 'mainContent';
  }

  // Add line to current section
  if (inResearchVerification) {
    sections.researchVerification += line + '\n';
  } else if (inSeoMetadata) {
    sections.seoMetadata += line + '\n';
  } else {
    sections[currentSection] += line + '\n';
  }
}

// Count exact keyword matches (case-insensitive)
function countKeywordInText(text, keyword) {
  const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
  const matches = text.match(regex);
  return matches ? matches.length : 0;
}

// Count in each section
const counts = {
  title: countKeywordInText(sections.title, keyword),
  researchVerification: countKeywordInText(sections.researchVerification, keyword),
  summary: countKeywordInText(sections.summary, keyword),
  introduction: countKeywordInText(sections.introduction, keyword),
  mainContent: countKeywordInText(sections.mainContent, keyword),
  conclusion: countKeywordInText(sections.conclusion, keyword),
  faqs: countKeywordInText(sections.faqs, keyword),
  seoMetadata: countKeywordInText(sections.seoMetadata, keyword)
};

// Calculate totals
const totalAll = Object.values(counts).reduce((sum, count) => sum + count, 0);
const totalCountable = counts.summary + counts.introduction + counts.mainContent + counts.conclusion + counts.faqs;
const totalExcluded = counts.title + counts.researchVerification + counts.seoMetadata;

// Display results
console.log('\n' + '='.repeat(70));
console.log('🔍 KEYWORD ANALYSIS REPORT');
console.log('='.repeat(70));
console.log(`📄 File: ${path.basename(filePath)}`);
console.log(`🔑 Keyword: "${keyword}"`);
console.log('='.repeat(70));

console.log('\n📊 SECTION BREAKDOWN:');
console.log(`   Title (H1):              ${counts.title.toString().padStart(3)} mentions ${counts.title > 0 ? '(EXCLUDED from target count)' : ''}`);
console.log(`   Research Verification:   ${counts.researchVerification.toString().padStart(3)} mentions (EXCLUDED from target count)`);
console.log(`   Summary:                 ${counts.summary.toString().padStart(3)} mentions`);
console.log(`   Introduction:            ${counts.introduction.toString().padStart(3)} mentions`);
console.log(`   Main Content (H2/H3):    ${counts.mainContent.toString().padStart(3)} mentions`);
console.log(`   Conclusion:              ${counts.conclusion.toString().padStart(3)} mentions`);
console.log(`   FAQs:                    ${counts.faqs.toString().padStart(3)} mentions`);
console.log(`   SEO Metadata:            ${counts.seoMetadata.toString().padStart(3)} mentions (EXCLUDED from target count)`);

console.log('\n' + '='.repeat(70));
console.log('📈 TOTAL COUNTS:');
console.log(`   Countable Content:       ${totalCountable} mentions`);
console.log(`   Excluded Sections:       ${totalExcluded} mentions`);
console.log(`   Grand Total:             ${totalAll} mentions`);
console.log('='.repeat(70));

// Validation against target (if provided via environment variable or third argument)
const targetMentions = args[2] || process.env.TARGET_KEYWORD_MENTIONS;
if (targetMentions) {
  const targetMatch = targetMentions.match(/(\d+)(?:-(\d+))?/);
  if (targetMatch) {
    const lowerBound = parseInt(targetMatch[1]);
    const upperBound = targetMatch[2] ? parseInt(targetMatch[2]) : lowerBound;

    console.log(`\n🎯 TARGET VALIDATION:`);
    console.log(`   Target Range:            ${lowerBound}-${upperBound} mentions`);
    console.log(`   Actual Count:            ${totalCountable} mentions`);

    if (totalCountable >= lowerBound && totalCountable <= upperBound) {
      console.log(`   Status:                  ✅ WITHIN TARGET`);
    } else if (totalCountable < lowerBound) {
      console.log(`   Status:                  ⚠️  BELOW TARGET (short by ${lowerBound - totalCountable})`);
    } else {
      console.log(`   Status:                  ⚠️  ABOVE TARGET (excess: ${totalCountable - upperBound})`);
    }
    console.log('='.repeat(70));
  }
}

console.log('\n✅ Analysis complete!\n');

// Exit code: 0 if within target, 1 if out of range
if (targetMentions) {
  const targetMatch = targetMentions.match(/(\d+)(?:-(\d+))?/);
  if (targetMatch) {
    const lowerBound = parseInt(targetMatch[1]);
    const upperBound = targetMatch[2] ? parseInt(targetMatch[2]) : lowerBound;

    if (totalCountable < lowerBound || totalCountable > upperBound) {
      process.exit(1);
    }
  }
}

process.exit(0);
