# Vercel Deployment Guide

## Overview

This project is configured to deploy on Vercel with the following setup:
- **Frontend**: Next.js app (frontend directory)
- **Backend**: Node.js workflow execution (root directory)
- **Function Timeout**: 5 minutes (300 seconds) on Vercel Pro plan

## Prerequisites

1. **Vercel Account**: Sign up at https://vercel.com
2. **Vercel API Token**: Already provided (`NTkSyFJLAMH9vpxmzZ7Wr6tU`)
3. **GitHub Repository**: Connected to https://github.com/yogsbags/enhanced-bulk-generator

## Deployment Steps

### Option 1: Deploy via Vercel CLI (Recommended)

```bash
# 1. Login to Vercel with API token
vercel login

# 2. Link project to Vercel (first time only)
vercel link

# 3. Set environment variables
vercel env add GROQ_API_KEY
vercel env add OPENAI_API_KEY
vercel env add UAT_WP_BASE_URL
vercel env add UAT_WP_USERNAME
vercel env add UAT_WP_APPLICATION_PASSWORD
vercel env add SANITY_PROJECT_ID
vercel env add SANITY_DATASET
vercel env add SANITY_TOKEN
vercel env add IMGBB_API_KEY

# 4. Deploy to production
vercel --prod
```

### Option 2: Deploy via Vercel Dashboard

1. Go to https://vercel.com/new
2. Import GitHub repository: `yogsbags/enhanced-bulk-generator`
3. Configure project settings:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (monorepo setup)
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Output Directory**: `frontend/.next`
   - **Install Command**: `npm install && cd frontend && npm install`

4. Add environment variables in **Settings → Environment Variables**:
   ```
   GROQ_API_KEY=<your-groq-api-key>
   OPENAI_API_KEY=<your-openai-key>
   UAT_WP_BASE_URL=http://localhost:8080
   UAT_WP_USERNAME=<your-wp-username>
   UAT_WP_APPLICATION_PASSWORD=<your-wp-app-password>
   SANITY_PROJECT_ID=<your-sanity-project-id>
   SANITY_DATASET=production
   SANITY_TOKEN=<your-sanity-token>
   IMGBB_API_KEY=<your-imgbb-key>
   ```

5. Click **Deploy**

## Project Structure

```
enhanced-bulk-generator/
├── frontend/                  # Next.js frontend
│   ├── app/
│   │   └── api/
│   │       └── workflow/
│   │           └── execute/
│   │               └── route.ts  # API route (uses local execution on Vercel)
│   ├── api/                   # Vercel serverless functions
│   │   └── workflow-execute/
│   │       └── index.ts       # Alternative serverless function (5-min timeout)
│   ├── package.json
│   └── next.config.js
├── core/                      # Backend workflow engine
├── research/                  # Research modules
├── content/                   # Content creation modules
├── data/                      # CSV data files
├── integrations/              # Integration modules
├── main.js                    # Backend entry point
├── package.json               # Root dependencies
└── vercel.json                # Vercel configuration
```

## How It Works

### Execution Path on Vercel

1. **Frontend UI** → User triggers workflow
2. **Next.js API Route** (`/app/api/workflow/execute/route.ts`)
   - Detects Vercel environment (not Netlify)
   - Spawns `main.js` directly with `spawn()`
   - Streams logs back to frontend via Server-Sent Events
3. **Backend Workflow** (`main.js`)
   - Executes 7-stage workflow
   - Accesses backend modules (core, research, content)
   - Reads/writes CSV files in `data/` directory

### Key Differences from Netlify

| Feature | Netlify | Vercel |
|---------|---------|--------|
| Function Timeout (Free) | 26 seconds | 60 seconds |
| Function Timeout (Pro) | 60 seconds | 300 seconds (5 min) |
| Module System | CommonJS required | ES modules supported |
| Backend Access | Separate function directory | Monorepo with direct access |
| Deployment | Manual file copying | Automatic with `vercel.json` |

## Configuration Files

### `vercel.json`

```json
{
  "version": 2,
  "buildCommand": "cd frontend && npm install && npm run build",
  "outputDirectory": "frontend/.next",
  "framework": "nextjs",
  "functions": {
    "frontend/app/api/**/*.ts": {
      "maxDuration": 300
    }
  },
  "regions": ["iad1"]
}
```

**Key settings:**
- `maxDuration: 300` - 5-minute timeout for API routes (requires Pro plan)
- `regions: ["iad1"]` - Deploy to US East (Washington DC) for lower latency
- Monorepo build commands to install both root and frontend dependencies

### `frontend/api/workflow-execute/index.ts`

Alternative serverless function endpoint with explicit 5-minute timeout:
- **URL**: `https://your-site.vercel.app/api/workflow-execute`
- **Method**: POST
- **Body**: `{ "topicLimit": 1, "category": "derivatives" }`
- **Response**: `{ "success": true, "output": [...], "exitCode": 0 }`

## Environment Variables

