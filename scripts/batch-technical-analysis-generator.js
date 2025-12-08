#!/usr/bin/env node

/**
 * Batch Technical Analysis Content Generator
 * Generates markdown and HTML articles for a list of technical analysis topics
 */

const fs = require('fs');
const path = require('path');
const ContentCreator = require('../frontend/backend/content/content-creator');
const MarkdownToHtmlConverter = require('./markdown-to-html-converter');

class BatchTechnicalAnalysisGenerator {
  constructor() {
    this.topics = [
      "What is Technical Analysis?",
      "What is DuPont Analysis?",
      "What is a Chart Pattern?",
      "What is a Candle Pattern Chart?",
      "What is Scalping Trading?",
      "What is Swing Trading?",
      "What is FVG in Trading?",
      "Difference Between NSE and BSE",
      "ETF vs Index Fund",
      "What is Sensex and Nifty?",
      "What is a Share?",
      "What is Mutual Fund?",
      "What is ETF?",
      "What is Nifty Lot Size?",
      "What is Dividend?",
      "What is Share Capital?",
      "What is Stop Loss?",
      "What is HUF?",
      "Top Index Funds in India",
      "What is Coffee Can Investing?",
      "What is Annuity?",
      "What are Debentures?",
      "What is an IPO Prospectus?",
      "AI Stocks in India",
      "Navratna Companies in India",
      "What is FII?",
      "What is CMP?",
      "What is AIF?",
      "What is SIF?",
      "What is Short Covering?",
      "What is SME IPO?",
      "What is GIFT Nifty?",
      "What is Nifty 50?",
      "What is NASDAQ?",
      "What is Sensex?",
      "What is AUM?"
    ];

    this.markdownDir = path.join(__dirname, '../docs/articles/technical analysis');
    this.htmlDir = path.join(__dirname, '../docs/html_articles/technical analysis');
    this.logsDir = path.join(__dirname, '../logs');
    this.researchLogFile = path.join(this.logsDir, 'research-verification.log');
    this.contentCreator = new ContentCreator({
      minWordCount: 2400,
      generateImages: false // Skip image generation for batch processing
    });
  }

