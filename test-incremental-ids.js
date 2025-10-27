#!/usr/bin/env node

/**
 * Test script to verify incremental ID generation
 */

const CSVDataManager = require('./core/csv-data-manager');

console.log('\n🧪 Testing Incremental ID Generation\n');
console.log('='.repeat(60));

const csvManager = new CSVDataManager('./data');

// Test 1: Master Research IDs
console.log('\n📊 Test 1: Master Research ID Generation');
console.log('-'.repeat(60));

const testResearch = {
  total_gaps_identified: 5,
  competitors_analyzed: ['Test1.com', 'Test2.com'],
  strategic_recommendations: {
    phase_1_focus: 'Test Phase 1',
    phase_2_focus: 'Test Phase 2',
    phase_3_focus: 'Test Phase 3',
    estimated_traffic_growth: '20% in 6 months'
  }
};

console.log('Saving test research entry...');
const saved1 = csvManager.saveMasterResearch(testResearch);
console.log(`✅ Saved: ${saved1}`);

// Read back to check ID
const masterData = csvManager.readCSV(csvManager.files.masterResearch);
const lastMaster = masterData[masterData.length - 1];
console.log(`Generated ID: ${lastMaster.research_id}`);

// Test 2: Research Gaps IDs
console.log('\n📋 Test 2: Research Gap ID Generation');
console.log('-'.repeat(60));

const testGaps = [
  {
    topic_area: 'test_area',
    gap_title: 'Test Gap 1',
    search_volume: 1000,
    keyword_difficulty: 25
  },
  {
    topic_area: 'test_area',
    gap_title: 'Test Gap 2',
    search_volume: 2000,
    keyword_difficulty: 30
  }
];

console.log('Saving 2 test gaps...');
const saved2 = csvManager.saveResearchGaps(testGaps);
console.log(`✅ Saved: ${saved2}`);

// Read back to check IDs
const gapsData = csvManager.readCSV(csvManager.files.researchGaps);
const lastTwoGaps = gapsData.slice(-2);
console.log(`Generated IDs: ${lastTwoGaps.map(g => g.gap_id).join(', ')}`);

// Test 3: Quick Wins IDs
console.log('\n⚡ Test 3: Quick Win ID Generation');
console.log('-'.repeat(60));

const testQuickWins = [
  {
    topic_title: 'Test Quick Win 1',
    topic_area: 'test_area',
    search_volume: 3000,
    keyword_difficulty: 20,
    primary_keyword: 'test keyword'
  }
];

console.log('Saving 1 test quick win...');
const saved3 = csvManager.saveQuickWins(testQuickWins);
console.log(`✅ Saved: ${saved3}`);

// Read back to check ID
const qwData = csvManager.readCSV(csvManager.files.quickWins);
const lastQW = qwData[qwData.length - 1];
console.log(`Generated ID: ${lastQW.gap_id}`);

// Display summary
console.log('\n' + '='.repeat(60));
console.log('📊 ID GENERATION SUMMARY');
console.log('='.repeat(60));

const stats = csvManager.getWorkflowStats();
console.log(`Total Research Batches: ${masterData.length}`);
console.log(`Total Research Gaps: ${stats.totalResearchGaps}`);
console.log(`Total Quick Wins: ${qwData.length}`);

console.log('\n✅ Incremental ID test completed!\n');
