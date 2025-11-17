# Content Validation Guide

## Overview

**Stage 4.5: Content Validation** is a critical quality gate that validates generated content against the **39 critical guidelines** before SEO optimization and publication.

## Workflow Integration

```
Stage 4: Content Creation (approval_status: "Needs-SEO")
    ↓
Stage 4.5: Content Validation (NEW)
    ↓
    ├─→ PASSED (approval_status: "Validation-Passed") → Stage 5: SEO Optimization
    └─→ FAILED (approval_status: "Validation-Failed") → Manual review/regeneration
```

## Running Validation

### Command Line

```bash
# Validate all content with "Needs-SEO" status
node main.js stage validation

# Or run from the validator directly
node content/content-validator.js

# With options
node content/content-validator.js --lenient  # Less strict mode (not recommended)
```

### Integration in Full Workflow

Validation runs automatically between Stage 4 and Stage 5:

```bash
# Full workflow with automatic validation
node main.js full

# Or run content creation + validation + SEO in sequence
node main.js stage content
node main.js stage validation
node main.js stage seo
```

## Validation Categories

### 1. Structural Validation (CRITICAL - Weight: 10)

**Checks:**
- ✅ No H1 title at article start (should start with `## Executive Summary`)
- ✅ Executive Summary is the first H2 heading
- ✅ No `## Introduction` heading (use plain text after Executive Summary)
- ✅ Key Takeaways section present
- ✅ Action Plan section present
- ✅ Conclusion section present
- ✅ FAQ section exists AFTER Conclusion
- ✅ Exactly 5 FAQ questions in H3 format
- ✅ Key Takeaways and Action Plan placed BEFORE Conclusion

**Example Structure:**
```markdown
## Executive Summary

(Plain text introduction paragraphs - no heading)

## [Main Topic Section 1]

## [Main Topic Section 2]

## Key Takeaways

## Action Plan

## Conclusion

## FAQ Section

### Q1: What is...?
### Q2: How does...?
### Q3: Why should...?
### Q4: When is...?
### Q5: Can I...?
```

### 2. Content Quality Validation (HIGH - Weight: 5)

**Checks:**
- ✅ Word count: 2,000-2,500 words (~2,400 optimal)
- ✅ No competitor names (Zerodha, Upstox, Angel One, ICICI Direct, Groww)
- ✅ CTA link present (`https://instakyc.plindia.com/` or `https://www.plindia.com`)
- ✅ Average sentence length under 15 words

**Example Issues:**
```
❌ Word count 1,850 outside target range (2000-2500)
❌ Found competitor names: Zerodha, Upstox
❌ Missing CTA link
⚠️  Average sentence length: 17.3 words (target: under 15)
```

### 3. Compliance Validation (CRITICAL - Weight: 10)

**Checks:**
- ✅ No "January 2025" references (use "November 2025")
- ✅ No absolute probability/success rate claims
- ✅ No unsourced historical data claims
- ✅ Asterisk and Important Notes section alignment
- ⚠️  No future date references ("as of Nov 2025")

**Example Issues:**
```
❌ Found "January 2025" references - should use November 2025
❌ Found probability/success rate stated as facts - must qualify
❌ Found "historical data shows" without sources
❌ Asterisks (*) used but no "Important Notes" section found
```

### 4. SEO Validation (HIGH - Weight: 5)

**Checks:**
- ✅ Meta title: 50-60 characters
- ✅ Meta description: 140-160 characters
- ✅ Focus keyphrase defined
- ✅ Secondary keywords: 3-5 keywords
- ⚠️  Focus keyphrase in meta description

**Example Output:**
```
✅ Meta title length optimal (50-60 chars): 57 chars
✅ Meta description length optimal (140-160 chars): 152 chars
✅ Focus keyphrase defined
✅ Secondary keywords count optimal (3-5): 4 keywords
```

### 5. Formatting Validation (MEDIUM - Weight: 2)

**Checks:**
- ✅ Mixed formatting (paragraphs, bullets, numbered lists, tables)
- ⚠️  No trailing years in headings (except FY)
- ⚠️  En dash usage for ranges (–) instead of hyphens (-)
- ⚠️  Conclusion length under 100 words

**Example Suggestions:**
```
💡 Use en dashes (–) for ranges instead of hyphens (-)
⚠️  Conclusion is 127 words (target: under 100 words)
```

## Validation Scoring

### Score Calculation

```
Total Score = (Passed Checks × Weight) / (Total Checks × Weight) × 100

Example:
- Passed: 35 checks
- Total: 40 checks
- Weighted Score: (35 × weights) / (40 × weights) = 87%
```

### Passing Criteria

- **PASS**: Score ≥ 80% AND 0 critical issues
- **WARNING**: Score 60-79% OR minor issues only
- **FAIL**: Score < 60% OR critical issues present

### Status Updates

| Validation Result | Approval Status | Next Step |
|------------------|-----------------|-----------|
| PASS (≥80%, 0 issues) | `Validation-Passed` | Auto-progress to SEO |
| WARNING (60-79%) | `Validation-Warning` | Manual review recommended |
| FAIL (<60% or issues) | `Validation-Failed` | Fix issues and re-validate |

## Output Examples

### Successful Validation

