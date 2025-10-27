#!/usr/bin/env node

/**
 * Model Selection Utility for Enhanced Bulk Generator
 * Helps users choose the optimal Groq model based on their needs
 */

const CSVDataManager = require('./core/csv-data-manager');

class ModelSelector {
  constructor() {
    this.csvManager = new CSVDataManager();

    this.models = {
      'groq/compound': {
        name: 'Groq Compound',
        type: 'primary',
        browserSearch: false,
        webSearch: true,
        speed: 'very_fast',
        cost: 'low',
        useCase: 'Fast content generation with native web search',
        bestFor: ['bulk_generation', 'quick_topics', 'cost_optimization', 'real_time_data'],
        limitations: ['rate_limits', 'json_parsing_issues']
      },
      'groq/compound-mini': {
        name: 'Groq Compound Mini',
        type: 'backup',
        browserSearch: false,
        webSearch: true,
        speed: 'very_fast',
        cost: 'very_low',
        useCase: 'Lightweight content generation with native web search',
        bestFor: ['bulk_generation', 'cost_optimization', 'backup_option'],
        limitations: ['smaller_context', 'json_parsing_issues']
      },
      'openai/gpt-oss-20b': {
        name: 'OpenAI GPT-OSS 20B',
        type: 'browser_search',
        browserSearch: true,
        webSearch: false,
        speed: 'medium',
        cost: 'medium',
        useCase: 'Real-time competitor analysis with web browsing',
        bestFor: ['competitor_research', 'real_time_data', 'market_validation'],
        limitations: ['slower_than_compound', 'higher_cost', 'json_complexity']
      },
      'openai/gpt-oss-120b': {
        name: 'OpenAI GPT-OSS 120B',
        type: 'browser_search_pro',
        browserSearch: true,
        webSearch: false,
        speed: 'slow',
        cost: 'high',
        useCase: 'Comprehensive web analysis and complex research',
        bestFor: ['deep_research', 'complex_analysis', 'high_quality_output'],
        limitations: ['slowest_option', 'highest_cost', 'token_intensive', 'json_complexity']
      },
      'gemini-2.5-pro': {
        name: 'Google Gemini 2.5 Pro',
        type: 'advanced',
        browserSearch: false,
        webSearch: false,
        speed: 'medium',
        cost: 'medium',
        useCase: 'Advanced reasoning and high-quality content generation',
        bestFor: ['complex_reasoning', 'high_quality_content', 'structured_output'],
        limitations: ['no_web_access', 'potential_rate_limits']
      },
      'meta-llama/llama-4-maverick-17b-128e-instruct': {
        name: 'Meta Llama 4 Maverick 17B',
        type: 'fallback',
        browserSearch: false,
        webSearch: false,
        speed: 'fast',
        cost: 'medium',
        useCase: 'Reliable fallback for general content generation',
        bestFor: ['fallback_option', 'general_content', 'reliability', 'instruction_following'],
        limitations: ['no_web_access', 'smaller_than_70b']
      }
    };
  }

  /**
   * Recommend model based on task type
   */
  recommendModel(taskType, priority = 'balanced') {
    const recommendations = {
      'competitor_research': {
        speed: 'openai/gpt-oss-20b',
        quality: 'openai/gpt-oss-120b',
        balanced: 'openai/gpt-oss-20b',
        cost: 'groq/compound'
      },
      'topic_generation': {
        speed: 'groq/compound',
        quality: 'openai/gpt-oss-20b',
        balanced: 'groq/compound',
        cost: 'groq/compound'
      },
      'bulk_processing': {
        speed: 'groq/compound',
        quality: 'groq/compound',
        balanced: 'groq/compound',
        cost: 'groq/compound'
      },
      'deep_research': {
        speed: 'openai/gpt-oss-20b',
        quality: 'openai/gpt-oss-120b',
        balanced: 'openai/gpt-oss-120b',
        cost: 'openai/gpt-oss-20b'
      },
      'real_time_validation': {
        speed: 'groq/compound',
        quality: 'openai/gpt-oss-120b',
        balanced: 'groq/compound',
        cost: 'groq/compound-mini'
      }
    };

    return recommendations[taskType]?.[priority] || 'groq/compound';
  }