  /**
   * Create output directories if they don't exist
   */
  ensureDirectories() {
    [this.markdownDir, this.htmlDir, this.logsDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`✅ Created directory: ${dir}`);
      }
    });
  }

  /**
   * Log research verification to file
   */
  logResearchVerification(topic, topicId, researchVerification) {
    if (!researchVerification || researchVerification === 'N/A - Fallback mode (JSON parsing failed)') {
      return;
    }

    const timestamp = new Date().toISOString();
    const separator = '='.repeat(80);
    const logEntry = `
${separator}
TOPIC: ${topic}
TOPIC ID: ${topicId}
TIMESTAMP: ${timestamp}
${separator}

${researchVerification}

${separator}

`;

    try {
      fs.appendFileSync(this.researchLogFile, logEntry, 'utf-8');
      console.log(`   📝 Research logged to: ${this.researchLogFile}`);
    } catch (error) {
      console.error(`   ⚠️  Failed to write research log: ${error.message}`);
    }
  }

  /**
   * Generate a slug from topic title
   */
  generateSlug(title) {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  /**
   * Create a research object for a topic
   */
  createResearchObject(topic, index, customOutline = null, keywordMentions = null) {
    const slug = this.generateSlug(topic);
    const topicId = `TA-${String(index + 1).padStart(3, '0')}`;

    // Use custom outline if provided, otherwise use default
    const outline = customOutline || `
## Summary
Brief overview of ${topic} and its importance

## Introduction
Detailed explanation of ${topic}

## How ${topic} Works
Step-by-step breakdown with examples

## ${topic} in Indian Markets
India-specific context and applications

## Benefits and Limitations
Pros and cons analysis

## Practical Examples
Real-world scenarios and case studies

## Key Takeaways
Action-oriented summary points

## Action Plan
Monthly roadmap for implementation

## Conclusion
Summary with CTA

## FAQs
5 frequently asked questions
      `.trim();

    const researchObject = {
      topic_id: topicId,
      primary_keyword: topic,
      topic_area: 'technical_analysis',
      search_intent: 'informational',
      target_audience: 'Indian investors and traders',
      content_gaps: `Comprehensive guide on ${topic} with Indian market context, practical examples, and actionable insights`,
      top_10_competitors: 'Zerodha Varsity, Groww Learn, Investopedia, NSE Academy',
      related_questions: [
        `What is ${topic}?`,
        `How does ${topic} work?`,
        `${topic} benefits and limitations`,
        `${topic} in Indian context`
      ],
      content_superiority_plan: `Create the most comprehensive ${topic} guide for Indian investors with real-world examples, regulatory context, and step-by-step guidance`,
      resource_requirements: 'Market data, regulatory references, case studies',
      regulatory_compliance: 'SEBI/RBI compliance, risk disclaimers, factual accuracy',
      estimated_impact: 'High - foundational knowledge for investors',
      content_outline: outline,
      custom_outline_provided: !!customOutline,
      created_at: new Date().toISOString(),
      approval_status: 'Approved'
    };

    // Add target_keyword_mentions if provided
    if (keywordMentions) {
      researchObject.target_keyword_mentions = keywordMentions;
    }

    return researchObject;
  }

  /**
   * Extract FAQs from article content
   */
  extractFAQs(articleContent) {
    const faqs = [];
    // Fixed regex: Use [\s\S] instead of . to match multi-line answers
    const faqRegex = /###\s+(.+?)\n\n?([\s\S]+?)(?=\n###|\n##|\n---|\n\n---|$)/gs;

    // Check if there's a FAQ section (match until --- separator or next ## heading)
    const faqSectionMatch = articleContent.match(/##\s+FAQs?.*?\n([\s\S]*?)(?=\n---|##\s+SEO Metadata|$)/i);

    if (faqSectionMatch) {
      const faqSection = faqSectionMatch[1];
      let match;

      while ((match = faqRegex.exec(faqSection)) !== null) {
        const question = match[1].trim();
        const answer = match[2].trim().replace(/\n\n/g, ' ').replace(/\n/g, ' ');

        if (question && answer) {
          faqs.push({
            question: question,
            answer: answer
          });
        }
      }
    }

    return faqs;
  }

  /**
   * Generate FAQ Schema JSON-LD
   */
  generateFAQSchema(faqs, url) {
    if (!faqs || faqs.length === 0) {
      return '';
    }

    const schema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": faqs.map(faq => ({
        "@type": "Question",
        "name": faq.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": faq.answer
        }
      }))
    };

    return `\n### FAQ Schema (JSON-LD)\n\`\`\`html\n<script type="application/ld+json">\n${JSON.stringify(schema, null, 2)}\n</script>\n\`\`\`\n\n`;
  }

  /**
   * Format content as markdown file with SEO metadata
   */
  formatMarkdown(content, research) {
    const { article_content, compliance, research_log } = content;

    // Parse seo_metadata from JSON string
    let seo_metadata;
    try {
      seo_metadata = content.__seo || (typeof content.seo_metadata === 'string'
        ? JSON.parse(content.seo_metadata)
        : content.seo_metadata);
    } catch (error) {
      console.warn('⚠️  Failed to parse seo_metadata, using defaults');
      seo_metadata = {};
    }

    let markdown = '';

    // Add H1 title (only at top of file)
    if (seo_metadata?.title) {
      markdown += `# ${seo_metadata.title}\n\n`;
    }

    // Add RESEARCH VERIFICATION section (BEFORE Summary)
    if (research_log && research_log !== 'N/A - Fallback mode (JSON parsing failed)') {
      markdown += `### RESEARCH VERIFICATION\n\n${research_log}\n\n---\n\n`;
    }

    // Add article content (starts with ## Summary)
    markdown += article_content || '';

    // Add compliance/disclaimer at the end
    if (compliance) {
      markdown += `\n\n---\n\n${compliance}`;
    }

    // Add SEO metadata section
    markdown += '\n\n---\n\n## SEO Metadata\n\n';

    if (seo_metadata?.title) {
      markdown += `### SEO Meta Title\n\`\`\`\n${seo_metadata.title}\n\`\`\`\n\n`;
    }

    if (seo_metadata?.meta_description) {
      markdown += `### SEO Meta Description\n\`\`\`\n${seo_metadata.meta_description}\n\`\`\`\n\n`;
    }

    if (seo_metadata?.focus_keyphrase) {
      markdown += `### Focus Keyword\n\`\`\`\n${seo_metadata.focus_keyphrase}\n\`\`\`\n\n`;
    }

    if (seo_metadata?.secondary_keywords && seo_metadata.secondary_keywords.length > 0) {
      markdown += `### Secondary Keywords\n\`\`\`\n${seo_metadata.secondary_keywords.join(', ')}\n\`\`\`\n\n`;
    }

    // Add canonical URL
    const slug = this.generateSlug(research.primary_keyword);
    const canonicalUrl = `https://www.plindia.com/blog/${slug}`;
    markdown += `### SEO Optimized URL\n\`\`\`\n${canonicalUrl}\n\`\`\`\n\n`;

    // Extract and add FAQ schema if FAQs exist
    const faqs = this.extractFAQs(article_content);
    if (faqs.length > 0) {
      markdown += this.generateFAQSchema(faqs, canonicalUrl);
    }

    return markdown;
  }

  /**
   * Save markdown content to file
   */
  saveMarkdown(content, research, index) {
    const slug = this.generateSlug(research.primary_keyword);
    const filename = `${slug}.md`;
    const filepath = path.join(this.markdownDir, filename);

    const markdown = this.formatMarkdown(content, research);
    fs.writeFileSync(filepath, markdown, 'utf-8');

    console.log(`   ✅ Saved markdown: ${filename}`);
    return filepath;
  }

  /**
   * Convert all markdown files to HTML
   */
  convertToHtml() {
    console.log('\n🔄 Converting markdown to HTML...\n');

    const converter = new MarkdownToHtmlConverter({
      articlesDir: this.markdownDir,
      outputDir: this.htmlDir
    });

    converter.convertAll();
  }

  /**
   * Generate content for a single topic (for testing)
   */
  async generateSingle(topicTitle, customOutline = null, keywordMentions = null) {
    console.log('\n🚀 SINGLE TOPIC CONTENT GENERATOR');
    console.log('='.repeat(70));
    console.log(`📝 Topic: "${topicTitle}"`);
    console.log(`📁 Markdown output: ${this.markdownDir}`);
    console.log(`📁 HTML output: ${this.htmlDir}`);
    if (customOutline) {
      console.log(`📋 Custom outline: Provided`);
    }
    if (keywordMentions) {
      console.log(`🎯 Target keyword mentions: ${keywordMentions}`);
    }
    console.log('='.repeat(70));

    // Ensure directories exist
    this.ensureDirectories();

    // Find topic index
    const topicIndex = this.topics.findIndex(t => t.toLowerCase() === topicTitle.toLowerCase());
    const index = topicIndex >= 0 ? topicIndex : 0;

    const results = {
      total: 1,
      successful: 0,
      failed: 0,
      errors: []
    };

    try {
      console.log(`\n📝 Processing: "${topicTitle}"`);

      // Create research object
      const research = this.createResearchObject(topicTitle, index, customOutline, keywordMentions);
      console.log(`   🔬 Created research object: ${research.topic_id}`);

      // Generate content using AI
      console.log(`   🤖 Generating content with AI...`);
      const content = await this.contentCreator.createArticle(research);

      if (!content) {
        throw new Error('Content generation returned null');
      }

      // Check word count
      const wordCount = content.__quality?.word_count || content.quality_metrics?.word_count || 0;
      console.log(`   📊 Word count: ${wordCount} words`);

      if (wordCount < 2200) {
        console.warn(`   ⚠️  Warning: Article is below 2,200 words`);
      }

      // Display RESEARCH VERIFICATION if available
      const researchVerification = content.research_log || '';
      if (researchVerification && researchVerification !== 'N/A - Fallback mode (JSON parsing failed)') {
        console.log(`\n   🔍 RESEARCH VERIFICATION:`);
        console.log(`   ${'-'.repeat(66)}`);
        // Wrap long text to fit terminal width
        const logLines = researchVerification.match(/.{1,66}(\s|$)/g) || [researchVerification];
        logLines.forEach(line => console.log(`   ${line.trim()}`));
        console.log(`   ${'-'.repeat(66)}\n`);

        // Log to file
        this.logResearchVerification(topicTitle, research.topic_id, researchVerification);
      } else if (researchVerification) {
        console.log(`   ⚠️  Research verification: ${researchVerification}`);
      } else {
        console.log(`   ⚠️  Research verification: Not available (field missing from response)`);
      }

      // Save markdown file
      const filepath = this.saveMarkdown(content, research, index);

      results.successful++;
      console.log(`   ✅ Successfully generated: ${topicTitle}`);

      // Convert to HTML
      try {
        console.log('\n🔄 Converting markdown to HTML...\n');
        const converter = new MarkdownToHtmlConverter({
          articlesDir: this.markdownDir,
          outputDir: this.htmlDir
        });
        converter.convertFile(filepath);
      } catch (error) {
        console.error('\n❌ HTML conversion failed:', error.message);
      }

    } catch (error) {
      results.failed++;
      results.errors.push({
        topic: topicTitle,
        error: error.message
      });
      console.error(`   ❌ Failed to generate: ${topicTitle}`);
      console.error(`      Error: ${error.message}`);
    }

    // Print final summary
    this.printSummary(results);
  }

  /**
   * Generate content for all topics
   */
  async generateAll() {
    console.log('\n🚀 BATCH TECHNICAL ANALYSIS CONTENT GENERATOR');
    console.log('='.repeat(70));
    console.log(`📚 Total topics: ${this.topics.length}`);
    console.log(`📁 Markdown output: ${this.markdownDir}`);
    console.log(`📁 HTML output: ${this.htmlDir}`);
    console.log('='.repeat(70));

    // Ensure directories exist
    this.ensureDirectories();

    const results = {
      total: this.topics.length,
      successful: 0,
      failed: 0,
      errors: []
    };

    // Process each topic
    for (let i = 0; i < this.topics.length; i++) {
      const topic = this.topics[i];
      console.log(`\n[${'='.repeat(Math.floor(i * 50 / this.topics.length))}${' '.repeat(50 - Math.floor(i * 50 / this.topics.length))}] ${i + 1}/${this.topics.length}`);
      console.log(`\n📝 Processing: "${topic}"`);

      try {
        // Create research object
        const research = this.createResearchObject(topic, i);
        console.log(`   🔬 Created research object: ${research.topic_id}`);

        // Generate content using AI
        console.log(`   🤖 Generating content with AI...`);
        const content = await this.contentCreator.createArticle(research);

        if (!content) {
          throw new Error('Content generation returned null');
        }

        // Check word count
        const wordCount = content.__quality?.word_count || content.quality_metrics?.word_count || 0;
        console.log(`   📊 Word count: ${wordCount} words`);

        if (wordCount < 2200) {
          console.warn(`   ⚠️  Warning: Article is below 2,200 words`);
        }

        // Display RESEARCH VERIFICATION if available
        const researchVerification = content.research_log || '';
        if (researchVerification && researchVerification !== 'N/A - Fallback mode (JSON parsing failed)') {
          console.log(`\n   🔍 RESEARCH VERIFICATION:`);
          console.log(`   ${'-'.repeat(66)}`);
          // Wrap long text to fit terminal width
          const logLines = researchVerification.match(/.{1,66}(\s|$)/g) || [researchVerification];
          logLines.forEach(line => console.log(`   ${line.trim()}`));
          console.log(`   ${'-'.repeat(66)}\n`);

          // Log to file
          this.logResearchVerification(topic, research.topic_id, researchVerification);
        } else if (researchVerification) {
          console.log(`   ⚠️  Research verification: ${researchVerification}`);
        } else {
          console.log(`   ⚠️  Research verification: Not available (field missing from response)`);
        }

        // Save markdown file
        const filepath = this.saveMarkdown(content, research, i);

        results.successful++;
        console.log(`   ✅ Successfully generated: ${topic}`);

        // Add small delay to avoid rate limiting
        if (i < this.topics.length - 1) {
          console.log(`   ⏸️  Waiting 3 seconds before next topic...`);
          await new Promise(resolve => setTimeout(resolve, 3000));
        }

      } catch (error) {
        results.failed++;
        results.errors.push({
          topic,
          error: error.message
        });
        console.error(`   ❌ Failed to generate: ${topic}`);
        console.error(`      Error: ${error.message}`);
      }
    }

    // Convert all markdown to HTML
    try {
      this.convertToHtml();
    } catch (error) {
      console.error('\n❌ HTML conversion failed:', error.message);
    }

    // Print final summary
    this.printSummary(results);
  }

  /**
   * Print generation summary
   */
  printSummary(results) {
    console.log('\n' + '='.repeat(70));
    console.log('📊 GENERATION SUMMARY');
    console.log('='.repeat(70));
    console.log(`✅ Successfully generated: ${results.successful}/${results.total} articles`);

    if (results.failed > 0) {
      console.log(`❌ Failed: ${results.failed}/${results.total} articles`);
      console.log('\n❌ Failed topics:');
      results.errors.forEach(({ topic, error }) => {
        console.log(`   - ${topic}`);
        console.log(`     Error: ${error}`);
      });
    }

    console.log(`\n📁 Markdown files: ${this.markdownDir}`);
    console.log(`📁 HTML files: ${this.htmlDir}`);
    console.log('='.repeat(70) + '\n');
  }
}

