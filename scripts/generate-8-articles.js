#!/usr/bin/env node

/**
 * Generate 8 New Articles on Different Topics
 * Uses improved format starting with Executive Summary
 */

require('dotenv').config();
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parse/sync');
const { stringify } = require('csv-stringify/sync');

// 8 diverse topics for Indian investors
const topics = [
  {
    id: 'NEW-001',
    title: 'Sovereign Gold Bonds vs Physical Gold: Complete Investment Guide 2025',
    keywords: ['sovereign gold bonds', 'physical gold investment', 'gold bonds interest rate', 'gold investment india', 'sgb vs gold']
  },
  {
    id: 'NEW-002',
    title: 'NIFTY 50 vs SENSEX: Which Index Should You Track in 2025?',
    keywords: ['nifty 50', 'sensex', 'stock market indices', 'index comparison', 'nifty vs sensex']
  },
  {
    id: 'NEW-003',
    title: 'PPF vs NPS: Best Long-Term Investment for Retirement in 2025',
    keywords: ['ppf', 'nps', 'retirement planning', 'tax saving retirement', 'ppf vs nps']
  },
  {
    id: 'NEW-004',
    title: 'Credit Card vs Debit Card: Smart Usage Guide for Indian Consumers 2025',
    keywords: ['credit card benefits', 'debit card vs credit card', 'credit score', 'card rewards', 'cashback cards']
  },
  {
    id: 'NEW-005',
    title: 'Fixed Deposit vs Recurring Deposit: Which Suits Your Savings Goals?',
    keywords: ['fixed deposit', 'recurring deposit', 'fd vs rd', 'bank deposits india', 'deposit schemes']
  },
  {
    id: 'NEW-006',
    title: 'Term Insurance vs Endowment Plan: Choosing the Right Life Insurance 2025',
    keywords: ['term insurance', 'endowment plan', 'life insurance india', 'insurance comparison', 'term vs endowment']
  },
  {
    id: 'NEW-007',
    title: 'Direct Stock Investment vs Index Funds: Best Strategy for Beginners 2025',
    keywords: ['direct stocks', 'index funds', 'stock market investing', 'beginner investing', 'stocks vs index funds']
  },
  {
    id: 'NEW-008',
    title: 'UPI vs Credit Card: Best Payment Method for Daily Transactions 2025',
    keywords: ['upi payments', 'credit card payments', 'digital payments india', 'upi vs credit card', 'payment methods']
  }
];

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
          content: 'You are a professional financial content writer specializing in Indian investment markets. You create comprehensive, E-E-A-T compliant articles with proper structure, expert insights, and actionable advice. You ALWAYS start articles with "## Executive Summary" - NO text before this heading.'
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

function generatePrompt(topic) {
  return `Create a comprehensive comparison article for Indian investors.

**TITLE**: ${topic.title}

**TARGET KEYWORDS**: ${topic.keywords.join(', ')}

**CRITICAL FORMAT REQUIREMENTS**:

1. **START IMMEDIATELY WITH**: \`## Executive Summary\`
   - NO introductory paragraphs, hooks, or definitions before this heading
   - The article MUST begin with "## Executive Summary"

2. **Executive Summary** (3-4 crisp sentences):
   - Context: Why this comparison matters in 2025
   - Opportunity: What readers can achieve
   - Takeaway: Key insight or action
   - Use "you/your" tone

3. **Immediately After**: \`### Key Numbers At a Glance\`
   Create a comparison table (5-6 rows):
   | Metric | Option 1 | Option 2 | Why it Matters |
   |--------|----------|----------|----------------|

4. **Then**: \`### Key Takeaways\`
   - 5-7 bullet points with action verbs
   - Specific and actionable
   - Include numbers where possible

5. **Main Content Structure**:
   - ## What is [Option 1] in India?
     - ### The Concept Behind [Option 1]
     - ### Regulation and Safety
     - ### Key Features
   - ## What is [Option 2] in India?
     - ### The Concept Behind [Option 2]
     - ### Regulation and Safety
     - ### Key Features
   - ## [Option 1] vs [Option 2]: Detailed Comparison
     (Detailed comparison table)
   - ## Benefits of [Option 1]
   - ## Benefits of [Option 2]
   - ## When to Choose [Option 1]
   - ## When to Choose [Option 2]
   - ## Tax Implications in 2025
   - ## How to Get Started
   - ## Common Mistakes to Avoid
   - ## FAQ
   - ## Conclusion

**Content Requirements**:
- Minimum 1800 words
- Expert quotes (realistic names: Nithin Kamath, Zerodha CEO; Radhika Gupta, Edelweiss AMC CEO, etc.)
- Statistical data and research
- Multiple comparison tables
- SEBI/RBI compliance mentions
- Internal linking suggestions
- Real-world examples

**IMPORTANT**: Start DIRECTLY with "## Executive Summary". No text before it.`;
}

