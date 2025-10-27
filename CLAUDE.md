# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Enhanced Bulk Generator** - An N8N-style AI workflow automation system for content domination in the Indian WealthTech niche. The system orchestrates a complete content pipeline from SEO research → topic generation → content creation → SEO optimization → multi-platform publishing (WordPress on port 8080 + Sanity CMS on port 3333 + Next.js frontend on port 3001).

**Target Goal**: 1M monthly visitors through systematic, AI-powered content production and publishing.

## Project Architecture

```
/enhanced-bulk-generator/
├── main.js                          # CLI entry point
├── package.json                     # Dependencies (node-fetch, csv-parse, google-auth-library)
├── README.md                        # Project documentation
├── core/                            # Core workflow engine
│   ├── workflow-orchestrator.js    # Stage orchestration & execution
│   └── csv-data-manager.js         # CSV-based data management & approval gates
├── research/                        # Research & topic generation modules
│   ├── master-seo-researcher.js    # Stage 1: Competitor analysis (100 content gaps)
│   ├── topic-generator.js          # Stage 2: Strategic topic selection (50 topics)
│   ├── deep-topic-researcher.js    # Stage 3: Deep competitor analysis per topic
│   ├── seo-data-fetcher.js         # SEO data integration (Google Search Console, etc.)
│   └── google-*.js                 # Google API clients (Ads, GSC, Analytics, etc.)
├── content/                         # Content creation & publishing modules
│   ├── content-creator.js          # Stage 4: E-E-A-T compliant content generation
│   ├── seo-optimizer.js            # Stage 5: Metadata, schema markup, internal linking
│   └── content-publisher.js        # Stage 6: WordPress + Sanity multi-platform publishing
└── data/                            # CSV data files (approval workflows)
    ├── research-gaps.csv            # 100 identified content opportunities
    ├── generated-topics.csv         # 50 strategic topics (Quick Wins + Authority)
    ├── topic-research.csv           # Deep competitor analysis per topic
    ├── created-content.csv          # Generated content with SEO metadata
    ├── published-content.csv        # Published URLs & performance tracking
    └── workflow-status.csv          # Overall progress & metrics
```

## Publishing Architecture (Stage 6)

The system publishes content to a **multi-platform setup**:

### 1. WordPress (Port 8080)
- **Purpose**: Traditional blog/CMS platform
- **Integration**: REST API (`/wp/v2/posts`)
- **Authentication**: Basic Auth (username + application password)
- **Content Format**: HTML (converted from Markdown)
- **Status**: Draft/Publish (configurable via `PUBLISH_STATUS` env var)

### 2. Sanity CMS (Port 3333)
- **Purpose**: Headless CMS for structured content
- **Integration**: Mutations API (`/v1/data/mutate/:dataset`)
- **Authentication**: Bearer token
- **Content Format**: Portable Text (structured blocks)
- **Document Type**: `post` with slug, body, excerpt, publishedAt fields

### 3. Next.js Frontend (Port 3001)
- **Purpose**: Public-facing website
- **Content Source**: Sanity CMS
- **URL Pattern**: `http://localhost:3001/posts/{slug}`
- **Fallback**: `https://preview.plindia.com/drafts/{slug}` (for simulated mode)

### Publishing Flow

```
SEO-Ready Content (CSV)
    ↓
content-publisher.js
    ├─→ publishToWordPress()
    │   ├─ POST /wp/v2/posts
    │   ├─ HTML content + SEO metadata
    │   └─ Returns: WordPress URL, Edit URL, Post ID
    │
    ├─→ publishToSanity()
    │   ├─ POST /v1/data/mutate/:dataset
    │   ├─ Portable Text + structured metadata
    │   ├─ Returns: Sanity Desk URL, Document ID, Frontend URL
    │   └─ Frontend builds from Sanity data
    │
    └─→ savePublishedContent()
        └─ CSV record with all URLs & performance metrics
```

## Common Commands

