#!/usr/bin/env node

require('dotenv').config();

const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const CSVDataManager = require('./core/csv-data-manager');

async function generateDALLE3Image(prompt, contentId, topicId) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY not set');
  }

  console.log('🎨 Generating image with DALL-E 3 (1024x1024)...');
  console.log('📝 Prompt:', prompt);

  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'dall-e-3',
      prompt: prompt,
      n: 1,
      size: '1024x1024',
      quality: 'standard',
      style: 'natural'
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`DALL-E API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  const imageUrl = data.data[0].url;
  const revisedPrompt = data.data[0].revised_prompt || prompt;

  console.log('✅ Image generated!');
  console.log('🔗 URL:', imageUrl);

  // Download and save the image
  const imageResponse = await fetch(imageUrl);
  const imageBuffer = await imageResponse.buffer();

  const dataDir = path.join(__dirname, 'data', 'generated-hero-images');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const filename = `${topicId}-${Date.now()}.png`;
  const localPath = path.join(dataDir, filename);

  // Resize and optimize the image using Sharp (same as main workflow)
  // This reduces file size by ~70-80% while maintaining good quality
  // Target size: 450x450 (1:1 ratio) - optimal for blog hero images
  console.log('🔄 Resizing and optimizing image to 450x450...');
  await sharp(imageBuffer)
    .png({
      quality: 85,           // Quality: 0-100 (85 is good balance)
      compressionLevel: 9,   // Max compression: 0-9
      palette: true          // Use palette-based optimization
    })
    .resize(450, 450, {      // Small square blog-friendly size (1:1 ratio)
      fit: 'cover',
      position: 'center'
    })
    .toFile(localPath);

  console.log('💾 Saved to:', localPath);
  console.log('📐 Final size: 450x450 pixels (optimized)');

  return {
    url: imageUrl,
    local_path: localPath,
    alt: prompt,
    prompt: revisedPrompt,
    created_at: new Date().toISOString()
  };
}

async function main() {
  const manager = new CSVDataManager();

  // Get CONTENT-037
  const allContent = manager.getContentByApprovalStatus(['Published', 'SEO-Ready']);
  const content = allContent.find(c => c.content_id === 'CONTENT-037');

  if (!content) {
    console.error('❌ CONTENT-037 not found');
    process.exit(1);
  }

  const seoMeta = JSON.parse(content.seo_metadata);
  console.log('📝 Found:', seoMeta.title);

  // Generate new hero image
  const prompt = `Professional illustration of advisors discussing ${seoMeta.focus_keyphrase} in an Indian financial office, modern technology, clean business style`;

  const newHero = await generateDALLE3Image(prompt, content.content_id, content.topic_id);

  // Update content
  manager.updateCreatedContent('CONTENT-037', {
    hero_image: JSON.stringify(newHero),
    approval_status: 'SEO-Ready'
  });

  console.log('\n✅ CONTENT-037 updated with new hero image!');
  console.log('📋 Ready to republish with: node main.js stage publication --topic-limit=1');
}

main().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
