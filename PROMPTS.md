# AI Model Prompts - Enhanced Bulk Generator

This document contains all the AI prompts used in each stage of the content pipeline.

## Table of Contents
1. [Stage 1: Master SEO Research](#stage-1-master-seo-research)
2. [Stage 2: Topic Generation](#stage-2-topic-generation)
3. [Stage 3: Deep Topic Research](#stage-3-deep-topic-research)
4. [Stage 4: Content Creation](#stage-4-content-creation)
5. [Stage 5: SEO Optimization](#stage-5-seo-optimization)
6. [Stage 6: Publication](#stage-6-publication)
7. [Stage 7: Workflow Completion](#stage-7-workflow-completion)

---

## Stage 1: Master SEO Research

**File**: `research/master-seo-researcher.js`
**Method**: `buildResearchPrompt()` (line 1166)
**Model**: groq/compound (with web search) → fallback chain
**Temperature**: 0.3
**Max Tokens**: 8000

### System Prompt:
```
You are an Elite SEO Research Analyst specializing in Indian WealthTech competitive intelligence. Your mission: Identify content gaps and opportunities to make PL Capital #1 in the Indian WealthTech niche.
```

### User Prompt:
```markdown
Execute comprehensive Master SEO Research for Indian WealthTech niche.

ANALYSIS REQUIREMENTS:

1. COMPETITOR LANDSCAPE
Analyze these top WealthTech competitors:
- Groww.in
- Zerodha.com/varsity
- ETMoney.com
- PaytmMoney.com
- INDmoney.com
- Kuvera.in
- Smallcase.com
- Upstox.com
- plindia.com
- hdfcsec.com
- icicidirect.com/wealth
- kotak.com/en/personal-banking/investments
- motilaloswal.com
- edelweiss.in
- scripbox.com

For each competitor identify:
- Top 20 ranking keywords
- Content strengths (what they do well)
- Content weaknesses (gaps, outdated info, poor UX)
- Traffic estimates
- Topical authority areas

2. CONTENT GAP OPPORTUNITIES
Find 10 high-value content opportunities in these categories (distributed proportionally):
- MUTUAL_FUNDS
- TAX_PLANNING
- STOCK_MARKET
- RETIREMENT_PLANNING
- INSURANCE
- INVESTMENT_STRATEGIES
- PERSONAL_FINANCE

For each gap, analyze:
- Why competitors are weak here
- Search volume potential
- Keyword difficulty (0-100)
- Commercial intent (Low/Medium/High)
- Regulatory considerations (SEBI/RBI compliance needed)

3. QUICK WIN OPPORTUNITIES
Identify 20 "quick win" topics:
- Search volume: 1,000-10,000/month
- Keyword difficulty: <30
- Competitor content quality: Poor
- Can rank in 30-60 days

4. AUTHORITY BUILDING OPPORTUNITIES
Identify 15 pillar content opportunities:
- Search volume: 10,000+/month
- Build topical authority clusters
- YMYL topics requiring expert positioning
- Long-term ranking potential

OUTPUT FORMAT - Return ONLY valid JSON (no markdown, no explanations):

{
  "research_id": "RESEARCH-20251008-001",
  "research_date": "2025-10-08",
  "competitors_analyzed": ["Groww.in", "Zerodha.com/varsity", ...],
  "total_gaps_identified": 10,
  "content_gaps": [
    {
      "gap_id": "GAP-001",
      "topic_area": "mutual_funds",
      "gap_title": "Complete Guide to Index Funds vs Mutual Funds 2025",
      "search_volume": 12000,
      "keyword_difficulty": 28,
      "commercial_intent": "High",
      "competitor_weakness": "Groww has outdated 2023 data; Zerodha focuses only on passive investing",
      "our_competitive_edge": "Include 2025 expense ratio changes, calculator tool, video comparison",
      "estimated_ranking_time": "45-60 days",
      "priority_score": 95,
      "primary_keyword": "index funds vs mutual funds",
      "secondary_keywords": "best index funds 2025,index fund calculator,index fund returns",
      "content_type_recommendation": "ymyl",
      "word_count_target": 2500,
      "expert_required": "true",
      "regulatory_compliance": "SEBI disclosure,Risk warning",
      "quick_win": "false",
      "authority_builder": "true"
    }
  ],
  "quick_wins": [
    {
      "gap_id": "GAP-QW-001",
      "topic_title": "Small Cap vs Mid Cap vs Large Cap Funds: Complete Comparison",
      "search_volume": 3500,
      "keyword_difficulty": 22,
      "ranking_probability": "85%",
      "estimated_traffic": "2800 monthly visits",
      "priority": "High"
    }
  ],
  "strategic_recommendations": {
    "phase_1_focus": "Quick wins in mutual funds and tax planning (Months 1-2)",
    "phase_2_focus": "Authority building in stock market education (Months 3-4)",
    "phase_3_focus": "YMYL content for retirement and insurance (Months 5-6)",
    "estimated_traffic_growth": "Month 1: 5K, Month 3: 25K, Month 6: 100K, Month 12: 500K+"
  },
  "approval_status": "Pending"
}

CRITICAL: Return ONLY the JSON object. No explanations, no markdown formatting, no extra text.
```

### Special Features:
- **Native Web Search**: Uses groq/compound with search_settings for India-focused competitor analysis
- **MCP Integration**: Enhances results with real Google Search Console data if available
- **Multi-Model Fallback**: groq/compound → groq/compound-mini → openai/gpt-oss-20b → openai/gpt-oss-120b → gemini-2.5-pro → llama-4-maverick
- **JSON Parsing**: Uses OpenAI GPT-4o or Groq GPT-OSS-20B to parse malformed JSON responses

---

## Stage 2: Topic Generation

**File**: `research/topic-generator.js`
**Method**: `buildTopicPrompt()` (line 631)
**Model**: groq/compound → fallback chain
**Temperature**: 0.4
**Max Tokens**: 16000

### System Prompt:
```
You are an Expert Content Strategist specializing in topic selection for competitive SEO dominance in Indian WealthTech. Transform research insights into actionable, battle-ready content topics.
```

### User Prompt:
```markdown
Generate ${topicCount} strategic content topics from approved research data.

RESEARCH CONTEXT:
${JSON.stringify({ approved_gaps: gapsContext }, null, 2)}

SELECTION STRATEGY:
1. QUICK WINS: Low difficulty, decent volume, can rank in 30-60 days
2. AUTHORITY BUILDERS: High volume, build topical clusters, 3-6 month ranking
3. COMPETITIVE STRIKES: Target competitor weaknesses, steal their traffic

TOPIC GENERATION REQUIREMENTS:

For EACH of the ${topicCount} topics, provide:

1. topic_id: "TOPIC-YYYYMMDD-XXX" (sequential)
2. research_gap_id: Link to specific gap from research (e.g., "GAP-001")
3. content_type: [blog|ymyl|listicle|news]
4. topic_title: Compelling, click-worthy, SEO-optimized (<60 chars)
5. category: [mutual_funds|tax_planning|stock_market|retirement_planning|insurance|personal_finance|investment_strategies]
6. primary_keyword: Main target keyword
7. secondary_keywords: Array of 3-5 related keywords (comma-separated string)
8. search_volume: Monthly search volume
9. keyword_difficulty: 0-100 score
10. priority: [High|Medium|Low]
11. topic_type: [quick_win|authority_builder|competitive_strike]
12. target_competitor: Which competitor we're outranking
13. our_competitive_advantage: Specific plan to beat competitor
14. word_count_target: Recommended length
15. expert_required: [true|false]
16. estimated_ranking_time: Days to rank
17. estimated_monthly_traffic: Expected traffic when ranked
18. internal_linking_opportunities: Array of related topics for clustering (comma-separated)
19. content_upgrade_idea: Lead magnet idea (calculator, checklist, template)
20. regulatory_requirements: Array of compliance needs (comma-separated)
21. approval_status: "Pending"

CONTENT TYPE DISTRIBUTION:
- Blog posts: ${this.contentTypeDistribution.blog} topics (educational, how-to guides)
- YMYL guides: ${this.contentTypeDistribution.ymyl} topics (investment advice, financial planning)
- Listicles: ${this.contentTypeDistribution.listicle} topics (Top X, best of lists)
- News articles: ${this.contentTypeDistribution.news} topics (regulatory updates, market news)

OUTPUT FORMAT
- Return a JSON object with a single key "topics" containing the array of topic objects.
- No markdown, no comments, no explanations.

{
  "topics": [
    {
      "topic_id": "TOPIC-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-001",
      "research_gap_id": "GAP-001",
      "content_type": "ymyl",
      "topic_title": "Index Funds vs Mutual Funds 2025: Complete Comparison Guide",
      "category": "mutual_funds",
      "primary_keyword": "index funds vs mutual funds",
      "secondary_keywords": "best index funds 2025,index fund calculator,passive investing india",
      "search_volume": 12000,
      "keyword_difficulty": 28,
      "priority": "High",
      "topic_type": "authority_builder",
      "target_competitor": "Groww",
      "our_competitive_advantage": "Include 2025 expense ratio data, interactive calculator, video comparisons, expert CFA quotes",
      "word_count_target": 2500,
      "expert_required": "true",
      "estimated_ranking_time": 60,
      "estimated_monthly_traffic": 8500,
      "internal_linking_opportunities": "passive-investing-guide,sip-calculator,mutual-fund-taxation",
      "content_upgrade_idea": "Interactive Index Fund vs Mutual Fund Calculator with expense ratio comparison",
      "regulatory_requirements": "SEBI disclaimer,Risk warning,Past performance disclaimer",
      "approval_status": "Pending"
    }
  ]
}

CRITICAL:
- Generate exactly ${topicCount} topics (no more, no less)
- Return ONLY the JSON object described above
- No markdown formatting, no explanations
- Ensure all topics link back to research gaps
- Validate JSON structure before returning
```

### Special Features:
- **Batch Generation**: Generates 50 topics in 2 batches of 25 each for reliability
- **CSE Duplicate Detection**: Validates topics with MCP Google Custom Search to prevent duplicates
- **Coverage Analysis**: Checks if content already exists on site (create/update/skip recommendations)
- **Multi-Model Fallback**: groq/compound → compound-mini → openai/gpt-oss-20b → gpt-oss-120b → gemini-2.5-pro → llama-4-maverick
- **Web Search**: Native search settings for India-focused competitor validation

---

## Stage 3: Deep Topic Research

**File**: `research/deep-topic-researcher.js`
**Method**: `buildResearchPrompt()` (line 149)
**Model**: groq/compound → openai/gpt-oss-120b → openai/gpt-4o → llama-4-maverick
**Temperature**: 0.3
**Max Tokens**: 8000

### System Prompt:
```
You are a senior financial research analyst focused on Indian wealth and wealthtech content.
```

### User Prompt:
```markdown
Conduct deep-dive research for this approved financial content topic:

TOPIC CONTEXT:
- Topic ID: ${topic.topic_id}
- Title: ${topic.topic_title}
- Content Type: ${topic.content_type || 'blog'}
- Category: ${topic.category}
- Primary Keyword: ${topic.primary_keyword}
- Secondary Keywords: ${topic.secondary_keywords || 'Not specified'}
- Search Volume: ${topic.search_volume || 'Not specified'} monthly searches
- Keyword Difficulty: ${topic.keyword_difficulty || 'Not specified'}/100
- Priority: ${topic.priority || 'Medium'}
- Topic Type: ${topic.topic_type || 'Not specified'} (quick_win/authority_builder/competitive_strike)
- Target Competitor: ${topic.target_competitor || 'Top financial websites'}
- Our Competitive Advantage: ${topic.our_competitive_advantage || 'Deep research and E-E-A-T compliance'}
- Word Count Target: ${topic.word_count_target} words
- Expert Required: ${topic.expert_required || 'Not specified'}
- Estimated Ranking Time: ${topic.estimated_ranking_time || 'Not specified'} days
- Estimated Monthly Traffic: ${topic.estimated_monthly_traffic || 'Not specified'} visits
- Internal Linking Opportunities: ${topic.internal_linking_opportunities || 'Not specified'}
- Content Upgrade Idea: ${topic.content_upgrade_idea || 'Calculator or downloadable guide'}
- Regulatory Requirements: ${topic.regulatory_requirements || 'Standard disclaimers'}

RESEARCH REQUIREMENTS:

1. TOP 10 COMPETITOR ANALYSIS
Analyze what's currently ranking for "${topic.primary_keyword}":
- What content format do they use?
- What depth of coverage?
- What makes them rank?
- What are their weaknesses?

2. CONTENT GAPS
Identify what ALL top articles are missing:
- Unanswered questions
- Missing examples or case studies
- Outdated information
- Lack of visual content
- Missing expert perspectives

3. SEARCH INTENT MAPPING
- Primary intent (informational/transactional/navigational)
- User questions and pain points
- Related queries people search for

4. CONTENT SUPERIORITY PLAN
Create a battle plan to outrank competitors:
- Unique angles to cover
- Additional depth needed
- Visual content requirements
- Expert quotes/data sources needed
- Internal linking opportunities

5. RESOURCE REQUIREMENTS
What's needed to create this content:
- Subject matter expert consultation needed?
- Data sources required
- Visual assets (charts, infographics, calculators)
- Legal/compliance review needed

Return your analysis in this JSON format:
{
  "topic_id": "${topic.topic_id}",
  "primary_keyword": "${topic.primary_keyword}",
  "top_10_competitors": "List of top ranking sites and their strengths",
  "content_gaps": "What's missing from current top content",
  "search_intent": "Primary user intent and related queries",
  "related_questions": "Common questions users ask",
  "content_superiority_plan": "Detailed plan to create better content",
  "resource_requirements": "Expert, data, visual requirements",
  "regulatory_compliance": "${topic.regulatory_requirements || 'Standard disclaimers'}",
  "estimated_impact": "Expected ranking improvement and traffic",
  "approval_status": "Pending"
}

Focus on Indian market context and SEBI/RBI compliance where applicable.
```

### Special Features:
- **Competitor HTML Scraping**: Fetches and analyzes actual competitor content structure
- **RankMath Scoring**: Computes competitive score based on word count, headings, media, tables, FAQs
- **Competitive Scorecard**: Generates aggregate metrics from top 10 competitors
  - Average word count, H2/H3 counts, media usage
  - Identifies specific opportunities to outrank
- **Opportunity Recommendations**: Suggests concrete improvements (e.g., "Add 8+ H2 sections", "Target 1,900+ words")
- **Source URL Extraction**: Automatically identifies and caches competitor URLs for follow-up analysis
- **Multi-Model Fallback**: groq/compound (with India-focused search) → openai/gpt-oss-120b (browser search) → openai/gpt-4o → llama-4-maverick

---

## Stage 4: Content Creation

**File**: `content/content-creator.js`
**Method**: `buildContentPrompt()` (line 208)
**Model**: groq/compound → openai/gpt-oss-120b → openai/gpt-4o → llama-4-maverick
**Temperature**: 0.6 (Groq), 0.7 (other models)
**Max Tokens**: 8000

### System Prompt:
```
You are a senior financial content strategist. Always respond with valid JSON following the provided schema.
```

### User Prompt:
```markdown
You are an award-winning Indian financial strategist, senior editor, and compliance reviewer.
Using the approved research brief, craft an SEO ready article that reads like it was written by PL Capital's in-house experts.

OUTPUT RULES:
- Respond with a **single valid JSON object** following the schema below. No markdown fences or extra prose.
- Article audience: mass affluent Indian investors and salaried professionals evaluating wealth options in FY 2025-26.
- Minimum length: ${wordTarget} words of original copy (exclude tables). Blend data, explanations, frameworks, and examples.
- Voice & tone: authoritative yet approachable, data-backed, compliance-safe, with PL Capital's advisory expertise shining through.
- Heading etiquette: never output an H1. Start with `## Executive Summary`, then use semantic H2/H3/H4 hierarchy.
- Structural must-haves (in order):
  1. `## Executive Summary` — 3 crisp sentences covering context, opportunity, and takeaway.
  2. `### Key Numbers At a Glance` — Markdown table with Metric / Value / Why it Matters (>=4 rows).
  3. `### Key Takeaways` — bullet list (5 bullets) of one-line insights.
  4. Core body sections addressing the content gaps, benchmarks vs competitors, tactical guidance, calculators/frameworks, and risk controls.
  5. At least one section titled `### Compliance & Risk Checklist` with bullet points consolidating SEBI/RBI obligations.
  6. Final H2 titled `## Talk to a PL Capital Advisor` containing a persuasive CTA paragraph.
- Every body section must integrate insights from the research brief (content gaps, competitor analysis, related questions, superiority plan) with specific data points, examples, and Indian regulatory references.
- Internal linking: include at least two inline links to PL Capital resources using relative URLs (e.g., `[PL Capital SIP Planner](/insights/sip-planner)`). External references must link to authoritative Indian financial sites and include the anchor text.
- Inline citations: when quoting stats or regulations, append `[Source n]` that maps to the enumerated SOURCES list.
- Tables: use valid Markdown tables, never placeholders.
- No placeholder strings ({{...}}, [TODO], etc.). Provide finished copy.
- Content upgrades: populate the JSON array with two value-add artefacts (e.g., calculator, downloadable checklist) but **do not** create an explicit section in the article labelled "Content Upgrades".
- Compliance paragraph must include mandatory SEBI/RBI disclaimers and suitability warnings.

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

SOURCES TO REFERENCE:
${sourcesList}

Focus on outperforming top competitors in depth, freshness, and authority while maintaining compliance.
```

### Special Features:
- **Multi-Attempt Quality Loop**: Up to 2 generation attempts with feedback-driven revision prompts
- **Quality Standards Enforcement**: Validates word count (1800+ words), meta description length (140-160 chars), focus keyphrase presence, and content upgrades (2+)
- **E-E-A-T Compliance**: Enforces structured sections for Executive Summary, Key Numbers, Key Takeaways, Compliance & Risk Checklist, and CTA
- **Internal Linking**: Requires 2+ inline links to PL Capital resources with relative URLs
- **Source Integration**: Pulls research sources from CSV and formats as enumerated list for inline citations
- **Content Sanitization**: Removes placeholder markers (`{{IMAGE:...}}`, `[TABLE:...]`, etc.) and normalizes headings
- **Auto-CTA Injection**: Adds "Partner with PL Capital" call-to-action if missing from content
- **Model Fallback**: groq/compound → groq/gpt-oss-120b → openai/gpt-4o → llama-4-maverick

---

## Stage 5: SEO Optimization

**File**: `content/seo-optimizer.js`
**Method**: `optimizeContentItem()` (line 60)
**Model**: None (rule-based optimization, no AI)
**Temperature**: N/A
**Max Tokens**: N/A

### Process:
Stage 5 uses **rule-based algorithms** (no AI model) to enhance SEO metadata:

1. **Title Optimization**:
   - Extract from `seo_metadata.title` or generate from article content (first H2 heading)
   - Keep full title for better SEO (no truncation unless significantly over 60 chars)
   - Preserve focus keyphrase in title

2. **Meta Description Optimization**:
   - Validate length: 140-160 characters
   - Ensure focus keyphrase is present
   - Truncate with proper ellipsis character (`…`) if over 160 chars

3. **URL Slug Generation**:
   - Convert title to lowercase
   - Remove accents and special characters
   - Replace spaces/symbols with hyphens
   - Limit to 96 characters
   - Example: "Best Wealth Management Apps India 2025" → "best-wealth-management-apps-india-2025"

4. **Schema Markup (JSON-LD)**:
```javascript
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": title,
  "description": metaDescription,
  "keywords": [focusKeyphrase],
  "url": `https://plindia.com/${slug}`,
  "about": focusKeyphrase,
  "identifier": topicId,
  "author": {
    "@type": "Organization",
    "name": "PL Capital"
  },
  "publisher": {
    "@type": "Organization",
    "name": "PL Capital",
    "logo": {
      "@type": "ImageObject",
      "url": "https://plindia.com/logo.png"
    }
  },
  "dateModified": new Date().toISOString()
}
```

5. **Open Graph Tags**:
```javascript
{
  "og_title": title,
  "og_description": metaDescription,
  "og_type": "article"
}
```

6. **Twitter Card Tags**:
```javascript
{
  "card": "summary_large_image",
  "title": title,
  "description": metaDescription
}
```

7. **SEO Score Calculation**:
   - Base score: 50
   - Title ≤60 chars: +10
   - Meta description 120-160 chars: +10
   - Focus keyphrase in title: +10
   - Secondary keywords ≥2: +5
   - Article content >1500 words: +10
   - **Maximum**: 100

### Special Features:
- **No AI Model**: Pure algorithmic optimization for speed and consistency
- **Auto-Approval Option**: `--auto-approve` flag marks content as "SEO-Ready" automatically
- **Data Preservation**: Updates existing SEO metadata without overwriting article content
- **Compliance-Safe**: Preserves all regulatory disclaimers and compliance notes
- **Output Status**: Sets `approval_status = "Pending Review"` or `"SEO-Ready"` (if auto-approved)

---

## Model Configuration

All stages use optimized parameters from `config/model-parameters.json`:

### Research Stage (Stage 1-3):
```json
{
  "temperature": 0.3,
  "top_p": 0.9,
  "frequency_penalty": 0.2,
  "presence_penalty": 0.1,
  "max_tokens": 8000,
  "response_format": { "type": "json_object" }
}
```

### JSON Parser (for malformed responses):
```json
{
  "temperature": 0.1,
  "top_p": 0.9,
  "frequency_penalty": 0,
  "presence_penalty": 0,
  "max_tokens": 8000,
  "response_format": { "type": "json_object" }
}
```

### Content Creation (Stage 4):
```json
{
  "temperature": 0.7,
  "top_p": 0.95,
  "frequency_penalty": 0.3,
  "presence_penalty": 0.2,
  "max_tokens": 12000
}
```

---

## Prompt Engineering Best Practices

1. **Clear Role Definition**: Each stage starts with a specific role assignment
2. **Structured Output**: All prompts specify exact JSON schema requirements
3. **Indian Market Focus**: All prompts emphasize Indian WealthTech, SEBI/RBI compliance
4. **Multi-Model Strategy**: Fallback chain ensures high success rate
5. **Web Search Integration**: Research stages leverage real-time competitor data
6. **Quality Enforcement**: Explicit quality thresholds and scoring criteria

---

## Stage 6: Publication

**File**: `content/content-publisher.js`
**Method**: `publishAll()` (line 47), `publishToWordPress()` (line 186), `publishToSanity()` (line 509)
**Model**: None (API-based publishing, no AI)
**Temperature**: N/A
**Max Tokens**: N/A

### Process:
Stage 6 uses **REST API calls** (no AI model) to publish content to multiple platforms simultaneously:

#### 1. **WordPress Publishing** (Local Development - Port 8080)
**Endpoint**: `POST {WP_BASE_URL}/?rest_route=/wp/v2/posts`
**Authentication**: Basic Auth (username + application password)
**Content Format**: HTML (converted from markdown)

**Payload**:
```json
{
  "title": "Article Title",
  "content": "<html>article content with tables and formatting</html>",
  "excerpt": "Brief summary (240 chars max)",
  "status": "draft",  // or "publish" based on PUBLISH_STATUS env var
  "slug": "url-friendly-slug",
  "meta": {
    "meta_description": "SEO description (140-160 chars)",
    "focus_keyword": "primary keyword"
  }
}
```

**Response Handling**:
- Success: Returns WordPress URL, post ID, edit URL
- Failure: Falls back to simulated URL for workflow continuity

#### 2. **WordPress Publishing** (UAT - Custom Post Type)
**Endpoint**: `POST {UAT_WP_BASE_URL}/wp-json/wp/v2/blogs`
**Authentication**: Basic Auth
**Content Format**: HTML with ACF (Advanced Custom Fields)
**Hero Image Upload**: Uploads to WordPress media library first, then attaches as featured image

**Payload**:
```json
{
  "title": "Article Title",
  "content": "<html>article content</html>",
  "excerpt": "Brief summary",
  "status": "draft",  // or "publish" based on UAT_PUBLISH_STATUS
  "slug": "url-friendly-slug",
  "acf": {
    "detailed_blog_banner_image": 123,  // WordPress attachment ID
    "inpost_banner_link": "https://www.plindia.com/open-demat-account/",
    "inpost_banner_alt": "Open your Demat account with PL India today",
    "banner_cta": "Start Your Investment Journey Today",
    "cta_anchor": "Open Free Demat Account",
    "cta_target_url": "https://www.plindia.com/open-demat-account/"
  },
  "meta": {
    "_yoast_wpseo_title": "Article Title",
    "_yoast_wpseo_metadesc": "SEO description",
    "_yoast_wpseo_focuskw": "focus keyword"
  }
}
```

**Special Features**:
- Hero image upload workflow (supports both URLs and local file paths)
- Yoast SEO meta fields integration
- ACF fields for banners and CTAs
- Skips categories (blogs_category taxonomy not REST-enabled)

#### 3. **Sanity CMS Publishing** (Port 3333)
**Endpoint**: `POST https://{projectId}.api.sanity.io/v1/data/mutate/{dataset}`
**Authentication**: Bearer token
**Content Format**: Portable Text (structured blocks)

**Payload**:
```json
{
  "mutations": [
    {
      "createOrReplace": {
        "_type": "post",
        "_id": "post-CONTENT-001",
        "title": "Article Title",
        "slug": {
          "_type": "slug",
          "current": "url-slug"
        },
        "body": [
          {
            "_type": "block",
            "style": "h2",
            "children": [
              { "_type": "span", "text": "Executive Summary", "marks": [] }
            ]
          },
          {
            "_type": "block",
            "style": "normal",
            "children": [
              { "_type": "span", "text": "Paragraph text...", "marks": [] }
            ]
          },
          {
            "_type": "table",
            "_key": "table-abc123",
            "rows": [
              {
                "_type": "tableRow",
                "_key": "row-xyz789",
                "cells": ["Metric", "Value", "Why it Matters"]
              }
            ]
          }
        ],
        "excerpt": "Brief summary",
        "publishedAt": "2025-10-21T12:00:00Z",
        "mainImage": {
          "_type": "image",
          "asset": {
            "_type": "reference",
            "_ref": "image-abc123-1920x1080-png"
          },
          "alt": "Hero image alt text",
          "caption": "Optional caption"
        }
      }
    }
  ]
}
```

**Portable Text Conversion** (`articleToPortableText()` method):
- Converts markdown headings (##, ###) → block style h2, h3
- Converts markdown lists (-) → block with listItem: 'bullet'
- Converts markdown tables → table blocks with structured rows/cells
- Strips markdown bold syntax (`**text**` → `text`) from all blocks
- Preserves semantic structure for Sanity Studio editing

**Hero Image Upload**:
- Uploads image to Sanity assets: `POST https://{projectId}.api.sanity.io/v1/assets/images/{dataset}`
- Supports both URLs and local file paths
- Returns asset ID reference for document

#### 4. **Next.js Frontend** (Port 3001)
**Purpose**: Public-facing website
**Content Source**: Fetches from Sanity CMS
**URL Pattern**: `http://localhost:3001/posts/{slug}`
**Build Process**: Next.js fetches Sanity content during build or ISR

### Publishing Flow:

```
SEO-Ready Content (CSV)
    ↓
normalizeContent()
    ├─ Parse seo_metadata, hero_image, quality_metrics
    ├─ Convert markdown → HTML (for WordPress)
    ├─ Convert markdown → Portable Text (for Sanity)
    └─ Generate slug, excerpt, frontend URL
    ↓
publishToWordPress()
    ├─ POST /wp/v2/posts (Local WP - port 8080)
    ├─ HTML content + SEO meta
    └─ Returns: WordPress URL, Post ID, Edit URL
    ↓
publishToUATWordPress()
    ├─ Upload hero image → WordPress media library
    ├─ POST /wp/v2/blogs (UAT WP - custom post type)
    ├─ HTML content + ACF fields + Yoast SEO meta
    └─ Returns: UAT WordPress URL, Post ID, Edit URL
    ↓
publishToSanity()
    ├─ Upload hero image → Sanity assets
    ├─ POST /v1/data/mutate/{dataset}
    ├─ Portable Text + structured metadata + image reference
    └─ Returns: Frontend URL, Sanity Desk URL, Document ID
    ↓
savePublishedContent()
    ├─ Update created-content.csv: approval_status = "Published" or "Simulated"
    ├─ Save to published-content.csv with all URLs
    └─ Record performance_metrics (wordpress_id, sanity_document_id, etc.)
```

### Simulation Mode:
If credentials are missing, the system automatically falls back to **simulation mode** for workflow continuity:

**WordPress Simulation**:
- Missing: `WP_BASE_URL`, `WP_USERNAME`, `WP_APPLICATION_PASSWORD`
- Fallback: Returns frontend URL as simulated WordPress URL
- Status: `simulated` or `wordpress-{error-code}`

**UAT WordPress Simulation**:
- Missing: `UAT_WP_BASE_URL`, `UAT_WP_USERNAME`, `UAT_WP_APPLICATION_PASSWORD`
- Fallback: Returns empty URL, skips UAT publication
- Status: `simulated-uat-missing` or `uat-wordpress-{error-code}`

**Sanity Simulation**:
- Missing: `SANITY_PROJECT_ID`, `SANITY_TOKEN`
- Fallback: Returns simulated frontend URL and Desk URL
- Status: `simulated` or `sanity-{error-code}`

**User Message**:
```
🛈 Simulation mode: provide WP_*, UAT_WP_*, and SANITY_* credentials for live publishing.
```

### URL Tracking:

All published content is tracked in `data/published-content.csv`:

```csv
content_id,topic_id,wordpress_url,uat_wordpress_url,sanity_url,sanity_desk_url,publish_date,status,performance_metrics
CONTENT-001,TOPIC-001,http://localhost:8080/?p=123,https://uat.plindia.com/?p=456,http://localhost:3001/posts/article-slug,https://sanity.io/projectid/production/desk/article;post-CONTENT-001,2025-10-21T12:00:00Z,Published,"{...}"
```

### Special Features:
- **Multi-Platform Publishing**: Simultaneous publication to 3 platforms (Local WP, UAT WP, Sanity)
- **Markdown → HTML Conversion**: Preserves tables, headings, lists, inline formatting
- **Markdown → Portable Text Conversion**: Structured blocks for Sanity Studio editing
- **Bold Syntax Stripping**: Removes `**text**` markers from Portable Text (not HTML)
- **Hero Image Support**: Uploads to both WordPress media library and Sanity assets
- **ACF Integration**: Custom fields for UAT WordPress (banners, CTAs)
- **Yoast SEO Integration**: Meta fields for WordPress SEO plugin
- **Graceful Degradation**: Falls back to simulation if credentials missing
- **Error Recovery**: Continues workflow even if one platform fails
- **URL Aggregation**: Tracks all platform URLs in single CSV record

### Configuration Required:

**Environment Variables**:
```bash
# Local WordPress (port 8080)
WP_BASE_URL="http://localhost:8080"
WP_USERNAME="your-username"
WP_APPLICATION_PASSWORD="your-app-password"
PUBLISH_STATUS="draft"  # or "publish"

# UAT WordPress (production)
UAT_WP_BASE_URL="https://uat.plindia.com"
UAT_WP_USERNAME="your-username"
UAT_WP_APPLICATION_PASSWORD="your-app-password"
UAT_PUBLISH_STATUS="draft"  # or "publish"

# Sanity CMS (port 3333)
SANITY_PROJECT_ID="your-project-id"
SANITY_DATASET="your-dataset"  # or "development"
SANITY_TOKEN="your-token"

# Next.js Frontend (port 3001)
NEXT_FRONTEND_BASE_URL="http://localhost:3001"
```

---

## Stage 7: Workflow Completion

**File**: `core/workflow-orchestrator.js`
**Method**: N/A (completion detection)
**Model**: None (workflow management, no AI)
**Temperature**: N/A
**Max Tokens**: N/A

### Process:

Stage 7 is the **completion detection and loop management** stage. No AI model or API calls are involved - it's pure workflow orchestration logic.

#### Completion Criteria:
1. **All content published**: Check `data/published-content.csv` for completion
2. **All workflows executed**: Verify all 6 previous stages have completed successfully
3. **CSV status updated**: Ensure `approval_status` fields reflect final state
4. **Metrics aggregated**: Consolidate performance data across all stages

#### Post-Completion Actions:
1. **Status Report**: Print summary of published content
   - Total published: Count from `published-content.csv`
   - Platform breakdown: WordPress, UAT WordPress, Sanity counts
   - Simulation vs Live: Identify simulated publications

2. **Ready for Next Cycle**: System automatically prepares for next batch:
   - New research gaps can be approved in `research-gaps.csv`
   - New topics can be generated from approved gaps
   - Continuous loop for ongoing content production

3. **Performance Tracking**: Aggregates metrics for monitoring:
   - Publication success rate
   - Platform-specific failures
   - Time from research to publication

### Loop Management:

The workflow orchestrator supports **continuous operation**:

```
Research Phase → Content Phase → Publication Phase → Completion
    ↑                                                      ↓
    └─────────────── New Batch Ready ────────────────────┘
```

**Auto-Run Mode** (`node main.js auto`):
- Automatically progresses through stages
- Detects when CSV approvals are ready
- Loops back for next batch when complete

**Manual Mode** (default):
- User approves CSVs manually between stages
- Runs one stage at a time
- More control, better for testing

### No Prompts, Just Orchestration:

Stage 7 has no AI prompts because it's purely **workflow management logic**:
- Reads CSV files to detect completion
- Updates workflow status
- Prepares for next iteration
- No content generation or transformation needed

### Monitoring Commands:

```bash
# Check workflow status
node main.js status

# View published content
cat data/published-content.csv

# Monitor workflow progress
node main.js monitor
```

---

**Last Updated**: 2025-10-21
**Document Version**: 1.1