### Installation & Setup
```bash
cd enhanced-bulk-generator
npm install
node main.js init                # Initialize data directories & CSV files
```

### Environment Variables
```bash
# Required for AI generation
export GROQ_API_KEY="your-groq-api-key"
export OPENAI_API_KEY="your-openai-key"  # Optional for advanced models

# WordPress Publishing (Port 8080)
export WP_BASE_URL="http://localhost:8080"
export WP_USERNAME="admin"
export WP_APPLICATION_PASSWORD="your-app-password"
export PUBLISH_STATUS="draft"  # or "publish"

# Sanity Publishing (Port 3333)
export SANITY_PROJECT_ID="your-project-id"
export SANITY_DATASET="production"  # or "development"
export SANITY_TOKEN="your-write-token"

# Next.js Frontend (Port 3001)
export NEXT_FRONTEND_BASE_URL="http://localhost:3001"
```

### Workflow Execution

**Research Phase (Stages 1-2):**
```bash
node main.js research                # Execute full research phase
node main.js stage research          # Stage 1 only (SEO research)
node main.js stage topics            # Stage 2 only (topic generation)
node main.js research --auto-approve # Auto-approve high-priority items
```

**Content Phase (Stages 3-4):**
```bash
node main.js content                 # Execute content creation phase
node main.js stage deep-research     # Stage 3 only (deep analysis)
node main.js stage content           # Stage 4 only (content drafting)
```

**Publication Phase (Stages 5-6):**
```bash
node main.js publish                 # Execute publication phase
node main.js stage seo               # Stage 5 only (SEO optimization)
node main.js stage publication       # Stage 6 only (WordPress + Sanity publishing)
```

**Full Workflow:**
```bash
node main.js full                    # Execute all 7 stages
node main.js auto                    # Auto-run with stage-by-stage progression
node main.js full --auto-approve --batch-size=25
```

**Monitoring:**
```bash
node main.js status                  # Show system status & CSV stats
node main.js monitor                 # Monitor workflow progress
```

## 7-Stage Workflow Pipeline

### Stage 1: Master SEO Research
- **Module**: `research/master-seo-researcher.js`
- **AI Models**: Multi-model approach (groq/compound → browser search fallback)
- **Input**: Competitor list (Groww, Zerodha, ETMoney, PaytmMoney, INDmoney)
- **Process**:
  - Analyze competitor content strategies
  - Identify 100 content gaps
  - Priority scoring (90+ = high priority)
  - Quick wins vs authority builders classification
- **Output**: `data/research-gaps.csv`

### Stage 2: Topic Generation
- **Module**: `research/topic-generator.js`
- **Input**: Approved research gaps from Stage 1
- **Strategy**:
  - 20 Quick Wins (30-60 day ranking targets)
  - 20 Authority Builders (3-6 month authority content)
  - 10 Competitive Strikes (direct competitor targeting)
- **Output**: `data/generated-topics.csv` (50 strategic topics)

### Stage 3: Deep Topic Research
- **Module**: `research/deep-topic-researcher.js`
- **Input**: Approved topics from Stage 2
- **Process**:
  - Analyze top 10 competitors per topic
  - Content gap analysis
  - Search intent mapping
  - Superiority planning
- **Output**: `data/topic-research.csv`

### Stage 4: Content Creation
- **Module**: `content/content-creator.js`
- **Input**: Research data from Stage 3
- **Features**:
  - E-E-A-T compliant content (Experience, Expertise, Authority, Trust)
  - SEBI/RBI compliance checking (for financial content)
  - Quality scoring (90%+ threshold)
  - Markdown format with proper headings & structure
- **Output**: `data/created-content.csv`

### Stage 5: SEO Optimization
- **Module**: `content/seo-optimizer.js`
- **Input**: Created content from Stage 4
- **Features**:
  - Meta tags (title, description, focus keyword)
  - URL slug optimization
  - Schema markup generation
  - Internal linking suggestions
  - Readability optimization
- **Output**: Enhanced `data/created-content.csv` with SEO metadata

