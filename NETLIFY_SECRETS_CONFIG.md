# Netlify Secrets Scanning Configuration

This guide explains how to configure Netlify's secrets scanner to ignore false positives in documentation files.

## Current Status

✅ **Implemented:**
- `.netlifyignore` - Excludes all .md files (except README.md) from deployment
- Sanitized environment variable values in all documentation
- Smart build ignore for docs-only changes

⚠️ **Optional Additional Configuration:**
If you still see secrets warnings despite `.netlifyignore`, you can configure secrets scanning via Netlify environment variables.

## Configuration Options

### Option 1: Ignore Specific File Paths (Recommended)

Add this environment variable in Netlify Dashboard:

**Key:** `SECRETS_SCAN_OMIT_PATHS`
**Value:** `*.md,.claude/,docs/,.github/,CLAUDE.md,PROMPTS.md`

**How to set:**
1. Go to https://app.netlify.com/sites/content-creator-pl/configuration/env
2. Click "Add a variable"
3. Key: `SECRETS_SCAN_OMIT_PATHS`
4. Value: `*.md,.claude/,docs/,.github/,CLAUDE.md,PROMPTS.md`
5. Scopes: Select "All deploys"
6. Click "Create variable"

### Option 2: Ignore Specific Secret Keys

If specific environment variable names are causing issues:

**Key:** `SECRETS_SCAN_OMIT_KEYS`
**Value:** `SANITY_DATASET,WP_USERNAME,UAT_WP_USERNAME`

**Note:** This tells Netlify to ignore these specific key names, but they should still be kept secure.

### Option 3: Disable Smart Detection (Not Recommended)

Only use if you're getting too many false positives:

**Key:** `SECRETS_SCAN_SMART_DETECTION_ENABLED`
**Value:** `false`

**⚠️ Warning:** This reduces security protection. Use `SECRETS_SCAN_OMIT_PATHS` instead.

### Option 4: Disable All Scanning (NOT Recommended)

**Key:** `SECRETS_SCAN_ENABLED`
**Value:** `false`

**❌ DO NOT USE:** This completely disables secret protection. Use `.netlifyignore` and `SECRETS_SCAN_OMIT_PATHS` instead.

## Recommended Configuration

Since we've already implemented `.netlifyignore`, you likely **don't need** additional configuration. However, if you want to be extra safe:

```bash
# Add to Netlify Environment Variables (optional)
SECRETS_SCAN_OMIT_PATHS=*.md,.claude/,docs/
```

## How It Works

### Current Implementation (Automatic)

1. **`.netlifyignore`** - Excludes files from deployment
   - Files excluded: All .md files, .claude/, test files
   - Files scanned: Only production code (main.js, frontend/)
   - Result: Secrets scanner never sees documentation files

2. **Sanitized Values** - Replaced hardcoded values
   - Before: `SANITY_DATASET="production"`
   - After: `SANITY_DATASET="your-dataset"`
   - Result: No real secrets in documentation

### With Environment Variable (Optional Enhancement)

3. **`SECRETS_SCAN_OMIT_PATHS`** - Double protection
   - Even if .netlifyignore fails, scanner ignores these paths
   - Provides redundancy
   - More explicit control

## Verification

### Check Current Scan Results

1. Go to https://app.netlify.com/sites/content-creator-pl/deploys
2. Click latest deploy
3. Scroll to "Secrets scanning" section
4. Should show: "0 secrets found" or "Secrets found in ignored files"

### Expected Behavior

**With `.netlifyignore` only:**
- ✅ Documentation files not included in deployment
- ✅ Scanner only scans production code
- ✅ Zero secrets warnings

**With additional `SECRETS_SCAN_OMIT_PATHS`:**
- ✅ Double protection (files ignored during deployment AND scanning)
- ✅ More explicit configuration
- ✅ Easier to debug if issues arise

## Troubleshooting

### Still Seeing Warnings?

**Check 1: Verify .netlifyignore is working**
```bash
# In Netlify build logs, look for:
"Scanning for secrets in code and build output"
# Should show fewer files scanned
```

**Check 2: Add environment variable**
- Set `SECRETS_SCAN_OMIT_PATHS=*.md,.claude/`
- Redeploy and check logs

**Check 3: Verify sanitized values**
```bash
# Search for hardcoded values
grep -r "production" --include="*.md" | grep SANITY_DATASET
# Should return 0 results with our placeholder "your-dataset"
```

### Build Hooks Still Scanning?

If using build hooks (webhooks):
- Environment variables apply to ALL builds
- `.netlifyignore` applies to ALL builds
- No special configuration needed

## Security Best Practices

✅ **Do:**
- Keep `.netlifyignore` excluding documentation
- Use sanitized placeholders in documentation
- Store real secrets in Netlify Environment Variables dashboard
- Use `SECRETS_SCAN_OMIT_PATHS` for documentation directories

❌ **Don't:**
- Set `SECRETS_SCAN_ENABLED=false` (disables all protection)
- Commit real secrets to git
- Use production values in documentation examples
- Disable scanning for production code

## Current Environment Variables

**Already Set in Netlify Dashboard:**
- `GROQ_API_KEY` (secret)
- `OPENAI_API_KEY` (secret)
- `SANITY_PROJECT_ID` (can be public)
- `SANITY_DATASET` (can be public: "production")
- `SANITY_TOKEN` (secret)
- `WP_USERNAME`, `WP_APPLICATION_PASSWORD` (secret)
- `UAT_WP_USERNAME`, `UAT_WP_APPLICATION_PASSWORD` (secret)
- `IMGBB_API_KEY` (secret)

**None of these need to be in code** - they're safely stored in Netlify's encrypted environment.

## Summary

**Current Protection (Already Implemented):**
1. ✅ `.netlifyignore` - Excludes docs from deployment
2. ✅ Sanitized values - No real secrets in docs
3. ✅ Smart build ignore - Skips builds for docs-only changes

**Optional Enhancement:**
- Add `SECRETS_SCAN_OMIT_PATHS=*.md,.claude/,docs/` in Netlify dashboard
- Provides redundant protection
- More explicit configuration

**Recommendation:**
- Monitor next deployment
- If zero warnings → no action needed
- If warnings persist → add `SECRETS_SCAN_OMIT_PATHS`

---

**Last Updated:** 2025-10-27
**Reference:** https://docs.netlify.com/build/environment-variables/secrets-controller/
