#!/usr/bin/env node

/**
 * Enhanced Bulk Generator - Main Entry Point
 * Implements N8N-style AI workflow for content domination
 * Uses Groq/compound model for research and topic generation
 */

// Resolve module paths for Vercel deployment (must be first)
require('./module-resolver');

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const WorkflowOrchestrator = require('./core/workflow-orchestrator');
const CSVDataManager = require('./core/csv-data-manager');
const { getGoogleCredentials } = require('./utils/google-credentials');

const ENV_FILES = ['.env', '.env.local'];
ENV_FILES.forEach((file) => {
  const fullPath = path.resolve(__dirname, file);
  if (fs.existsSync(fullPath)) {
    dotenv.config({ path: fullPath, override: false });
  }
});

// Initialize Google credentials (Railway support)
getGoogleCredentials();

// Configuration
const CONFIG = {
  // AI Models with browser search capabilities
  models: {
    primary: 'groq/compound',                    // Fast compound model
    compoundMini: 'groq/compound-mini',          // Backup compound model
    browserSearch20B: 'openai/gpt-oss-20b',     // Browser search 20B model
    browserSearch120B: 'openai/gpt-oss-120b',   // Browser search 120B model
    gemini: 'gemini-2.5-pro',                   // Google Gemini model
    fallback: 'meta-llama/llama-4-maverick-17b-128e-instruct' // Latest Llama model
  },

  // Workflow settings
  batchSize: 50,
  autoApprove: false,
  qualityThreshold: 90,
  delayBetweenStages: 2000,
  contentBatchSize: 3,
  contentBatchSize: 1,
  deepResearchLimit: null,
  contentLimit: null,
  topicLimit: null,
  publicationLimit: null,

  // Target competitors
  competitors: [
    'Groww.in',
    'Zerodha.com/varsity',
    'ETMoney.com',
    'PaytmMoney.com',
    'INDmoney.com'
  ],

  // Content strategy
  contentStrategy: {
    quickWins: 20,        // 30-60 day ranking targets
    authorityBuilders: 20, // 3-6 month authority content
    competitiveStrikes: 10 // Direct competitor targeting
  }
};

class EnhancedBulkGenerator {
  constructor(config = {}) {
    this.config = { ...CONFIG, ...config };
    this.config.topicLimit = this.config.topicLimit ?? null;
    this.config.deepResearchLimit = this.config.deepResearchLimit ?? this.config.topicLimit ?? null;
    this.config.contentLimit = this.config.contentLimit ?? this.config.topicLimit ?? null;
    this.config.publicationLimit = this.config.publicationLimit ?? this.config.contentLimit ?? this.config.topicLimit ?? null;
    this.orchestrator = new WorkflowOrchestrator(this.config);
    this.csvManager = new CSVDataManager();

    console.log('🚀 Enhanced Bulk Generator Initialized');
    console.log(`🤖 Primary Model: ${this.config.models.primary} (native web search)`);
    console.log(`🔄 Backup Models: ${this.config.models.compoundMini}, ${this.config.models.browserSearch20B}, ${this.config.models.browserSearch120B}, ${this.config.models.gemini}, ${this.config.models.fallback}`);
    console.log(`📊 Batch Size: ${this.config.batchSize}`);
    console.log(`📂 Category Focus: ${this.config.category}`);

    // Debug logging for limits
    if (this.config.topicLimit !== null || this.config.deepResearchLimit !== null || this.config.contentLimit !== null) {
      console.log(`📊 Topic Limit: ${this.config.topicLimit}`);
      console.log(`🔍 Deep Research Limit: ${this.config.deepResearchLimit}`);
      console.log(`📝 Content Limit: ${this.config.contentLimit}`);
      console.log(`🚀 Publication Limit: ${this.config.publicationLimit}`);
    }
  }

