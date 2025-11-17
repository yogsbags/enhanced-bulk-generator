#!/usr/bin/env node

/**
 * Article Quality Review & Ranking System
 * Analyzes all published articles and provides quality scores
 */

const fs = require('fs');
const path = require('path');
const csv = require('csv-parse/sync');

class ArticleQualityReviewer {
  constructor() {
    this.createdContentPath = path.join(__dirname, '../data/created-content.csv');
  }

  /**
   * Load created content from CSV
   */
  loadArticles() {
    const csvContent = fs.readFileSync(this.createdContentPath, 'utf-8');
    const records = csv.parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      relax_quotes: true,
      quote: '"',
      escape: '"'
    });
    return records;
  }

  /**
   * Parse JSON field safely
   */
  parseJSON(field) {
    if (!field) return {};
    try {
      return JSON.parse(field);
    } catch (error) {
      return {};
    }
  }

  /**
   * Analyze article quality across multiple dimensions
   */
  analyzeArticle(article) {
    const seoMetadata = this.parseJSON(article.seo_metadata);
    const qualityMetrics = this.parseJSON(article.quality_metrics);
    const compliance = this.parseJSON(article.compliance);
    const content = article.article_content || '';

    const analysis = {
      content_id: article.content_id,
      title: seoMetadata.title || article.content_id,
      google_docs_url: seoMetadata.google_docs_url || article.google_docs_url || 'N/A',

      // Content Quality (0-10)
      content_depth: this.scoreContentDepth(content),
      structure_readability: this.scoreStructure(content),
      practical_value: this.scorePracticalValue(content),

      // SEO Quality (0-10)
      seo_optimization: this.scoreSEO(seoMetadata, content),
      keyword_usage: this.scoreKeywords(seoMetadata, content),

      // Compliance & Authority (0-10)
      regulatory_compliance: compliance.sebi_compliance === 'Yes' ? 10 : (compliance.warnings ? 5 : 0),
      expert_quotes: this.scoreExpertContent(content),

      // Technical Quality (0-10)
      formatting: this.scoreFormatting(content),
      tables_charts: this.scoreVisualContent(content),

      // Existing metrics from quality_metrics
      existing_quality_score: qualityMetrics.overall_score || 0,
      word_count: content.split(/\s+/).length,
    };

    // Calculate composite score
    analysis.composite_score = this.calculateCompositeScore(analysis);

    // Identify strengths and weaknesses
    analysis.strengths = this.identifyStrengths(analysis, content);
    analysis.weaknesses = this.identifyWeaknesses(analysis, content);

    return analysis;
  }

  /**
   * Score content depth (0-10)
   */
  scoreContentDepth(content) {
    const wordCount = content.split(/\s+/).length;
    const hasExecutiveSummary = /executive summary/i.test(content);
    const hasKeyTakeaways = /key takeaways/i.test(content);
    const hasExamples = /example|case study|scenario/i.test(content);
    const hasTables = content.includes('|') && content.split('|').length > 10;

    let score = 0;
    if (wordCount >= 2500) score += 3;
    else if (wordCount >= 2000) score += 2;
    else if (wordCount >= 1500) score += 1;

    if (hasExecutiveSummary) score += 2;
    if (hasKeyTakeaways) score += 2;
    if (hasExamples) score += 2;
    if (hasTables) score += 1;

    return Math.min(score, 10);
  }

  /**
   * Score structure and readability (0-10)
   */
  scoreStructure(content) {
    const h2Count = (content.match(/^## /gm) || []).length;
    const h3Count = (content.match(/^### /gm) || []).length;
    const bulletPoints = (content.match(/^- /gm) || []).length;
    const paragraphs = content.split('\n\n').length;
    const avgParagraphLength = content.length / paragraphs;

    let score = 0;

    // Good heading structure
    if (h2Count >= 5 && h2Count <= 10) score += 3;
    else if (h2Count >= 3) score += 2;

    if (h3Count >= 3) score += 2;

    // Good use of lists
    if (bulletPoints >= 10) score += 2;
    else if (bulletPoints >= 5) score += 1;

    // Readable paragraph length (200-400 chars ideal)
    if (avgParagraphLength >= 200 && avgParagraphLength <= 400) score += 3;
    else if (avgParagraphLength < 600) score += 1;

    return Math.min(score, 10);
  }

  /**
   * Score practical value (0-10)
   */
  scorePracticalValue(content) {
    const hasStepByStep = /step[\s-]by[\s-]step|step \d+|1\.|2\.|3\./i.test(content);
    const hasActionableAdvice = /how to|you can|you should|start by|begin with/i.test(content);
    const hasNumbers = (content.match(/₹|INR|%|\d+/g) || []).length > 20;
    const hasCalculations = /calculation|formula|equation|compute|calculate/i.test(content);
    const hasLinks = /https?:\/\//i.test(content);

    let score = 0;
    if (hasStepByStep) score += 3;
    if (hasActionableAdvice) score += 2;
    if (hasNumbers) score += 2;
    if (hasCalculations) score += 2;
    if (hasLinks) score += 1;

    return Math.min(score, 10);
  }

  /**
   * Score SEO optimization (0-10)
   */
  scoreSEO(seoMetadata, content) {
    let score = 0;

    if (seoMetadata.title && seoMetadata.title.length >= 50 && seoMetadata.title.length <= 70) score += 2;
    if (seoMetadata.meta_description && seoMetadata.meta_description.length >= 140 && seoMetadata.meta_description.length <= 160) score += 2;
    if (seoMetadata.focus_keyphrase) score += 2;
    if (seoMetadata.secondary_keywords && seoMetadata.secondary_keywords.length >= 3) score += 2;
    if (seoMetadata.slug && seoMetadata.slug.length < 70) score += 1;
    if (seoMetadata.schema_markup) score += 1;

    return Math.min(score, 10);
  }

  /**
   * Score keyword usage (0-10)
   */
  scoreKeywords(seoMetadata, content) {
    if (!seoMetadata.focus_keyphrase) return 0;

    const contentLower = content.toLowerCase();
    const keyword = seoMetadata.focus_keyphrase.toLowerCase();
    const keywordCount = (contentLower.match(new RegExp(keyword, 'g')) || []).length;
    const wordCount = content.split(/\s+/).length;
    const keywordDensity = (keywordCount / wordCount) * 100;

    let score = 0;

    // Ideal keyword density: 0.5% - 2%
    if (keywordDensity >= 0.5 && keywordDensity <= 2) score += 4;
    else if (keywordDensity >= 0.3 && keywordDensity <= 3) score += 2;

    // Keyword in first 100 words
    const first100Words = content.split(/\s+/).slice(0, 100).join(' ').toLowerCase();
    if (first100Words.includes(keyword)) score += 2;

    // Secondary keywords
    if (seoMetadata.secondary_keywords) {
      const secondaryFound = seoMetadata.secondary_keywords.filter(kw =>
        contentLower.includes(kw.toLowerCase())
      ).length;
      score += Math.min(secondaryFound, 4);
    }

    return Math.min(score, 10);
  }

  /**
   * Score expert content (0-10)
   */
  scoreExpertContent(content) {
    const expertQuotes = (content.match(/expert view|according to|says|analyst|sebi.*analyst/gi) || []).length;
    const citations = (content.match(/\[.*\]|source:|reference:/gi) || []).length;
    const dataPoints = (content.match(/fy \d{4}|sebi|rbi|reserve bank|securities board/gi) || []).length;

    let score = 0;
    if (expertQuotes >= 2) score += 4;
    else if (expertQuotes >= 1) score += 2;

    if (citations >= 3) score += 3;
    else if (citations >= 1) score += 1;

    if (dataPoints >= 5) score += 3;
    else if (dataPoints >= 2) score += 1;

    return Math.min(score, 10);
  }

  /**
   * Score formatting (0-10)
   */
  scoreFormatting(content) {
    const hasBold = content.includes('**');
    const hasItalic = content.includes('*') && !content.includes('**');
    const hasCode = content.includes('`');
    const hasLinks = content.includes('[') && content.includes('](');
    const properSpacing = !content.includes('\n\n\n\n');

    let score = 6; // Base score for basic markdown
    if (hasBold) score += 1;
    if (hasLinks) score += 2;
    if (properSpacing) score += 1;

    return Math.min(score, 10);
  }

  /**
   * Score visual content (0-10)
   */
  scoreVisualContent(content) {
    const tableCount = (content.match(/^\|.*\|$/gm) || []).length;
    const hasProperTables = tableCount >= 6; // At least 3 rows (header + separator + data)

    let score = 0;
    if (hasProperTables) score += 5;
    else if (tableCount >= 3) score += 3;
    else if (tableCount >= 1) score += 1;

    // Check for callouts/blockquotes
    const hasCallouts = (content.match(/^> /gm) || []).length;
    if (hasCallouts >= 2) score += 3;
    else if (hasCallouts >= 1) score += 2;

    // Check for visual aids mentions
    if (/diagram|chart|graph|illustration|visual/i.test(content)) score += 2;

    return Math.min(score, 10);
  }

  /**
   * Calculate composite score (0-100)
   */
  calculateCompositeScore(analysis) {
    const weights = {
      content_depth: 0.20,
      structure_readability: 0.15,
      practical_value: 0.15,
      seo_optimization: 0.15,
      keyword_usage: 0.10,
      regulatory_compliance: 0.10,
      expert_quotes: 0.05,
      formatting: 0.05,
      tables_charts: 0.05
    };

    let score = 0;
    for (const [key, weight] of Object.entries(weights)) {
      score += (analysis[key] || 0) * weight * 10;
    }

    return Math.round(score);
  }

  /**
   * Identify top 3 strengths
   */
  identifyStrengths(analysis, content) {
    const scores = [
      { area: 'Content Depth', score: analysis.content_depth, detail: `${analysis.word_count} words with comprehensive coverage` },
      { area: 'Structure & Readability', score: analysis.structure_readability, detail: 'Well-organized with clear headings and sections' },
      { area: 'Practical Value', score: analysis.practical_value, detail: 'Actionable advice and real-world examples' },
      { area: 'SEO Optimization', score: analysis.seo_optimization, detail: 'Strong metadata and keyword strategy' },
      { area: 'Regulatory Compliance', score: analysis.regulatory_compliance, detail: 'SEBI/RBI compliant with proper disclosures' },
      { area: 'Expert Authority', score: analysis.expert_quotes, detail: 'Expert quotes and authoritative sources' },
      { area: 'Visual Content', score: analysis.tables_charts, detail: 'Tables and formatted data for clarity' }
    ];

    return scores
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(s => `${s.area} (${s.score}/10): ${s.detail}`);
  }

  /**
   * Identify top 3 weaknesses
   */
  identifyWeaknesses(analysis, content) {
    const scores = [
      { area: 'Content Depth', score: analysis.content_depth, fix: 'Add more examples, case studies, or detailed explanations' },
      { area: 'Structure & Readability', score: analysis.structure_readability, fix: 'Improve heading hierarchy and paragraph length' },
      { area: 'Practical Value', score: analysis.practical_value, fix: 'Include more step-by-step guidance and calculations' },
      { area: 'SEO Optimization', score: analysis.seo_optimization, fix: 'Optimize title length, meta description, and schema' },
      { area: 'Keyword Usage', score: analysis.keyword_usage, fix: 'Adjust keyword density and placement' },
      { area: 'Expert Authority', score: analysis.expert_quotes, fix: 'Add more expert quotes and citations' },
      { area: 'Visual Content', score: analysis.tables_charts, fix: 'Include more tables, charts, or visual aids' },
      { area: 'Formatting', score: analysis.formatting, fix: 'Improve use of bold, links, and markdown formatting' }
    ];

    return scores
      .sort((a, b) => a.score - b.score)
      .slice(0, 3)
      .map(s => `${s.area} (${s.score}/10): ${s.fix}`);
  }

  /**
   * Generate quality report
   */
  generateReport() {
    console.log('\n📊 ARTICLE QUALITY REVIEW & RANKING REPORT');
    console.log('='.repeat(80));
    console.log('Generated:', new Date().toISOString());
    console.log('='.repeat(80));

    const articles = this.loadArticles();
    const analyses = articles.map(article => this.analyzeArticle(article));

    // Sort by composite score
    analyses.sort((a, b) => b.composite_score - a.composite_score);

    console.log(`\n📈 OVERALL RANKINGS (${analyses.length} articles)`);
    console.log('='.repeat(80));

    analyses.forEach((analysis, index) => {
      const rank = index + 1;
      const grade = this.getGrade(analysis.composite_score);
      const icon = rank <= 3 ? '🥇' : rank <= 6 ? '🥈' : rank <= 9 ? '🥉' : '📄';

      console.log(`\n${icon} RANK ${rank}: ${analysis.title}`);
      console.log('-'.repeat(80));
      console.log(`Content ID: ${analysis.content_id}`);
      console.log(`Composite Score: ${analysis.composite_score}/100 (Grade: ${grade})`);
      console.log(`Word Count: ${analysis.word_count.toLocaleString()}`);
      console.log(`Google Docs: ${analysis.google_docs_url}`);

      console.log(`\n📊 Dimension Scores:`);
      console.log(`   Content Depth: ${analysis.content_depth}/10`);
      console.log(`   Structure & Readability: ${analysis.structure_readability}/10`);
      console.log(`   Practical Value: ${analysis.practical_value}/10`);
      console.log(`   SEO Optimization: ${analysis.seo_optimization}/10`);
      console.log(`   Keyword Usage: ${analysis.keyword_usage}/10`);
      console.log(`   Regulatory Compliance: ${analysis.regulatory_compliance}/10`);
      console.log(`   Expert Authority: ${analysis.expert_quotes}/10`);
      console.log(`   Formatting: ${analysis.formatting}/10`);
      console.log(`   Visual Content: ${analysis.tables_charts}/10`);

      console.log(`\n✅ TOP STRENGTHS:`);
      analysis.strengths.forEach((strength, i) => {
        console.log(`   ${i + 1}. ${strength}`);
      });

      console.log(`\n⚠️  AREAS FOR IMPROVEMENT:`);
      analysis.weaknesses.forEach((weakness, i) => {
        console.log(`   ${i + 1}. ${weakness}`);
      });
    });

    console.log('\n\n' + '='.repeat(80));
    console.log('📊 SUMMARY STATISTICS');
    console.log('='.repeat(80));

    const avgScore = analyses.reduce((sum, a) => sum + a.composite_score, 0) / analyses.length;
    const avgWordCount = analyses.reduce((sum, a) => sum + a.word_count, 0) / analyses.length;
    const gradeDistribution = analyses.reduce((dist, a) => {
      const grade = this.getGrade(a.composite_score);
      dist[grade] = (dist[grade] || 0) + 1;
      return dist;
    }, {});

    console.log(`\nAverage Composite Score: ${Math.round(avgScore)}/100`);
    console.log(`Average Word Count: ${Math.round(avgWordCount).toLocaleString()}`);
    console.log(`\nGrade Distribution:`);
    Object.entries(gradeDistribution)
      .sort((a, b) => b[1] - a[1])
      .forEach(([grade, count]) => {
        console.log(`   ${grade}: ${count} article(s)`);
      });

    console.log('\n' + '='.repeat(80));
    console.log('✅ Review complete!\n');
  }

  /**
   * Convert score to letter grade
   */
  getGrade(score) {
    if (score >= 90) return 'A+';
    if (score >= 85) return 'A';
    if (score >= 80) return 'A-';
    if (score >= 75) return 'B+';
    if (score >= 70) return 'B';
    if (score >= 65) return 'B-';
    if (score >= 60) return 'C+';
    if (score >= 55) return 'C';
    return 'C-';
  }
}

// Run review
const reviewer = new ArticleQualityReviewer();
reviewer.generateReport();
