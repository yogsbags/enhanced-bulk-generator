#!/usr/bin/env node

/**
 * Test Script for Google APIs Direct Integration
 * Tests all three Google API clients (Ads, GSC, CSE)
 */

const GoogleAdsAPIClient = require('./research/google-ads-api-client');
const GoogleSearchConsoleAPIClient = require('./research/google-search-console-api-client');
const GoogleCustomSearchAPIClient = require('./research/google-custom-search-api-client');
const SEODataFetcher = require('./research/seo-data-fetcher');

async function testGoogleAdsAPI() {
  console.log('\n🧪 TEST 1: Google Ads API');
  console.log('='.repeat(80));

  const client = new GoogleAdsAPIClient();

  if (!client.validateCredentials()) {
    console.log('❌ Google Ads API credentials not configured');
    console.log('💡 See GOOGLE_APIs_SETUP_GUIDE.md for setup instructions\n');
    return false;
  }

  try {
    const keywords = ['mutual funds', 'SIP investment'];
    console.log(`\n🔍 Testing with keywords: ${keywords.join(', ')}`);

    const results = await client.getKeywordIdeas(keywords, 'India', 'en');

    console.log(`\n✅ SUCCESS: Got ${results.length} keyword ideas`);
    console.log('\nSample result:');
    console.log(JSON.stringify(results[0], null, 2));

    return true;
  } catch (error) {
    console.error(`\n❌ FAILED: ${error.message}`);
    return false;
  }
}

async function testGoogleSearchConsoleAPI() {
  console.log('\n🧪 TEST 2: Google Search Console API');
  console.log('='.repeat(80));

  const siteUrl = process.env.SITE_URL || 'https://plindia.com';
  const client = new GoogleSearchConsoleAPIClient({ siteUrl });

  if (!client.validateCredentials()) {
    console.log('❌ GSC API credentials not configured');
    console.log('💡 See GOOGLE_APIs_SETUP_GUIDE.md for setup instructions\n');
    return false;
  }

  try {
    console.log(`\n🔍 Testing with site: ${siteUrl}`);

    const gaps = await client.getContentGaps({ days: 30, limit: 5 });

    console.log(`\n✅ SUCCESS: Found ${gaps.length} content gap opportunities`);
    if (gaps.length > 0) {
      console.log('\nSample result:');
      console.log(JSON.stringify(gaps[0], null, 2));
    }

    return true;
  } catch (error) {
    console.error(`\n❌ FAILED: ${error.message}`);
    return false;
  }
}

async function testGoogleCustomSearchAPI() {
  console.log('\n🧪 TEST 3: Google Custom Search API');
  console.log('='.repeat(80));

  const siteUrl = process.env.SITE_URL || 'plindia.com';
  const client = new GoogleCustomSearchAPIClient({ siteUrl });

  if (!client.validateCredentials()) {
    console.log('❌ CSE API credentials not configured');
    console.log('💡 See GOOGLE_APIs_SETUP_GUIDE.md for setup instructions\n');
    return false;
  }

  try {
    const topic = 'mutual funds for beginners';
    console.log(`\n🔍 Testing with topic: ${topic}`);

    const coverage = await client.analyzeTopicCoverage(topic, ['SIP', 'investment']);

    console.log(`\n✅ SUCCESS: Coverage score ${coverage.coverageScore}/100`);
    console.log(`Recommendation: ${coverage.recommendation.action.toUpperCase()}`);
    console.log(`Reason: ${coverage.recommendation.reason}`);

    return true;
  } catch (error) {
    console.error(`\n❌ FAILED: ${error.message}`);
    return false;
  }
}

async function testSEODataFetcher() {
  console.log('\n🧪 TEST 4: SEO Data Fetcher (Integrated)');
  console.log('='.repeat(80));

  const fetcher = new SEODataFetcher({
    siteUrl: process.env.SITE_URL || 'https://plindia.com'
  });

  fetcher.validateCredentials();

  try {
    const keyword = 'best mutual funds for beginners';
    console.log(`\n🔍 Fetching metrics for: ${keyword}`);

    const metrics = await fetcher.fetchKeywordMetrics(keyword);

    console.log('\n✅ SUCCESS: Got keyword metrics');
    fetcher.displayMetricsSummary(metrics);

    return true;
  } catch (error) {
    console.error(`\n❌ FAILED: ${error.message}`);
    return false;
  }
}

