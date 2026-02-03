# 🚀 Google APIs Direct Integration - Complete Setup Guide

## Overview

This guide shows you how to integrate **Google Ads API**, **Google Search Console API**, and **Google Custom Search API** directly into the enhanced-bulk-generator for real, accurate SEO data.

## 📊 What You'll Get

### ✅ Google Ads API
- **Real search volumes** (not estimates)
- **Keyword difficulty** scores
- **CPC (Cost Per Click)** data
- **Competition** metrics
- **Monthly search trends**

### ✅ Google Search Console API
- **Real traffic data** from your site
- **Actual user queries**
- **Click-through rates** (CTR)
- **Search positions**
- **Content gap opportunities** (high impressions, low CTR)

### ✅ Google Custom Search API
- **Site-specific content search**
- **Coverage detection** (avoid duplicates)
- **Competitor analysis**
- **Topic validation**

---

## 🔧 Setup Instructions

### Prerequisites

1. **Google Cloud Project**: https://console.cloud.google.com/
2. **Service Account**: For automated access
3. **API Keys**: For Custom Search

---

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Enter project name: `seo-research-automation`
4. Click "Create"

---

## Step 2: Enable Required APIs

Enable these APIs in your project:

### A. Google Ads API
1. Go to [Google Ads API Library](https://console.cloud.google.com/apis/library/googleads.googleapis.com)
2. Click "Enable"

### B. Google Search Console API
1. Go to [Search Console API Library](https://console.cloud.google.com/apis/library/searchconsole.googleapis.com)
2. Click "Enable"

### C. Custom Search API
1. Go to [Custom Search API Library](https://console.cloud.google.com/apis/library/customsearch.googleapis.com)
2. Click "Enable"

---

## Step 3: Create Service Account (Google Ads & GSC)

### Create Service Account

1. Go to [IAM & Admin → Service Accounts](https://console.cloud.google.com/iam-admin/serviceaccounts)
2. Click "Create Service Account"
3. Name: `seo-research-bot`
4. Click "Create and Continue"
5. Grant role: **Owner** (for full access)
6. Click "Done"

### Generate Key File

1. Click on your service account
2. Go to "Keys" tab
3. Click "Add Key" → "Create new key"
4. Select "JSON"
5. Click "Create"
6. **Download the JSON file** (e.g., `website-project-473310-2de85d4e7a7c.json`)
7. **Save it securely** - this is your authentication credential

### Set Environment Variable

```bash
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account.json"
```

**Make it permanent** (add to ~/.zshrc or ~/.bashrc):
```bash
echo 'export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account.json"' >> ~/.zshrc
source ~/.zshrc
```

---

## Step 4: Google Ads API Setup

### A. Get Developer Token

1. Go to [Google Ads](https://ads.google.com/)
2. Navigate to **Tools & Settings** → **Setup** → **API Center**
3. Apply for **Developer Token**
4. Wait for approval (usually instant for test accounts, 1-2 days for production)

### B. Get Customer ID

1. Go to [Google Ads](https://ads.google.com/)
2. Look at the top right corner
3. Copy your **Customer ID** (format: `123-456-7890`)

### C. Add Service Account to Google Ads

1. In Google Ads, go to **Tools & Settings** → **Setup** → **Access and security**
2. Click **Users**
3. Click the **+** button
4. Enter your **service account email** (from the JSON file, e.g., `seo-research-bot@website-project-473310.iam.gserviceaccount.com`)
5. Grant **Standard** access
6. Click "Send invitation"

### D. Set Environment Variables

```bash
export GOOGLE_ADS_DEVELOPER_TOKEN="your-developer-token"
export GOOGLE_ADS_CUSTOMER_ID="123-456-7890"  # Without dashes: 1234567890
```

---

## Step 5: Google Search Console Setup

### Add Service Account to GSC

1. Go to [Google Search Console](https://search.google.com/search-console)
2. Select your property (e.g., `https://plindia.com`)
3. Go to **Settings** → **Users and permissions**
4. Click **Add user**
5. Enter your **service account email** (e.g., `seo-research-bot@website-project-473310.iam.gserviceaccount.com`)
6. Grant **Full** permission
7. Click **Add**

**That's it!** The service account can now access GSC data.

---

## Step 6: Google Custom Search API Setup

### A. Create API Key

1. Go to [Credentials](https://console.cloud.google.com/apis/credentials)
2. Click "Create Credentials" → "API key"
3. Copy the API key (example format: `AIza...`)
4. Click "Restrict Key"
5. Under "API restrictions", select "Restrict key"
6. Choose "Custom Search API"
7. Click "Save"

### B. Create Custom Search Engine

1. Go to [Programmable Search Engine](https://programmablesearchengine.google.com/)
2. Click "Add"
3. **Sites to search**: Enter your domain (e.g., `plindia.com`)
4. **Name**: `PLIndia Content Search`
5. Click "Create"
6. Copy the **Search engine ID** (example format: `0123456789abcdef0`)

### C. Set Environment Variables

```bash
export GOOGLE_CSE_API_KEY="your-api-key"
export GOOGLE_CSE_ENGINE_ID="your-engine-id"
```

---

## Step 7: Install Dependencies

```bash
cd enhanced-bulk-generator
npm install google-auth-library node-fetch
```

---

## Step 8: Test the Integrations

### Test Google Ads API

```bash
cd enhanced-bulk-generator
node research/google-ads-api-client.js "mutual funds" "SIP investment"
```

**Expected output:**
```
🔍 Fetching keyword ideas for: mutual funds, SIP investment
✅ Got 20 keyword ideas from Google Ads API

📊 KEYWORD ANALYSIS RESULTS:
================================================================================

🔑 mutual funds
   Search Volume: 135,000/month
   Competition: HIGH (Index: 75)
   Difficulty: 60/100
   CPC: ₹45.50
...
```

### Test Google Search Console API

```bash
node research/google-search-console-api-client.js https://plindia.com
```

**Expected output:**
```
🔍 Fetching GSC analytics for https://plindia.com
✅ Got 500 analytics rows from GSC
✅ Identified 47 content gap opportunities

📊 CONTENT GAP OPPORTUNITIES:
================================================================================

1. best mutual funds for beginners
   Impressions: 5,420
   Clicks: 54
   CTR: 1.00%
   Position: 18.5
   Potential Traffic Gain: +1,030 clicks/month
   Opportunity Score: 87/100
...
```

### Test Google Custom Search API

```bash
node research/google-custom-search-api-client.js "mutual funds for beginners"
```

**Expected output:**
```
🔍 Searching: "mutual funds for beginners" on plindia.com
✅ Got 10 search results (1/100 queries today)

📊 TOPIC COVERAGE ANALYSIS:
================================================================================

Topic: mutual funds for beginners
Coverage Score: 45/100
Total Results: 3

Recommendation: UPDATE
Reason: Medium coverage - update and expand existing content
...
```

---

## Step 9: Configure Your Workflow

All environment variables in one place:

```bash
# Add to ~/.zshrc or ~/.bashrc

# Service Account (Google Ads + GSC)
export GOOGLE_APPLICATION_CREDENTIALS="/Users/yogs87/Downloads/PL/website-project-473310-2de85d4e7a7c.json"

# Google Ads API
export GOOGLE_ADS_DEVELOPER_TOKEN="your-developer-token"
export GOOGLE_ADS_CUSTOMER_ID="1234567890"

# Google Custom Search API
export GOOGLE_CSE_API_KEY="AIzaSyBTQvqn-o7D9LpR2iM2MyHG8srAsweVkXc"
export GOOGLE_CSE_ENGINE_ID="925912f53ec3949e7"

# AI Models
export GROQ_API_KEY="gsk_YOUR_GROQ_API_KEY_HERE"
export OPENAI_API_KEY="sk-proj-YOUR_OPENAI_API_KEY_HERE"
```

**Apply changes:**
```bash
source ~/.zshrc  # or source ~/.bashrc
```

---

## Step 10: Run the Full Workflow

```bash
cd enhanced-bulk-generator
node main.js stage research
```

**What happens:**
1. ✅ Groq generates competitor analysis with web search
2. ✅ Google Ads API provides real search volumes
3. ✅ GSC API identifies content gaps from your site data
4. ✅ CSE API checks existing coverage
5. ✅ OpenAI GPT-4o structures everything to JSON
6. ✅ Data saved to research-gaps.csv

---

## 💰 Pricing

### Google Ads API
- **FREE** for keyword research
- Requires Google Ads Manager account (free to create)

### Google Search Console API
- **FREE** (unlimited)
- Requires verified property in GSC

### Google Custom Search API
- **FREE**: 100 queries/day
- **Paid**: $5 per 1,000 queries after that
- [Pricing details](https://developers.google.com/custom-search/v1/overview)

---

## 🎯 Benefits

### Before (AI Estimates)
- ❌ Guessed search volumes
- ❌ No real traffic data
- ❌ Theoretical content gaps
- ❌ No coverage detection

### After (Real APIs)
- ✅ **Official Google search volumes**
- ✅ **Real traffic from your site**
- ✅ **Proven content opportunities**
- ✅ **Accurate coverage analysis**
- ✅ **Data-driven decisions**

---

## 🐛 Troubleshooting

### Error: "Failed to get access token"
**Solution**: Check that `GOOGLE_APPLICATION_CREDENTIALS` points to valid JSON file

### Error: "Google Ads API: PERMISSION_DENIED"
**Solution**: Add service account email to your Google Ads account with Standard access

### Error: "GSC API: User does not have sufficient permissions"
**Solution**: Add service account to Search Console property with Full permission

### Error: "CSE API: Daily limit exceeded"
**Solution**: Upgrade to paid tier or wait until next day (limit resets at midnight PST)

### Error: "DEVELOPER_TOKEN_NOT_APPROVED"
**Solution**: Apply for production developer token at Google Ads API Center

---

## 📚 Resources

- [Google Ads API Docs](https://developers.google.com/google-ads/api/docs/start)
- [Google Search Console API Docs](https://developers.google.com/webmaster-tools/v1/quickstart)
- [Google Custom Search API Docs](https://developers.google.com/custom-search/v1/overview)
- [Service Account Setup](https://cloud.google.com/iam/docs/service-accounts-create)

---

## 🎉 You're Done!

Your enhanced-bulk-generator now has:
- ✅ Real search volume data from Google Ads
- ✅ Real traffic data from Google Search Console
- ✅ Coverage detection from Custom Search API
- ✅ Fully automated, data-driven content research

**Ready to dominate search results!** 🚀
