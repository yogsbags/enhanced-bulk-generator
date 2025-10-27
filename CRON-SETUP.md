# Cron Job Setup for Automated Content Generation

## Overview

The Enhanced Bulk Generator is designed to run automatically via cron at 2am daily, executing the complete 7-stage workflow with auto-approval enabled.

## Command Used

```bash
node main.js auto --auto-approve
```

This command runs all stages sequentially:
1. **Stage 1**: Master SEO Research (identifies 10 content gaps)
2. **Stage 2**: Topic Generation (creates strategic topics from gaps)
3. **Stage 3**: Deep Topic Research (competitor analysis)
4. **Stage 4**: Content Creation (generates E-E-A-T compliant articles with hero images)
5. **Stage 5**: SEO Optimization (metadata, schema markup)
6. **Stage 6**: Publication (WordPress + Sanity CMS)
7. **Stage 7**: Completion (workflow tracking)

## Environment Variables Required

### Required for AI Generation
```bash
export GROQ_API_KEY="your-groq-api-key"
```

### Optional for Hero Images
```bash
export OPENAI_API_KEY="your-openai-api-key"
```

### Optional for Live Publishing (Sanity)
```bash
export SANITY_PROJECT_ID="your-project-id"
export SANITY_DATASET="production"  # or "development"
export SANITY_TOKEN="your-write-token"
export NEXT_FRONTEND_BASE_URL="http://localhost:3001"  # or your production URL
```

### Optional for Live Publishing (WordPress)
```bash
export WP_BASE_URL="http://localhost:8080"
export WP_USERNAME="admin"
export WP_APPLICATION_PASSWORD="xxxx yyyy zzzz wwww"
export PUBLISH_STATUS="draft"  # or "publish"
```

## Cron Job Setup

### 1. Edit Crontab
```bash
crontab -e
```

### 2. Add Daily Job at 2am
```bash
# Enhanced Bulk Generator - Daily Content Generation at 2am
0 2 * * * cd /Users/yogs87/Downloads/sanity/enhanced-bulk-generator && /usr/local/bin/node main.js auto --auto-approve >> logs/cron-$(date +\%Y\%m\%d).log 2>&1
```

### 3. Verify Cron Job
```bash
crontab -l
```

### 4. Create Logs Directory
```bash
mkdir -p /Users/yogs87/Downloads/sanity/enhanced-bulk-generator/logs
```

## Auto-Approve Behavior

When `--auto-approve` is enabled:

### Stage 1 (Research)
- Automatically approves research gaps with priority score >= 90

### Stage 2 (Topics)
- Automatically approves topics with priority score >= 80

### Stage 3 (Deep Research)
- Automatically approves all completed research items

### Stage 4 (Content Creation)
- Automatically creates content for all approved research
- **Hero images are saved to disk with `saveToDisk: true`**
- Images stored in: `data/generated-hero-images/{topic-id}-hero.png`

### Stage 5 (SEO Optimization)
- Automatically marks content as "SEO-Ready"

### Stage 6 (Publication)
- Automatically publishes to WordPress and Sanity
- Uses local hero images (no URL expiration issues)

## Hero Image Persistence

**Critical Update**: Hero images are now saved locally during generation!

### How It Works:
1. DALL-E generates image → temporary URL (expires in 1 hour)
2. Image immediately downloaded to `data/generated-hero-images/`
3. CSV stores both URL and `local_path`
4. Publisher uses `local_path` if URL expired

### Files Modified:
- `content/content-creator.js:875` - Added `saveToDisk: true`
- `content/content-publisher.js:230` - Check both `url` and `local_path`
- `content/content-publisher.js:306-335` - Support local file uploads to Sanity

### Storage Location:
```
data/generated-hero-images/
├── TOPIC-001-hero.png
├── TOPIC-002-hero.png
└── TOPIC-003-hero.png
```

## Expected Output Files

After each run, check these CSV files:

```
data/
├── research-gaps.csv          # SEO research results
├── generated-topics.csv       # Strategic topics
├── topic-research.csv         # Deep competitor analysis
├── created-content.csv        # Generated articles + hero images
├── published-content.csv      # Publication URLs
└── workflow-status.csv        # Progress tracking
```

## Monitoring

### Check Workflow Status
```bash
cd /Users/yogs87/Downloads/sanity/enhanced-bulk-generator
node main.js status
```

### View Logs
```bash
tail -f logs/cron-$(date +%Y%m%d).log
```

### Manual Test Run
```bash
./test-auto-workflow.sh
```

## Troubleshooting

### Issue: No content generated
**Check**:
- GROQ_API_KEY is set correctly
- Previous runs haven't already generated content for today
- CSV files are not locked by another process

### Issue: Images not showing
**Check**:
- OPENAI_API_KEY is set (required for DALL-E)
- Directory `data/generated-hero-images/` exists and is writable
- Check `hero_image` field in `created-content.csv` has `local_path`

### Issue: Publishing fails
**Check**:
- Sanity credentials (SANITY_PROJECT_ID, SANITY_TOKEN, SANITY_DATASET)
- WordPress credentials (WP_BASE_URL, WP_USERNAME, WP_APPLICATION_PASSWORD)
- Network connectivity to APIs
- Falls back to simulation mode if credentials missing

### Issue: Cron not running
**Check**:
- Cron service is running: `sudo launchctl list | grep cron`
- Node.js path is correct: `which node`
- Working directory exists and is accessible
- Check system logs: `grep CRON /var/log/system.log`

## Performance Expectations

### Time per Stage (approximate):
- Stage 1 (Research): 2-3 minutes (10 gaps)
- Stage 2 (Topics): 1-2 minutes
- Stage 3 (Deep Research): 3-5 minutes
- Stage 4 (Content Creation): 5-10 minutes (includes image generation)
- Stage 5 (SEO Optimization): <1 minute
- Stage 6 (Publication): 1-2 minutes
- Stage 7 (Completion): <1 minute

**Total**: 13-24 minutes per run

### Resource Usage:
- Memory: ~200-500 MB
- Disk: ~50-100 MB per batch (CSV + images)
- Network: API calls to Groq, OpenAI, WordPress, Sanity

## Batch Size Configuration

Default: 10 content pieces per day

To adjust:
```bash
# Generate 25 pieces per day
node main.js auto --auto-approve --batch-size=25

# Or modify main.js line 62:
batchSize: 25
```

## Success Indicators

✅ Workflow completed successfully when:
1. No errors in logs
2. New rows in all CSV files
3. `workflow-status.csv` shows "Content Published"
4. Hero images present in `data/generated-hero-images/`
5. URLs in `published-content.csv` (or marked as "Simulated")

## Data Backup

The workflow does NOT clear old data. Each run:
- Appends new research gaps
- Appends new topics
- Creates new content
- Tracks all in workflow-status.csv

**Manual cleanup** required periodically to prevent CSV file growth.

## Integration Checklist

Before running the cron job:

- [ ] All environment variables set in shell profile
- [ ] Node.js v16+ installed
- [ ] Dependencies installed (`npm install`)
- [ ] WordPress running (or simulation mode enabled)
- [ ] Sanity project configured (or simulation mode enabled)
- [ ] Next.js frontend running (optional)
- [ ] Test run successful (`./test-auto-workflow.sh`)
- [ ] Cron job added and verified
- [ ] Logs directory created
- [ ] Image storage directory exists

## Support

For issues, check:
1. Logs in `logs/cron-YYYYMMDD.log`
2. CSV files in `data/` directory
3. Run `node main.js status` for system overview
4. Run `./test-auto-workflow.sh` for manual testing
