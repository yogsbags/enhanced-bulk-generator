#!/usr/bin/env node

/**
 * Content Creator for Enhanced Bulk Generator
 * Implements N8N Workflow 4: Content Creation
 * Generates E-E-A-T compliant, SEO-optimized financial content per topic
 */

const fetch = require('node-fetch');
const { jsonrepair } = require('jsonrepair');
const fs = require('fs');
const path = require('path');
const CSVDataManager = require('../core/csv-data-manager');
const { generateHeroImage } = require('../integrations/image-generator');

class ContentCreator {
  constructor(config = {}) {
    this.config = {
      contentBatchSize: config.contentBatchSize || 1,
      minWordCount: config.minWordCount || 1800,
      maxGenerationAttempts: config.maxGenerationAttempts || 2,
      generateImages: config.generateImages !== undefined ? config.generateImages : process.env.GENERATE_IMAGES !== 'false',
      ...config,
    };

    this.openaiApiKey = process.env.OPENAI_API_KEY;
    this.groqApiKey = process.env.GROQ_API_KEY;
    this.openaiApiUrl = 'https://api.openai.com/v1/chat/completions';
    this.groqApiUrl = 'https://api.groq.com/openai/v1/chat/completions';

    this.csvManager = new CSVDataManager();
    this.heroImageCache = new Map();
    this.researchSourceCache = new Map();

    // Load optimized model parameters
    this.modelParams = this.loadModelParameters();

    this.validateConfig();
  }

  validateConfig() {
    if (!this.openaiApiKey && !this.groqApiKey) {
      console.warn('⚠️  Neither OPENAI_API_KEY nor GROQ_API_KEY set!');
      console.log('Please set at least one API key');
      return false;
    }
    console.log('✅ Content Creator initialized');
    return true;
  }

  /**
   * Load optimized model parameters from config
   */
  loadModelParameters() {
    try {
      const configPath = path.join(__dirname, '../config/model-parameters.json');
      const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      console.log('✅ Loaded optimized model parameters from config');
      return config;
    } catch (error) {
      console.warn('⚠️  Failed to load model parameters, using defaults');
      return {
        stages: {
          content: {
            temperature: 0.6,
            top_p: 0.92,
            frequency_penalty: 0.3,
            presence_penalty: 0.1,
            max_tokens: 8000,
            response_format: { type: 'json_object' }
          }
        }
      };
    }
  }

  /**
   * Main content creation entry point
   */
  async createContent() {
    console.log('\n✍️  CONTENT CREATION STARTED');
    console.log('='.repeat(60));

    try {
      const pendingResearch = this.getPendingResearchItems();

      if (pendingResearch.length === 0) {
        console.log('⚠️  No research items require new drafts (already created or not approved).');
        return [];
      }

      console.log(`✅ Preparing ${pendingResearch.length} research item(s) for drafting`);

      const contentResults = [];

      for (let i = 0; i < pendingResearch.length; i++) {
        const research = pendingResearch[i];
        console.log(`\n📝 Creating content ${i + 1}/${pendingResearch.length}: ${research.topic_id}`);

        const content = await this.createArticle(research);
        if (content) {
          const stored = this.prepareForStorage(content);
          if (stored) {
            contentResults.push(stored);
            console.log(`✅ Content created for: ${research.topic_id}`);
          } else {
            console.warn(`⚠️  Skipped storing content for ${research.topic_id} (serialization failed).`);
          }
        } else {
          console.warn(`⚠️  Content generation returned no usable draft for ${research.topic_id}`);
        }
      }

      if (contentResults.length > 0) {
        const saved = this.csvManager.saveCreatedContent(contentResults);
        if (saved) {
          console.log(`\n💾 Saved ${contentResults.length} content item(s) to created-content.csv`);
        }
      }

      this.printSummary(contentResults);
      return contentResults;
    } catch (error) {
      console.error('❌ Content creation failed:', error.message);
      throw error;
    }
  }

  /**
   * Find approved research entries that do not yet have content
   */
  getPendingResearchItems() {
    const approvedResearch = this.csvManager.getApprovedTopicResearch();
    if (!approvedResearch || approvedResearch.length === 0) {
      return [];
    }

    const existingContent = this.csvManager.getContentByTopicIds(
      approvedResearch.map((item) => item.topic_id)
    );
    const existingTopicIds = new Set(existingContent.map((item) => item.topic_id));

    const pending = approvedResearch
      .filter((item) => !existingTopicIds.has(item.topic_id))
      .sort((a, b) => {
        const aDate = a.created_at ? new Date(a.created_at).getTime() : 0;
        const bDate = b.created_at ? new Date(b.created_at).getTime() : 0;
        return bDate - aDate;
      });
    if (pending.length === 0) {
      return [];
    }

    const batchSize = this.config.autoApprove ? pending.length : Math.max(1, this.config.contentBatchSize || 1);
    const limitedByBatch = pending.slice(0, batchSize);
    const limit = this.config.contentLimit ?? this.config.topicLimit ?? null;
    return limit ? limitedByBatch.slice(0, limit) : limitedByBatch;
  }

  /**
   * Create an article for a single topic, retrying with stricter prompts if needed
   */
  async createArticle(research) {
    let draft = null;
    let feedback = '';

    for (let attempt = 1; attempt <= this.config.maxGenerationAttempts; attempt++) {
      const prompt = this.buildContentPrompt(research, {
        attempt,
        feedback,
      });

      try {
        const response = await this.callAI(prompt);
        const content = this.parseContentResponse(response, research);

        if (!content) {
          feedback =
            'Previous attempt produced invalid output. Respond with strictly valid JSON matching the requested schema.';
          continue;
        }

        draft = content;
        await this.applyHeroImage(draft, research);

        if (this.meetsQualityStandards(draft)) {
          return draft;
        }

        feedback = this.buildRevisionFeedback(content);
      } catch (error) {
        console.warn(`⚠️  Attempt ${attempt} failed for ${research.topic_id}: ${error.message}`);
        feedback =
          'The previous attempt caused an error. Respond with strictly valid JSON containing the required fields.';
      }
    }

    if (draft) {
      await this.applyHeroImage(draft, research);
    }

    return draft;
  }

