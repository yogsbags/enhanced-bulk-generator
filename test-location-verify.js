const SEODataFetcher = require('./research/seo-data-fetcher');

const fetcher = new SEODataFetcher();

(async () => {
  console.log('\n🔍 Verifying DataForSEO Location Settings...\n');
  
  const keyword = 'mutual funds';
  console.log(`Testing keyword: "${keyword}"`);
  console.log(`Location Code: 2356 (India)`);
  console.log(`Language Code: en`);
  console.log(`Search Partners: false\n`);
  
  const result = await fetcher.fetchKeywordMetrics(keyword);
  
  console.log('📊 RESPONSE DETAILS:');
  console.log('='.repeat(60));
  console.log(`Keyword: ${result.keyword}`);
  console.log(`Search Volume: ${result.search_volume.toLocaleString()}/month`);
  console.log(`Location Code Returned: ${result.location || 'Not specified'}`);
  console.log(`Language Code Returned: ${result.language || 'Not specified'}`);
  console.log(`CPC: ₹${result.cpc.toFixed(2)}`);
  console.log(`Keyword Difficulty: ${result.keyword_difficulty}/100`);
  console.log(`Competition: ${result.competition}`);
  console.log(`Data Source: ${result.source}`);
  console.log('='.repeat(60));
  
  if (result.location === 2356) {
    console.log('\n✅ CONFIRMED: Data is from India (location: 2356)');
  } else if (result.location) {
    console.log(`\n⚠️  WARNING: Data is from location: ${result.location} (not India!)`);
  } else {
    console.log('\n⚠️  Location code not returned in response');
  }
})();
