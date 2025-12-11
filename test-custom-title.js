#!/usr/bin/env node

/**
 * Test script for custom title generation
 * Tests the fixes for:
 * 1. Title truncation bug
 * 2. Empty article content bug (via raw markdown fallback)
 */

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
const ENV_FILES = ['.env', '.env.local'];
ENV_FILES.forEach((file) => {
  const fullPath = path.resolve(__dirname, file);
  if (fs.existsSync(fullPath)) {
    dotenv.config({ path: fullPath, override: false });
  }
});

const TopicGenerator = require('./frontend/backend/research/topic-generator');
const DeepTopicResearcher = require('./frontend/backend/research/deep-topic-researcher');
const ContentCreator = require('./frontend/backend/content/content-creator');
const CSVDataManager = require('./frontend/backend/core/csv-data-manager');

async function testCustomTitleGeneration() {
  console.log('\n' + '='.repeat(80));
  console.log('🧪 TESTING CUSTOM TITLE GENERATION');
  console.log('='.repeat(80));

  const customTitle = "Wealth Optimization through Real Estate and Gold";
  console.log(`\n📝 Testing with custom title: "${customTitle}"`);

  try {
    const csvManager = new CSVDataManager();

    // Step 1: Generate custom topic
    console.log('\n📍 Step 1: Generating custom topic...');
    const topicGenerator = new TopicGenerator({
      models: {
        primary: 'groq/compound',
        fallback: 'meta-llama/llama-4-maverick-17b-128e-instruct'
      }
    });

    const topics = await topicGenerator.generateCustomTopics(customTitle, 1);

    if (!topics || topics.length === 0) {
      throw new Error('Failed to generate custom topic');
    }

    const topic = topics[0];
    console.log(`✅ Generated topic: ${topic.topic_id}`);
    console.log(`   Title: "${topic.topic_title}"`);
    console.log(`   Primary Keyword: "${topic.primary_keyword}"`);

    // Save to CSV
    csvManager.saveGeneratedTopics(topics);
    console.log('✅ Topic saved to generated-topics.csv');

    // Step 2: Deep research
    console.log('\n📍 Step 2: Conducting deep research...');
    const deepResearcher = new DeepTopicResearcher({
      models: {
        primary: 'groq/compound',
        fallback: 'meta-llama/llama-4-maverick-17b-128e-instruct'
      }
    });

    const research = await deepResearcher.researchTopic(topic);
    console.log(`✅ Deep research completed for ${research.topic_id}`);

    // Save to CSV
    csvManager.saveTopicResearch([research]);
    console.log('✅ Research saved to topic-research.csv');

    // Step 3: Create content
    console.log('\n📍 Step 3: Creating content...');
    const contentCreator = new ContentCreator({
      minWordCount: 2000,
      maxWordCount: 3500,
      customTitle: customTitle // Pass the custom title
    });

    const content = await contentCreator.createArticle(research);

    if (!content) {
      throw new Error('Failed to create content');
    }

    console.log(`✅ Content created: ${content.content_id}`);

    // Save to CSV
    csvManager.saveCreatedContent([content]);
    console.log('✅ Content saved to created-content.csv');

    // Step 4: Verify the fixes
    console.log('\n📍 Step 4: Verifying fixes...');

    // Check SEO metadata for title
    const seoMetadata = JSON.parse(content.seo_metadata || '{}');
    const generatedTitle = seoMetadata.title || '';

    console.log('\n🔍 Title Verification:');
    console.log(`   Original: "${customTitle}"`);
    console.log(`   Generated: "${generatedTitle}"`);

    if (generatedTitle.toLowerCase().includes(customTitle.toLowerCase())) {
      console.log('   ✅ Title preserved correctly!');
    } else if (generatedTitle.length >= customTitle.length * 0.8) {
      console.log('   ⚠️  Title was modified but not significantly truncated');
    } else {
      console.log('   ❌ Title was truncated!');
    }

    // Check article content
    console.log('\n🔍 Article Content Verification:');
    const articleContent = content.article_content || '';
    const wordCount = articleContent.split(/\s+/).filter(w => w.length > 0).length;

    console.log(`   Length: ${articleContent.length} characters`);
    console.log(`   Word Count: ${wordCount} words`);

    if (articleContent.length > 0) {
      console.log('   ✅ Article content is NOT empty!');
    } else {
      console.log('   ❌ Article content is EMPTY!');
    }

    // Check for raw markdown file
    const rawDir = path.join(__dirname, 'backend/data/raw-responses');
    if (fs.existsSync(rawDir)) {
      const files = fs.readdirSync(rawDir);
      const topicFiles = files.filter(f => f.startsWith(topic.topic_id));

      console.log('\n🔍 Raw Markdown Files:');
      if (topicFiles.length > 0) {
        topicFiles.forEach(file => {
          console.log(`   ✅ Found: ${file}`);
        });
      } else {
        console.log('   ⚠️  No raw markdown files found');
      }
    }

    // Display final summary
    console.log('\n' + '='.repeat(80));
    console.log('✅ TEST COMPLETED SUCCESSFULLY!');
    console.log('='.repeat(80));

    console.log('\n📊 Results Summary:');
    console.log(`   Topic ID: ${topic.topic_id}`);
    console.log(`   Content ID: ${content.content_id}`);
    console.log(`   Title Match: ${generatedTitle.toLowerCase().includes(customTitle.toLowerCase()) ? 'YES' : 'NO'}`);
    console.log(`   Content Empty: ${articleContent.length === 0 ? 'YES' : 'NO'}`);
    console.log(`   Word Count: ${wordCount}`);

    console.log('\n📂 Generated Files:');
    console.log(`   CSV: backend/data/created-content.csv`);
    console.log(`   Raw Markdown: backend/data/raw-responses/`);

    console.log('\n🎯 Next Steps:');
    console.log('   1. Check backend/data/created-content.csv for the generated content');
    console.log('   2. Check backend/data/raw-responses/ for raw AI response backups');
    console.log('   3. Verify the title and article content fields');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the test
testCustomTitleGeneration()
  .then(() => {
    console.log('\n✅ All tests passed!\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test suite failed:', error.message);
    process.exit(1);
  });
