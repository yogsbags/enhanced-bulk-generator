#!/usr/bin/env node

/**
 * Test Google Ads MCP Integration
 * Verifies that Google Ads MCP is properly integrated for FREE SEO data
 */

const GoogleAdsMCPClient = require('./research/google-ads-mcp-client');
const SEODataFetcher = require('./research/seo-data-fetcher');

console.log('\n🧪 TESTING GOOGLE ADS MCP INTEGRATION');
console.log('='.repeat(70));

async function testGoogleAdsMCPIntegration() {
  try {
    // Test 1: Initialize MCP Client
    console.log('\n📍 TEST 1: Initialize Google Ads MCP Client');
    console.log('-'.repeat(70));

    const mcpClient = new GoogleAdsMCPClient();
    await mcpClient.ensureInitialized();

    if (mcpClient.isAvailable()) {
      console.log('✅ Google Ads MCP client initialized successfully');
      console.log('   Tools available: run_keyword_planner, list_accounts, run_gaql, gaql_reference');
    } else {
      console.log('⚠️  Google Ads MCP not available - will use DataForSEO backup');
    }

    // Test 2: Initialize SEO Data Fetcher with MCP
    console.log('\n📍 TEST 2: Initialize SEO Data Fetcher with Google Ads MCP');
    console.log('-'.repeat(70));

    const fetcher = new SEODataFetcher({
      mcpClient: mcpClient,
      useGoogleAdsMCP: true,
      country: 'in',
      language: 'en'
    });

    const hasCredentials = fetcher.validateCredentials();

    if (hasCredentials) {
      console.log('✅ SEO Data Fetcher configured with Google Ads MCP');
    } else {
      console.log('⚠️  No SEO data sources available');
    }

    // Test 3: Fetch keyword metrics (will use Google Ads MCP if available)
    console.log('\n📍 TEST 3: Fetch Keyword Metrics');
    console.log('-'.repeat(70));

    const testKeywords = ['mutual funds', 'SIP investment', 'index funds'];

    for (const keyword of testKeywords) {
      try {
        console.log(`\n🔍 Testing keyword: "${keyword}"`);
        const metrics = await fetcher.fetchKeywordMetrics(keyword);

        console.log('📊 METRICS RECEIVED:');
        console.log(`   Keyword: ${metrics.keyword}`);
        console.log(`   Search Volume: ${metrics.search_volume.toLocaleString()}/month`);
        console.log(`   Keyword Difficulty: ${metrics.keyword_difficulty}/100`);
        console.log(`   CPC: ₹${metrics.cpc.toFixed(2)}`);
        console.log(`   Competition: ${metrics.competition}`);
        console.log(`   Data Source: ${metrics.source}`);
        console.log(`   Confidence: ${metrics.confidence}`);

        if (metrics.source === 'Google Ads MCP') {
          console.log('   🎉 FREE Google Ads data!');
        } else if (metrics.source === 'DataForSEO') {
          console.log('   💰 Paid DataForSEO data (₹0.04)');
        } else if (metrics.source === 'AI-Estimated') {
          console.log('   💭 AI-estimated data (configure APIs for accuracy)');
        }

      } catch (error) {
        console.error(`   ❌ Failed to fetch "${keyword}": ${error.message}`);
      }

      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Test 4: Summary
    console.log('\n📊 INTEGRATION SUMMARY');
    console.log('='.repeat(70));

    if (mcpClient.isAvailable()) {
      console.log('✅ Google Ads MCP: ENABLED (FREE unlimited queries)');
      console.log('✅ DataForSEO: Available as backup (₹0.04/keyword)');
      console.log('✅ AI Estimates: Available as final fallback (FREE)');
      console.log('\n💰 COST SAVINGS:');
      console.log('   - 100 keywords: ₹4.00 saved');
      console.log('   - 1,000 keywords: ₹40.00 saved');
      console.log('   - 10,000 keywords: ₹400.00 saved');
      console.log('\n🎉 You have FREE, official Google keyword data!');
    } else {
      console.log('⚠️  Google Ads MCP: NOT AVAILABLE');
      console.log('   Current fallback: DataForSEO (₹0.04/keyword) or AI estimates');
      console.log('\n💡 To enable Google Ads MCP:');
      console.log('   1. Open Cursor settings');
      console.log('   2. Enable Google Ads MCP server');
      console.log('   3. Authenticate with Google Ads Manager account');
      console.log('   4. Restart workflow');
    }

    console.log('\n✅ INTEGRATION TEST COMPLETED');
    console.log('='.repeat(70));

  } catch (error) {
    console.error('\n❌ Integration test failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the test
testGoogleAdsMCPIntegration();