  /**
   * Build the content prompt with strict schema and optional feedback
   */
  buildContentPrompt(research, options = {}) {
    const wordTarget = options.minWordCount || this.config.minWordCount;
    const attempt = options.attempt || 1;
    const feedback = options.feedback ? `\nREVISION FEEDBACK:\n${options.feedback}\n` : '';
    const sources = this.getResearchSources(research);
    const sourcesList = sources.length
      ? sources.map((url, idx) => `${idx + 1}. ${url}`).join('\n')
      : 'Reference RBI publications, SEBI circulars, and reputable Indian financial portals.';

    return `You are an award-winning Indian financial strategist, senior editor, and compliance reviewer.
Using the approved research brief, craft an SEO ready article that reads like it was written by PL Capital's in-house experts.

OUTPUT RULES:
- Respond with a **single valid JSON object** following the schema below. No markdown fences or extra prose.
- Article audience: mass affluent Indian investors and salaried professionals evaluating wealth options in FY 2025-26.
- Minimum length: ${wordTarget} words of original copy (exclude tables). Blend data, explanations, frameworks, and examples.
- Voice & tone: Use first/second-person (you/your/our/we) to create engagement. Write as if you're speaking directly to the reader. Example: "When you invest..." instead of "When investors invest...". Balance authority with approachability, keeping it data-backed and compliance-safe.
- Heading etiquette: never output an H1. Start with \`## Executive Summary\`, then use semantic H2/H3/H4 hierarchy. All headings must include the focus keyphrase or close semantic variations for SEO optimization.
- Structural must-haves (in order):
  1. \`## Executive Summary\` — 3 crisp sentences covering context, opportunity, and takeaway (using "you/your" tone).
  2. \`### Key Numbers At a Glance\` — Markdown table with Metric / Value / Why it Matters (>=4 rows).
  3. \`### Key Takeaways\` — bullet list (5 bullets) of one-line insights (using "you/your" tone).
  4. Core body sections addressing the content gaps, benchmarks vs competitors, tactical guidance, frameworks, and risk controls (written in observational, neutral tone – no direct trading suggestions).
  5. Final H2 titled \`## Talk to Our Advisors\` containing a persuasive CTA paragraph (using "you/your/our" tone).
- Every body section must integrate insights from the research brief (content gaps, competitor analysis, related questions, superiority plan) with specific data points, examples, and Indian regulatory references.
- **IMPORTANT – EXTERNAL LINKS**: Limit external links to a maximum of 3 verified, authoritative sources (RBI, SEBI, NSE, BSE, Ministry of Finance, AMFI official pages only). No competitor websites or blogs. Each external link must be a permanent, official government/regulatory URL (no blog posts or news articles that may become 404). Use proper en dashes (–) with spaces around them for ranges/connections.
- **IMPORTANT – INTERNAL LINKS**: Include at least two inline links to PL Capital resources using relevant blog URLs (from https://www.plindia.com/blogs-sitemap.xml).
- **IMPORTANT – TRADING STRATEGIES**: Never provide direct trading suggestions or investment recommendations. Use observational, neutral language like "Some investors consider...", "Historical data shows...", "Market patterns suggest..." instead of "You should invest in..." or "Buy/Sell...".
- **IMPORTANT – FORMATTING**: Use en dashes (–) consistently for ranges and connections with proper spacing (e.g., "5%–7%" or "stocks – bonds"). Never use hyphens for these purposes.
- Tables: use valid Markdown tables, never placeholders.
- No placeholder strings ({{...}}, [TODO], etc.). Provide finished copy.
- No developer comments or internal labels (e.g., "## Quality Metrics", "## Content Upgrades", "DEVELOPER NOTE:"). These must never appear in the final output.
- **IMPORTANT – CONTENT UPGRADES**: Populate the content_upgrades JSON array with two text-based, conceptual suggestions only (e.g., "Related reading: Understanding SIP strategies", "Framework: Building a diversified portfolio"). NEVER reference calculators, downloadables, PDFs, interactive tools, checklists, templates, spreadsheets, widgets, or any features requiring additional development. These features do not exist on the website. Do not create an explicit section in the article labelled "Content Upgrades".

CRITICAL ANTI-HALLUCINATION GUARDRAILS:
- **ABSOLUTELY NO FABRICATED DATA**: Every statistic, percentage, number, date, or data point MUST come from the research brief or be a general industry observation. NEVER invent specific numbers, fund names, company performance figures, or market statistics.
- **NO MADE-UP SOURCES**: Only cite sources from the provided research context. NEVER create fictional URLs, fake RBI/SEBI circulars, or imaginary research papers. If no specific source is available, use general language like "Industry data suggests..." or "Historical trends show..." without citations.
- **NO FAKE EXTERNAL LINKS**: NEVER fabricate external links to RBI, SEBI, NSE, BSE, or any other website. Only use links explicitly provided in the research sources. If you don't have a verified URL, DO NOT include any external link. It's better to have zero external links than one fabricated link.
- **NO SPECIFIC FUND/STOCK NAMES**: Unless explicitly mentioned in the research brief, NEVER name specific mutual funds, stocks, companies, or financial products. Use generic categories instead (e.g., "large-cap equity funds" instead of "HDFC Top 100 Fund").
- **NO INVENTED REGULATIONS**: NEVER cite specific SEBI regulations, RBI circulars, or government policy numbers unless they are in the research brief. Use general compliance language instead (e.g., "As per SEBI guidelines..." without citing specific regulation numbers).
- **NO FUTURE PREDICTIONS**: NEVER make specific market predictions, target returns, or future performance estimates. Use historical context and observational language only (e.g., "Historically, markets have shown..." NOT "Markets will deliver 12% returns").
- **VERIFY DATES & TIMEFRAMES**: Only use dates, financial years, or time periods that are current (FY 2025-26) or from the research brief. NEVER invent historical dates or specific event timelines.
- **NO FABRICATED EXAMPLES**: Do not create fictional investor scenarios, case studies, or examples unless they are generic and clearly hypothetical (e.g., "Consider an investor who..." NOT "Mr. Sharma from Mumbai invested in...").
- **FACT-CHECK LANGUAGE**: Use qualifying language for uncertain claims: "typically", "generally", "often", "may", "historical data suggests". Avoid absolute claims like "always", "guaranteed", "will definitely", "proven to".
- **PENALTY AWARENESS**: Google penalizes websites for E-E-A-T violations (fabricated expertise, false authority, misleading trust signals). Every claim must be defensible and verifiable. When in doubt, stay general and observational.

JSON SCHEMA:
{
  "topic_id": "string",
  "seo_metadata": {
    "title": "string <= 60 characters containing the focus keyphrase",
    "meta_description": "string 140-160 characters with a CTA and focus keyphrase",
    "focus_keyphrase": "string",
    "secondary_keywords": ["string", "string", "string"]
  },
  "article_content": "markdown string >= ${wordTarget} words with deep analysis, data, recommendations, CTAs, and inline links",
  "content_upgrades": ["string", "string"],
  "compliance": "string including SEBI/RBI disclaimers and investor risk warnings",
  "quality_metrics": {
    "word_count": number,
    "readability_score": "Excellent | Good | Fair | Needs Review",
    "seo_score": "Excellent | Good | Fair | Needs Review"
  }
}

${feedback}
ATTEMPT: ${attempt}

RESEARCH CONTEXT:
- Topic ID: ${research.topic_id}
- Primary Keyword: ${research.primary_keyword}
- Search Intent: ${research.search_intent}
- Content Gaps to Address: ${research.content_gaps}
- Top 10 Competitors Analysis: ${typeof research.top_10_competitors === 'string' ? research.top_10_competitors : JSON.stringify(research.top_10_competitors || 'Not available')}
- Related Questions Users Ask: ${typeof research.related_questions === 'string' ? research.related_questions : JSON.stringify(research.related_questions || [])}
- Content Superiority Plan: ${research.content_superiority_plan}
- Resource Requirements: ${research.resource_requirements}
- Regulatory Compliance: ${research.regulatory_compliance}
- Estimated Impact: ${research.estimated_impact}


Focus on outperforming top competitors in depth, freshness, and authority while maintaining compliance.
`;
  }

