#!/usr/bin/env node

/**
 * Demo Data Generator for Enhanced Bulk Generator
 * Creates sample research gaps and topics for testing without API calls
 */

const CSVDataManager = require('./core/csv-data-manager');

class DemoDataGenerator {
  constructor() {
    this.csvManager = new CSVDataManager();
  }

  /**
   * Generate sample research gaps
   */
  generateSampleResearchGaps() {
    const sampleGaps = [
      {
        gap_id: 'GAP-001',
        topic_area: 'mutual_funds',
        gap_title: 'Complete Guide to Index Funds vs Mutual Funds 2025',
        search_volume: 12000,
        keyword_difficulty: 28,
        commercial_intent: 'High',
        competitor_weakness: 'Groww has outdated 2023 data; Zerodha focuses only on passive investing',
        our_competitive_edge: 'Include 2025 expense ratio changes, calculator tool, video comparison',
        estimated_ranking_time: '45-60 days',
        priority_score: 95,
        primary_keyword: 'index funds vs mutual funds',
        secondary_keywords: 'best index funds 2025,index fund calculator,index fund returns',
        content_type_recommendation: 'ymyl',
        word_count_target: 2500,
        expert_required: 'true',
        regulatory_compliance: 'SEBI disclosure,Risk warning',
        quick_win: 'false',
        authority_builder: 'true',
        approval_status: 'Pending'
      },
      {
        gap_id: 'GAP-002',
        topic_area: 'tax_planning',
        gap_title: 'Tax-Saving Mutual Funds vs ELSS: Complete 2025 Comparison',
        search_volume: 8500,
        keyword_difficulty: 32,
        commercial_intent: 'High',
        competitor_weakness: 'ETMoney lacks detailed tax calculation examples',
        our_competitive_edge: 'Interactive tax calculator with real scenarios',
        estimated_ranking_time: '30-45 days',
        priority_score: 92,
        primary_keyword: 'tax saving mutual funds vs elss',
        secondary_keywords: 'elss funds 2025,tax saving investment,80c deduction',
        content_type_recommendation: 'ymyl',
        word_count_target: 2200,
        expert_required: 'true',
        regulatory_compliance: 'SEBI disclosure,Tax disclaimer',
        quick_win: 'true',
        authority_builder: 'false',
        approval_status: 'Pending'
      },
      {
        gap_id: 'GAP-003',
        topic_area: 'stock_market',
        gap_title: 'Small Cap vs Mid Cap vs Large Cap Funds: Complete Analysis',
        search_volume: 6800,
        keyword_difficulty: 25,
        commercial_intent: 'Medium',
        competitor_weakness: 'Zerodha Varsity lacks recent performance data',
        our_competitive_edge: 'Real-time performance comparison with charts',
        estimated_ranking_time: '25-40 days',
        priority_score: 88,
        primary_keyword: 'small cap vs mid cap vs large cap',
        secondary_keywords: 'market cap funds,equity fund types,cap size investing',
        content_type_recommendation: 'blog',
        word_count_target: 2000,
        expert_required: 'false',
        regulatory_compliance: 'Risk warning',
        quick_win: 'true',
        authority_builder: 'false',
        approval_status: 'Pending'
      },
      {
        gap_id: 'GAP-004',
        topic_area: 'retirement_planning',
        gap_title: 'NPS vs PPF vs ELSS: Best Retirement Investment Strategy 2025',
        search_volume: 9200,
        keyword_difficulty: 35,
        commercial_intent: 'High',
        competitor_weakness: 'INDmoney lacks comprehensive comparison matrix',
        our_competitive_edge: 'Retirement calculator with inflation adjustment',
        estimated_ranking_time: '60-75 days',
        priority_score: 94,
        primary_keyword: 'nps vs ppf vs elss',
        secondary_keywords: 'retirement planning india,pension schemes,long term investment',
        content_type_recommendation: 'ymyl',
        word_count_target: 2800,
        expert_required: 'true',
        regulatory_compliance: 'SEBI disclosure,PFRDA guidelines',
        quick_win: 'false',
        authority_builder: 'true',
        approval_status: 'Pending'
      },
      {
        gap_id: 'GAP-005',
        topic_area: 'personal_finance',
        gap_title: 'Emergency Fund Calculator: How Much Should You Save in 2025?',
        search_volume: 4500,
        keyword_difficulty: 18,
        commercial_intent: 'Medium',
        competitor_weakness: 'PaytmMoney has basic calculator without personalization',
        our_competitive_edge: 'AI-powered emergency fund calculator with expense tracking',
        estimated_ranking_time: '20-30 days',
        priority_score: 85,
        primary_keyword: 'emergency fund calculator',
        secondary_keywords: 'emergency fund amount,financial planning,savings calculator',
        content_type_recommendation: 'blog',
        word_count_target: 1800,
        expert_required: 'false',
        regulatory_compliance: 'Financial advice disclaimer',
        quick_win: 'true',
        authority_builder: 'false',
        approval_status: 'Pending'
      }
    ];

    return sampleGaps;
  }

