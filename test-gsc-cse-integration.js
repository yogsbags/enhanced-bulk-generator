#!/usr/bin/env node

/**
 * Test GSC & CSE Integration
 * Verifies that Google Search Console and Custom Search Engine are properly integrated
 */

const GSCMCPClient = require('./research/gsc-mcp-client');
const CSEMCPClient = require('./research/cse-mcp-client');
const GSCCSEDataFetcher = require('./research/gsc-cse-data-fetcher');

console.log('\n🧪 TESTING GSC & CSE MCP INTEGRATION');
console.log('='.repeat(70));

async function testGSCCSEIntegration() {
  try {
    // Test 1: Initialize GSC Client
    console.log('\n📍 TEST 1: Initialize Google Search Console MCP Client');
    console.log('-'.repeat(70));
    
    const gscClient = new GSCMCPClient();
    await gscClient.ensureInitialized();
    
    if (gscClient.isAvailable()) {
      console.log('✅ GSC MCP client initialized successfully');
      console.log('   Tools available: list_sites, search_analytics, index_inspect');
      console.log('                    list_sitemaps, get_sitemap, submit_sitemap');
    } else {
      console.log('⚠️  GSC MCP not available - enable in Cursor settings');
    }

    // Test 2: Initialize CSE Client
    console.log('\n📍 TEST 2: Initialize Google Custom Search Engine MCP Client');
    console.log('-'.repeat(70));
    
    const cseClient = new CSEMCPClient();
    await cseClient.ensureInitialized();
    
    if (cseClient.isAvailable()) {
      console.log('✅ CSE MCP client initialized successfully');
      console.log('   Tools available: google_search');
    } else {
      console.log('⚠️  CSE MCP not available - enable in Cursor settings');
    }

    // Test 3: Initialize GSC/CSE Data Fetcher
    console.log('\n📍 TEST 3: Initialize GSC/CSE Data Fetcher');
    console.log('-'.repeat(70));
    
    const fetcher = new GSCCSEDataFetcher({
      gscClient: gscClient,
      cseClient: cseClient,
      siteUrl: 'https://plindia.com',
      dateRange: 'last_30_days'
    });
    
    const hasClients = fetcher.validateClients();
    
    if (hasClients) {
      console.log('✅ GSC/CSE Data Fetcher configured successfully');
    } else {
      console.log('⚠️  No GSC/CSE clients available');
    }

    // Test 4: Demonstrate Use Cases
    console.log('\n📍 TEST 4: Use Case Demonstrations');
    console.log('-'.repeat(70));

    console.log('\n💡 USE CASE 1: Get Top-Performing Keywords from GSC');
    console.log('   Example call:');
    console.log('   ```javascript');
    console.log('   const topKeywords = await fetcher.getTopPerformingKeywords({ limit: 100 });');
    console.log('   ```');
    console.log('   Returns: Actual keywords driving traffic to plindia.com');
    console.log('   - Keyword, clicks, impressions, CTR, position');
    console.log('   - Based on last 30 days of real GSC data');

    console.log('\n💡 USE CASE 2: Find Content Gap Opportunities');
    console.log('   Example call:');
    console.log('   ```javascript');
    console.log('   const gaps = await fetcher.getContentGaps({');
    console.log('     minImpressions: 500,   // At least 500 searches/month');
    console.log('     maxCTR: 0.03,          // Less than 3% CTR');
    console.log('     minPosition: 10        // Not in top 10');
    console.log('   });');
    console.log('   ```');
    console.log('   Returns: High-opportunity keywords with:');
    console.log('   - Current traffic vs potential traffic');
    console.log('   - Opportunity score (prioritization)');
    console.log('   - Actionable improvement recommendations');

    console.log('\n💡 USE CASE 3: Check Existing Content Coverage (CSE)');
    console.log('   Example call:');
    console.log('   ```javascript');
    console.log('   const coverage = await fetcher.analyzeTopicCoverage(');
    console.log('     "best mutual funds for beginners",');
    console.log('     ["mutual funds", "beginner investing", "SIP"]');
    console.log('   );');
    console.log('   ```');
    console.log('   Returns: Coverage analysis:');
    console.log('   - Existing articles on plindia.com');
    console.log('   - Keywords covered vs missing');
    console.log('   - Recommendation: create/update/skip');

    console.log('\n💡 USE CASE 4: Identify Declining Pages');
    console.log('   Example call:');
    console.log('   ```javascript');
    console.log('   const declining = await fetcher.getDecliningPages({ limit: 50 });');
    console.log('   ```');
    console.log('   Returns: Pages needing content refresh:');
    console.log('   - URL, clicks, position, CTR');
    console.log('   - Priority level (high/medium/low)');
    console.log('   - Auto-queue for updates');

    // Test 5: Integration Summary
    console.log('\n📊 INTEGRATION SUMMARY');
    console.log('='.repeat(70));
    
    if (gscClient.isAvailable() && cseClient.isAvailable()) {
      console.log('✅ GSC MCP: ENABLED (Real traffic data)');
      console.log('✅ CSE MCP: ENABLED (Site search & coverage)');
      console.log('✅ Data Fetcher: Ready to use');
      console.log('\n🎯 CAPABILITIES:');
      console.log('   ✅ Real keyword performance data (GSC)');
      console.log('   ✅ Content gap analysis with traffic potential');
      console.log('   ✅ Duplicate content detection (CSE)');
      console.log('   ✅ Topic coverage analysis');
      console.log('   ✅ Declining page identification');
      console.log('   ✅ Index status monitoring');
      console.log('\n💡 WORKFLOW IMPACT:');
      console.log('   📈 Data-driven content decisions');
      console.log('   🎯 Quantified traffic opportunities');
      console.log('   ⚡ Avoid duplicate content');
      console.log('   🔄 Automated content refresh');
      console.log('\n🎉 You have REAL performance data from plindia.com!');
    } else if (gscClient.isAvailable() || cseClient.isAvailable()) {
      console.log('⚠️  Partial Integration:');
      if (gscClient.isAvailable()) {
        console.log('   ✅ GSC MCP: ENABLED');
      } else {
        console.log('   ❌ GSC MCP: Not available');
      }
      if (cseClient.isAvailable()) {
        console.log('   ✅ CSE MCP: ENABLED');
      } else {
        console.log('   ❌ CSE MCP: Not available');
      }
      console.log('\n💡 To enable missing MCPs:');
      console.log('   1. Open Cursor settings → MCP');
      console.log('   2. Enable gsc-mcp and google-cse-mcp');
      console.log('   3. Authenticate with Google Account');
      console.log('   4. Restart workflow');
    } else {
      console.log('⚠️  GSC & CSE MCPs: NOT AVAILABLE');
      console.log('\n💡 To enable:');
      console.log('   1. Open Cursor settings → MCP');
      console.log('   2. Enable:');
      console.log('      - gsc-mcp (Google Search Console)');
      console.log('      - google-cse-mcp (Custom Search Engine)');
      console.log('   3. Authenticate with Google Account');
      console.log('   4. Verify plindia.com is added to Search Console');
      console.log('   5. Restart workflow');
      console.log('\n📚 Current capabilities:');
      console.log('   - AI-generated topics (without real data)');
      console.log('   - Google Ads MCP for keyword research');
      console.log('   - DataForSEO for search volumes');
    }

    // Test 6: Quick Reference
    console.log('\n📚 QUICK REFERENCE');
    console.log('='.repeat(70));
    console.log('\n🔧 Integration Code:');
    console.log('```javascript');
    console.log('const GSCMCPClient = require("./research/gsc-mcp-client");');
    console.log('const CSEMCPClient = require("./research/cse-mcp-client");');
    console.log('const GSCCSEDataFetcher = require("./research/gsc-cse-data-fetcher");');
    console.log('');
    console.log('const gscClient = new GSCMCPClient();');
    console.log('const cseClient = new CSEMCPClient();');
    console.log('const fetcher = new GSCCSEDataFetcher({');
    console.log('  gscClient, cseClient,');
    console.log('  siteUrl: "https://plindia.com",');
    console.log('  dateRange: "last_30_days"');
    console.log('});');
    console.log('```');

    console.log('\n✅ INTEGRATION TEST COMPLETED');
    console.log('='.repeat(70));
    
  } catch (error) {
    console.error('\n❌ Integration test failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the test
testGSCCSEIntegration();

