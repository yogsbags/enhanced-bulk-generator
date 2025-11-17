#!/usr/bin/env node

/**
 * Create 8 Research Gaps for Stage-by-Stage Workflow
 * Adds gaps to research-gaps.csv with approval_status = "Yes"
 */

const fs = require('fs');
const path = require('path');
const csv = require('csv-parse/sync');
const { stringify } = require('csv-stringify/sync');

const newGaps = [
  {
    gap_id: 'GAP-101',
    topic_area: 'gold_investment',
    gap_title: 'Sovereign Gold Bonds vs Physical Gold Investment Comparison',
    gap_description: 'Comprehensive comparison between SGB and physical gold covering returns, safety, liquidity, and tax benefits for Indian investors',
    target_keywords: 'sovereign gold bonds, physical gold investment, gold bonds interest rate, sgb vs gold',
    priority_score: 92,
    approval_status: 'Yes'
  },
  {
    gap_id: 'GAP-102',
    topic_area: 'stock_market_indices',
    gap_title: 'NIFTY 50 vs SENSEX Index Comparison Guide',
    gap_description: 'Detailed analysis of India\'s two major stock indices, their composition, performance, and which to track for investment decisions',
    target_keywords: 'nifty 50, sensex, stock market indices, nifty vs sensex',
    priority_score: 90,
    approval_status: 'Yes'
  },
  {
    gap_id: 'GAP-103',
    topic_area: 'retirement_planning',
    gap_title: 'PPF vs NPS for Retirement Planning Comparison',
    gap_description: 'Complete comparison of Public Provident Fund and National Pension System covering returns, liquidity, tax benefits, and retirement suitability',
    target_keywords: 'ppf, nps, retirement planning, ppf vs nps',
    priority_score: 93,
    approval_status: 'Yes'
  },
  {
    gap_id: 'GAP-104',
    topic_area: 'payment_methods',
    gap_title: 'Credit Card vs Debit Card Usage Guide',
    gap_description: 'Smart usage guide comparing credit and debit cards covering benefits, rewards, credit score impact, and best use cases',
    target_keywords: 'credit card benefits, debit card vs credit card, credit score',
    priority_score: 88,
    approval_status: 'Yes'
  },
  {
    gap_id: 'GAP-105',
    topic_area: 'bank_deposits',
    gap_title: 'Fixed Deposit vs Recurring Deposit Comparison',
    gap_description: 'Comprehensive comparison of FD and RD covering interest rates, liquidity, tax implications, and suitability for different savings goals',
    target_keywords: 'fixed deposit, recurring deposit, fd vs rd',
    priority_score: 85,
    approval_status: 'Yes'
  },
  {
    gap_id: 'GAP-106',
    topic_area: 'insurance',
    gap_title: 'Term Insurance vs Endowment Plan Comparison',
    gap_description: 'Detailed comparison of term insurance and endowment plans covering coverage, costs, returns, and which suits different life stages',
    target_keywords: 'term insurance, endowment plan, life insurance india',
    priority_score: 91,
    approval_status: 'Yes'
  },
  {
    gap_id: 'GAP-107',
    topic_area: 'equity_investing',
    gap_title: 'Direct Stock Investment vs Index Funds for Beginners',
    gap_description: 'Beginner-friendly comparison of direct stock picking vs index fund investing covering risk, returns, effort, and cost',
    target_keywords: 'direct stocks, index funds, beginner investing',
    priority_score: 89,
    approval_status: 'Yes'
  },
  {
    gap_id: 'GAP-108',
    topic_area: 'digital_payments',
    gap_title: 'UPI vs Credit Card for Daily Transactions',
    gap_description: 'Practical comparison of UPI and credit cards for daily spending covering convenience, rewards, safety, and cost',
    target_keywords: 'upi payments, credit card payments, digital payments india',
    priority_score: 87,
    approval_status: 'Yes'
  }
];

function createResearchGaps() {
  console.log('\n📋 CREATING 8 RESEARCH GAPS');
  console.log('='.repeat(60));

  const csvPath = path.join(__dirname, '../data/research-gaps.csv');
  let existingGaps = [];

  // Load existing gaps if file exists
  if (fs.existsSync(csvPath)) {
    try {
      const csvContent = fs.readFileSync(csvPath, 'utf-8');
      existingGaps = csv.parse(csvContent, {
        columns: true,
        skip_empty_lines: true,
        relax_quotes: true,
        quote: '"',
        escape: '"'
      });
      console.log(`✅ Loaded ${existingGaps.length} existing gaps`);
    } catch (error) {
      console.log('⚠️  Could not load existing gaps, creating new file');
    }
  }

  // Add timestamp and status fields
  const timestamp = new Date().toISOString();
  const enrichedGaps = newGaps.map(gap => ({
    ...gap,
    identified_date: timestamp,
    competitor_mentions: 'Multiple competitors lack comprehensive comparison',
    search_volume: 'High',
    content_type: 'Ultimate Guide',
    estimated_word_count: '1800-2000'
  }));

  // Combine with existing
  const allGaps = [...existingGaps, ...enrichedGaps];

  // Save to CSV
  const csvOutput = stringify(allGaps, {
    header: true,
    quoted: true,
    quoted_empty: true
  });

  fs.writeFileSync(csvPath, csvOutput, 'utf-8');

  console.log(`\n✅ Added 8 new research gaps`);
  console.log(`📄 Total gaps in CSV: ${allGaps.length}`);

  console.log('\n📊 New Gaps Created:');
  enrichedGaps.forEach((gap, i) => {
    console.log(`   ${i + 1}. ${gap.gap_id}: ${gap.gap_title}`);
    console.log(`      Priority: ${gap.priority_score}, Status: ${gap.approval_status}`);
  });

  console.log('\n✅ Research gaps ready for Stage 2: Topic Generation');
  console.log('   Next: node main.js stage topics --auto-approve\n');
}

createResearchGaps();