  /**
   * Generate sample topics from research gaps
   */
  generateSampleTopics() {
    const sampleTopics = [
      {
        topic_id: 'TOPIC-20251005-001',
        research_gap_id: 'GAP-001',
        content_type: 'ymyl',
        topic_title: 'Index Funds vs Mutual Funds 2025: Complete Comparison Guide',
        category: 'mutual_funds',
        primary_keyword: 'index funds vs mutual funds',
        secondary_keywords: 'best index funds 2025,index fund calculator,passive investing india',
        search_volume: 12000,
        keyword_difficulty: 28,
        priority: 'High',
        topic_type: 'authority_builder',
        target_competitor: 'Groww',
        our_competitive_advantage: 'Include 2025 expense ratio data, interactive calculator, video comparisons, expert CFA quotes',
        word_count_target: 2500,
        expert_required: 'true',
        estimated_ranking_time: 60,
        estimated_monthly_traffic: 8500,
        internal_linking_opportunities: 'passive-investing-guide,sip-calculator,mutual-fund-taxation',
        content_upgrade_idea: 'Interactive Index Fund vs Mutual Fund Calculator with expense ratio comparison',
        regulatory_requirements: 'SEBI disclaimer,Risk warning,Past performance disclaimer',
        approval_status: 'Pending'
      },
      {
        topic_id: 'TOPIC-20251005-002',
        research_gap_id: 'GAP-002',
        content_type: 'ymyl',
        topic_title: 'ELSS vs Tax-Saving FDs: Which Saves More Tax in 2025?',
        category: 'tax_planning',
        primary_keyword: 'elss vs tax saving fd',
        secondary_keywords: 'tax saving options,80c investments,elss benefits',
        search_volume: 8500,
        keyword_difficulty: 32,
        priority: 'High',
        topic_type: 'quick_win',
        target_competitor: 'ETMoney',
        our_competitive_advantage: 'Interactive tax calculator with real scenarios and inflation impact',
        word_count_target: 2200,
        expert_required: 'true',
        estimated_ranking_time: 45,
        estimated_monthly_traffic: 6200,
        internal_linking_opportunities: 'tax-planning-guide,elss-calculator,investment-options',
        content_upgrade_idea: 'Tax Savings Calculator with 80C optimization',
        regulatory_requirements: 'SEBI disclaimer,Tax disclaimer',
        approval_status: 'Pending'
      },
      {
        topic_id: 'TOPIC-20251005-003',
        research_gap_id: 'GAP-003',
        content_type: 'blog',
        topic_title: 'Small Cap vs Mid Cap vs Large Cap Funds: 2025 Performance Analysis',
        category: 'stock_market',
        primary_keyword: 'small cap vs mid cap vs large cap',
        secondary_keywords: 'market cap funds,equity fund types,cap size investing',
        search_volume: 6800,
        keyword_difficulty: 25,
        priority: 'Medium',
        topic_type: 'quick_win',
        target_competitor: 'Zerodha',
        our_competitive_advantage: 'Real-time performance comparison with interactive charts',
        word_count_target: 2000,
        expert_required: 'false',
        estimated_ranking_time: 35,
        estimated_monthly_traffic: 4800,
        internal_linking_opportunities: 'equity-funds-guide,market-analysis,fund-selection',
        content_upgrade_idea: 'Market Cap Fund Comparison Tool with risk assessment',
        regulatory_requirements: 'Risk warning',
        approval_status: 'Pending'
      }
    ];

    return sampleTopics;
  }

