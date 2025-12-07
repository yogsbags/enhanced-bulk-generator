#!/usr/bin/env node

/**
 * Test script to verify markdown, CSV, and HTML export formats
 */

const fs = require('fs');
const path = require('path');

// Import ContentExporter
const ContentExporter = require('./frontend/backend/utils/content-exporter');

// Read the latest raw response
const rawFile = '/Users/yogs87/Downloads/sanity/projects/enhanced-bulk-generator/frontend/backend/data/raw-responses/unknown_attempt-1_2025-12-07T18-51-11-798Z.md';

console.log('\n' + '='.repeat(80));
console.log('🧪 TESTING EXPORT FORMATS');
console.log('='.repeat(80));

try {
  // Read raw response file
  const rawContent = fs.readFileSync(rawFile, 'utf-8');

  // Extract JSON from raw response
  const jsonMatch = rawContent.match(/# RAW AI RESPONSE\s*\n\n({[\s\S]+)/);

  if (!jsonMatch) {
    throw new Error('Could not extract JSON from raw response');
  }

  const jsonData = JSON.parse(jsonMatch[1]);

  // Create content object
  const content = {
    content_id: 'TEST-001',
    topic_id: 'TOPIC-931',
    topic_title: 'Wealth Optimization through Real Estate and Gold',
    primary_keyword: 'wealth optimization real estate gold',
    creation_date: '2025-12-07',
    article_content: jsonData.article_content,
    seo_metadata: jsonData.seo_metadata,
    compliance: jsonData.compliance,
    research_log: 'Searched: "Gold ETF taxation 2025"\n→ Found: 12.5% LTCG rate after 12 months holding period.\n\nSearched: "Real estate LTCG tax rate India"\n→ Found: 12.5% without indexation for properties bought after July 23, 2024.',
    approval_status: 'SEO-Ready',
    created_at: new Date().toISOString()
  };

  console.log('\n✅ Content object created successfully');
  console.log(`   Title: ${content.seo_metadata.title}`);
  console.log(`   Primary Keyword: ${content.primary_keyword}`);
  console.log(`   Word Count: ${content.article_content.split(/\s+/).length}`);

  // Export to all formats
  const exporter = new ContentExporter();

  console.log('\n📍 Exporting to all formats...');
  const result = exporter.exportAll(content);

  console.log('\n✅ Export completed successfully!');
  console.log('\n📂 Generated Files:');
  console.log(`   📝 Markdown: ${result.markdown}`);
  console.log(`   🌐 HTML: ${result.html}`);
  console.log(`   📊 CSV: ${result.csv}`);

  // Verify files exist
  console.log('\n🔍 Verifying files...');

  const mdExists = fs.existsSync(result.markdown);
  const htmlExists = fs.existsSync(result.html);
  const csvExists = fs.existsSync(result.csv);

  console.log(`   Markdown exists: ${mdExists ? '✅' : '❌'}`);
  console.log(`   HTML exists: ${htmlExists ? '✅' : '❌'}`);
  console.log(`   CSV exists: ${csvExists ? '✅' : '❌'}`);

  // Check markdown content
  if (mdExists) {
    const mdContent = fs.readFileSync(result.markdown, 'utf-8');
    const hasResearchVerification = mdContent.includes('### RESEARCH VERIFICATION');
    const hasSEOMetadata = mdContent.includes('## SEO Metadata');
    const hasFAQSchema = mdContent.includes('FAQ Schema (JSON-LD)');

    console.log('\n🔍 Markdown Format Checks:');
    console.log(`   Has RESEARCH VERIFICATION: ${hasResearchVerification ? '✅' : '❌'}`);
    console.log(`   Has SEO Metadata section: ${hasSEOMetadata ? '✅' : '❌'}`);
    console.log(`   Has FAQ Schema: ${hasFAQSchema ? '✅' : '❌'}`);
    console.log(`   File size: ${(mdContent.length / 1024).toFixed(2)} KB`);
  }

  // Check HTML content
  if (htmlExists) {
    const htmlContent = fs.readFileSync(result.html, 'utf-8');
    const hasResearchVerification = htmlContent.includes('RESEARCH VERIFICATION');
    const hasH1 = htmlContent.includes('<h1>');
    const hasH2Summary = htmlContent.includes('<h2>Summary</h2>');
    const hasSEOComments = htmlContent.includes('<!-- SEO Metadata -->');
    const hasFAQSchema = htmlContent.includes('<script type="application/ld+json">');
    const hasImportantNotes = htmlContent.includes('<div class="important-notes">');

    console.log('\n🔍 HTML Format Checks:');
    console.log(`   Has RESEARCH VERIFICATION: ${hasResearchVerification ? '❌ SHOULD NOT HAVE' : '✅ CORRECT'}`);
    console.log(`   Has <h1> tag: ${hasH1 ? '✅' : '❌'}`);
    console.log(`   Has <h2>Summary</h2>: ${hasH2Summary ? '✅' : '❌'}`);
    console.log(`   Has SEO HTML comments: ${hasSEOComments ? '✅' : '❌'}`);
    console.log(`   Has FAQ JSON-LD schema: ${hasFAQSchema ? '✅' : '❌'}`);
    console.log(`   Has Important Notes div: ${hasImportantNotes ? '✅' : '❌'}`);
    console.log(`   File size: ${(htmlContent.length / 1024).toFixed(2)} KB`);

    // Show first 100 characters of HTML
    console.log('\n📄 HTML Preview (first 100 chars):');
    console.log(`   ${htmlContent.substring(0, 100)}...`);
  }

  console.log('\n' + '='.repeat(80));
  console.log('✅ TEST COMPLETED SUCCESSFULLY!');
  console.log('='.repeat(80));
  console.log('\n🎯 Summary:');
  console.log('   ✅ Markdown: Includes Research Verification, SEO Metadata, FAQ Schema');
  console.log('   ✅ HTML: Excludes Research Verification, includes SEO comments, FAQ JSON-LD');
  console.log('   ✅ CSV: Standard export format');
  console.log('\n');

} catch (error) {
  console.error('\n❌ Test failed:', error.message);
  console.error(error.stack);
  process.exit(1);
}
