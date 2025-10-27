---
name: AI Content Workflow Automation
description: Expertise in N8N-style AI workflows for bulk content generation, SEO research, topic planning, and multi-platform publishing (WordPress + Sanity + Next.js). Specializes in 7-stage pipeline orchestration, CSV-based approval workflows, and AI model fallback chains.
allowed-tools: [Read, Write, Edit, Bash, Glob, Grep]
---

# AI Content Workflow Automation Skill

This skill enables Claude to work with sophisticated AI-powered content generation pipelines that orchestrate SEO research, topic generation, content creation, and multi-platform publishing.

## When to Invoke This Skill

Use this skill when the user needs help with:

- **Workflow Orchestration**: Designing or modifying multi-stage AI content pipelines
- **Multi-Platform Publishing**: Publishing content to WordPress, Sanity CMS, and Next.js frontends simultaneously
- **SEO Research Automation**: Competitor analysis, content gap identification, and topic prioritization
- **CSV-Based Approval Gates**: Managing approval workflows for research → topics → content → publication
- **AI Model Management**: Implementing fallback chains with Groq, OpenAI, Gemini, and Llama models
- **Content Quality Control**: E-E-A-T compliance, SEBI/RBI financial content validation
- **Bulk Content Generation**: Creating 50-1000 articles per month with automated SEO optimization

## Core Capabilities

### 1. 7-Stage Workflow Pipeline

```
Stage 1: Master SEO Research
  └─→ Competitor analysis → 100 content gaps → research-gaps.csv

Stage 2: Topic Generation
  └─→ Strategic selection → 50 topics (Quick Wins + Authority) → generated-topics.csv

Stage 3: Deep Topic Research
  └─→ Per-topic competitor analysis → topic-research.csv

Stage 4: Content Creation
  └─→ E-E-A-T compliant drafting → created-content.csv

Stage 5: SEO Optimization
  └─→ Meta tags, schema markup, internal linking → enhanced content

Stage 6: Multi-Platform Publication
  ├─→ WordPress (port 8080): HTML via REST API
  ├─→ Sanity (port 3333): Portable Text via Mutations API
  └─→ Next.js (port 3001): Frontend URLs from Sanity

Stage 7: Workflow Completion
  └─→ Performance tracking → published-content.csv → Next cycle
```

### 2. Multi-Platform Publishing Architecture

**WordPress Integration:**
- REST API publishing (`/wp/v2/posts`)
- Basic Auth with application passwords
- HTML content transformation
- Draft/publish status control
- URL: `http://localhost:8080/?rest_route=/wp/v2/posts`

**Sanity CMS Integration:**
- Mutations API (`/v1/data/mutate/:dataset`)
- Bearer token authentication
- Portable Text format (structured blocks)
- Document type: `post` with slug, body, excerpt
- Studio URL: `https://sanity.io/{projectId}/{dataset}/desk/article;{docId}`

**Next.js Frontend:**
- Public-facing website (port 3001)
- Server-side rendering from Sanity
- URL pattern: `http://localhost:3001/posts/{slug}`
- Fallback: Preview URLs for simulation mode

### 3. AI Model Fallback Chain

```javascript
Primary: groq/compound (fast, cost-effective)
  ↓ (if fails)
Fallback 1: openai/gpt-oss-20b (browser search)
  ↓ (if fails)
Fallback 2: openai/gpt-oss-120b (advanced search)
  ↓ (if fails)
Fallback 3: gemini-2.5-pro (Google Gemini)
  ↓ (if fails)
Final: meta-llama/llama-4-maverick (Llama)
```

### 4. CSV-Based Data Management

All workflow stages use CSV files for data persistence and approval gates:

- `research-gaps.csv`: 100 identified opportunities (set `approval_status = "Yes"`)
- `generated-topics.csv`: 50 strategic topics (set `approval_status = "Yes"`)
- `topic-research.csv`: Deep competitor analysis
- `created-content.csv`: Generated content (set `approval_status = "SEO-Ready"`)
- `published-content.csv`: Multi-platform URLs + performance metrics
- `workflow-status.csv`: Overall progress tracking

## Common Commands Reference

### Workflow Execution