  /**
   * Display banner and system info
   */
  displayBanner() {
    console.log('\n' + '='.repeat(80));
    console.log('🚀 ENHANCED BULK GENERATOR - N8N AI WORKFLOW IMPLEMENTATION');
    console.log('='.repeat(80));
    console.log('🎯 Goal: Content Domination for 1M Monthly Visitors');
    console.log('🤖 AI: Multi-model approach with browser search capabilities');
    console.log('📊 Strategy: 7-stage workflow with CSV-based approval gates');
    console.log('🏢 Target: Indian WealthTech competitive intelligence');
    console.log('🌐 Browser Search: Real-time competitor data via Groq OSS models');
    console.log('='.repeat(80));

    console.log('\n📋 WORKFLOW STAGES:');
    console.log('   1. 🔍 Master SEO Research (100 content gaps)');
    console.log('   2. 🎯 Topic Generation (50 strategic topics)');
    console.log('   3. 📊 Deep Topic Research (competitor analysis)');
    console.log('   4. ✍️  Content Creation (E-E-A-T compliant)');
    console.log('   5. 🔧 SEO Optimization (metadata, schema)');
    console.log('   6. 🚀 Publication (WordPress + Sanity)');
    console.log('   7. 🔄 Completion & Loop (continuous cycle)');

    console.log('\n📊 CURRENT IMPLEMENTATION STATUS:');
    console.log('   ✅ Stage 1: Master SEO Research (automated)');
    console.log('   ✅ Stage 2: Topic Generation (automated)');
    console.log('   ✅ Stage 3: Deep Topic Research (approval-driven)');
    console.log('   ✅ Stage 4: Content Creation (draft generation)');
    console.log('   ✅ Stage 5: SEO Optimization (metadata enrichment)');
    console.log('   ✅ Stage 6: Publication (WordPress & Sanity ready)');
    console.log('   ✅ Stage 7: Workflow Orchestration (continuous loop)');

    console.log('\n' + '='.repeat(80) + '\n');
  }

  /**
   * Initialize the system
   */
  async initialize() {
    console.log('🔧 Initializing Enhanced Bulk Generator...');

    // Check environment variables (warning only)
    if (!process.env.GROQ_API_KEY) {
      console.warn('⚠️  GROQ_API_KEY environment variable not set!');
      console.log('Please set it with: export GROQ_API_KEY="your-api-key"');
      console.log('AI features will be disabled until API key is provided.\n');
    }

    // Initialize CSV files
    this.csvManager.initializeCSVFiles();

    // Display current stats
    const stats = this.csvManager.getWorkflowStats();
    if (stats.totalResearchGaps > 0 || stats.totalTopics > 0) {
      console.log('\n📊 EXISTING DATA FOUND:');
      console.log(`   Research Gaps: ${stats.totalResearchGaps} (${stats.approvedResearchGaps} approved)`);
      console.log(`   Topics: ${stats.totalTopics} (${stats.approvedTopics} approved)`);
      console.log(`   Content: ${stats.createdContent} pieces`);
    }

    console.log('✅ System initialized successfully\n');
  }

  /**
   * Execute research phase (Stages 1-2)
   */
  async executeResearchPhase() {
    console.log('📍 EXECUTING RESEARCH PHASE (Stages 1-2)');
    console.log('-'.repeat(50));

    try {
      // Stage 1: Master SEO Research
      await this.orchestrator.executeStage('research');

      // Stage 2: Topic Generation
      await this.orchestrator.executeStage('topics');

      console.log('✅ Research Phase completed successfully!');
      console.log('\n📋 RESEARCH PHASE SUMMARY:');

      const stats = this.csvManager.getWorkflowStats();
      console.log(`   🔍 Research Gaps: ${stats.totalResearchGaps} identified`);
      console.log(`   ✅ Approved Gaps: ${stats.approvedResearchGaps}`);
      console.log(`   🎯 Topics Generated: ${stats.totalTopics}`);
      console.log(`   ✅ Approved Topics: ${stats.approvedTopics}`);

      console.log('\n🎯 NEXT STEPS:');
      console.log('   1. Review data/research-gaps.csv and approve promising gaps');
      console.log('   2. Review data/generated-topics.csv and approve strategic topics');
      console.log('   3. Run content creation phase when ready');

      return true;

    } catch (error) {
      console.error('❌ Research Phase failed:', error.message);
      throw error;
    }
  }

