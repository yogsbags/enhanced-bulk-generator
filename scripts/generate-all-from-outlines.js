#!/usr/bin/env node

/**
 * Generate Articles from All Outline Files
 * Reads all outline files and generates articles using the batch generator
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const OUTLINE_DIR = path.join(__dirname, '../outlines');
const SCRIPT_PATH = path.join(__dirname, 'batch-technical-analysis-generator.js');

// Get API key from environment (check Groq first, then Gemini as fallback)
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GROQ_API_KEY && !GEMINI_API_KEY) {
  console.error('❌ Neither GROQ_API_KEY nor GEMINI_API_KEY environment variable is set');
  console.error('   Please set one with: export GROQ_API_KEY="your-api-key"');
  console.error('   Or: export GEMINI_API_KEY="your-api-key"');
  process.exit(1);
}

const API_KEY_TYPE = GROQ_API_KEY ? 'GROQ' : 'GEMINI';
const API_KEY = GROQ_API_KEY || GEMINI_API_KEY;
console.log(`\n🔑 Using ${API_KEY_TYPE} API for content generation`);

function extractTopicFromOutline(outlineContent) {
  // First line should be the topic name (e.g., "# ETF vs Index Fund")
  const firstLine = outlineContent.split('\n')[0];
  return firstLine.replace(/^#\s*/, '').trim();
}

async function generateAllArticles() {
  console.log('\n🚀 BATCH ARTICLE GENERATOR FROM OUTLINES');
  console.log('='.repeat(70));

  // Read all outline files
  const outlineFiles = fs.readdirSync(OUTLINE_DIR).filter(file => file.endsWith('.md'));

  console.log(`📚 Found ${outlineFiles.length} outline files`);
  console.log('='.repeat(70));

  const results = {
    total: outlineFiles.length,
    successful: 0,
    failed: 0,
    errors: []
  };

  // Process each outline file
  for (let i = 0; i < outlineFiles.length; i++) {
    const filename = outlineFiles[i];
    const filepath = path.join(OUTLINE_DIR, filename);

    try {
      console.log(`\n[${'='.repeat(Math.floor(i * 50 / outlineFiles.length))}${' '.repeat(50 - Math.floor(i * 50 / outlineFiles.length))}] ${i + 1}/${outlineFiles.length}`);
      console.log(`\n📝 Processing: ${filename}`);

      // Read outline content
      const outlineContent = fs.readFileSync(filepath, 'utf-8');
      const topic = extractTopicFromOutline(outlineContent);

      console.log(`   📌 Topic: "${topic}"`);
      console.log(`   📋 Outline: ${filepath}`);

      // Build command with available API keys
      let envVars = '';
      if (GROQ_API_KEY) envVars += `export GROQ_API_KEY="${GROQ_API_KEY}" && `;
      if (GEMINI_API_KEY) envVars += `export GEMINI_API_KEY="${GEMINI_API_KEY}" && `;

      const command = `cd "${path.dirname(SCRIPT_PATH)}" && ${envVars}node batch-technical-analysis-generator.js --single "${topic}" --outline-file "${filepath}"`;

      console.log(`   🤖 Generating article with ${API_KEY_TYPE}...`);

      // Execute generator script
      execSync(command, {
        stdio: 'inherit',
        encoding: 'utf-8'
      });

      results.successful++;
      console.log(`   ✅ Successfully generated: ${topic}`);

      // Add small delay to avoid rate limiting
      if (i < outlineFiles.length - 1) {
        console.log(`   ⏸️  Waiting 5 seconds before next article...`);
        await new Promise(resolve => setTimeout(resolve, 5000));
      }

    } catch (error) {
      results.failed++;
      results.errors.push({
        file: filename,
        error: error.message
      });
      console.error(`   ❌ Failed to generate: ${filename}`);
      console.error(`      Error: ${error.message}`);
    }
  }

  // Print final summary
  console.log('\n' + '='.repeat(70));
  console.log('📊 GENERATION SUMMARY');
  console.log('='.repeat(70));
  console.log(`✅ Successfully generated: ${results.successful}/${results.total} articles`);

  if (results.failed > 0) {
    console.log(`❌ Failed: ${results.failed}/${results.total} articles`);
    console.log('\n❌ Failed files:');
    results.errors.forEach(({ file, error }) => {
      console.log(`   - ${file}`);
      console.log(`     Error: ${error}`);
    });
  }

  console.log(`\n📁 Output directory: ${path.join(__dirname, '../docs/articles/technical analysis')}`);
  console.log('='.repeat(70) + '\n');
}

// Run generation
generateAllArticles()
  .then(() => {
    console.log('\n✅ All articles generated successfully!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Batch generation failed:', error);
    process.exit(1);
  });
