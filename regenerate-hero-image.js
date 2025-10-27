#!/usr/bin/env node

const ContentCreator = require('./content/content-creator');
const CSVDataManager = require('./core/csv-data-manager');

async function regenerateHeroImage() {
  const creator = new ContentCreator();
  const manager = new CSVDataManager();

  // Get CONTENT-037
  const allContent = manager.getContentByApprovalStatus(['Published', 'SEO-Ready']);
  const content = allContent.find(c => c.content_id === 'CONTENT-037');

  if (!content) {
    console.error('❌ CONTENT-037 not found');
    process.exit(1);
  }

  console.log('📝 Found CONTENT-037');
  console.log('📋 Title:', JSON.parse(content.seo_metadata).title);

  // Parse existing hero image
  const oldHero = JSON.parse(content.hero_image);
  console.log('🖼️  Old image URL:', oldHero.url ? oldHero.url.substring(0, 100) + '...' : 'none');

  // Generate new hero image using applyHeroImage
  console.log('\n🎨 Generating new hero image...');

  // Get topic research data
  const topicResearch = manager.getTopicResearchByTopicId(content.topic_id);

  // Create a content object for applyHeroImage
  const contentForImage = {
    content_id: content.content_id,
    topic_id: content.topic_id,
    seo_metadata: JSON.parse(content.seo_metadata),
    article_content: content.article_content
  };

  const updatedContent = await creator.applyHeroImage(contentForImage, topicResearch);

  if (!updatedContent || !updatedContent.hero_image) {
    console.error('❌ Failed to generate hero image');
    process.exit(1);
  }

  const newHero = updatedContent.hero_image;

  console.log('✅ New image generated!');
  console.log('🔗 New URL:', newHero.url ? newHero.url.substring(0, 100) + '...' : 'none');
  console.log('📁 Local path:', newHero.local_path);

  // Update content with new hero image
  manager.updateCreatedContent('CONTENT-037', {
    hero_image: JSON.stringify(newHero),
    approval_status: 'SEO-Ready'
  });

  console.log('\n✅ CONTENT-037 updated with new hero image and marked as SEO-Ready');
}

regenerateHeroImage().catch(err => {
  console.error('❌ Error:', err.message);
  console.error(err.stack);
  process.exit(1);
});