### Stage 6: Publication
- **Module**: `content/content-publisher.js`
- **Input**: SEO-ready content from Stage 5
- **Publishing Targets**:
  - **WordPress** (port 8080): REST API publishing with HTML content
  - **Sanity** (port 3333): Structured content with Portable Text
  - **Next.js** (port 3001): Frontend URLs from Sanity data
- **Features**:
  - Simultaneous multi-platform publishing
  - Smart scheduling (optimal timing)
  - Fallback to simulation mode if credentials missing
  - URL tracking for all platforms
- **Output**: `data/published-content.csv` with URLs & metrics

### Stage 7: Workflow Completion
- **Module**: `core/workflow-orchestrator.js`
- **Process**:
  - Loop completion detection
  - Performance metrics aggregation
  - Continuous cycle management
- **Output**: Ready for next batch iteration

## CSV-Based Approval Workflow

The system uses CSV files for data management and approval gates:

### Approval Process
1. **research-gaps.csv**: Review and set `approval_status = "Yes"` for gaps to use
2. **generated-topics.csv**: Review and set `approval_status = "Yes"` for topics to develop
3. **created-content.csv**: Review and set `approval_status = "SEO-Ready"` for publication
4. **Automatic progression**: Once approved, content flows to next stage automatically

### Auto-Approval
```bash
# Auto-approve high-priority items (score >= 90)
node main.js research --auto-approve
node main.js full --auto-approve
```

### Manual Approval
Edit CSV files directly:
```csv
gap_id,topic_area,gap_title,...,approval_status
GAP-001,mutual_funds,Index Funds Guide,...,Yes
GAP-002,tax_planning,Tax Saving Tips,...,Pending
```

## Content Publishing Details

### WordPress Integration (`content/content-publisher.js:156-212`)

**Authentication:**
- Basic Auth: `Authorization: Basic base64(username:password)`
- Application passwords recommended over account passwords

**Endpoint:**
```
POST http://localhost:8080/?rest_route=/wp/v2/posts
```

**Payload:**
```json
{
  "title": "Article Title",
  "content": "<html>...</html>",
  "excerpt": "Brief summary...",
  "status": "draft",  // or "publish"
  "slug": "url-friendly-slug",
  "meta": {
    "meta_description": "SEO description",
    "focus_keyword": "primary keyword"
  }
}
```

**Response:**
```json
{
  "id": 123,
  "link": "http://localhost:8080/article-slug/",
  "status": "draft"
}
```

### Sanity Integration (`content/content-publisher.js:217-276`)

**Authentication:**
- Bearer Token: `Authorization: Bearer your-token`

**Endpoint:**
```
POST https://{projectId}.api.sanity.io/v1/data/mutate/{dataset}
```

**Payload:**
```json
{
  "mutations": [
    {
      "createOrReplace": {
        "_type": "post",
        "_id": "post-CONT-001",
        "title": "Article Title",
        "slug": { "_type": "slug", "current": "url-slug" },
        "body": [
          { "_type": "block", "style": "h2", "children": [...] },
          { "_type": "block", "style": "normal", "children": [...] }
        ],
        "excerpt": "Brief summary",
        "publishedAt": "2025-10-09T12:00:00Z"
      }
    }
  ]
}
```

**Portable Text Format:**
- Blocks-based content structure
- Supports headings (h2, h3), paragraphs, lists
- Rich text with marks (bold, italic, links)
- Sanity Studio can edit this format natively

### Frontend URL Pattern

**Next.js (port 3001):**
- Published URL: `http://localhost:3001/posts/{slug}`
- Fetches content from Sanity CMS
- Server-side rendering or ISR (Incremental Static Regeneration)

**Sanity Desk URL:**
- Direct edit link: `https://sanity.io/{projectId}/{dataset}/desk/article;{documentId}`
- Opens document in Sanity Studio for editing

### Simulation Mode