  /**
   * Call Groq/OpenAI models in priority order for content drafting
   */
  async callAI(prompt) {
    const groqModels = [
      { name: 'groq/compound', label: 'Groq Compound (primary)', temperature: 0.55 },
      { name: 'openai/gpt-oss-120b', label: 'Groq GPT-OSS 120B (secondary)', temperature: 0.6 }
    ];

    if (this.groqApiKey) {
      for (const model of groqModels) {
        try {
          const result = await this.callGroqModel(model.name, prompt, model.temperature);
          console.log(`🤖 Draft generated via ${model.label}`);
          return result;
        } catch (error) {
          console.warn(`⚠️  ${model.label} failed: ${error.message}`);
        }
      }
    }

    if (this.openaiApiKey) {
      try {
        const params = this.modelParams.stages.content;
        const response = await fetch(this.openaiApiUrl, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.openaiApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o',
            response_format: params.response_format,
            messages: [
              {
                role: 'system',
                content:
                  'You are a senior financial content strategist. Always respond with valid JSON following the provided schema.',
              },
              { role: 'user', content: prompt },
            ],
            temperature: params.temperature,
            top_p: params.top_p,
            frequency_penalty: params.frequency_penalty,
            presence_penalty: params.presence_penalty,
            max_tokens: params.max_tokens,
          }),
        });

        if (!response.ok) {
          throw new Error(`OpenAI API error: ${response.status}`);
        }

