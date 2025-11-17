#!/usr/bin/env node

/**
 * Direct Article Regeneration for CONTENT-009
 * Uses Groq API directly via fetch
 */

require('dotenv').config();
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parse/sync');
const { stringify } = require('csv-stringify/sync');

async function callGroqAPI(prompt) {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'You are a professional financial content writer specializing in Indian investment markets. You create comprehensive, E-E-A-T compliant articles with proper structure, expert insights, and actionable advice.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 8000,
      top_p: 0.9
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Groq API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

async function regenerateArticle() {
  console.log('\n🔧 REGENERATING CONTENT-009: Intraday Trading Strategies');
  console.log('='.repeat(60));

  if (!process.env.GROQ_API_KEY) {
    console.error('❌ GROQ_API_KEY not set');
    process.exit(1);
  }

  // Article specifications
  const specs = {
    title: 'Intraday Trading Strategies 2025: A Complete Guide for Indian Investors',
    keywords: [
      'intraday trading strategies',
      'intraday trading plan',
      'risk management for day trading',
      'sebi intraday margin 2025',
      'day trading in india'
    ],
    wordCount: 2000
  };

  console.log('\n📋 Article Specifications:');
  console.log(`   Title: ${specs.title}`);
  console.log(`   Keywords: ${specs.keywords.join(', ')}`);
  console.log(`   Target Word Count: ${specs.wordCount}`);

  // Content generation prompt
  const prompt = `Create a comprehensive article on intraday trading strategies for Indian investors.

**TITLE**: ${specs.title}

**TARGET KEYWORDS**: ${specs.keywords.join(', ')}

**REQUIREMENTS**:

1. **Structure** (Use markdown formatting):
   - ## Executive Summary (Key takeaways in bullet points)
   - ## Introduction
   - ## Understanding Intraday Trading
   - ## Top Intraday Trading Strategies
     - ### Strategy 1: Momentum Trading
     - ### Strategy 2: Scalping
     - ### Strategy 3: Breakout Trading
     - ### Strategy 4: Range Trading
     - ### Strategy 5: News-Based Trading
   - ## Technical Indicators for Intraday Trading
     - ### Moving Averages
     - ### RSI (Relative Strength Index)
     - ### MACD
     - ### Bollinger Bands
   - ## Risk Management Techniques
     - ### Stop-Loss Orders
     - ### Position Sizing
     - ### Maximum Daily Loss Limit
   - ## SEBI Margin Requirements 2025
   - ## Platform Comparison
   - ## Real-World Examples
   - ## Common Mistakes to Avoid
   - ## Step-by-Step Action Plan
   - ## FAQ
   - ## Conclusion

2. **Content Requirements**:
   - Minimum 2000 words
   - Include realistic expert quotes (e.g., "According to Nithin Kamath, CEO of Zerodha...")
   - Add statistical data and research citations
   - Provide real-world examples and case studies
   - Include tables for strategy comparison and platform comparison
   - Add SEBI/RBI compliance disclaimers

3. **Tables** (Use markdown table format):
   - Strategy comparison table (Strategy | Risk Level | Time Frame | Best For)
   - Platform comparison table (Platform | Brokerage | Margin | Features)
   - Cost comparison table

4. **E-E-A-T Elements**:
   - Expert quotes from industry professionals
   - Statistical data and market research
   - Practical, actionable advice
   - Risk warnings and disclaimers

5. **SEO Optimization**:
   - Natural keyword integration throughout
   - Internal linking suggestions: [Learn more about F&O trading](/futures-options-trading)
   - Clear, descriptive subheadings
   - Meta-focused conclusion

6. **Formatting**:
   - Use **bold** for key terms
   - Use bullet points for lists
   - Use > for important callouts
   - Use \`code\` for formulas

**IMPORTANT**: Generate the COMPLETE article now. Do NOT use placeholders. Include all sections with detailed content.`;

  console.log('\n🤖 Generating content with Groq API (llama-3.3-70b-versatile)...');
  console.log('   This may take 30-90 seconds...\n');

  try {
    const content = await callGroqAPI(prompt);

    console.log('✅ Content generated successfully!');

    // Calculate metrics
    const wordCount = content.split(/\s+/).length;
    const charCount = content.length;
    const headingCount = (content.match(/^##/gm) || []).length;
    const tableCount = (content.match(/\|.*\|/g) || []).length / 3; // Rough estimate

    console.log(`   Word count: ${wordCount}`);
    console.log(`   Character count: ${charCount}`);
    console.log(`   Headings (H2): ${headingCount}`);
    console.log(`   Tables detected: ~${Math.floor(tableCount)}`);

    // Load and update CSV
    const csvPath = path.join(__dirname, '../data/created-content.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const records = csv.parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      relax_quotes: true,
      quote: '"',
      escape: '"'
    });

    const recordIndex = records.findIndex(r => r.content_id === 'CONTENT-009');
    if (recordIndex === -1) {
      console.error('❌ CONTENT-009 not found in CSV');
      process.exit(1);
    }

    // Update record
    records[recordIndex].article_content = content;
    records[recordIndex].word_count = wordCount.toString();
    records[recordIndex].quality_score = wordCount >= 2000 ? '95' : '85';
    records[recordIndex].created_at = new Date().toISOString();
    records[recordIndex].approval_status = 'SEO-Ready';

    // Save CSV
    const csvOutput = stringify(records, {
      header: true,
      quoted: true,
      quoted_empty: true
    });

    fs.writeFileSync(csvPath, csvOutput, 'utf-8');
    console.log('\n✅ Updated created-content.csv');

    // Preview
    console.log('\n📊 Article Preview (first 1000 chars):');
    console.log('-'.repeat(60));
    console.log(content.substring(0, 1000));
    console.log('-'.repeat(60));

    console.log('\n✅ CONTENT-009 regenerated successfully!');
    console.log('\n📝 Next Steps:');
    console.log('   1. Review the article in created-content.csv');
    console.log('   2. Republish to Google Docs:');
    console.log('      node scripts/publish-to-google-docs.js --force --limit 1\n');

  } catch (error) {
    console.error('\n❌ Error generating content:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

// Run
regenerateArticle().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