If WordPress/Sanity credentials are missing:
- **Fallback**: Generate simulated URLs for workflow continuity
- **WordPress**: Uses frontend URL as fallback
- **Sanity**: Uses preview URL and Desk link
- **Status**: Marked as `Simulated` in CSV
- **Message**: "Provide WP_* and SANITY_* credentials for live publishing"

## AI Model Strategy

### Primary Models (Groq)
- **groq/compound**: Fast, cost-effective generation (primary)
- **groq/compound-mini**: Backup compound model
- **openai/gpt-oss-20b**: Browser search capabilities
- **openai/gpt-oss-120b**: Advanced browser search
- **gemini-2.5-pro**: Google Gemini for variety
- **meta-llama/llama-4-maverick-17b-128e-instruct**: Fallback

### Browser Search Integration
- Real-time competitor data fetching
- Mimics human browsing behavior
- More comprehensive than traditional web search
- Automatic fallback if primary model fails

### Multi-Model Fallback Chain
```
1. Try groq/compound (fast, cheap)
   ↓ (if fails)
2. Try openai/gpt-oss-20b (browser search)
   ↓ (if fails)
3. Try openai/gpt-oss-120b (advanced search)
   ↓ (if fails)
4. Try gemini-2.5-pro
   ↓ (if fails)
5. Try llama-4-maverick (final fallback)
```

## Data Flow Architecture

```
Competitors List
    ↓
[Stage 1: SEO Research]
    ↓
research-gaps.csv (100 gaps)
    ↓ (approval_status = Yes)
[Stage 2: Topic Generation]
    ↓
generated-topics.csv (50 topics)
    ↓ (approval_status = Yes)
[Stage 3: Deep Research]
    ↓
topic-research.csv (competitor analysis)
    ↓
[Stage 4: Content Creation]
    ↓
created-content.csv (markdown + metadata)
    ↓ (approval_status = SEO-Ready)
[Stage 5: SEO Optimization]
    ↓
created-content.csv (with SEO fields)
    ↓
[Stage 6: Publication]
    ├─→ WordPress (port 8080) → HTML post
    ├─→ Sanity (port 3333) → Portable Text doc
    └─→ Frontend (port 3001) → Public URL
    ↓
published-content.csv (URLs + metrics)
    ↓
[Stage 7: Completion]
    → Ready for next cycle
```

## Development Workflow

### Adding a New Publishing Platform

1. **Create publisher module** in `content/`:
```javascript
class NewPlatformPublisher {
  async publish(content) {
    // Authentication
    // Content transformation
    // API call
    // Return URL & status
  }
}
```

2. **Integrate in `content-publisher.js`**:
```javascript
const newPlatformResult = await this.publishToNewPlatform(normalized);
```

3. **Add configuration**:
```javascript
newPlatformUrl: process.env.NEW_PLATFORM_URL
newPlatformToken: process.env.NEW_PLATFORM_TOKEN
```

4. **Update `published-content.csv` schema** to include new platform URL

### Modifying AI Models

Edit `main.js:24-33` to change model priority:
```javascript
models: {
  primary: 'your-preferred-model',
  fallback: 'backup-model'
}
```

### Custom Content Templates

Edit `config/templates.json` (if exists) or modify prompts in:
- `content/content-creator.js` - Content generation prompts
- `research/topic-generator.js` - Topic selection prompts
- `research/master-seo-researcher.js` - Research prompts

## Testing & Validation

### Local WordPress Setup
```bash
# Using Docker
docker run -d -p 8080:80 --name wp-test wordpress:latest

# Or MAMP/XAMPP on port 8080
# Create application password in WP Admin → Users → Profile
```

### Local Sanity Setup
```bash
# In Sanity project directory
npm run dev  # Starts on port 3333

# Create write token in Sanity.io → Project → API → Tokens
```

### Local Next.js Setup
```bash
# In Next.js frontend directory
npm run dev  # Starts on port 3001 (default)

# Configure Sanity client to fetch from port 3333
```