async function testComprehensiveAnalysis() {
  console.log('\n🧪 TEST 5: Comprehensive Content Gap Analysis');
  console.log('='.repeat(80));

  const fetcher = new SEODataFetcher({
    siteUrl: process.env.SITE_URL || 'https://plindia.com'
  });

  try {
    const results = await fetcher.comprehensiveContentGapAnalysis({
      days: 30,
      limit: 5
    });

    console.log('\n✅ SUCCESS: Comprehensive analysis complete');
    console.log(`\n📊 Results Summary:`);
    console.log(`   GSC Gaps: ${results.gsc_gaps.length}`);
    console.log(`   Enriched Gaps: ${results.enriched_gaps.length}`);
    console.log(`   Coverage Analysis: ${results.coverage_analysis.length}`);
    console.log(`   Recommendations: ${results.recommendations.length}`);

    if (results.recommendations.length > 0) {
      console.log('\n🎯 Top 3 Recommendations:');
      results.recommendations.slice(0, 3).forEach((rec, i) => {
        console.log(`\n${i + 1}. ${rec.keyword}`);
        console.log(`   Priority: ${rec.priority}/100`);
        console.log(`   Search Volume: ${rec.search_volume.toLocaleString()}/month`);
        console.log(`   Traffic Gain: +${rec.potential_traffic_gain.toLocaleString()} clicks/month`);
        console.log(`   Recommendation: ${rec.recommendation.toUpperCase()}`);
      });
    }

    return true;
  } catch (error) {
    console.error(`\n❌ FAILED: ${error.message}`);
    return false;
  }
}

async function runAllTests() {
  console.log('\n🚀 GOOGLE APIs INTEGRATION TEST SUITE');
  console.log('='.repeat(80));
  console.log('Testing direct integration with Google Ads, GSC, and CSE APIs\n');

  const results = {
    googleAds: false,
    gsc: false,
    cse: false,
    seoDataFetcher: false,
    comprehensive: false
  };

  // Test each API individually
  results.googleAds = await testGoogleAdsAPI();
  await sleep(2000);

  results.gsc = await testGoogleSearchConsoleAPI();
  await sleep(2000);

  results.cse = await testGoogleCustomSearchAPI();
  await sleep(2000);

  results.seoDataFetcher = await testSEODataFetcher();
  await sleep(2000);

  // Only run comprehensive test if basic tests pass
  if (results.googleAds && results.gsc && results.seoDataFetcher) {
    results.comprehensive = await testComprehensiveAnalysis();
  } else {
    console.log('\n⚠️  Skipping comprehensive test (basic tests failed)');
  }

  // Print final summary
  console.log('\n' + '='.repeat(80));
  console.log('📊 FINAL TEST RESULTS');
  console.log('='.repeat(80));
  console.log(`Google Ads API:           ${results.googleAds ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`Google Search Console:    ${results.gsc ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`Google Custom Search:     ${results.cse ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`SEO Data Fetcher:         ${results.seoDataFetcher ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`Comprehensive Analysis:   ${results.comprehensive ? '✅ PASSED' : '⏭️  SKIPPED'}`);

  const passed = Object.values(results).filter(r => r === true).length;
  const total = Object.keys(results).length;

  console.log('\n' + '='.repeat(80));
  console.log(`🎯 TOTAL: ${passed}/${total} tests passed`);
  console.log('='.repeat(80));

  if (passed === 0) {
    console.log('\n⚠️  No Google APIs configured!');
    console.log('📚 See GOOGLE_APIs_SETUP_GUIDE.md for setup instructions');
  } else if (passed < total) {
    console.log('\n⚠️  Some APIs not configured. See GOOGLE_APIs_SETUP_GUIDE.md');
  } else {
    console.log('\n🎉 All tests passed! Your Google APIs integration is working perfectly!');
  }

  console.log('\n');
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Run tests
if (require.main === module) {
  runAllTests()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('\n❌ Test suite failed:', error);
      process.exit(1);
    });
}

module.exports = { runAllTests };
