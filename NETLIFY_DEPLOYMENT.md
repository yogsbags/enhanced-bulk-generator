# Netlify Deployment Guide

## ✅ Deployment Status

- **GitHub Repository**: https://github.com/yogsbags/enhanced-bulk-generator
- **Netlify Site**: https://content-creator-pl.netlify.app
- **Admin Dashboard**: https://app.netlify.com/projects/content-creator-pl

## 🚀 Quick Start

The project has been successfully:
1. ✅ Pushed to GitHub
2. ✅ Connected to Netlify
3. ✅ Auto-deploy configured (pushes to main branch trigger deployments)

## 🔧 Environment Variables Setup

You need to set environment variables in Netlify. Choose one of these methods:

### Method 1: Via Netlify CLI (Recommended)

Run these commands from the project root:

```bash
# Required - Groq API Key
npx netlify env:set GROQ_API_KEY "your-groq-api-key-here"

# Optional - OpenAI API Key
npx netlify env:set OPENAI_API_KEY "your-openai-key-here"

# WordPress Configuration
npx netlify env:set UAT_WP_BASE_URL "https://uat.plindia.com"
npx netlify env:set UAT_WP_USERNAME "pl_capital_admin"
npx netlify env:set UAT_WP_APPLICATION_PASSWORD "your-wordpress-app-password"

# Sanity CMS Configuration
npx netlify env:set SANITY_PROJECT_ID "1eg1vt8d"
npx netlify env:set SANITY_DATASET "production"
npx netlify env:set SANITY_TOKEN "your-sanity-token"

# Image Upload Configuration
npx netlify env:set IMGBB_API_KEY "your-imgbb-api-key"

# Frontend URL
npx netlify env:set NEXT_FRONTEND_BASE_URL "https://content-creator-pl.netlify.app"
```

### Method 2: Via Netlify Dashboard

1. Go to: https://app.netlify.com/projects/content-creator-pl/settings/deploys
2. Click on "Environment variables"
3. Add each variable manually:
   - `GROQ_API_KEY` - Your Groq API key
   - `OPENAI_API_KEY` - Your OpenAI API key (optional)
   - `UAT_WP_BASE_URL` - WordPress base URL
   - `UAT_WP_USERNAME` - WordPress username
   - `UAT_WP_APPLICATION_PASSWORD` - WordPress application password
   - `SANITY_PROJECT_ID` - Sanity project ID (default: 1eg1vt8d)
   - `SANITY_DATASET` - Sanity dataset (default: production)
   - `SANITY_TOKEN` - Sanity authentication token
   - `IMGBB_API_KEY` - ImgBB API key for image uploads
   - `NEXT_FRONTEND_BASE_URL` - Your Netlify site URL

### Method 3: Using the Interactive Script

We've provided a script to guide you through setting up all environment variables:

```bash
./setup-netlify-env.sh
```

## 📦 Manual Deployment

If you want to deploy immediately without waiting for auto-deploy:

```bash
# Deploy to production
npx netlify deploy --prod

# Or deploy a draft first to test
npx netlify deploy
```

## 🔍 Verify Environment Variables

Check that your environment variables are set correctly:

```bash
npx netlify env:list
```

## 🧪 Testing the Deployment

After deployment:

1. Visit your site: https://content-creator-pl.netlify.app
2. Click the "Execute Full Workflow" button
3. Watch the real-time logs
4. Verify all 7 stages execute properly

## 🔄 Auto-Deploy

The site is configured for automatic deployment:

- **Main branch**: Automatically deploys to production
- **Other branches**: Create deploy previews

To trigger a deployment:

```bash
git add .
git commit -m "your commit message"
git push origin main
```

## 📊 Build Configuration

The build is configured in `netlify.toml`:

- **Base directory**: `frontend/`
- **Build command**: `npm install && npm run build`
- **Publish directory**: `.next/`
- **Node version**: 20

## 🐛 Troubleshooting

### Build Fails

Check the build logs at: https://app.netlify.com/projects/content-creator-pl/deploys

Common issues:
- Missing environment variables
- Node version mismatch
- Dependency installation errors

### Environment Variables Not Working

1. Ensure variables are set in Netlify (not just locally)
2. Redeploy after adding new variables
3. Use `npx netlify env:list` to verify

### API Routes Failing

The Next.js API routes in `frontend/app/api/*` need:
- Access to parent directory files (for workflow execution)
- Proper environment variables set
- Sufficient Netlify function timeout (26s on free tier)

## 📝 Next Steps

1. Set all required environment variables
2. Push any remaining changes to GitHub
3. Monitor the build at: https://app.netlify.com/projects/content-creator-pl/deploys
4. Test the deployed site

## 🔗 Useful Links

- **Live Site**: https://content-creator-pl.netlify.app
- **Admin Dashboard**: https://app.netlify.com/projects/content-creator-pl
- **GitHub Repository**: https://github.com/yogsbags/enhanced-bulk-generator
- **Build Logs**: https://app.netlify.com/projects/content-creator-pl/deploys

## 💡 Tips

- Environment variables are encrypted and secure in Netlify
- You can have different variables for production vs preview deploys
- Use `npx netlify open` to quickly access your admin dashboard
- Check build logs immediately if deployment fails


