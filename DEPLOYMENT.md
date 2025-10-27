# Netlify Deployment Guide
## Enhanced Bulk Generator - AI Content Workflow Automation

This guide covers deploying the Enhanced Bulk Generator frontend to Netlify with serverless workflow execution.

---

## 🚀 Quick Deployment (5 Minutes)

### Step 1: Prerequisites

✅ **GitHub Repository** - Push your code to GitHub
✅ **Netlify Account** - Sign up at [netlify.com](https://netlify.com) (free tier works!)
✅ **API Keys** - Gather all required credentials (see below)

---

## 📋 Required Environment Variables

You'll need to set these in Netlify Dashboard → Site Settings → Environment Variables:

### AI Models
```bash
GROQ_API_KEY=gsk_YOUR_GROQ_API_KEY_HERE
OPENAI_API_KEY=sk-proj-YOUR_OPENAI_API_KEY_HERE
```

### WordPress UAT Publishing
```bash
UAT_WP_BASE_URL=https://uat.plindia.com
UAT_WP_USERNAME=your-username
UAT_WP_APPLICATION_PASSWORD=dvsi RH53 OQ2R i5CA bgBX E74k
UAT_PUBLISH_STATUS=publish
```

### Sanity CMS
```bash
SANITY_PROJECT_ID=1eg1vt8d
SANITY_DATASET=your-dataset
SANITY_TOKEN=skGpBM9FYdHCZvFxG9BSN870Lc8VEQUeWABdIhPrPtL4AyIJ4iJ55lcqgQK6eTgHqWPZQ08LgtAVSHbLdZUBN726KfdRu8e4Iz3OtU7sDCSus2npb2ckFAcpFmxPfooE51YYBE6LzIepxcmWTuH748A6qvgPx9PNSNBREJm4ABoztkf8i4ED
```

### Image Hosting (imgbb CDN)
```bash
IMGBB_API_KEY=8921800e17a535d6fe1bbb016d3bddd7
```

### Google APIs (Optional - for SEO research)
```bash
GOOGLE_APPLICATION_CREDENTIALS=/path/to/credentials.json  # Upload as Netlify file
GOOGLE_ADS_DEVELOPER_TOKEN=2JuZRu2i0VHAvbBwFX5fKg
GOOGLE_ADS_CUSTOMER_ID=3411160347
GOOGLE_CSE_API_KEY=AIzaSyBTQvqn-o7D9LpR2iM2MyHG8srAsweVkXc
GOOGLE_CSE_ENGINE_ID=925912f53ec3949e7
GA4_PROPERTY_ID=309159799
GEMINI_API_KEY=AIzaSyAcCCA2Kt0TMVF4-uiOW2iRU--WSiGMk8k
SITE_URL=https://plindia.com
```

### Frontend URL (Set after deployment)
```bash
NEXT_FRONTEND_BASE_URL=https://your-site-name.netlify.app
```

---

## 🎯 Deployment Methods

### Method 1: Deploy via Netlify Dashboard (Recommended)

1. **Push to GitHub**
   ```bash
   cd /Users/yogs87/Downloads/sanity/projects/enhanced-bulk-generator
   git init
   git add .
   git commit -m "Initial commit: Enhanced Bulk Generator"
   git branch -M main
   git remote add origin https://github.com/your-username/enhanced-bulk-generator.git
   git push -u origin main
   ```

2. **Connect to Netlify**
   - Go to [app.netlify.com/start](https://app.netlify.com/start)
   - Click "Import from Git" → Select GitHub
   - Choose your `enhanced-bulk-generator` repository
   - Configure build settings:
     - **Base directory**: (leave empty)
     - **Build command**: `cd frontend && npm install && npm run build`
     - **Publish directory**: `frontend/.next`

3. **Set Environment Variables**
   - Go to Site Settings → Environment Variables
   - Click "Add a variable" for each variable listed above
   - Save and redeploy

4. **Update Frontend URL**
   - After deployment, copy your Netlify URL (e.g., `https://pl-capital-content.netlify.app`)
   - Add it as `NEXT_FRONTEND_BASE_URL` environment variable
   - Redeploy (Deploys → Trigger deploy → Deploy site)

---

### Method 2: Deploy via Netlify CLI (Advanced)

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   netlify login
   ```

2. **Initialize Netlify Site**
   ```bash
   cd /Users/yogs87/Downloads/sanity/projects/enhanced-bulk-generator
   netlify init
   ```

3. **Set Environment Variables**
   ```bash
   # Set all variables at once
   netlify env:set GROQ_API_KEY "gsk_YOUR_GROQ_API_KEY_HERE"
   netlify env:set OPENAI_API_KEY "sk-proj-5wyWJQXRjE..."
   netlify env:set UAT_WP_BASE_URL "https://uat.plindia.com"
   netlify env:set UAT_WP_USERNAME "pl_capital_admin"
   netlify env:set UAT_WP_APPLICATION_PASSWORD "dvsi RH53 OQ2R i5CA bgBX E74k"
   netlify env:set SANITY_PROJECT_ID "1eg1vt8d"
   netlify env:set SANITY_DATASET "production"
   netlify env:set SANITY_TOKEN "skGpBM9FYdHCZvFxG9BSN870Lc8VEQUeWABdIhPrPtL4AyIJ4iJ55lcqgQK6eTgHqWPZQ08LgtAVSHbLdZUBN726KfdRu8e4Iz3OtU7sDCSus2npb2ckFAcpFmxPfooE51YYBE6LzIepxcmWTuH748A6qvgPx9PNSNBREJm4ABoztkf8i4ED"
   netlify env:set IMGBB_API_KEY "8921800e17a535d6fe1bbb016d3bddd7"
   ```

4. **Deploy**
   ```bash
   netlify deploy --prod
   ```

5. **Update Frontend URL**
   ```bash
   # Copy the deployed URL and set it
   netlify env:set NEXT_FRONTEND_BASE_URL "https://your-site.netlify.app"
   netlify deploy --prod  # Redeploy with updated URL
   ```

---

## 🔧 Project Structure for Netlify

```
enhanced-bulk-generator/
├── netlify.toml                 # ✅ Netlify configuration (already created)
├── frontend/                    # Next.js frontend
│   ├── app/                     # App router
│   │   ├── api/                 # API routes (serverless functions)
│   │   │   └── workflow/        # Workflow execution endpoints
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── package.json
│   ├── next.config.js
│   └── .next/                   # Build output (generated)
├── core/                        # Workflow orchestrator
├── research/                    # SEO research modules
├── content/                     # Content creation modules
├── integrations/                # Image generation (imgbb)
├── data/                        # CSV data files
├── package.json                 # Root dependencies
└── main.js                      # CLI entry point
```

---

## ⚙️ How It Works on Netlify

### 1. **Frontend Build**
- Next.js frontend builds to `frontend/.next`
- Static pages are pre-rendered
- React app runs client-side

### 2. **Serverless Functions**
- Next.js API routes (`/api/workflow/*`) become Netlify Functions
- Each request spawns `node main.js` to execute workflow stages
- Streams live logs back to frontend via Server-Sent Events (SSE)

### 3. **Workflow Execution**
```
User clicks "Execute Workflow" in frontend
    ↓
Frontend calls /api/workflow/execute
    ↓
Netlify Function spawns: node main.js full --auto-approve --topic-limit 1
    ↓
Workflow runs all 7 stages:
    Stage 1: SEO Research
    Stage 2: Topic Generation (1 topic)
    Stage 3: Deep Research
    Stage 4: Content Creation (generates hero image → imgbb CDN)
    Stage 5: SEO Optimization
    Stage 6: Publication (WordPress UAT + Sanity)
    Stage 7: Completion
    ↓
Published URLs returned to frontend
```

### 4. **Image Hosting**
- Hero images generated via DALL-E (1024x1024)
- Sharp.js resizes to 450x450 (in-memory)
- **Primary**: Upload to imgbb CDN (permanent URL)
- **Fallback**: Would save to local disk (but Netlify has ephemeral filesystem)
- WordPress UAT uses imgbb URL for featured image

---

## 🚨 Important Netlify Limitations

### 1. **Serverless Function Timeout**
- **Free Tier**: 10 seconds max
- **Pro Tier**: 26 seconds max
- **Issue**: Full workflow can take 2-5 minutes

**Solution**: Use **Background Functions** (Netlify Pro feature) or break workflow into smaller chunks

### 2. **Ephemeral Filesystem**
- Netlify functions can't write to disk permanently
- CSV data files in `/data` won't persist between invocations

**Solutions**:
- **Option A**: Store CSV data in **Sanity CMS** (recommended)
- **Option B**: Use **Netlify Blob Storage** (key-value store)
- **Option C**: Use **external database** (PostgreSQL, MongoDB)
- **Option D**: Store in **GitHub** (commit CSV changes via API)

### 3. **CSV Data Persistence** ⚠️ CRITICAL
Current architecture uses CSV files (`data/*.csv`) which **won't work** on Netlify without modification.

**Recommended Fix**: Migrate CSV storage to Sanity CMS
```javascript
// Instead of:
const csv = readCSV('data/created-content.csv')

// Use:
const content = await sanityClient.fetch('*[_type == "content"]')
```

---

## 🔄 Suggested Architecture for Netlify

### Option 1: Hybrid Approach (Recommended)
- **Frontend on Netlify** (UI dashboard)
- **Backend on AWS Lambda / Railway / Render** (long-running workflows)
- **Data in Sanity CMS** (persistent storage)
- **Images on imgbb** (CDN hosting)

### Option 2: Pure Netlify (Requires Changes)
1. **Break workflow into smaller functions** (each stage = separate function)
2. **Store data in Sanity CMS** (replace CSV files)
3. **Use Netlify Queue** for async processing (Pro feature)
4. **Frontend calls stages sequentially** with polling

### Option 3: Scheduled Workflows (Netlify + GitHub Actions)
- **Netlify** hosts frontend dashboard
- **GitHub Actions** runs workflows on schedule (cron)
- **GitHub** stores CSV data (commits changes)
- **Frontend** displays results from latest commit

---

## 📊 Cost Breakdown

### Netlify Free Tier
- ✅ 100GB bandwidth/month
- ✅ 300 build minutes/month
- ⚠️ 125K function invocations/month
- ❌ 10-second function timeout (too short for full workflow)

### Netlify Pro Tier ($19/month)
- ✅ 1TB bandwidth/month
- ✅ Unlimited build minutes
- ✅ Unlimited function invocations
- ✅ 26-second function timeout (still tight)
- ✅ Background Functions (up to 15 minutes)

### External Services (FREE)
- ✅ imgbb (free tier: unlimited images)
- ✅ Sanity CMS (free tier: 100K API requests/month)
- ✅ Groq API (free tier: varies)

---

## ✅ Pre-Deployment Checklist

- [ ] Push code to GitHub repository
- [ ] Create Netlify account
- [ ] Configure `netlify.toml` (already done)
- [ ] Set all environment variables in Netlify Dashboard
- [ ] Test build locally: `cd frontend && npm run build`
- [ ] Deploy to Netlify
- [ ] Copy deployed URL and update `NEXT_FRONTEND_BASE_URL`
- [ ] Redeploy with updated URL
- [ ] Test workflow execution in deployed frontend
- [ ] Verify imgbb image upload works
- [ ] Verify WordPress UAT publishing works
- [ ] Verify Sanity CMS publishing works

---

## 🐛 Troubleshooting

### Build Fails
- **Error**: `Module not found` → Run `npm install` in `frontend/`
- **Error**: `Cannot find parent directory` → Check `netlify.toml` base directory
- **Error**: `Out of memory` → Reduce `topic-limit` in frontend

### Function Timeout
- **Error**: `Function timed out after 10s` → Upgrade to Netlify Pro or use Background Functions
- **Solution**: Break workflow into smaller stages, call them sequentially

### Environment Variables Not Found
- **Error**: `GROQ_API_KEY is not defined` → Set in Netlify Dashboard → Redeploy
- **Check**: Netlify Dashboard → Site Settings → Environment Variables

### CSV Data Not Persisting
- **Issue**: CSV changes don't save between function invocations
- **Solution**: Migrate to Sanity CMS or external database (see section above)

---

## 🎯 Next Steps After Deployment

1. **Test Full Workflow**
   - Set topic-limit=1
   - Click "Execute Workflow"
   - Monitor live logs
   - Verify published URLs

2. **Optimize for Netlify**
   - Migrate CSV storage to Sanity CMS
   - Implement Background Functions for long workflows
   - Add error handling for timeout scenarios

3. **Monitor Usage**
   - Track Netlify function invocations
   - Monitor imgbb API usage
   - Check Sanity CMS API limits

4. **Production Hardening**
   - Add authentication (OAuth, JWT)
   - Implement rate limiting
   - Set up monitoring & alerts (Sentry, LogRocket)
   - Add content approval workflows

---

## 📚 Resources

- [Netlify Documentation](https://docs.netlify.com/)
- [Next.js on Netlify](https://docs.netlify.com/frameworks/next-js/)
- [Netlify Functions](https://docs.netlify.com/functions/overview/)
- [Netlify Background Functions](https://docs.netlify.com/functions/background-functions/)
- [imgbb API Docs](https://api.imgbb.com/)
- [Sanity CMS Docs](https://www.sanity.io/docs)

---

## 🚀 Deploy Now!

Ready to deploy? Run this command:

```bash
# Option 1: Via Netlify CLI
cd /Users/yogs87/Downloads/sanity/projects/enhanced-bulk-generator
netlify deploy --prod

# Option 2: Via GitHub (Push and use Netlify Dashboard)
git push origin main  # Then deploy via dashboard
```

**Questions?** Check the troubleshooting section or open an issue on GitHub.

---

**Generated**: 2025-10-27
**Version**: 1.0
**Project**: PL Capital Enhanced Bulk Generator