```
🔍 CONTENT VALIDATION STARTED
============================================================
✅ Found 3 content item(s) to validate

🔍 Validating 1/3: CONT-001

────────────────────────────────────────────────────────────
📊 Validation Results: CONT-001
────────────────────────────────────────────────────────────
Status: Validation-Passed
Score: 92% (184/200 points)

⚠️  WARNINGS (should review):
   1. Average sentence length: 15.8 words (target: under 15)
   2. Conclusion is 112 words (target: under 100 words)

✅ VALIDATION PASSED - Content ready for SEO optimization
────────────────────────────────────────────────────────────
```

### Failed Validation

```
🔍 Validating 2/3: CONT-002

────────────────────────────────────────────────────────────
📊 Validation Results: CONT-002
────────────────────────────────────────────────────────────
Status: Validation-Failed
Score: 65% (130/200 points)

❌ ISSUES (must fix):
   1. [CRITICAL] No "Executive Summary" as first H2
   2. [CRITICAL] Found competitor names: Zerodha, Upstox
   3. [HIGH] Word count 1,650 outside target range (2000-2500)
   4. [HIGH] Missing CTA link

⚠️  WARNINGS (should review):
   1. Found "January 2025" reference
   2. Focus keyphrase not found in meta description

❌ VALIDATION FAILED - Content requires fixes before SEO
────────────────────────────────────────────────────────────
```

## CSV Integration

### Approval Status Flow

```csv
topic_id,creation_date,approval_status,content_id
TOPIC-001,2025-11-17,Needs-SEO,CONT-001          # After Stage 4
TOPIC-001,2025-11-17,Validation-Passed,CONT-001  # After Stage 4.5 (Pass)
TOPIC-002,2025-11-17,Validation-Failed,CONT-002  # After Stage 4.5 (Fail)
TOPIC-001,2025-11-17,SEO-Ready,CONT-001          # After Stage 5
```

### Workflow Status Tracking

The validator updates `data/workflow-status.csv`:

```csv
topic_id,current_stage,status,notes,validation_score,validation_status
TOPIC-001,Content Validation,Validation Passed,Score: 92% | Issues: 0 | Warnings: 2,92,Validation-Passed
TOPIC-002,Content Validation,Validation Failed,Score: 65% | Issues: 4 | Warnings: 2,65,Validation-Failed
```

## Troubleshooting

### Issue: No content found for validation

```
⚠️  No content found requiring validation.
   • Content must have approval_status = "Needs-SEO"
   • Run Stage 4 (content creation) first
```

**Solution:**
```bash
# Run content creation first
node main.js stage content

# Then run validation
node main.js stage validation
```

### Issue: All content fails validation

**Common Causes:**
1. Content created before validation guidelines were implemented
2. AI model not following the 39 guidelines
3. Outdated content templates

**Solution:**
```bash
# Regenerate content with updated guidelines
node main.js stage content --force-regenerate

# Or manually fix issues in created-content.csv
# Then re-run validation
node main.js stage validation
```

### Issue: Validation takes too long

**Solution:**
```bash
# Process content in batches
node main.js stage validation --limit 10
```

## Best Practices

### 1. Run Validation After Every Content Creation

```bash
# Always run these two stages together
node main.js stage content && node main.js stage validation
```

### 2. Review Warnings Even on Pass

Warnings indicate areas for improvement even if validation passes:

```bash
# Review warnings in validation output
# Consider manual refinements for high-priority content
```

### 3. Fix Critical Issues Immediately

Critical issues (CRITICAL, HIGH priority) should be fixed before proceeding:

```bash
# Review failed content
cat data/created-content.csv | grep "Validation-Failed"

# Fix issues manually or regenerate
node main.js stage content --content-id CONT-002

# Re-validate
node main.js stage validation
```

### 4. Use Auto-Approve Carefully

Auto-approve only validates structure, not quality:

```bash
# Manual review recommended for production content
node main.js stage validation  # Without --auto-approve

# Auto-approve only for testing/development
node main.js full --auto-approve
```

## Integration with Other Stages

### Stage 5: SEO Optimization

The SEO Optimizer now only processes content with `Validation-Passed` status:

```javascript
// content/seo-optimizer.js
const pendingContent = this.csvManager.getContentByApprovalStatus([
  'Validation-Passed',  // NEW: Only validated content
  'Needs-SEO',          // LEGACY: Backwards compatibility
  'Pending'             // LEGACY: Backwards compatibility
]);
```

### Stage 6: Publication

Publication requires content to be `SEO-Ready`:

```
Content Creation → Validation → SEO Optimization → Publication
(Needs-SEO)      (Val-Passed)  (SEO-Ready)        (Published)
```

## Monitoring Validation Metrics

### Overall Statistics

```bash
# Check validation pass rate
grep -c "Validation-Passed" data/created-content.csv
grep -c "Validation-Failed" data/created-content.csv

# View validation scores
node main.js status
```

### Individual Content Review

```bash
# View validation details for specific content
grep "CONT-001" data/workflow-status.csv
```

## Future Enhancements

Planned improvements for the validation stage:

1. **Readability Scoring**: Flesch-Kincaid readability analysis
2. **Plagiarism Detection**: Check for duplicate content
3. **Link Validation**: Verify all internal/external links
4. **Image Validation**: Check hero image quality and alt text
5. **Schema Validation**: Validate JSON-LD schema markup
6. **Performance Metrics**: Track validation time and bottlenecks
7. **AI-Powered Fixes**: Automatic issue correction with AI
8. **Custom Rules**: User-defined validation rules

---

**Version:** 1.0
**Created:** 2025-11-17
**Updated:** 2025-11-17
**Author:** Content Automation System