// CLI execution
if (require.main === module) {
  const generator = new BatchTechnicalAnalysisGenerator();
  const args = process.argv.slice(2);

  // Parse arguments
  let topic = null;
  let customOutline = null;
  let keywordMentions = null;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--single' && args[i + 1]) {
      topic = args[i + 1];
      i++;
    } else if (args[i] === '--outline' && args[i + 1]) {
      customOutline = args[i + 1].replace(/\\n/g, '\n');
      i++;
    } else if (args[i] === '--outline-file' && args[i + 1]) {
      const filePath = path.resolve(args[i + 1]);
      try {
        customOutline = fs.readFileSync(filePath, 'utf-8');
        console.log(`✅ Loaded outline from: ${filePath}`);
      } catch (error) {
        console.error(`❌ Failed to load outline file: ${error.message}`);
        process.exit(1);
      }
      i++;
    } else if (args[i] === '--keyword-mentions' && args[i + 1]) {
      keywordMentions = args[i + 1]; // e.g., "41-45" or "42"
      console.log(`✅ Target keyword mentions: ${keywordMentions}`);
      i++;
    }
  }

  // Check if single topic mode
  if (topic) {
    generator.generateSingle(topic, customOutline, keywordMentions)
      .then(() => {
        console.log('\n✅ Single topic generation completed!');
        process.exit(0);
      })
      .catch(error => {
        console.error('\n❌ Single topic generation failed:', error);
        process.exit(1);
      });
  } else {
    // Default: generate all topics
    generator.generateAll()
      .then(() => {
        console.log('\n✅ Batch generation completed!');
        process.exit(0);
      })
      .catch(error => {
        console.error('\n❌ Batch generation failed:', error);
        process.exit(1);
      });
  }
}

module.exports = BatchTechnicalAnalysisGenerator;
