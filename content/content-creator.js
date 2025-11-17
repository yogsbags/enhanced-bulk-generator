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
  /**
   * Dynamic word count based on topic type
   */
  getOptimalWordCount(research) {
    const intent = this.normalizeTextField(research.search_intent);
    const title = this.normalizeTextField(research.topic_title || research.topic_id);

    // Informational topics (What is, How does it work)
    if (intent.includes('informational') || title.includes('what is') || title.includes('how does')) {
      return 1350; // Round 3 optimization: 1300-1350 words
    }

    // Guide/How-to/Buying Guide topics (Round 6 #43: 1000-1200 words)
    if (title.includes('guide') || title.includes('buying guide') || title.includes('complete guide') ||
        title.includes('how to guide') || title.includes('step-by-step guide') ||
        intent.includes('guide') || intent.includes('how-to')) {
      return 1200; // Round 6 #43: Guide topics target 1000-1200 words
    }

    // Strategy topics (Best time, How to, Step-by-step)
    if (title.includes('best time') || title.includes('how to') || title.includes('step by step') ||
        intent.includes('strategy')) {
      return 1600; // Sweet spot for retention (15-20% less than default)
    }

    // Comparison/Analysis topics
    if (title.includes('vs') || title.includes('comparison') || intent.includes('comparison')) {
      return 1900; // Round 3 optimization: 1800-2000 words
    }

    // Default for pillar/ultimate guides
    return 2000;
  }

  /**
   * Normalize free-form fields that may arrive as strings, arrays, or objects
   */
  normalizeTextField(value) {
    if (value === null || value === undefined) {
      return '';
    }

    if (typeof value === 'string') {
      return value.toLowerCase();
    }

    if (Array.isArray(value)) {
      return value
        .filter((item) => item !== null && item !== undefined)
        .map((item) => String(item).toLowerCase())
        .join(' ');
    }

    if (typeof value === 'object') {
      const parts = Object.values(value).map((item) => {
        if (item === null || item === undefined) {
          return '';
        }
        if (Array.isArray(item)) {
          return item
            .filter((sub) => sub !== null && sub !== undefined)
            .map((sub) => String(sub).toLowerCase())
            .join(' ');
        }
        return String(item).toLowerCase();
      });
      return parts.join(' ').trim();
    }

    return String(value).toLowerCase();
  }

  buildContentPrompt(research, options = {}) {
    const wordTarget = 2400; // Fixed target of ~2,400 words as per guidelines
    const attempt = options.attempt || 1;
    const feedback = options.feedback ? `\nREVISION FEEDBACK:\n${options.feedback}\n` : '';
    const sources = this.getResearchSources(research);
    const sourcesList = sources.length
      ? sources.map((url, idx) => `${idx + 1}. ${url}`).join('\n')
      : 'Reference RBI publications, SEBI circulars, and reputable Indian financial portals.';

    return `You are an award-winning Indian financial strategist, senior editor, and compliance reviewer.
Using the approved research brief, craft an SEO ready article that reads like it was written by PL Capital's in-house experts.

**CRITICAL: FOLLOW THESE 39 GUIDELINES STRICTLY**

1. ✅ NEVER mention competitor names: Zerodha, Upstox, Angel One, ICICI Direct, Groww
2. ✅ START DIRECTLY WITH "## Executive Summary" - NO introductory paragraphs before this H2
3. ✅ NO H2 for "Introduction" - plain text paragraphs after Executive Summary (no heading)
4. ✅ ADD "## Key Takeaways" section BEFORE "## Conclusion" (5-7 action-oriented bullets)
5. ✅ ADD "## Action Plan" section BEFORE "## Conclusion" (step-by-step monthly roadmap)
6. ✅ MOVE "## FAQ Section" or "## FAQs on [Topic]" AFTER "## Conclusion" (never before)
7. ✅ Use MIXED formatting throughout - paragraphs, tables, bullets, numbered lists (NOT all bullets)
8. ✅ EEAT COMPLIANCE: Human-readable, high-quality, original content with expertise, experience, authority, trust
9. ✅ CTA in Conclusion: MUST include link to https://instakyc.plindia.com/ with text "Open your PL Capital account"
10. ✅ NATURAL keyword flow - NO keyword stuffing, use semantic variations naturally
11. ✅ 8th GRADE ENGLISH - Simple language, simplified H2s (avoid jargon, explain technical terms)
12. ✅ H2s and H3s structure - Semantic hierarchy with focus keyword variations in headings
13. ✅ WORD COUNT: Under 2500 words (~2,400 words target) - concise and focused
14. ✅ ELABORATE examples with REAL data - NO hallucination, NO fake statistics, NO invented fund names
15. ✅ SENTENCES: Under 15 words average - short, punchy, clear sentences
16. ✅ CONCISE throughout - Every paragraph must earn its place, cut ruthlessly
17. ✅ ENHANCED GREEKS section (if applicable): Flowing explanations with real examples, NOT just definitions
18. ✅ 5 FAQs ONLY - No more, no less (H3 format with complete questions)
19. ✅ 100-WORD Conclusion - Brief, actionable, with PL Capital CTA
20. ✅ DATE CONTEXT: November 2025 (NOT January 2025) - use "FY 2025-26" for current financial year, "AY 2026-27" for assessment year
21. ✅ FAQ ANSWERS: 30-40 words each with COMPLETE questions in H3 format (e.g., "### What is...")
22. ✅ FAQ PLACEMENT: MUST be AFTER "## Conclusion" section (never before, never mid-article)
23. ✅ WEB RESEARCH: Use factual accuracy, proper content structure, real data from research brief

**FACTUAL ACCURACY & COMPLIANCE RULES (24-39) - Apply ONLY when these topics are mentioned:**

24. ✅ IF mentioning TRADER PARTICIPATION: Use general qualifiers - "Lakhs of traders", "Thousands of traders", "Many traders" - NEVER specific unverifiable numbers like "12 lakh traders" (add asterisk*)
25. ✅ IF mentioning TRADING VOLUMES: Always prefix with "Approximately" or "Around" - e.g., "Approximately 5-7 crore contracts" (add asterisk*)
26. ✅ IF mentioning LOT SIZES: Always add qualifier "subject to NSE revisions" - NEVER use "as of Nov 2025" for current date (add asterisk*)
27. ✅ IF mentioning STRIKE INTERVALS: Use "Typically" or "Generally" prefix - e.g., "Typically 50 points", "Generally 100 points" (add asterisk*)
28. ✅ IF mentioning INCOME/ELIGIBILITY REQUIREMENTS: Present as broker-specific NOT regulatory - "Most brokers require minimum annual income (typically ₹2-3 lakh)" NOT "SEBI requires ₹2 lakh income" (add asterisk*)
29. ✅ IF mentioning CIRCUIT LIMITS: Clarify "No individual strike circuits; market-wide breakers apply" NOT just "No circuit limits" (add asterisk*)
30. ✅ IF mentioning TAX RULES: Always specify assessment year - "for Assessment Year 2026-27" and note rules are subject to change (add asterisk*)
31. ✅ IF mentioning EXPIRY SCHEDULES: Add qualifier noting NSE's right to change - "Every Tuesday (subject to NSE notifications)" (add asterisk*)
32. ✅ PROBABILITY & SUCCESS RATES: NEVER state as facts - "65% probability of profit" is PROHIBITED. Instead: "Your profit chances improve when [conditions]... exact probability varies by market conditions"
33. ✅ RETURNS & ROI: Always frame as examples - "Example Return: 233% if price reaches upper strike" NOT "Return on Investment: 233% gain"
34. ✅ PERCENTAGE CLAIMS: Qualify cost savings/reductions - "Example shows: 67% cost reduction" or "significantly reduces cost" NOT absolute "40-70% reduction" without context
35. ✅ AVOID REPETITION: Each key concept should be explained ONCE in detail. Don't repeat cost advantages, volatility warnings, or expiry risks across multiple sections. Consolidate.
36. ✅ GREEKS/TECHNICAL SECTIONS: Keep practical and accessible. Focus on "Understanding Risk Factors" with real impact, not heavy Greek formulas. Example: "Time decay (Theta)" with practical effect, not "Bought Call Theta: -₹8, Sold Call Theta: +₹6, Net Theta: -₹2"
37. ✅ UNSOURCED HISTORICAL DATA: NEVER claim "Historical data shows..." or "Studies indicate..." without sources. Use: "Nifty typically shows weekly movements" NOT "Historical data shows Nifty moves 0.5-1% weekly on average"
38. ✅ IMPORTANT NOTES SECTION: IF any asterisks (*) are used in article, add "**Important Notes:**" section at end explaining all asterisked items. IF no asterisks used, standard risk disclaimer is sufficient.
39. ✅ ASTERISK USAGE: Mark claims requiring qualifiers with asterisk (*) in body text, then explain in "Important Notes" section. Only include explanations for asterisk-marked items actually used in the article.

**ARTICLE STRUCTURE (MANDATORY ORDER):**

1. ## Executive Summary (3-4 sentences, context + opportunity + takeaway)
2. Plain text introduction paragraphs (NO H2 heading, 2-3 paragraphs explaining topic)
3. ## [Main Topic] sections (5-8 H2 sections with H3 subsections)
4. ## Key Takeaways (5-7 action-oriented bullets BEFORE Conclusion)
5. ## Action Plan (Monthly roadmap: Month 1-2, Month 3-4, etc.)
6. ## Conclusion (100 words max, must include CTA with https://instakyc.plindia.com/)
7. ## FAQ Section or ## FAQs on [Topic] (EXACTLY 5 FAQs with H3 questions, 30-40 word answers)

**CRITICAL FORMATTING RULES:**

- **Executive Summary**: Must be FIRST H2, no content before it
- **No Introduction H2**: After Executive Summary, start with plain text paragraphs (no heading)
- **Key Takeaways**: BEFORE Conclusion, bullet list with "You can...", "Consider...", "Start with..."
- **Action Plan**: BEFORE Conclusion, monthly timeline (Month 1-2: ..., Month 3-4: ...)
- **Conclusion**: 100 words, 2-3 paragraphs, MUST include: "Ready to [action]? [Open your PL Capital account](https://instakyc.plindia.com/) and..."
- **FAQs**: AFTER Conclusion, H3 format: "### What is [topic]?", "### How does [topic] work?", etc.
- **FAQ Answers**: 30-40 words each, complete sentences, specific data (amounts, percentages, timelines)

**WRITING STYLE:**

- Short sentences (under 15 words average)
- 8th grade reading level (simple, clear language)
- Active voice: "You can invest..." NOT "Investors can invest..."
- Mixed formatting: paragraphs + tables + bullets + numbered lists
- Natural keyword flow (no stuffing)
- Conversational tone with "you/your" language
- Specific examples with INR amounts (₹10,000, ₹1 lakh, ₹50,000)
- Real data only (NO hallucination, NO fake statistics)

**GREEKS/RISK FACTORS SECTION (if applicable for options/derivatives topics):**

- Title section "Understanding Risk Factors" NOT "Greeks Analysis" for better accessibility
- Explain concepts in plain language: "Price Movement (Delta)", "Time Decay (Theta)", "Volatility Impact (Vega)"
- Focus on practical impact: "If Nifty moves 100 points, your spread gains value gradually"
- Use simple examples with real ₹ amounts, NOT complex formulas like "Net Theta: -₹2 = (Bought -₹8) + (Sold +₹6)"
- Skip Gamma entirely unless absolutely critical - it's too technical for most readers
- Keep it conversational: "Time works against all options buyers. Bull call spread reduces this impact significantly."

**PROHIBITED:**

- ❌ Competitor names: Zerodha, Upstox, Angel One, ICICI Direct, Groww
- ❌ "## Introduction" heading (use plain text after Executive Summary)
- ❌ FAQs before Conclusion
- ❌ More than 5 FAQs
- ❌ Conclusions longer than 100 words
- ❌ Keyword stuffing or repetitive explanations
- ❌ Fake statistics or invented data
- ❌ Generic CTA links (must use https://instakyc.plindia.com/)
- ❌ January 2025 references (use November 2025 or FY 2025-26)
- ❌ Sentences longer than 20 words (aim for under 15 words)
- ❌ Specific unverifiable trader numbers ("12 lakh traders", "5 lakh users")
- ❌ Absolute statements about lot sizes, volumes, or intervals without qualifiers
- ❌ Presenting broker requirements as SEBI/regulatory mandates
- ❌ "Disclaimer" heading (use "Important Notes" instead)
- ❌ Unqualified tax rules (always add "for AY 2026-27")
- ❌ Probability/success rates stated as facts ("65% probability", "60-65% success rate")
- ❌ Unsourced historical claims ("Historical data shows...", "Studies indicate...")
- ❌ Absolute ROI claims (frame as "Example Return" not "Return on Investment")
- ❌ Future-date references like "as of Nov 2025" (just use "subject to NSE revisions")
- ❌ Heavy Greek formulas (use practical "Understanding Risk Factors" approach)

**WORD COUNT DISTRIBUTION (~2,400 words total):**

- Executive Summary: 50-80 words
- Introduction paragraphs (no heading): 150-200 words
- Main H2 sections (5-8 sections): 1,800-2,000 words (250-300 words each)
- Key Takeaways: 100-150 words
- Action Plan: 150-200 words
- Conclusion: 100 words
- FAQs (5 questions): 200-250 words (40-50 words per FAQ)

**JSON SCHEMA (REQUIRED OUTPUT FORMAT):**

Respond with a single valid JSON object (no markdown fences) following this schema:

{
  "topic_id": "string",
  "seo_metadata": {
    "title": "string <= 60 characters, keyword-focused. Format: '[Topic]: Complete Guide' or 'What is [Topic]?'",
    "meta_description": "string 140-160 characters with CTA and focus keyphrase",
    "focus_keyphrase": "string",
    "secondary_keywords": ["string", "string", "string"]
  },
  "article_content": "markdown string ~2,400 words following 23 guidelines above",
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

**RESEARCH CONTEXT:**
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

**SOURCES FOR REFERENCE:**
${sourcesList}

**FINAL REMINDERS:**
- Target: ~2,400 words (under 2,500 words)
- Structure: Executive Summary → Plain intro → Main sections → Key Takeaways → Action Plan → Conclusion → FAQs → [Important Notes - only if asterisks used]
- FAQs: EXACTLY 5 questions AFTER Conclusion
- CTA: Must include https://instakyc.plindia.com/ in Conclusion
- Date: November 2025, FY 2025-26 (current), AY 2026-27 (for tax rules)
- Sentences: Under 15 words average
- NO competitor names, NO hallucinated data, NO keyword stuffing, NO repetition
- NEVER state probabilities/success rates as facts - always qualify
- NEVER claim unsourced historical data - use "typically" instead of "historical data shows"
- Frame ALL returns/ROI as examples, not guarantees
- Qualify percentage claims (cost reductions, etc.) as examples or use "significantly"
- Keep Greeks/technical content practical - focus on real impact, not heavy formulas
- NO future-date references ("as of Nov 2025") - use "subject to NSE revisions"
- IF mentioning volumes, lot sizes, trader numbers, tax rules, expiry schedules, requirements → add asterisks (*) and explain in "Important Notes"
- IF no such facts mentioned → end with standard risk disclaimer after FAQs (no separate "Important Notes" needed)

**ASTERISK REFERENCE FORMAT (USE ONLY IF ASTERISKS PRESENT IN ARTICLE):**

IF you used asterisks (*) in the article, add after FAQ section:

---

**Important Notes:**
\*[List only the qualifications for asterisk-marked items actually used in your article. Examples:]
- IF volumes mentioned: Trading volumes are approximate based on recent market activity and subject to change.
- IF lot sizes mentioned: Lot sizes and contract specifications subject to NSE circulars.
- IF trader numbers mentioned: Participation figures are estimates.
- IF tax rules mentioned: Tax rules applicable for Assessment Year 2025-26; consult a tax professional.
- IF broker requirements mentioned: Requirements vary by institution.
- IF expiry schedules mentioned: Expiry schedules subject to NSE/SEBI notifications.
[Then add:] Options trading involves substantial risk. This guide is for educational purposes only. Consult a SEBI-registered advisor before trading.

IF no asterisks used in article, just end with standard risk disclaimer after FAQs (no separate "Important Notes" section needed).

Focus on outperforming top competitors in depth, freshness, and authority while maintaining factual accuracy and compliance.
`;
  }

  /**
   * Call Groq/OpenAI models in priority order for content drafting
   */
  async callAI(prompt) {
    const groqModels = [
      { name: 'openai/gpt-oss-120b', label: 'Groq GPT-OSS 120B (primary)', temperature: 0.6 },
      { name: 'groq/compound', label: 'Groq Compound (secondary)', temperature: 0.55 }
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
    content = this.removeIntroHeadingBeforeExecutiveSummary(content, research, seoMeta);
    content = this.standardizeExecutiveSummarySection(content);
    content = this.removeTrailingYearsFromHeadings(content);
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

    // Remove Comparative Benchmark and related sections
    content = content.replace(/##\s*Comparative\s+Benchmark[\s\S]*?(?=\n#{2,}\s|$)/gi, '');
    content = content.replace(/###\s*Content\s+Gap\s+Analysis[\s\S]*?(?=\n#{2,3}\s|$)/gi, '');
    content = content.replace(/###\s*Our\s+Superiority\s+Plan[\s\S]*?(?=\n#{2,3}\s|$)/gi, '');

    // Remove External References section
    content = content.replace(/\*\*External\s+References\*\*[\s\S]*?(?=\n{2,}|\n#+\s|$)/gi, '');
    content = content.replace(/##\s*External\s+References[\s\S]*?(?=\n#{2,}\s|$)/gi, '');

    // Remove Compliance Disclaimer section
    content = content.replace(/\*\*Compliance\s+Disclaimer\*\*[\s\S]*?(?=\n{2,}|\n#+\s|$)/gi, '');
    content = content.replace(/##\s*Compliance\s+Disclaimer[\s\S]*?(?=\n#{2,}\s|$)/gi, '');

    // Remove disclaimer footer (usually starts with "---" followed by "*All data reflects...")
    content = content.replace(/\n---\s*\n\*All data reflects[\s\S]*$/gi, '');
    content = content.replace(/\n\*All data reflects[\s\S]*$/gi, '');

    // Remove any trailing disclaimer that starts with "*All" or "*This article"
    content = content.replace(/\n\*All (data|information|content)[\s\S]*$/gi, '');
    content = content.replace(/\n\*This (article|information|content)[\s\S]*$/gi, '');

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
    let firstIndex = lines.findIndex((line) => line.trim() !== '');
    if (firstIndex === -1) {
      return content;
    }

    const firstLine = lines[firstIndex].trim();
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
      lines.splice(firstIndex, 1);
      while (lines[firstIndex] !== undefined && lines[firstIndex].trim() === '') {
        lines.splice(firstIndex, 1);
      }
      return lines.join('\n');
    }

    return content;
  }

  removeIntroHeadingBeforeExecutiveSummary(content, research = {}, seoMeta = {}) {
    if (!content) return '';

    const lines = content.split('\n');
    let firstIndex = lines.findIndex((line) => line.trim() !== '');
    if (firstIndex === -1) return content;

    const firstLine = lines[firstIndex].trim();
    if (!/^##\s+/i.test(firstLine)) return content;
    if (/^##\s*Executive\s+Summary/i.test(firstLine)) return content;

    const headingText = firstLine.replace(/^##\s+/i, '').trim();
    if (!headingText) return content;

    if (
      this.isGenericIntroHeading(headingText) ||
      this.looksLikeTopicHeading(headingText, research, seoMeta)
    ) {
      lines.splice(firstIndex, 1);
      while (lines[firstIndex] !== undefined && lines[firstIndex].trim() === '') {
        lines.splice(firstIndex, 1);
      }
      return lines.join('\n');
    }

    return content;
  }

  standardizeExecutiveSummarySection(content) {
    if (!content) return '';

    const lines = content.split('\n');
    const execIndex = lines.findIndex((line) => /^##\s*Executive\s+Summary/i.test(line.trim()));
    if (execIndex === -1) {
      return content;
    }

    const headingLine = lines[execIndex];
    const remainder = headingLine.replace(/^##\s*Executive\s+Summary/i, '').replace(/^[\s–—:\-]+/, '').trim();
    lines[execIndex] = '## Executive Summary';

    let sectionStart = execIndex + 1;
    let sectionEnd = sectionStart;
    while (sectionEnd < lines.length && !/^##\s+/i.test(lines[sectionEnd].trim())) {
      sectionEnd++;
    }

    const originalSection = lines.slice(sectionStart, sectionEnd);
    const sectionLines = remainder ? [remainder, ...originalSection] : originalSection.slice();
    const normalizedSection = this.normalizeExecutiveSummaryContent(sectionLines);

    lines.splice(sectionStart, sectionEnd - sectionStart, ...normalizedSection);
    return lines.join('\n');
  }

  normalizeExecutiveSummaryContent(lines) {
    const normalized = [];

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed) {
        return;
      }

      if (/^[-*]\s+/.test(trimmed)) {
        normalized.push(this.ensureSentenceEnding(trimmed.replace(/^[-*]\s+/, '').trim()));
      } else {
        normalized.push(trimmed);
      }
    });

    if (normalized.length === 0) {
      return [];
    }

    if (normalized[normalized.length - 1] !== '') {
      normalized.push('');
    }

    return normalized;
  }

  looksLikeTopicHeading(heading, research = {}, seoMeta = {}) {
    const headingTokens = this.tokenizeComparableValue(heading);
    if (headingTokens.length === 0) return false;

    const candidateValues = [
      seoMeta?.title,
      seoMeta?.focus_keyphrase,
      research?.topic_title,
      research?.primary_keyword,
      research?.topic_id,
    ];

    return candidateValues.some((value) => {
      const candidateTokens = this.tokenizeComparableValue(value);
      if (candidateTokens.length === 0) return false;
      const overlap = headingTokens.filter((token) => candidateTokens.includes(token));
      return overlap.length >= 2 && overlap.length >= Math.min(headingTokens.length, 3);
    });
  }

  tokenizeComparableValue(value) {
    if (!value) return [];
    const normalized = this.normalizeComparableValue(value);
    if (!normalized) return [];
    const ignore = new Set(['guide', 'complete', 'india', 'indian', 'investors', 'introduction', 'overview', 'updated']);
    return normalized
      .split(' ')
      .map((token) => token.trim())
      .filter((token) => token.length > 2 && !ignore.has(token));
  }

  normalizeComparableValue(value) {
    if (!value) return '';
    return String(value).toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
  }

  isGenericIntroHeading(text) {
    if (!text) return false;
    const normalized = text.trim().toLowerCase();
    return (
      normalized === 'introduction' ||
      normalized === 'overview' ||
      normalized === 'about this topic' ||
      /^introduction\b/i.test(text) ||
      /^overview\b/i.test(text)
    );
  }

  ensureSentenceEnding(sentence) {
    if (!sentence) return '';
    return /[.!?]"?$/.test(sentence) ? sentence : `${sentence}.`;
  }

  removeTrailingYearsFromHeadings(content) {
    if (!content) return '';

    const headingPattern = /^(#{2,6}\s+)(.+)$/gm;
    return content.replace(headingPattern, (full, hashes, text) => {
      const trimmed = (text || '').trimEnd();
      const cleaned = trimmed.replace(/(\s*[–—\-:|]\s*)?\b(20\d{2})\b\s*$/i, (match, separator = '', year = '') => {
        if (!year) {
          return match;
        }
        if (this.shouldPreserveHeadingYear(trimmed, year)) {
          return match;
        }
        return '';
      });

      const normalized = cleaned.replace(/\s{2,}/g, ' ').trim();
      return normalized ? `${hashes}${normalized}` : full;
    });
  }

  shouldPreserveHeadingYear(text, year) {
    if (!text || !year) return false;
    const trimmed = text.trim();

    if (/\bFY\s*20\d{2}$/i.test(trimmed)) {
      return true;
    }

    if (/\b20\d{2}\s*[–—-]\s*20\d{2}$/i.test(trimmed)) {
      return true;
    }

    return false;
  }

  /**
   * Filter external links - remove ALL external links, keep only internal PL Capital links
   */
  filterExternalLinks(content) {
    if (!content) return '';

    // Extract all markdown links [text](url)
    const linkPattern = /\[([^\]]+)\]\(([^)]+)\)/g;

    return content.replace(linkPattern, (match, text, url) => {
      // Keep internal PL Capital links only
      if (url.includes('plindia.com')) {
        return match;
      }

      // Remove all external links but keep the text
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