### Test Publishing
```bash
# Dry run (simulation mode, no credentials needed)
node main.js stage publication

# Live publishing (requires all credentials)
export WP_BASE_URL="http://localhost:8080"
export WP_USERNAME="admin"
export WP_APPLICATION_PASSWORD="xxxx yyyy zzzz wwww"
export SANITY_PROJECT_ID="abc123xyz"
export SANITY_DATASET="production"
export SANITY_TOKEN="skABCD..."
export NEXT_FRONTEND_BASE_URL="http://localhost:3001"

node main.js stage publication
```

### Verify Published Content
1. **WordPress**: Open `http://localhost:8080/wp-admin/edit.php` → View drafts
2. **Sanity Studio**: Open `http://localhost:3333/desk` → Check post documents
3. **Next.js Frontend**: Open returned URL (e.g., `http://localhost:3001/posts/article-slug`)
4. **CSV Record**: Check `data/published-content.csv` for all URLs

## Performance & Scaling

### Target Metrics
- **Content Volume**: 50 pieces per batch
- **Generation Speed**: 30-60 seconds per piece
- **Quality Threshold**: 90%+ quality score
- **Publishing Speed**: 3-5 seconds per platform
- **Monthly Target**: 500-1000 published articles
- **Traffic Goal**: 1M monthly visitors (year 1)

### Optimization Tips
- Use `--batch-size` flag to control memory usage
- Run stages sequentially for large batches (50+ pieces)
- Enable `--auto-approve` for faster iteration
- Monitor `data/workflow-status.csv` for bottlenecks
- Use simulation mode for testing without API costs

### API Rate Limits
- **Groq**: Check Groq console for limits
- **WordPress REST API**: Typically unlimited for authenticated requests
- **Sanity Mutations API**: Free tier = 100K requests/month
- **Next.js**: No limits (self-hosted)

## Troubleshooting

### Publishing Failures

**WordPress 401/403 Error:**
- Verify `WP_USERNAME` and `WP_APPLICATION_PASSWORD` are correct
- Check WordPress user has `publish_posts` capability
- Ensure WordPress REST API is enabled (should be by default)

**Sanity 401/403 Error:**
- Verify `SANITY_TOKEN` has write permissions
- Check `SANITY_PROJECT_ID` and `SANITY_DATASET` are correct
- Ensure dataset exists in Sanity project

**WordPress 404 Error:**
- Verify `WP_BASE_URL` includes protocol (`http://`)
- Check WordPress is running on specified port
- Test URL manually: `curl http://localhost:8080`

**Sanity Schema Mismatch:**
- Ensure `post` document type exists in Sanity schema
- Required fields: `title`, `slug`, `body`, `excerpt`
- Check Sanity Studio for schema definition

**Frontend URL Not Working:**
- Verify Next.js app is running on port 3001
- Check slug matches Sanity document slug
- Ensure Next.js is configured to fetch from Sanity

### CSV Data Issues

**Approval Not Triggering Next Stage:**
- Set `approval_status` to exact value: `"Yes"` or `"SEO-Ready"`
- Ensure no extra spaces or quotes in CSV
- Re-run workflow: `node main.js stage {next-stage}`

**CSV File Corrupted:**
- Backup: `cp data/file.csv data/file.csv.backup`
- Validate: Open in spreadsheet software, check headers
- Recreate: `node main.js init` (preserves existing data)

## Continuous Improvement

### Content Quality Monitoring
- Review `quality_metrics` in `created-content.csv`
- Track performance in `published-content.csv`
- Adjust AI prompts based on output quality

### SEO Performance Tracking
- Integrate Google Analytics for traffic monitoring
- Track rankings for target keywords
- A/B test different content formats

### Workflow Optimization
- Analyze stage execution times in logs
- Identify bottlenecks (API calls, AI generation, etc.)
- Optimize slow stages with caching or batching

---

**Document Version**: 1.0
**Created**: 2025-10-09
**Owner**: PL Capital Content Team
**Related**: See lead-generation project for similar workflow architecture