  /**
   * Display model comparison table
   */
  displayModelComparison() {
    console.log('\n🤖 GROQ MODEL COMPARISON');
    console.log('='.repeat(80));
    console.log('| Model                        | Web/Browser | Speed     | Cost   | Best For                |');
    console.log('|------------------------------|-------------|-----------|--------|-------------------------|');

    Object.entries(this.models).forEach(([modelId, info]) => {
      const searchIcon = info.webSearch ? '🌐' : (info.browserSearch ? '🔍' : '❌');
      const name = info.name.padEnd(28);
      const search = searchIcon.padEnd(11);
      const speed = info.speed.replace('_', ' ').padEnd(9);
      const cost = info.cost.padEnd(6);
      const bestFor = info.bestFor[0].replace('_', ' ').padEnd(23);

      console.log(`| ${name} | ${search} | ${speed} | ${cost} | ${bestFor} |`);
    });

    console.log('='.repeat(80));
  }

  /**
   * Display detailed model information
   */
  displayModelDetails(modelId) {
    const model = this.models[modelId];
    if (!model) {
      console.log(`❌ Model ${modelId} not found`);
      return;
    }

    console.log(`\n📊 MODEL DETAILS: ${model.name}`);
    console.log('='.repeat(50));
    console.log(`🆔 Model ID: ${modelId}`);
    console.log(`🌐 Web Search: ${model.webSearch ? '✅ Native' : '❌ Not available'}`);
    console.log(`🔍 Browser Search: ${model.browserSearch ? '✅ Enabled' : '❌ Disabled'}`);
    console.log(`⚡ Speed: ${model.speed.replace('_', ' ')}`);
    console.log(`💰 Cost: ${model.cost}`);
    console.log(`🎯 Use Case: ${model.useCase}`);

    console.log('\n✅ Best For:');
    model.bestFor.forEach(use => {
      console.log(`   • ${use.replace('_', ' ')}`);
    });

    console.log('\n⚠️  Limitations:');
    model.limitations.forEach(limitation => {
      console.log(`   • ${limitation.replace('_', ' ')}`);
    });

    console.log('='.repeat(50));
  }

  /**
   * Interactive model selection wizard
   */
  async selectModelInteractive() {
    console.log('\n🧙 MODEL SELECTION WIZARD');
    console.log('='.repeat(40));

    const questions = [
      {
        question: 'What is your primary task?',
        options: [
          { key: '1', value: 'competitor_research', label: 'Competitor Research & Analysis' },
          { key: '2', value: 'topic_generation', label: 'Topic Generation' },
          { key: '3', value: 'bulk_processing', label: 'Bulk Content Processing' },
          { key: '4', value: 'deep_research', label: 'Deep Market Research' },
          { key: '5', value: 'real_time_validation', label: 'Real-time Data Validation' }
        ]
      },
      {
        question: 'What is your priority?',
        options: [
          { key: '1', value: 'speed', label: 'Speed (fastest processing)' },
          { key: '2', value: 'quality', label: 'Quality (best results)' },
          { key: '3', value: 'balanced', label: 'Balanced (good speed + quality)' },
          { key: '4', value: 'cost', label: 'Cost (lowest expense)' }
        ]
      }
    ];

    console.log('\n1️⃣  What is your primary task?');
    questions[0].options.forEach(opt => {
      console.log(`   ${opt.key}. ${opt.label}`);
    });

    // For demo purposes, simulate selection
    const taskType = 'competitor_research'; // Default selection
    const priority = 'balanced'; // Default selection

    console.log(`\n✅ Selected Task: ${taskType.replace('_', ' ')}`);
    console.log(`✅ Selected Priority: ${priority}`);

    const recommendedModel = this.recommendModel(taskType, priority);

    console.log(`\n🎯 RECOMMENDED MODEL: ${recommendedModel}`);
    this.displayModelDetails(recommendedModel);

    return recommendedModel;
  }