  /**
   * Execute content creation phase (Stages 3-4)
   */
  async executeContentPhase() {
    console.log('📍 EXECUTING CONTENT PHASE (Stages 3-4)');
    console.log('-'.repeat(50));

    const stats = this.csvManager.getWorkflowStats();
    if (stats.approvedTopics === 0) {
      throw new Error('No approved topics found. Complete research phase first.');
    }

    console.log(`✅ Found ${stats.approvedTopics} approved topics for content creation`);
    console.log('🔬 Running deep research and content drafting pipeline...');

    // Stage 3: Deep Topic Research
    await this.orchestrator.executeStage('deep-research', {
      limit: this.config.deepResearchLimit
    });

    // Stage 4: Content Creation
    await this.orchestrator.executeStage('content', {
      limit: this.config.contentLimit
    });

    const postStats = this.csvManager.getWorkflowStats();

    console.log('\n📋 CONTENT PHASE SUMMARY:');
    console.log(`   🔍 Deep Research Items: ${postStats.completedResearch}`);
    console.log(`   📝 Content Drafts Created: ${postStats.createdContent}`);
    console.log('   📄 Review files: data/topic-research.csv & data/created-content.csv');
    console.log('   🏁 Update approval_status to "Yes" / "SEO-Ready" where manual review is required.');

    console.log('\n✅ Content Phase completed!');
    return true;
  }

  async executeAutoWorkflow() {
    await this.initialize();
    this.displayBanner();

    console.log('\n=== 🚀 Auto Workflow: Research Phase ===');
    await this.executeResearchPhase();

    console.log('\n=== 🚀 Auto Workflow: Deep Research ===');
    await this.orchestrator.executeStage('deep-research', {
      limit: this.config.deepResearchLimit
    });

    console.log('\n=== 🚀 Auto Workflow: Content Creation ===');
    await this.orchestrator.executeStage('content', {
      limit: this.config.contentLimit
    });

    console.log('\n=== 🚀 Auto Workflow: SEO Optimization ===');
    await this.orchestrator.executeStage('seo');

    console.log('\n=== 🚀 Auto Workflow: Publication ===');
    await this.orchestrator.executeStage('publication', {
      limit: this.config.publicationLimit
    });

    console.log('\n=== 🚀 Auto Workflow: Completion ===');
    await this.orchestrator.executeStage('completion');
  }

  /**
   * Execute publication phase (Stages 5-6)
   */
  async executePublicationPhase() {
    console.log('📍 EXECUTING PUBLICATION PHASE (Stages 5-6)');
    console.log('-'.repeat(50));

    // Stage 5: SEO Optimization
    await this.orchestrator.executeStage('seo');

    // Stage 6: Publication
    await this.orchestrator.executeStage('publication', {
      limit: this.config.publicationLimit
    });

    const postStats = this.csvManager.getWorkflowStats();

    console.log('\n📋 PUBLICATION PHASE SUMMARY:');
    console.log(`   📑 Created Content: ${postStats.createdContent}`);
    console.log(`   🚀 Published Content: ${postStats.publishedContent}`);
    console.log('   📂 Review data/created-content.csv and data/published-content.csv for URLs');
    console.log('   ⚙️  Missing credentials? Configure WP_* and SANITY_* env vars to switch from simulated to live publishing.');

    console.log('\n✅ Publication Phase completed!');
    return true;
  }

  /**
   * Execute full workflow
   */
  async executeFullWorkflow() {
    await this.initialize();
    this.displayBanner();

    console.log('🚀 STARTING FULL N8N AI WORKFLOW');
    console.log('='.repeat(50));

    try {
      // Execute all phases
      await this.executeResearchPhase();
      await this.executeContentPhase();
      await this.executePublicationPhase();

      // Completion stage
      await this.orchestrator.executeStage('completion');

      console.log('\n🎉 FULL WORKFLOW COMPLETED SUCCESSFULLY!');
      console.log('🔄 System ready for continuous content domination cycle');

      return true;

    } catch (error) {
      console.error('❌ Full workflow failed:', error.message);
      throw error;
    }
  }

