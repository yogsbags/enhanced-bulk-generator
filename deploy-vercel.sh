#!/bin/bash

# Vercel Deployment Script
# This script deploys the Enhanced Bulk Generator to Vercel

echo "🚀 Enhanced Bulk Generator - Vercel Deployment"
echo "=============================================="
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

echo "📋 Step 1: Login to Vercel"
echo "Using API token: NTkSyFJLAMH9vpxmzZ7Wr6tU"
echo ""

# Login with token (if not already logged in)
vercel whoami &> /dev/null || echo "NTkSyFJLAMH9vpxmzZ7Wr6tU" | vercel login

echo "🔗 Step 2: Link project to Vercel"
echo ""

# Link project (creates .vercel directory)
vercel link --yes || true

echo "🔧 Step 3: Set environment variables"
echo ""
echo "⚠️  IMPORTANT: You need to add these environment variables manually via:"
echo "   - Vercel Dashboard: https://vercel.com/dashboard"
echo "   - Or use: vercel env add <VARIABLE_NAME>"
echo ""
echo "Required variables:"
echo "  - GROQ_API_KEY"
echo "  - OPENAI_API_KEY"
echo "  - UAT_WP_BASE_URL"
echo "  - UAT_WP_USERNAME"
echo "  - UAT_WP_APPLICATION_PASSWORD"
echo "  - SANITY_PROJECT_ID"
echo "  - SANITY_DATASET"
echo "  - SANITY_TOKEN"
echo "  - IMGBB_API_KEY"
echo ""

read -p "Have you added all environment variables? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Please add environment variables first, then run this script again."
    echo ""
    echo "Quick command:"
    echo "  vercel env add GROQ_API_KEY"
    echo "  vercel env add OPENAI_API_KEY"
    echo "  ... (repeat for all variables)"
    exit 1
fi

echo "🚀 Step 4: Deploy to production"
echo ""

# Deploy to production
vercel --prod

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📍 Next steps:"
echo "  1. Check deployment logs: vercel logs --follow"
echo "  2. Open your site: vercel --open"
echo "  3. Test workflow execution from the frontend UI"
echo ""
echo "📚 For more info, see: VERCEL_DEPLOYMENT_GUIDE.md"
