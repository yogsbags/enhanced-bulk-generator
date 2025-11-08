#!/bin/bash

# Setup Netlify Environment Variables
# Run this script after filling in your actual API keys and credentials

echo "Setting up Netlify environment variables..."

# Required: Groq API Key
read -p "Enter your GROQ_API_KEY: " GROQ_KEY
if [ ! -z "$GROQ_KEY" ]; then
  npx netlify env:set GROQ_API_KEY "$GROQ_KEY"
  echo "✓ GROQ_API_KEY set"
fi

# Optional: OpenAI API Key
read -p "Enter your OPENAI_API_KEY (or press Enter to skip): " OPENAI_KEY
if [ ! -z "$OPENAI_KEY" ]; then
  npx netlify env:set OPENAI_API_KEY "$OPENAI_KEY"
  echo "✓ OPENAI_API_KEY set"
fi

# WordPress Configuration
read -p "Enter UAT_WP_BASE_URL (default: https://uat.plindia.com): " WP_URL
WP_URL=${WP_URL:-https://uat.plindia.com}
npx netlify env:set UAT_WP_BASE_URL "$WP_URL"
echo "✓ UAT_WP_BASE_URL set"

read -p "Enter UAT_WP_USERNAME: " WP_USER
if [ ! -z "$WP_USER" ]; then
  npx netlify env:set UAT_WP_USERNAME "$WP_USER"
  echo "✓ UAT_WP_USERNAME set"
fi

read -p "Enter UAT_WP_APPLICATION_PASSWORD: " WP_PASS
if [ ! -z "$WP_PASS" ]; then
  npx netlify env:set UAT_WP_APPLICATION_PASSWORD "$WP_PASS"
  echo "✓ UAT_WP_APPLICATION_PASSWORD set"
fi

# Sanity Configuration
read -p "Enter SANITY_PROJECT_ID (default: 1eg1vt8d): " SANITY_ID
SANITY_ID=${SANITY_ID:-1eg1vt8d}
npx netlify env:set SANITY_PROJECT_ID "$SANITY_ID"
echo "✓ SANITY_PROJECT_ID set"

read -p "Enter SANITY_DATASET (default: production): " SANITY_DS
SANITY_DS=${SANITY_DS:-production}
npx netlify env:set SANITY_DATASET "$SANITY_DS"
echo "✓ SANITY_DATASET set"

read -p "Enter SANITY_TOKEN: " SANITY_TOKEN
if [ ! -z "$SANITY_TOKEN" ]; then
  npx netlify env:set SANITY_TOKEN "$SANITY_TOKEN"
  echo "✓ SANITY_TOKEN set"
fi

# ImgBB Configuration
read -p "Enter IMGBB_API_KEY: " IMGBB_KEY
if [ ! -z "$IMGBB_KEY" ]; then
  npx netlify env:set IMGBB_API_KEY "$IMGBB_KEY"
  echo "✓ IMGBB_API_KEY set"
fi

# Frontend URL
npx netlify env:set NEXT_FRONTEND_BASE_URL "https://content-creator-pl.netlify.app"
echo "✓ NEXT_FRONTEND_BASE_URL set"

echo ""
echo "✅ Environment variables setup complete!"
echo ""
echo "To view all environment variables, run:"
echo "  npx netlify env:list"
echo ""
echo "To deploy now, run:"
echo "  npx netlify deploy --prod"