async function generateArticles() {
  console.log('\n📚 GENERATING 8 NEW ARTICLES');
  console.log('='.repeat(60));

  if (!process.env.GROQ_API_KEY) {
    console.error('❌ GROQ_API_KEY not set');
    process.exit(1);
  }

  const results = [];

  for (let i = 0; i < topics.length; i++) {
    const topic = topics[i];
    console.log(`\n[${i + 1}/8] Generating: ${topic.title}`);
    console.log('   Keywords:', topic.keywords.join(', '));

    try {
      const prompt = generatePrompt(topic);
      const content = await callGroqAPI(prompt);

      // Validate format
      const firstLine = content.split('\n').find(l => l.trim());
      const startsCorrectly = /^##\s+Executive\s+Summary/i.test(firstLine);
      const wordCount = content.split(/\s+/).length;

      console.log(`   ✅ Generated: ${wordCount} words`);
      console.log(`   Format check: ${startsCorrectly ? '✅ Correct' : '⚠️  Needs review'}`);

      results.push({
        content_id: topic.id,
        topic_id: topic.id,
        title: topic.title,
        article_content: content,
        word_count: wordCount,
        quality_score: wordCount >= 1800 ? 90 : 85,
        created_at: new Date().toISOString(),
        approval_status: 'SEO-Ready',
        seo_metadata: JSON.stringify({
          title: topic.title,
          focus_keyphrase: topic.keywords[0],
          secondary_keywords: topic.keywords.slice(1),
          slug: topic.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
          meta_description: `Compare ${topic.keywords[0]} vs ${topic.keywords[1]}. Expert analysis, key differences, and which option suits your financial goals in 2025.`
        })
      });

      // Rate limiting
      if (i < topics.length - 1) {
        console.log('   ⏳ Waiting 3 seconds before next generation...');
        await new Promise(resolve => setTimeout(resolve, 3000));
      }

    } catch (error) {
      console.error(`   ❌ Failed: ${error.message}`);
      results.push({
        content_id: topic.id,
        title: topic.title,
        error: error.message
      });
    }
  }

  // Load existing CSV
  const csvPath = path.join(__dirname, '../data/created-content.csv');
  let existingRecords = [];

  if (fs.existsSync(csvPath)) {
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    existingRecords = csv.parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      relax_quotes: true,
      quote: '"',
      escape: '"'
    });
  }

  // Add new records
  const successfulResults = results.filter(r => !r.error);
  const allRecords = [...existingRecords, ...successfulResults];

  // Save updated CSV
  const csvOutput = stringify(allRecords, {
    header: true,
    quoted: true,
    quoted_empty: true
  });

  fs.writeFileSync(csvPath, csvOutput, 'utf-8');

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 GENERATION SUMMARY:');
  console.log(`   ✅ Successfully generated: ${successfulResults.length}/8`);
  console.log(`   ❌ Failed: ${results.filter(r => r.error).length}/8`);
  console.log(`   📄 Total articles in CSV: ${allRecords.length}`);
  console.log('='.repeat(60));

  if (successfulResults.length > 0) {
    console.log('\n📝 Generated Articles:');
    successfulResults.forEach((r, i) => {
      console.log(`   ${i + 1}. ${r.title} (${r.word_count} words)`);
    });

    console.log('\n📋 Next Steps:');
    console.log('   1. Review articles in created-content.csv');
    console.log('   2. Publish to Google Docs:');
    console.log('      node scripts/publish-to-google-docs.js --skip-existing');
  }

  console.log('');
}

generateArticles().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