All environment variables are managed in Vercel dashboard:

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `GROQ_API_KEY` | Groq API key for AI generation | `gsk_...` |
| `OPENAI_API_KEY` | OpenAI key (optional) | `sk-proj-...` |
| `UAT_WP_BASE_URL` | WordPress site URL | `http://localhost:8080` |
| `UAT_WP_USERNAME` | WordPress username | `admin` |
| `UAT_WP_APPLICATION_PASSWORD` | WordPress app password | `xxxx xxxx xxxx xxxx` |
| `SANITY_PROJECT_ID` | Sanity project ID | `1eg1vt8d` |
| `SANITY_DATASET` | Sanity dataset | `production` |
| `SANITY_TOKEN` | Sanity write token | `sk...` |
| `IMGBB_API_KEY` | ImgBB API key for image uploads | `...` |

### Vercel-Specific Variables (Auto-set)

These are automatically set by Vercel:
- `VERCEL` = `"1"`
- `VERCEL_ENV` = `"production"` | `"preview"` | `"development"`
- `VERCEL_URL` = `"your-site.vercel.app"`
- `VERCEL_GIT_COMMIT_SHA` = Git commit hash

## Deployment Workflow

### Automatic Deployment (GitHub Integration)

1. **Push to `main` branch** → Triggers production deployment
2. **Push to other branches** → Triggers preview deployment
3. **Pull Request** → Triggers preview deployment with unique URL

### Manual Deployment

```bash
# Deploy to preview (test)
vercel

# Deploy to production
vercel --prod

# Check deployment status
vercel ls

# View logs
vercel logs <deployment-url>
```

## Testing Deployment

### 1. Test Frontend

Open your Vercel deployment URL:
```
https://your-project.vercel.app
```

### 2. Test Workflow Execution

From frontend UI:
1. Set topic limit (1-5)
2. Select category filter
3. Click "Start Workflow"
4. Monitor logs in real-time

### 3. Test API Directly

```bash
curl -X POST https://your-project.vercel.app/api/workflow-execute \
  -H "Content-Type: application/json" \
  -d '{"topicLimit": 1, "category": "derivatives"}'
```

## Monitoring & Debugging

### View Logs

**Vercel Dashboard:**
1. Go to https://vercel.com/dashboard
2. Select your project
3. Click **Deployments** → Select deployment
4. View **Function Logs** and **Build Logs**

**CLI:**
```bash
# Real-time logs
vercel logs --follow

# Filter by deployment
vercel logs <deployment-url>
```

### Common Issues

#### Issue: Timeout after 60 seconds

**Solution:** Upgrade to Vercel Pro plan for 300-second timeout
- Free plan: 60 seconds max
- Pro plan: 300 seconds max
- Set `maxDuration: 300` in `vercel.json`

#### Issue: Backend files not found

**Solution:** Ensure `vercel.json` includes root directory in build
- Check `installCommand` installs root dependencies
- Verify backend files are not in `.vercelignore`

#### Issue: Environment variables not working

**Solution:**
1. Check variables are set in Vercel dashboard
2. Redeploy after adding new variables
3. Use `vercel env pull` to sync locally

## Performance Optimization

### 1. Enable Edge Functions (Future)

For faster response times, consider moving to Edge Runtime:
```typescript
export const runtime = 'edge'  // Instead of 'nodejs'
```

**Note:** Edge runtime has limitations (no `spawn`, no file system)

### 2. Optimize Build Time

Current build installs dependencies twice (root + frontend):
```bash
# Root dependencies
npm install

# Frontend dependencies
cd frontend && npm install
```

Consider using npm workspaces or pnpm for faster installs.

### 3. Cache Backend Modules

Vercel caches `node_modules` between builds. Ensure:
- `package.json` is at root level
- Dependencies are correctly listed
- No dynamic imports of backend modules

## Rollback Strategy

### Rollback via Dashboard

1. Go to **Deployments** tab
2. Find previous working deployment
3. Click **⋯** → **Promote to Production**

### Rollback via CLI

```bash
# List deployments
vercel ls

# Promote specific deployment
vercel promote <deployment-url>
```

## Comparison: Netlify vs Vercel

| Aspect | Netlify | Vercel |
|--------|---------|--------|
| **Timeout (Free)** | 26s | 60s |
| **Timeout (Pro)** | 60s | 300s (5min) ⭐ |
| **Module Support** | CommonJS only (with `node_bundler: none`) | ES modules native ⭐ |
| **Monorepo Support** | Manual file copying required | Native support ⭐ |
| **Build Speed** | Moderate | Fast ⭐ |
| **Edge Functions** | Yes | Yes |
| **Pricing (Pro)** | $19/month | $20/month |

**Winner: Vercel** - Better timeout limits, native ES module support, easier monorepo setup.

## Next Steps

1. ✅ Created `vercel.json` configuration
2. ✅ Created Vercel serverless function (`frontend/api/workflow-execute/index.ts`)
3. ⏳ Deploy using Vercel CLI or dashboard
4. ⏳ Set environment variables
5. ⏳ Test workflow execution
6. ⏳ Monitor logs and performance

## Support

- **Vercel Docs**: https://vercel.com/docs
- **Vercel CLI**: https://vercel.com/docs/cli
- **Community**: https://github.com/vercel/vercel/discussions