        const data = await response.json();
        const message = data.choices[0]?.message || {};
        const content = message.content || message.parsed || '';
        if (!content) {
          throw new Error('OpenAI returned an empty response');
        }
        console.log('🤖 Draft generated via OpenAI gpt-4o');
        return content;
      } catch (error) {
        console.warn(`⚠️  OpenAI gpt-4o failed: ${error.message}`);
      }
    }

    if (this.groqApiKey) {
      try {
        const fallback = await this.callGroqModel(
          'meta-llama/llama-4-maverick-17b-128e-instruct',
          prompt,
          0.6
        );
        console.log('🤖 Draft generated via Groq Llama-4 Maverick');
        return fallback;
      } catch (error) {
        console.warn(`⚠️  Groq Llama-4 Maverick failed: ${error.message}`);
      }
    }

    throw new Error('No AI API available');
  }

  async callGroqModel(modelName, prompt, temperature = 0.6) {
    if (!this.groqApiKey) {
      throw new Error('GROQ_API_KEY not configured');
    }

    const params = this.modelParams.stages.content;
    const response = await fetch(this.groqApiUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: modelName,
        response_format: params.response_format,
        messages: [
          {
            role: 'system',
            content:
              'You are a senior financial content strategist. Always respond with valid JSON following the provided schema.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: params.temperature,
        top_p: params.top_p,
        frequency_penalty: params.frequency_penalty,
        presence_penalty: params.presence_penalty,
        max_tokens: params.max_tokens,
      }),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      throw new Error(`${response.status} ${detail ? `- ${detail}` : ''}`.trim());
    }

    const data = await response.json();
    const message = data.choices?.[0]?.message || {};
    const content = message.parsed
      ? typeof message.parsed === 'string'
        ? message.parsed
        : JSON.stringify(message.parsed)
      : message.content || '';

    if (!content) {
      throw new Error('Model returned an empty response');
    }

    return content;
  }

  /**
   * Parse AI response, repairing JSON when necessary
   */
  parseContentResponse(response, research) {
    const safeResponse = this.stripControlChars(response || '');
    const jsonPayload = this.extractJsonPayload(safeResponse);

    if (jsonPayload) {
      const parsed = this.parseJsonObject(jsonPayload);
      if (parsed) {
        return this.structureFromParsed(parsed, research);
      }
    }

    return this.buildFallbackContent(safeResponse, research);
  }

  /**
   * Attempt to locate JSON within an AI response
   */
  extractJsonPayload(response) {
    if (!response) return null;
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    return this.normalizeJsonString(jsonMatch[0]);
  }

  /**
   * Parse JSON, repairing common issues
   */
  parseJsonObject(raw) {
    try {
      return JSON.parse(raw);
    } catch (error) {
      try {
        const repaired = jsonrepair(raw);
        return JSON.parse(repaired);
      } catch (err) {
        return null;
      }
    }
  }

  /**
   * Convert parsed JSON into our storage format
   */
  structureFromParsed(parsed, research) {
    const rawArticle = this.stripControlChars(parsed.article_content || '');
    const seoMeta = this.normalizeSeoMetadata(parsed.seo_metadata, research, rawArticle);
    const upgrades = this.ensureArray(parsed.content_upgrades);
    const sources = this.collectSources(parsed.sources, research);
    const preparedArticle = this.prepareArticleContent(rawArticle, {
      research,
      sources,
      seoMeta,
    });
    const quality = this.buildQualityMetrics(parsed.quality_metrics, preparedArticle, false);
    const heroPayload = this.normalizeHeroPayload(parsed.hero_image, research, seoMeta);

    return {
      topic_id: research.topic_id,
      creation_date: new Date().toISOString().split('T')[0],
      seo_metadata: JSON.stringify(seoMeta),
      article_content: preparedArticle,
      content_upgrades: JSON.stringify(upgrades),
      compliance: parsed.compliance || research.regulatory_compliance || '',
      quality_metrics: JSON.stringify(quality),
      sources: JSON.stringify(sources),
      hero_image: heroPayload ? JSON.stringify(heroPayload) : '',
      approval_status: 'Needs-SEO',
      __fallback: false,
      __quality: quality,
      __seo: seoMeta,
      __sources: sources,
      __hero: heroPayload || null,
    };
  }

  /**
   * Fallback structure when JSON parsing fails entirely
   */
  buildFallbackContent(text, research) {
    const rawArticle = this.stripControlChars(text);
    const seoMeta = this.normalizeSeoMetadata({}, research, rawArticle);
    const sources = this.collectSources([], research);
    const preparedArticle = this.prepareArticleContent(rawArticle, {
      research,
      sources,
      seoMeta,
    });
    const quality = this.buildQualityMetrics({}, preparedArticle, true);
    let boundedArticle = preparedArticle;
    if (preparedArticle.length > 12000) {
      const cutoff = preparedArticle.lastIndexOf(' ', 11950);
      boundedArticle = (cutoff > 0 ? preparedArticle.slice(0, cutoff) : preparedArticle.slice(0, 12000)).trim();
    }

    return {
      topic_id: research.topic_id,
      creation_date: new Date().toISOString().split('T')[0],
      seo_metadata: JSON.stringify(seoMeta),
      article_content: boundedArticle,
      content_upgrades: JSON.stringify(['Manual enhancements required']),
      compliance: research.regulatory_compliance || '',
      quality_metrics: JSON.stringify(quality),
      sources: JSON.stringify(sources),
      hero_image: '',
      approval_status: 'Needs-SEO',
      __fallback: true,
      __quality: quality,
      __seo: seoMeta,
      __sources: sources,
      __hero: null,
    };
  }

  /**
   * Does the generated content satisfy our quality minimums?
   */
  meetsQualityStandards(content) {
    if (!content) return false;
    const quality = content.__quality || this.safeParseJSON(content.quality_metrics, {});
    const seoMeta = content.__seo || this.safeParseJSON(content.seo_metadata, {});

    if (!quality || !seoMeta) return false;
    if (quality.source === 'fallback') return false;

    const wordCount = quality.word_count || this.calculateWordCount(content.article_content);
    const metaDescription = seoMeta.meta_description || '';
    const secondaryKeywords = this.ensureArray(seoMeta.secondary_keywords);

    const passesWordCount = wordCount >= this.config.minWordCount;
    const passesMeta = metaDescription.length >= 140 && metaDescription.length <= 160;
    const hasFocus = Boolean(seoMeta.focus_keyphrase);
    const hasUpgrades =
      Array.isArray(this.safeParseJSON(content.content_upgrades, null)) &&
      this.safeParseJSON(content.content_upgrades, []).length >= 2;

    return passesWordCount && passesMeta && hasFocus && hasUpgrades;
  }

  /**
   * Build feedback text for the next attempt
   */
  buildRevisionFeedback(content) {
    if (!content) return '';

    const quality = content.__quality || this.safeParseJSON(content.quality_metrics, {});
    const seoMeta = content.__seo || this.safeParseJSON(content.seo_metadata, {});
    const upgrades = this.safeParseJSON(content.content_upgrades, []);

    const issues = [];

    if (!quality || quality.source === 'fallback') {
      issues.push('- Output must be a strict JSON object matching the schema (no markdown fences).');
    }

    const wordCount = quality?.word_count || this.calculateWordCount(content.article_content);
    if (wordCount < this.config.minWordCount) {
      issues.push(`- Increase article_content to at least ${this.config.minWordCount} words of rich detail.`);
    }

    if (!seoMeta?.meta_description || seoMeta.meta_description.length < 140 || seoMeta.meta_description.length > 160) {
      issues.push('- Provide a meta description between 140 and 160 characters containing the focus keyphrase.');
    }

    if (!seoMeta?.focus_keyphrase) {
      issues.push('- Include a focus_keyphrase that matches the primary keyword intent.');
    }

    if (!Array.isArray(upgrades) || upgrades.length < 2) {
      issues.push('- Suggest at least two distinct text-based content upgrades (e.g., "Related reading: topic", "Framework: concept"). NO calculators, PDFs, or downloadables.');
    }

    if (issues.length === 0) {
      issues.push('- Improve depth with competitor benchmarks, data tables, and actionable recommendations.');
    }

    return issues.join('\n');
  }

  prepareArticleContent(article, { research = {}, sources = [], seoMeta = {} } = {}) {
    let content = this.sanitizeArticleContent(article || '');
    content = this.normalizeHeadings(content);
    content = this.removeLeadingTitleHeading(content, research, seoMeta);
    content = this.filterExternalLinks(content); // Remove excessive/invalid external links
    content = this.ensureCallToAction(content, research, seoMeta);
    return this.finalizeArticleContent(content);
  }

  sanitizeArticleContent(text) {
    if (!text) return '';
    let content = text.replace(/\r/g, '');

    const placeholderPatterns = [
      /\{\{IMAGE:[^}]+\}\}/gi,
      /\[IMAGE:[^\]]+\]/gi,
      /\[TABLE:[^\]]+\]/gi,
      /\{\{TABLE:[^}]+\}\}/gi,
      /\[CTA:[^\]]+\]/gi,
    ];

    placeholderPatterns.forEach((pattern) => {
      content = content.replace(pattern, '');
    });

    // Remove developer comments and internal labels
    content = content.replace(/<!--[\s\S]*?-->/g, ''); // Remove HTML comments
    content = content.replace(/\/\/\s*DEVELOPER NOTE:.*$/gim, ''); // Remove developer notes
    content = content.replace(/\/\/\s*TODO:.*$/gim, ''); // Remove TODO comments
    content = content.replace(/\[INTERNAL:[^\]]+\]/gi, ''); // Remove internal labels
    content = content.replace(/\[CONTENT_LABEL:[^\]]+\]/gi, ''); // Remove content labels
    content = content.replace(/\[DEV:[^\]]+\]/gi, ''); // Remove dev labels

    // Normalize bullet markers (convert en/em dashes to standard hyphen for lists only)
    content = content.replace(/^[ \t]*[–—]\s+/gm, '- ');

    // Fix dash formatting: Use en dashes (–) for ranges and connections with proper spacing
    // Replace hyphens in ranges with en dashes (e.g., "5%-7%" -> "5%–7%")
    content = content.replace(/(\d+%?)\s*-\s*(\d+%?)/g, '$1–$2');
    // Replace hyphens in connections with en dashes with spacing (e.g., "stocks-bonds" -> "stocks – bonds")
    content = content.replace(/(\b\w+)\s*-\s*(\w+\b)/g, '$1 – $2');

    // Remove Quality Metrics and Content Upgrades sections
    content = content.replace(/##\s*Quality\s+Metrics[\s\S]*?(?=\n#{2,}\s|$)/gi, '');
    content = content.replace(/##\s*Content\s+Upgrades[\s\S]*?(?=\n#{2,}\s|$)/gi, '');
    content = content.replace(/^\s{0,3}\*\*?\s*Quality\s+Metrics?:[\s\S]*?(?=\n{2,}|\n#+\s|$)/gim, '');
    content = content.replace(/^\s{0,3}\*\*?\s*Content\s+Upgrades?:[\s\S]*?(?=\n{2,}|\n#+\s|$)/gim, '');

    return content;
  }

  normalizeHeadings(content) {
    if (!content) return '';
    const withoutOrphanHeadings = content.replace(/^#(?!#)/gm, '##');
    return withoutOrphanHeadings.replace(/\n{3,}/g, '\n\n');
  }

  removeLeadingTitleHeading(content, research = {}, seoMeta = {}) {
    if (!content) return '';

    const lines = content.split('\n');
    if (lines.length === 0) {
      return content;
    }

    const firstLine = lines[0].trim();
    if (!/^##\s+/i.test(firstLine)) {
      return content;
    }

    const headingText = firstLine.replace(/^##\s+/i, '').trim().toLowerCase();
    const candidates = [
      seoMeta?.title,
      research?.topic_title,
      research?.topic_id,
      research?.primary_keyword,
    ]
      .filter(Boolean)
      .map((value) => String(value).trim().toLowerCase());

    if (candidates.includes(headingText)) {
      lines.shift();
      while (lines[0] !== undefined && lines[0].trim() === '') {
        lines.shift();
      }
      return lines.join('\n');
    }

    return content;
  }

  /**
   * Filter external links to only keep verified, authoritative sources
   * Remove links that are likely to become 404s or dilute SEO
   */
  filterExternalLinks(content) {
    if (!content) return '';

    // Whitelist of trusted Indian financial authorities (permanent URLs only)
    const trustedDomains = [
      'rbi.org.in',
      'sebi.gov.in',
      'nseindia.com',
      'bseindia.com',
      'finmin.nic.in', // Ministry of Finance
      'amfiindia.com', // AMFI
      'irdai.gov.in', // IRDAI
      'pfrda.org.in', // PFRDA
    ];

    // Extract all markdown links [text](url)
    const linkPattern = /\[([^\]]+)\]\(([^)]+)\)/g;
    let externalLinkCount = 0;
    const maxExternalLinks = 3;

    return content.replace(linkPattern, (match, text, url) => {
      // Keep internal PL Capital links
      if (url.includes('plindia.com')) {
        return match;
      }

      // Check if it's a trusted domain
      const isTrusted = trustedDomains.some(domain => url.includes(domain));

      if (isTrusted) {
        externalLinkCount++;
        if (externalLinkCount <= maxExternalLinks) {
          return match; // Keep the link
        }
      }

      // Remove link but keep the text
      return text;
    });
  }

  ensureCallToAction(content, research = {}, seoMeta = {}) {
    if (!content) return '';

    const hasPLCapital = /pl\s+capital/i.test(content);
    const hasCallToAction = /(contact|speak|reach out|call|book|schedule|consult)/i.test(content);
    if (hasPLCapital && hasCallToAction) {
      return content;
    }

    const focusRaw =
      seoMeta.focus_keyphrase ||
      research.primary_keyword ||
      research.topic_title ||
      research.topic_id ||
      'wealth management';
    const focus =
      typeof focusRaw === 'string' && focusRaw.trim().length > 0 ? focusRaw.trim() : 'wealth management';

    const ctaParagraph = [
      '### Partner with PL Capital',
      `Ready to strengthen your ${focus.toLowerCase()} strategy? Connect with our SEBI-registered advisors for personalised guidance and actionable portfolios.`,
      '[Book a consultation](https://www.plindia.com/contact-us) today.',
    ].join('\n');

    return `${content.replace(/\s+$/, '')}\n\n${ctaParagraph}\n`;
  }

  finalizeArticleContent(content) {
    if (!content) return '';
    return content
      .replace(/[ \t]+\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  collectSources(rawSources, research) {
    const aiSources = this.ensureArray(rawSources).map((source) => {
      if (!source) return source;
      if (typeof source === 'object') {
        return source.url || source.link || source.href || source.value || '';
      }
      return source;
    });

    const researchSources = this.getResearchSources(research);
    return this.normalizeSourceList([...aiSources, ...researchSources]);
  }

  normalizeSourceList(candidates = []) {
    const urls = new Set();

    candidates.forEach((candidate) => {
      if (!candidate) return;
      const value =
        typeof candidate === 'object'
          ? candidate.url || candidate.link || candidate.href || candidate.value || ''
          : candidate;

      if (!value) return;

      let normalized = null;
      if (this.csvManager && typeof this.csvManager.normalizeSourceUrl === 'function') {
        normalized = this.csvManager.normalizeSourceUrl(value);
      }
      if (!normalized) {
        normalized = this.normalizeUrlCandidate(value, false);
      }
      if (normalized) {
        urls.add(normalized);
      }
    });

    return Array.from(urls);
  }

  normalizeUrlCandidate(raw, allowNonHttp = false) {
    if (!raw) return null;
    const value = typeof raw === 'string' ? raw.trim() : String(raw);
    if (!value) return null;

    if (/^https?:\/\//i.test(value)) {
      try {
        const parsed = new URL(value);
        const normalized = `${parsed.protocol}//${parsed.hostname}${parsed.pathname}`.replace(/\/+$/, '');
        return normalized;
      } catch (_) {
        return null;
      }
    }

    return allowNonHttp ? value : null;
  }

  getResearchSources(research) {
    if (!research) return [];

    const cacheKey = research.topic_id || research.topic_research_id;
    if (cacheKey && this.researchSourceCache.has(cacheKey)) {
      return this.researchSourceCache.get(cacheKey);
    }

    let extracted = [];
    if (this.csvManager && typeof this.csvManager.extractSourceUrls === 'function') {
      extracted = this.csvManager.extractSourceUrls(research);
    }

    const normalized = this.normalizeSourceList(extracted);

    if (cacheKey) {
      this.researchSourceCache.set(cacheKey, normalized);
    }

    return normalized;
  }

  composeHeroPrompt(seoMeta = {}, research = {}) {
    const title =
      seoMeta.title ||
      research.topic_title ||
      research.topic_id ||
      research.primary_keyword ||
      'Financial insights for Indian investors';
    const focus = seoMeta.focus_keyphrase || research.primary_keyword || '';
    const intent = research.search_intent || '';
    const superiority = research.content_superiority_plan || '';
    const impact = research.estimated_impact || '';

    const descriptors = [intent, superiority, impact]
      .flatMap((item) => {
        if (!item) return [];
        if (Array.isArray(item)) {
          return item
            .map((entry) => (typeof entry === 'string' ? entry : String(entry ?? '')))
            .filter(Boolean);
        }
        if (typeof item === 'object') {
          return Object.values(item)
            .map((entry) => (typeof entry === 'string' ? entry : String(entry ?? '')))
            .filter(Boolean);
        }
        return [typeof item === 'string' ? item : String(item)];
      })
      .map((item) => item.replace(/\s+/g, ' ').trim())
      .filter((item) => item && item !== '[object Object]')
      .join('. ');

    const descriptorText = descriptors ? `${descriptors}. ` : '';
    const focusText = focus ? `Focus on ${focus} outcomes. ` : '';

    return `Create a professional square hero image (1024×1024 pixels) for an Indian financial article titled "${title}". ${descriptorText}${focusText}Show expert wealth advisors reviewing market data, charts, and projections in a premium Mumbai office. Emphasize professionalism, trust, and forward-looking strategy. Use natural lighting, modern aesthetics, centered composition optimized for small square format (final size: 450×450 pixels), and avoid text or typography. Keep important elements in the center frame to ensure nothing critical is lost when resized.`;
  }

  buildHeroImagePrompt(content, research) {
    const seoMeta = content.__seo || this.safeParseJSON(content.seo_metadata, {});
    return this.composeHeroPrompt(seoMeta, research);
  }

  buildHeroAltText(title, focus) {
    const subject = focus || title || 'financial strategy';
    return `Professional illustration of advisors discussing ${subject} in an Indian financial office`;
  }

  buildHeroPlaceholder(research, seoMeta, reason) {
    const meta = seoMeta || {};
    const title =
      meta.title || research.topic_title || research.topic_id || research.primary_keyword || 'Financial insights';
    const focus = meta.focus_keyphrase || research.primary_keyword || '';
    const prompt = this.composeHeroPrompt(meta, research);

    return {
      topic_id: research.topic_id,
      status: 'placeholder',
      provider: 'placeholder',
      reason,
      prompt,
      alt: this.buildHeroAltText(title, focus),
      generated_at: new Date().toISOString(),
    };
  }

  normalizeHeroPayload(candidate, research, seoMeta) {
    if (!candidate) return null;
    let payload = candidate;

    if (typeof candidate === 'string') {
      const trimmed = candidate.trim();
      if (!trimmed) {
        return null;
      }
      if (/^\{/.test(trimmed)) {
        try {
          payload = JSON.parse(trimmed);
        } catch (_) {
          return null;
        }
      } else if (/^https?:\/\//i.test(trimmed)) {
        payload = { status: 'provided', url: trimmed };
      } else {
        return null;
      }
    }

    if (payload && typeof payload === 'object') {
      const normalized = { ...payload };
      const meta = seoMeta || {};
      const title =
        meta.title || research.topic_title || research.topic_id || research.primary_keyword || 'Financial insights';
      const focus = meta.focus_keyphrase || research.primary_keyword || '';

      normalized.topic_id = normalized.topic_id || research.topic_id || null;
      normalized.status = normalized.status || (normalized.url ? 'provided' : 'placeholder');
      if (normalized.url) {
        const normalizedUrl = this.normalizeUrlCandidate(normalized.url, true);
        if (normalizedUrl) {
          normalized.url = normalizedUrl;
        }
      }
      normalized.alt = normalized.alt || this.buildHeroAltText(title, focus);
      normalized.prompt = normalized.prompt || this.composeHeroPrompt(meta, research);
      normalized.generated_at = normalized.generated_at || new Date().toISOString();
      normalized.provider = normalized.provider || 'manual';

      return normalized;
    }

    return null;
  }

  shouldGenerateHeroImage() {
    return Boolean(this.config.generateImages && this.openaiApiKey);
  }

  async applyHeroImage(content, research) {
    if (!content || !research) {
      return content;
    }

    if (content.__heroApplied) {
      return content;
    }

    const seoMeta = content.__seo || this.safeParseJSON(content.seo_metadata, {});
    const cacheKey = research.topic_id || content.topic_id;

    let hero = content.__hero || this.safeParseJSON(content.hero_image, null);
    if (hero && ['generated', 'provided'].includes(hero.status)) {
      content.hero_image = JSON.stringify(hero);
      content.__heroApplied = true;
      return content;
    }

    if (!hero && cacheKey && this.heroImageCache.has(cacheKey)) {
      const cached = this.heroImageCache.get(cacheKey);
      if (cached && ['generated', 'provided'].includes(cached.status)) {
        hero = cached;
      }
    }

    if (!hero && this.shouldGenerateHeroImage()) {
      const prompt = this.buildHeroImagePrompt(content, research);
      const alt = this.buildHeroAltText(
        seoMeta?.title || research.topic_title || research.topic_id,
        seoMeta?.focus_keyphrase || research.primary_keyword
      );

      try {
        const generated = await generateHeroImage({
          prompt,
          topicId: cacheKey,
          title: seoMeta?.title || research.topic_title || research.topic_id,
          focusKeyword: seoMeta?.focus_keyphrase || research.primary_keyword || '',
          saveToDisk: true,
        });

        if (generated && ['generated', 'provided'].includes(generated.status || 'generated')) {
          hero = {
            topic_id: cacheKey,
            status: generated.status || 'generated',
            provider: generated.provider || 'openai-dall-e-3',
            url: generated.url || null,
            local_path: generated.localPath || generated.local_path || null,
            prompt: generated.prompt || prompt,
            alt: generated.alt || alt,
            generated_at: generated.generated_at || new Date().toISOString(),
            metadata: generated.metadata || {},
          };
        }

        if (!hero && generated && generated.status === 'skipped') {
          hero = this.buildHeroPlaceholder(research, seoMeta, 'skipped');
        }
      } catch (error) {
        console.warn(`⚠️  Hero image generation failed for ${cacheKey || research.topic_research_id}: ${error.message}`);
      }
    }

    if (!hero) {
      const reason = this.shouldGenerateHeroImage() ? 'generation_failed' : 'images_disabled';
      hero = this.buildHeroPlaceholder(research, seoMeta, reason);
    }

    if (cacheKey) {
      this.heroImageCache.set(cacheKey, hero);
    }

    content.__hero = hero;
    content.hero_image = JSON.stringify(hero);
    content.__heroApplied = true;
    return content;
  }

  /**
   * Prepare content object for CSV storage (remove internal markers)
   */
  prepareForStorage(content) {
    if (!content) return null;
    const { __fallback, __quality, __seo, __hero, __heroApplied, __sources, ...rest } = content;
    return {
      ...rest,
      approval_status: rest.approval_status || 'Needs-SEO',
    };
  }

  /**
   * Normalize SEO metadata ensuring all required fields exist
   */
  normalizeSeoMetadata(meta, research, article = '') {
    const raw = this.safeParseJSON(meta, meta && typeof meta === 'object' ? meta : {});
    const focus = raw.focus_keyphrase || research.primary_keyword || '';
    const title = this.truncateTitle(raw.title || research.topic_id || focus);
    const metaDescription = this.buildMetaDescription(raw.meta_description, article, focus);

    const secondary = this.ensureArray(raw.secondary_keywords || [])
      .filter(Boolean)
      .map((kw) => kw.toLowerCase())
      .slice(0, 5);

    if (secondary.length < 3 && focus) {
      const fallbacks = [
        `${focus} analysis india`,
        `${focus} pros and cons`,
        `${focus} calculator`,
        `${focus} tax benefits`,
      ];
      for (const item of fallbacks) {
        if (secondary.length >= 5) break;
        if (!secondary.includes(item.toLowerCase())) {
          secondary.push(item);
        }
      }
    }

    return {
      title,
      meta_description: metaDescription,
      focus_keyphrase: focus,
      secondary_keywords: secondary,
    };
  }

  /**
   * Build quality metrics with guaranteed fields
   */
  buildQualityMetrics(rawMetrics, article, isFallback) {
    const metrics = this.safeParseJSON(rawMetrics, rawMetrics && typeof rawMetrics === 'object' ? rawMetrics : {});
    const wordCount = metrics.word_count || this.calculateWordCount(article);

    return {
      word_count: wordCount,
      readability_score: metrics.readability_score || 'Needs Review',
      seo_score: metrics.seo_score || 'Pending',
      source: isFallback ? 'fallback' : metrics.source || 'model',
    };
  }

  calculateWordCount(text) {
    if (!text) return 0;
    return text
      .replace(/[`*#>]/g, ' ')
      .split(/\s+/)
      .filter(Boolean).length;
  }

  truncateTitle(title) {
    if (!title) return '';
    const cleaned = title.trim();
    if (cleaned.length > 60) {
      console.warn(
        `⚠️  Generated title exceeds 60 characters ("${cleaned.length}" chars): "${cleaned}". Keeping full title for display.`
      );
    }
    return cleaned;
  }

  buildMetaDescription(existing, article, focus) {
    if (existing) {
      const trimmed = existing.trim();
      if (trimmed.length >= 140 && trimmed.length <= 160) {
        return trimmed;
      }
    }

    const focusPhrase = focus || 'mutual fund investments';
    const fallback =
      `Compare ${focusPhrase} performance, costs, and risks. Discover expert analysis, insights, and action steps for Indian investors today.`;

    const articleSnippet = (article || '')
      .replace(/[`*#>\[\]]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 200);

    const candidate = articleSnippet.length > 0 ? `${articleSnippet} Learn how to act now.` : fallback;
    return this.clampDescription(candidate, focusPhrase);
  }

  clampDescription(text, focusPhrase) {
    if (!text) {
      return this.clampDescription(
        `Learn how ${focusPhrase} compares on returns, volatility, and costs. Get expert tips and actionable insights for Indian investors.`,
        focusPhrase
      );
    }

    const cleaned = text.replace(/\s+/g, ' ').trim();
    if (cleaned.length > 160) {
      return `${cleaned.slice(0, 157).trim()}...`;
    }
    if (cleaned.length < 140) {
      const extension =
        ' Explore comparative charts, expert insights, and takeaways tailored for Indian investors.';
      const extended = `${cleaned}${extension}`;
      return extended.length > 160 ? extended.slice(0, 157).trim() + '...' : extended;
    }
    return cleaned;
  }

  ensureArray(value) {
    if (Array.isArray(value)) {
      return value.filter(Boolean);
    }
    if (typeof value === 'string' && value.trim().length > 0) {
      const trimmed = value.trim();
      if (/^[\[{]/.test(trimmed)) {
        try {
          const parsed = JSON.parse(trimmed);
          return this.ensureArray(parsed);
        } catch (_) {
          // fall through to delimiter split
        }
      }
      return trimmed
        .split(/[\n;,]+/)
        .map((item) => item.trim())
        .filter(Boolean);
    }
    if (value && typeof value === 'object') {
      return Object.values(value)
        .map((entry) => (typeof entry === 'string' ? entry.trim() : entry))
        .filter(Boolean);
    }
    return [];
  }

  safeParseJSON(value, fallback = null) {
    if (!value) return fallback;
    if (typeof value === 'object') return value;
    try {
      return JSON.parse(value);
    } catch (error) {
      return fallback;
    }
  }

  stripControlChars(text) {
    if (!text) return '';
    return text.replace(/[^\x09\x0A\x0D\x20-\uFFFF]/g, '');
  }

  normalizeJsonString(text) {
    return text.replace(/,\s*([\]}])/g, '$1');
  }

  /**
   * Print a summary for the batch
   */
  printSummary(results) {
    console.log('\n' + '='.repeat(60));
    console.log('📊 CONTENT CREATION SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Created Content: ${results.length} article(s)`);
    console.log('\n📋 Next Steps:');
    console.log('   1. Review created-content.csv file');
    console.log('   2. Approve content (set approval_status = "Yes")');
    console.log('   3. Run SEO optimizer: node content/seo-optimizer.js');
    console.log('='.repeat(60) + '\n');
  }
}

// CLI
if (require.main === module) {
  const creator = new ContentCreator();
  const command = process.argv[2];

  switch (command) {
    case 'create':
      creator
        .createContent()
        .then(() => console.log('🎉 Content creation completed!'))
        .catch((err) => {
          console.error('❌ Failed:', err.message);
          process.exit(1);
        });
      break;

    default:
      console.log('Usage: node content-creator.js [create]');
      console.log('');
      console.log('Commands:');
      console.log('  create - Create content from approved research');
  }
}

module.exports = ContentCreator;
