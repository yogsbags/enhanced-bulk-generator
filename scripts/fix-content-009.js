#!/usr/bin/env node

/**
 * Fix CONTENT-009: Regenerate missing article content
 * Uses content-creator to generate comprehensive intraday trading article
 */

require('dotenv').config();
const ContentCreator = require('../content/content-creator');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parse/sync');
const { stringify } = require('csv-stringify/sync');

async function fixContent009() {
  console.log('\n🔧 FIXING CONTENT-009: Intraday Trading Strategies');
  console.log('='.repeat(60));

  // Load current CSV
  const csvPath = path.join(__dirname, '../data/created-content.csv');
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const records = csv.parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    relax_quotes: true,
    quote: '"',
    escape: '"'
  });

  const content009 = records.find(r => r.content_id === 'CONTENT-009');
  if (!content009) {
    console.error('❌ CONTENT-009 not found in CSV');
    process.exit(1);
  }

  console.log('\n📋 Current Status:');
  console.log(`   Content ID: ${content009.content_id}`);
  console.log(`   Topic ID: ${content009.topic_id}`);
  console.log(`   Article Content: ${content009.article_content ? content009.article_content.length + ' chars' : 'EMPTY'}`);

  // Parse SEO metadata to get title and keywords
  const seoMetadata = JSON.parse(content009.seo_metadata || '{}');
  const title = seoMetadata.title || 'Intraday Trading Strategies 2025: A Complete Guide for Indian Investors';
  const keywords = [
    seoMetadata.focus_keyphrase,
    ...(seoMetadata.secondary_keywords || [])
  ].filter(Boolean);

  console.log(`   Title: ${title}`);
  console.log(`   Keywords: ${keywords.join(', ')}`);

  // Create mock research data for content generation
  const mockResearch = {
    topic_id: content009.topic_id || 'TOPIC-018',
    topic_title: title,
    target_keywords: keywords.join(', '),
    content_type: 'Ultimate Guide',
    word_count_target: 2000,
    search_intent: 'Informational + Transactional',
    competitor_analysis: JSON.stringify({
      top_competitors: [
        { url: 'zerodha.com', content_gaps: ['Technical indicators', 'Risk management'] },
        { url: 'groww.in', content_gaps: ['Real-time examples', 'Platform comparison'] },
        { url: 'angelone.in', content_gaps: ['Margin requirements', 'Trading costs'] }
      ],
      content_gaps: [
        'Comprehensive intraday trading strategies',
        'SEBI margin rules 2025',
        'Risk management techniques',
        'Technical indicator combinations',
        'Real-world examples and case studies'
      ],
      superiority_plan: 'Create most comprehensive guide covering all major strategies, technical analysis, risk management, and platform comparison'
    }),
    research_status: 'Complete'
  };

  console.log('\n🤖 Generating article content...');
  console.log('   Using AI model: groq/compound');

  // Initialize content creator
  const config = {
    groqApiKey: process.env.GROQ_API_KEY,
    openaiApiKey: process.env.OPENAI_API_KEY,
    models: {
      primary: 'groq/compound',
      fallback: 'openai/gpt-oss-20b'
    }
  };

  const creator = new ContentCreator(config);

  try {
    // Generate content
    const result = await creator.createContent(mockResearch);

    if (!result.success) {
      console.error('❌ Content generation failed:', result.error);
      process.exit(1);
    }

    console.log('\n✅ Content generated successfully!');
    console.log(`   Word count: ${result.word_count}`);
    console.log(`   Quality score: ${result.quality_score}/100`);

    // Update CSV record
    content009.article_content = result.content;
    content009.word_count = result.word_count.toString();
    content009.quality_score = result.quality_score.toString();
    content009.created_at = new Date().toISOString();
    content009.approval_status = 'SEO-Ready'; // Mark as ready for publication

    // Save updated CSV
    const csvOutput = stringify(records, {
      header: true,
      quoted: true,
      quoted_empty: true
    });

    fs.writeFileSync(csvPath, csvOutput, 'utf-8');
    console.log('\n✅ Updated created-content.csv');

    console.log('\n📊 Article Preview (first 500 chars):');
    console.log('-'.repeat(60));
    console.log(result.content.substring(0, 500) + '...');
    console.log('-'.repeat(60));

    console.log('\n✅ CONTENT-009 fixed successfully!');
    console.log('   Next step: Run republish script to update Google Docs');
    console.log('   Command: node scripts/publish-to-google-docs.js --limit 1');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  fixContent009().catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
}

module.exports = fixContent009;