  /**
   * Generate usage examples for each model
   */
  generateUsageExamples() {
    console.log('\n📚 USAGE EXAMPLES');
    console.log('='.repeat(50));

    console.log('\n🚀 Fast Bulk Generation (Groq Compound):');
    console.log('   node main.js research --model=groq/compound');
    console.log('   # Best for: High-volume content generation');

    console.log('\n🌐 Real-time Research (Browser Search 20B):');
    console.log('   node main.js research --model=openai/gpt-oss-20b');
    console.log('   # Best for: Live competitor analysis');

    console.log('\n🔬 Deep Analysis (Browser Search 120B):');
    console.log('   node main.js research --model=openai/gpt-oss-120b');
    console.log('   # Best for: Comprehensive market research');

    console.log('\n🔄 Reliable Fallback (Llama 3.1):');
    console.log('   node main.js research --model=llama-3.1-70b-versatile');
    console.log('   # Best for: When other models are unavailable');

    console.log('\n💡 Auto-Selection (Recommended):');
    console.log('   node main.js research');
    console.log('   # System automatically tries models in optimal order');
  }

  /**
   * Show current system model configuration
   */
  showCurrentConfig() {
    console.log('\n⚙️  CURRENT SYSTEM CONFIGURATION');
    console.log('='.repeat(50));
    console.log('🔄 Model Fallback Order:');
    console.log('   1. groq/compound (Primary - Fast with native web search)');
    console.log('   2. groq/compound-mini (Backup - Lightweight with web search)');
    console.log('   3. openai/gpt-oss-20b (Browser Search)');
    console.log('   4. openai/gpt-oss-120b (Browser Search Pro)');
    console.log('   5. gemini-2.5-pro (Advanced Reasoning)');
    console.log('   6. meta-llama/llama-4-maverick-17b-128e-instruct (Reliable Fallback)');

    console.log('\n🌐 Search Capabilities:');
    console.log('   ✅ Native web search (Compound models)');
    console.log('   ✅ Interactive browser search (GPT-OSS models)');
    console.log('   ✅ India-focused search settings');
    console.log('   ✅ Competitor domain targeting');

    console.log('\n📊 Automatic Features:');
    console.log('   🔄 Model fallback on failures');
    console.log('   ⏳ Rate limit handling');
    console.log('   🔁 Retry logic with backoff');
    console.log('   📈 Performance optimization');
  }
}

module.exports = ModelSelector;

// CLI usage
if (require.main === module) {
  const command = process.argv[2];
  const selector = new ModelSelector();

  switch (command) {
    case 'compare':
      selector.displayModelComparison();
      break;

    case 'details':
      const modelId = process.argv[3];
      if (!modelId) {
        console.log('Usage: node model-selector.js details <model-id>');
        console.log('Available models: groq/compound, openai/gpt-oss-20b, openai/gpt-oss-120b, llama-3.1-70b-versatile');
        break;
      }
      selector.displayModelDetails(modelId);
      break;

    case 'recommend':
      const taskType = process.argv[3];
      const priority = process.argv[4] || 'balanced';
      if (!taskType) {
        console.log('Usage: node model-selector.js recommend <task-type> [priority]');
        console.log('Task types: competitor_research, topic_generation, bulk_processing, deep_research, real_time_validation');
        console.log('Priorities: speed, quality, balanced, cost');
        break;
      }
      const recommended = selector.recommendModel(taskType, priority);
      console.log(`🎯 Recommended model for ${taskType} (${priority}): ${recommended}`);
      selector.displayModelDetails(recommended);
      break;

    case 'wizard':
      selector.selectModelInteractive();
      break;

    case 'examples':
      selector.generateUsageExamples();
      break;

    case 'config':
      selector.showCurrentConfig();
      break;

    default:
      console.log('🤖 Groq Model Selection Utility');
      console.log('');
      console.log('USAGE:');
      console.log('  node model-selector.js [command] [options]');
      console.log('');
      console.log('COMMANDS:');
      console.log('  compare                     - Show model comparison table');
      console.log('  details <model-id>          - Show detailed model information');
      console.log('  recommend <task> [priority] - Get model recommendation');
      console.log('  wizard                      - Interactive model selection');
      console.log('  examples                    - Show usage examples');
      console.log('  config                      - Show current system configuration');
      console.log('');
      console.log('EXAMPLES:');
      console.log('  node model-selector.js compare');
      console.log('  node model-selector.js details openai/gpt-oss-20b');
      console.log('  node model-selector.js recommend competitor_research quality');
      console.log('  node model-selector.js wizard');
  }
}
