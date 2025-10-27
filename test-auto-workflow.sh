#!/bin/bash

# Test script to verify end-to-end auto-approved workflow
# This simulates what the cron job at 2am will do

echo "=========================================="
echo "Testing Auto-Approved Workflow (E2E)"
echo "=========================================="
echo ""

# Check for required environment variables
echo "📋 Checking environment variables..."
if [ -z "$GROQ_API_KEY" ]; then
    echo "❌ GROQ_API_KEY not set!"
    echo "Please set it: export GROQ_API_KEY='your-key'"
    exit 1
fi

if [ -z "$OPENAI_API_KEY" ]; then
    echo "⚠️  OPENAI_API_KEY not set (optional for images)"
fi

if [ -z "$SANITY_PROJECT_ID" ] || [ -z "$SANITY_TOKEN" ]; then
    echo "⚠️  Sanity credentials not set (will use simulation mode)"
fi

if [ -z "$WP_BASE_URL" ] || [ -z "$WP_USERNAME" ] || [ -z "$WP_APPLICATION_PASSWORD" ]; then
    echo "⚠️  WordPress credentials not set (will use simulation mode)"
fi

echo "✅ Environment check complete"
echo ""

# Backup existing CSV files
echo "💾 Backing up existing data..."
mkdir -p data/backups
timestamp=$(date +%Y%m%d_%H%M%S)
cp data/*.csv data/backups/ 2>/dev/null || echo "No existing CSV files to backup"
echo "✅ Backup complete"
echo ""

# Run the auto workflow
echo "🚀 Starting auto-approved workflow..."
echo "   This will run all 7 stages end-to-end"
echo "   Expected duration: 5-15 minutes"
echo ""

node main.js auto --auto-approve

exit_code=$?

if [ $exit_code -eq 0 ]; then
    echo ""
    echo "=========================================="
    echo "✅ WORKFLOW COMPLETED SUCCESSFULLY"
    echo "=========================================="
    echo ""
    echo "📊 Check results:"
    echo "   - data/research-gaps.csv (research results)"
    echo "   - data/generated-topics.csv (topic selection)"
    echo "   - data/topic-research.csv (deep research)"
    echo "   - data/created-content.csv (content drafts)"
    echo "   - data/published-content.csv (publication URLs)"
    echo "   - data/workflow-status.csv (progress tracking)"
    echo ""

    # Show summary
    node main.js status
else
    echo ""
    echo "=========================================="
    echo "❌ WORKFLOW FAILED (exit code: $exit_code)"
    echo "=========================================="
    echo ""
    echo "📋 Check logs above for errors"
    echo "💾 Backups available in data/backups/"
fi

exit $exit_code