  /**
   * Show help information
   */
  showHelp() {
    console.log('Enhanced Bulk Generator - N8N AI Workflow Implementation');
    console.log('');
    console.log('USAGE:');
    console.log('  node main.js [command] [options]');
    console.log('');
    console.log('COMMANDS:');
    console.log('  init                    - Initialize system and CSV files');
    console.log('  research               - Execute research phase (stages 1-2)');
    console.log('  content                - Execute content phase (stages 3-4)');
    console.log('  publish                - Execute publication phase (stages 5-6)');
    console.log('  full                   - Execute complete workflow (all stages)');
    console.log('  auto                   - Auto-run workflow stage-by-stage');
    console.log('  stage <name>           - Execute specific stage');
    console.log('  monitor                - Monitor workflow progress');
    console.log('  status                 - Show current system status');
    console.log('  help                   - Show this help message');
    console.log('');
    console.log('STAGE NAMES:');
    console.log('  research, topics, deep-research, content, seo, publication, completion');
    console.log('');
    console.log('OPTIONS:');
    console.log('  --auto-approve         - Auto-approve high-priority items');
    console.log('  --batch-size=N         - Set batch size (default: 50)');
    console.log('  --quality=N            - Set quality threshold (default: 90)');
    console.log('  --topic-limit=N        - Limit topics processed during deep research');
    console.log('  --category=NAME        - Focus on specific content category (default: derivatives)');
    console.log('');
    console.log('EXAMPLES:');
    console.log('  node main.js research --auto-approve');
    console.log('  node main.js full --batch-size=25 --category=mutual_funds');
    console.log('  node main.js auto --auto-approve --category=stock_market');
    console.log('  node main.js stage topics --category=commodities');
    console.log('  node main.js monitor');
    console.log('');
    console.log('ENVIRONMENT VARIABLES:');
    console.log('  GROQ_API_KEY          - Required for AI content generation');
    console.log('  OPENAI_API_KEY        - Optional for advanced features');
  }
}

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const command = args[0] || 'help';

  const topicLimit = (() => {
    const limitArg = args.find(arg => arg.startsWith('--topic-limit=')) || args.find(arg => arg.startsWith('--limit='));
    if (!limitArg) return null;
    const value = parseInt(limitArg.split('=')[1], 10);
    return Number.isFinite(value) && value > 0 ? value : null;
  })();

  const category = (() => {
    const categoryArg = args.find(arg => arg.startsWith('--category='));
    return categoryArg ? categoryArg.split('=')[1] : 'derivatives';
  })();

  const options = {
    autoApprove: args.includes('--auto-approve'),
    batchSize: parseInt(args.find(arg => arg.startsWith('--batch-size='))?.split('=')[1]) || 50,
    qualityThreshold: parseInt(args.find(arg => arg.startsWith('--quality='))?.split('=')[1]) || 90,
    topicLimit,
    deepResearchLimit: topicLimit,
    contentLimit: topicLimit,
    category
  };

  return { command, options, args };
}

// Main execution
async function main() {
  const { command, options, args } = parseArgs();
  const generator = new EnhancedBulkGenerator(options);

  try {
    switch (command) {
      case 'help':
        generator.showHelp();
        break;

      case 'init':
        await generator.initialize();
        console.log('✅ System initialized successfully');
        break;

      case 'research':
        await generator.executeResearchPhase();
        break;

      case 'content':
        await generator.executeContentPhase();
        break;

      case 'publish':
        await generator.executePublicationPhase();
        break;

      case 'full':
        await generator.executeFullWorkflow();
        break;

      case 'auto':
        await generator.executeAutoWorkflow();
        break;

      case 'stage':
        const stageName = args[1];
        if (!stageName) {
          console.error('❌ Please specify stage name');
          generator.showHelp();
          process.exit(1);
        }
        const stageOptions = {};
        // Always pass limit regardless of truthiness - let the orchestrator handle null/undefined
        if (stageName === 'topics') {
          stageOptions.limit = generator.config.topicLimit;
        } else if (stageName === 'deep-research') {
          stageOptions.limit = generator.config.deepResearchLimit;
        } else if (stageName === 'content') {
          stageOptions.limit = generator.config.contentLimit;
        } else if (stageName === 'publication') {
          stageOptions.limit = generator.config.publicationLimit;
        }
        await generator.orchestrator.executeStage(stageName, stageOptions);
        break;

      case 'monitor':
        generator.orchestrator.monitorProgress();
        break;

      case 'status':
        await generator.initialize();
        generator.csvManager.generateSummaryReport();
        break;

      case 'help':
      default:
        generator.showHelp();
        break;
    }

    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Export for module usage
module.exports = EnhancedBulkGenerator;

// Run if called directly
if (require.main === module) {
  main();
}
