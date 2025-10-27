#!/usr/bin/env node

/**
 * Test script to publish a single article to WordPress and Sanity
 */

require('dotenv').config({ path: '.env.local' });
const ContentPublisher = require('./content/content-publisher.js');

async function testPublish() {
  console.log('🧪 Testing article publication...\n');

  // Test article data
  const testArticle = {
    content_id: 'TEST-001',
    topic_id: 'TOPIC-TEST',
    creation_date: new Date().toISOString().split('T')[0],
    seo_metadata: JSON.stringify({
      title: "Index Funds vs Mutual Funds: A Comprehensive Indian Market Guide",
      meta_description: "Explore index funds vs mutual funds in India. Discover performance, tax implications, and risk strategies.",
      focus_keyphrase: "index funds vs mutual funds",
      slug: "index-funds-vs-mutual-funds-comprehensive-guide",
      schema_markup: {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": "Index Funds vs Mutual Funds: A Comprehensive Indian Market Guide",
        "description": "Explore index funds vs mutual funds in India.",
        "author": {
          "@type": "Organization",
          "name": "PL Capital"
        }
      }
    }),
    article_content: `## Understanding Index Funds and Mutual Funds

In the dynamic landscape of the Indian financial market, investors are often faced with the dilemma of choosing between index funds and mutual funds. Both investment vehicles offer unique advantages and cater to different investor needs.

### What Are Index Funds?

Index funds are a type of mutual fund designed to replicate the performance of a specific index, such as the NIFTY 50 or BSE Sensex. They offer a passive investment strategy.

#### Benefits of Index Funds
- **Cost-Effective:** Low expense ratios due to passive management
- **Diversification:** Exposure to a broad market segment reduces individual stock risk
- **Transparency:** Clear understanding of holdings based on the index

### What Are Mutual Funds?

Mutual funds pool money from various investors to invest in stocks, bonds, or other securities, managed by professional fund managers.

#### Benefits of Mutual Funds
- **Professional Management:** Expertise in selecting securities
- **Variety of Options:** Available in equity, debt, hybrid, and other forms
- **Active Strategy:** Potential for higher returns than index benchmarks

## Performance Comparison

| Fund Type | Average 5-Year Return | Volatility |
|-----------|----------------------|------------|
| Index Funds | 10% | Low |
| Equity Mutual Funds | 12% | High |

## Tax Implications

### Index Funds
- **Long-Term Capital Gains (LTCG):** Taxed at 10% on gains exceeding INR 1 lakh
- **Short-Term Capital Gains (STCG):** Taxed at 15%

### Mutual Funds
- **Equity Funds:** Similar tax treatment as index funds
- **Debt Funds:** LTCG taxed at 20% with indexation

## Conclusion

Both index funds and mutual funds have their place in a well-diversified portfolio. The choice between them depends on your investment goals, risk tolerance, and time horizon.

For personalized advice on building your investment portfolio, contact PL Capital's advisory team today.`,
    quality_metrics: JSON.stringify({
      readability_score: 92,
      e_e_a_t_score: 88,
      compliance_score: 95
    }),
    approval_status: 'SEO-Ready'
  };

  const config = {
    wordpressUrl: process.env.WP_BASE_URL || 'http://localhost:8080',
    wordpressUsername: process.env.WP_USERNAME,
    wordpressPassword: process.env.WP_APPLICATION_PASSWORD || process.env.WP_PASSWORD,
    sanityProjectId: process.env.SANITY_PROJECT_ID,
    sanityDataset: process.env.SANITY_DATASET || 'production',
    sanityToken: process.env.SANITY_TOKEN,
    nextFrontendUrl: process.env.NEXT_FRONTEND_BASE_URL || 'http://localhost:3001'
  };

  const publisher = new ContentPublisher(config);

  // Normalize the content
  const normalized = publisher.normalizeContent(testArticle);

  console.log('📄 Article to publish:');
  console.log(`   Title: ${normalized.title}`);
  console.log(`   Slug: ${normalized.slug}`);
  console.log(`   Content Length: ${(normalized.markdown || normalized.article_content || '').length} characters`);
  console.log();

  // Publish to WordPress
  console.log('🌐 Publishing to WordPress...');
  const wpResult = await publisher.publishToWordPress(normalized);
  console.log(`   Status: ${wpResult.status}`);
  if (wpResult.success) {
    console.log(`   ✅ URL: ${wpResult.url}`);
    if (wpResult.editUrl) {
      console.log(`   ✏️  Edit: ${wpResult.editUrl}`);
    }
  } else {
    console.log(`   ❌ Error: ${wpResult.error}`);
  }
  console.log();

  // Publish to Sanity
  console.log('📝 Publishing to Sanity CMS...');
  const sanityResult = await publisher.publishToSanity(normalized);
  console.log(`   Status: ${sanityResult.status}`);
  if (sanityResult.success) {
    console.log(`   ✅ Frontend URL: ${sanityResult.url || sanityResult.frontendUrl}`);
    console.log(`   🖊️  Sanity Desk: ${sanityResult.deskUrl || sanityResult.sanityDeskUrl}`);
  } else {
    console.log(`   ❌ Error: ${sanityResult.error}`);
  }
  console.log();

  // Summary
  console.log('📊 Publication Summary:');
  console.log(`   WordPress: ${wpResult.success ? '✅ Success' : '❌ Failed'}`);
  console.log(`   Sanity: ${sanityResult.success ? '✅ Success' : '❌ Failed'}`);
  console.log();

  if (wpResult.success || sanityResult.success) {
    console.log('🎉 Article published successfully!');
    console.log();
    console.log('🔗 Access your article:');
    if (wpResult.success && wpResult.url) {
      console.log(`   WordPress: ${wpResult.url}`);
    }
    if (sanityResult.success && (sanityResult.url || sanityResult.frontendUrl)) {
      console.log(`   Next.js: ${sanityResult.url || sanityResult.frontendUrl}`);
    }
  } else {
    console.log('⚠️  Article publication failed on all platforms');
  }
}

testPublish().catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});
