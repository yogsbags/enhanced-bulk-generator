#!/usr/bin/env node

/**
 * Test New Executive Summary Format
 * Generates a single test article to verify the changes
 */

require('dotenv').config();
const fetch = require('node-fetch');

async function testNewFormat() {
  console.log('\n🧪 TESTING NEW ARTICLE FORMAT');
  console.log('='.repeat(60));

  if (!process.env.GROQ_API_KEY) {
    console.error('❌ GROQ_API_KEY not set');
    process.exit(1);
  }

  const testTopic = {
    title: 'ELSS Funds vs Tax Saving FD: Which is Better for You in 2025?',
    keywords: ['elss funds', 'tax saving fd', 'section 80c', 'tax saving options', 'equity linked savings scheme']
  };

  console.log(`\n📋 Test Article: ${testTopic.title}`);
  console.log(`   Keywords: ${testTopic.keywords.join(', ')}\n`);

  const prompt = `Create a comprehensive article on tax saving options for Indian investors.

**TITLE**: ${testTopic.title}

**TARGET KEYWORDS**: ${testTopic.keywords.join(', ')}

**CRITICAL FORMAT REQUIREMENTS**:

1. **START IMMEDIATELY WITH**: \`## Executive Summary\`
   - NO introductory paragraphs before this heading
   - NO hook, definition, or context paragraphs
   - The article MUST begin with the H2 heading "## Executive Summary"

2. **Executive Summary Content** (3-4 sentences):
   - Sentence 1: Context and why this matters in 2025
   - Sentence 2: What readers can achieve/benefit
   - Sentence 3: What this guide covers
   - Sentence 4 (optional): Call to action or key insight
   - Use "you/your" tone throughout

3. **Immediately After Executive Summary**:
   \`### Key Numbers At a Glance\`

   Create a table with 4-6 rows:
   | Metric | Value | Why it Matters |
   |--------|-------|----------------|
   | ... | ... | ... |

4. **Then**: \`### Key Takeaways\`
   - 5-7 bullet points
   - Start with action verbs ("You can", "Consider", "Avoid", etc.)
   - Be specific and actionable
   - Example: "You can save up to ₹46,800 in taxes annually by investing ₹1.5 lakh in ELSS funds"

5. **Main Content Structure**:
   - ## What are ELSS Funds and Tax Saving FDs?
     - ### The Concept Behind ELSS Funds
     - ### The Concept Behind Tax Saving FDs
     - ### ELSS vs Tax Saving FD: Key Differences (comparison table)
   - ## How Do ELSS Funds Work in India 2025?
   - ## Tax Benefits of ELSS Funds vs FD in 2025
   - ## Risk Comparison: ELSS Funds vs Tax Saving FD
   - ## Returns Analysis: Historical Performance
   - ## Which Option is Right for You?
   - ## Step-by-Step: How to Invest in ELSS Funds
   - ## Common Mistakes to Avoid
   - ## FAQ
   - ## Conclusion

**IMPORTANT**: Generate the COMPLETE article starting DIRECTLY with "## Executive Summary". No text before this heading.

Word count: 1800-2000 words
Include: Expert quotes, comparison tables, specific numbers, SEBI/RBI compliance mentions`;

  console.log('🤖 Generating test article with Groq API...\n');

  try {
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
            content: 'You are a professional financial content writer. You follow format requirements EXACTLY as specified.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 8000
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    // Analyze format
    const lines = content.split('\n');
    const firstNonEmpty = lines.find(l => l.trim());
    const startsWithExecSummary = /^##\s+Executive\s+Summary/i.test(firstNonEmpty);
    const wordCount = content.split(/\s+/).length;
    const hasKeyNumbers = /###\s+Key\s+Numbers/i.test(content);
    const hasKeyTakeaways = /###\s+Key\s+Takeaways/i.test(content);
    const tableCount = (content.match(/\|.*\|/g) || []).length / 3;

    console.log('✅ Article generated!\n');
    console.log('📊 FORMAT VALIDATION:');
    console.log(`   ✓ Starts with "## Executive Summary": ${startsWithExecSummary ? '✅ YES' : '❌ NO'}`);
    console.log(`   ✓ Has "### Key Numbers At a Glance": ${hasKeyNumbers ? '✅ YES' : '❌ NO'}`);
    console.log(`   ✓ Has "### Key Takeaways": ${hasKeyTakeaways ? '✅ YES' : '❌ NO'}`);
    console.log(`   ✓ Word count: ${wordCount} (target: 1800-2000)`);
    console.log(`   ✓ Tables detected: ~${Math.floor(tableCount)}\n`);

    console.log('📝 FIRST 1000 CHARACTERS:');
    console.log('-'.repeat(60));
    console.log(content.substring(0, 1000));
    console.log('-'.repeat(60));

    if (!startsWithExecSummary) {
      console.log('\n⚠️  WARNING: Article does NOT start with "## Executive Summary"');
      console.log('   First line:', firstNonEmpty);
    } else {
      console.log('\n✅ FORMAT TEST PASSED!');
    }

    console.log('\n💾 Full article saved to: test-article-output.txt\n');
    require('fs').writeFileSync('test-article-output.txt', content, 'utf-8');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

testNewFormat().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
