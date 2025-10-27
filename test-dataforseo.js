#!/usr/bin/env node

const SEODataFetcher = require('./research/seo-data-fetcher');

const fetcher = new SEODataFetcher();

const keywords = [
  'mutual funds',
  'index funds vs mutual funds',
  'elss vs tax saving fd',
  'small cap vs mid cap',
  'nps vs ppf'
];

(async () => {
  console.log('\n🔍 Testing DataForSEO with real keywords...\n');
  const results = await fetcher.batchFetchKeywords(keywords);

  console.log('\n📊 REAL SEO DATA FROM DATAFORSEO');
  console.log('='.repeat(100));
  console.log('Keyword'.padEnd(40) + ' | ' + 'Volume'.padStart(8) + ' | ' + 'KD'.padStart(3) + ' | ' + 'CPC'.padStart(6) + ' | ' + 'Source');
  console.log('='.repeat(100));

  results.forEach(r => {
    const keyword = r.keyword.padEnd(40);
    const volume = String(r.search_volume).padStart(8);
    const kd = String(r.keyword_difficulty).padStart(3);
    const cpc = `₹${r.cpc.toFixed(2)}`.padStart(6);
    const source = r.source;
    console.log(`${keyword} | ${volume} | ${kd} | ${cpc} | ${source}`);
  });

  console.log('='.repeat(100));

  const totalVolume = results.reduce((sum, r) => sum + r.search_volume, 0);
  const avgKD = Math.round(results.reduce((sum, r) => sum + r.keyword_difficulty, 0) / results.length);

  console.log(`\n📈 Summary:`);
  console.log(`   Total Monthly Search Volume: ${totalVolume.toLocaleString()}`);
  console.log(`   Average Keyword Difficulty: ${avgKD}/100`);
  console.log(`   Data Source: ${results[0].source}`);
  console.log(`   API Cost: ~$${(results.length * 0.0005).toFixed(4)} (₹${(results.length * 0.04).toFixed(2)})\n`);
})();