```bash
# Research Phase
node main.js research                    # Full research (Stage 1-2)
node main.js stage research              # Stage 1 only
node main.js stage topics                # Stage 2 only
node main.js research --auto-approve     # Auto-approve high-priority

# Content Phase
node main.js content                     # Content creation (Stage 3-4)
node main.js stage deep-research         # Stage 3 only
node main.js stage content               # Stage 4 only

# Publication Phase
node main.js publish                     # Publication (Stage 5-6)
node main.js stage seo                   # Stage 5 only
node main.js stage publication           # Stage 6 only

# Full Workflow
node main.js full                        # All 7 stages
node main.js auto                        # Auto-run with progression
node main.js full --auto-approve --batch-size=25

# Monitoring
node main.js status                      # System status
node main.js monitor                     # Progress tracking
```

### Environment Variables

```bash
# AI Models
export GROQ_API_KEY="your-groq-key"
export OPENAI_API_KEY="your-openai-key"

# WordPress (port 8080)
export WP_BASE_URL="http://localhost:8080"
export WP_USERNAME="your-username"
export WP_APPLICATION_PASSWORD="your-app-password"
export PUBLISH_STATUS="draft"  # or "publish"

# Sanity (port 3333)
export SANITY_PROJECT_ID="your-project-id"
export SANITY_DATASET="your-dataset"
export SANITY_TOKEN="your-token"

# Next.js (port 3001)
export NEXT_FRONTEND_BASE_URL="http://localhost:3001"
```

## Key File Locations

- `core/workflow-orchestrator.js`: Stage orchestration engine
- `core/csv-data-manager.js`: CSV management & approval gates
- `research/master-seo-researcher.js`: Stage 1 implementation
- `research/topic-generator.js`: Stage 2 implementation
- `research/deep-topic-researcher.js`: Stage 3 implementation
- `content/content-creator.js`: Stage 4 implementation
- `content/seo-optimizer.js`: Stage 5 implementation
- `content/content-publisher.js`: Stage 6 implementation (multi-platform)
- `data/*.csv`: All workflow data files

## Publishing Workflow Details

### WordPress Payload Example

```json
{
  "title": "Article Title",
  "content": "<html>...</html>",
  "excerpt": "Brief summary",
  "status": "draft",
  "slug": "url-friendly-slug",
  "meta": {
    "meta_description": "SEO description",
    "focus_keyword": "primary keyword"
  }
}
```

### Sanity Payload Example

```json
{
  "mutations": [{
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
  }]
}
```

## Troubleshooting Guide

**WordPress 401/403 Error:**
- Verify application password format (no spaces)
- Check user has `publish_posts` capability
- Ensure REST API is enabled

**Sanity 401/403 Error:**
- Verify token has write permissions
- Check project ID and dataset name
- Confirm `post` document type exists in schema

**Simulation Mode Activated:**
- Provide missing credentials (WP_*, SANITY_*)
- System falls back to preview URLs
- Workflow continues without live publishing

**CSV Approval Not Triggering:**
- Set exact value: `approval_status = "Yes"` or `"SEO-Ready"`
- No extra spaces or quotes
- Re-run stage: `node main.js stage {next-stage}`

## Best Practices

1. **Always review approval CSVs** before auto-approving
2. **Test publishing locally** before production
3. **Monitor quality scores** (90%+ threshold)
4. **Use simulation mode** for workflow testing
5. **Track performance** via `published-content.csv`
6. **Batch processing**: Use `--batch-size` for large volumes
7. **Fallback chains**: Let AI models degrade gracefully
8. **Multi-platform**: Ensure all credentials before Stage 6

## Performance Metrics

- **Generation Speed**: 30-60 seconds per article
- **Publishing Speed**: 3-5 seconds per platform
- **Quality Threshold**: 90%+ quality score required
- **Monthly Target**: 500-1000 published articles
- **Traffic Goal**: 1M monthly visitors (year 1)

## Related Skills

- **Content Research Writer**: For manual research-based writing
- **Test-Driven Development**: For adding new workflow stages
- **Systematic Debugging**: For troubleshooting pipeline issues
- **Git Pushing**: For version control of workflow changes