  /**
   * Create demo data
   */
  async createDemoData() {
    console.log('\n🎭 CREATING DEMO DATA');
    console.log('='.repeat(40));

    try {
      // Initialize CSV files
      this.csvManager.initializeCSVFiles();

      // Generate and save research gaps
      const researchGaps = this.generateSampleResearchGaps();
      const gapsSaved = this.csvManager.saveResearchGaps(researchGaps);

      if (gapsSaved) {
        console.log(`✅ Created ${researchGaps.length} sample research gaps`);
      }

      // Generate and save topics
      const topics = this.generateSampleTopics();
      const topicsSaved = this.csvManager.saveGeneratedTopics(topics);

      if (topicsSaved) {
        console.log(`✅ Created ${topics.length} sample topics`);
      }

      console.log('\n📊 DEMO DATA SUMMARY:');
      console.log(`   Research Gaps: ${researchGaps.length} created`);
      console.log(`   Topics: ${topics.length} created`);
      console.log(`   High Priority Gaps: ${researchGaps.filter(g => parseInt(g.priority_score) >= 90).length}`);
      console.log(`   Quick Win Topics: ${topics.filter(t => t.topic_type === 'quick_win').length}`);
      console.log(`   Authority Builders: ${topics.filter(t => t.topic_type === 'authority_builder').length}`);

      console.log('\n🎯 NEXT STEPS:');
      console.log('   1. Review data/research-gaps.csv');
      console.log('   2. Review data/generated-topics.csv');
      console.log('   3. Approve items by setting approval_status = "Yes"');
      console.log('   4. Or run: node main.js research --auto-approve');

      console.log('\n✅ Demo data created successfully!');
      return true;

    } catch (error) {
      console.error('❌ Demo data creation failed:', error.message);
      throw error;
    }
  }

  /**
   * Auto-approve demo data
   */
  autoApproveDemoData() {
    console.log('\n🤖 AUTO-APPROVING DEMO DATA');
    console.log('='.repeat(40));

    // Approve all research gaps
    const gaps = this.csvManager.readCSV(this.csvManager.files.researchGaps);
    gaps.forEach(gap => {
      this.csvManager.updateApprovalStatus('researchGaps', 'gap_id', gap.gap_id, 'Yes');
    });

    // Approve all topics
    const topics = this.csvManager.readCSV(this.csvManager.files.generatedTopics);
    topics.forEach(topic => {
      this.csvManager.updateApprovalStatus('generatedTopics', 'topic_id', topic.topic_id, 'Yes');
    });

    console.log(`✅ Auto-approved ${gaps.length} research gaps`);
    console.log(`✅ Auto-approved ${topics.length} topics`);
    console.log('\n🎉 Demo data is ready for content creation!');

    return true;
  }
}

module.exports = DemoDataGenerator;

// CLI usage
if (require.main === module) {
  const command = process.argv[2];
  const generator = new DemoDataGenerator();

  switch (command) {
    case 'create':
      generator.createDemoData()
        .then(() => {
          console.log('🎉 Demo data creation completed!');
          process.exit(0);
        })
        .catch((error) => {
          console.error('❌ Demo data creation failed:', error.message);
          process.exit(1);
        });
      break;

    case 'approve':
      generator.autoApproveDemoData();
      console.log('✅ Demo data auto-approval completed!');
      break;

    case 'full':
      generator.createDemoData()
        .then(() => {
          generator.autoApproveDemoData();
          console.log('🎉 Complete demo setup finished!');
          process.exit(0);
        })
        .catch((error) => {
          console.error('❌ Demo setup failed:', error.message);
          process.exit(1);
        });
      break;

    default:
      console.log('Usage: node demo-data-generator.js [create|approve|full]');
      console.log('');
      console.log('Commands:');
      console.log('  create   - Create sample research gaps and topics');
      console.log('  approve  - Auto-approve all demo data');
      console.log('  full     - Create and auto-approve demo data');
  }
}
