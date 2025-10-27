# Google Ads API Setup - Complete Guide

## ✅ Configuration Added

The following credentials have been successfully added to `.env.local`:

```bash
GOOGLE_ADS_DEVELOPER_TOKEN=2JuZRu2i0VHAvbBwFX5fKg
GOOGLE_ADS_CUSTOMER_ID=3411160347
```

### API Access Details (from Google Ads Console)
- **Developer Token**: 2JuZRu2i0VHAvbBwFX5fKg
- **Access Level**: Basic Access
- **Customer ID**: 341-116-0347 (formatted as 3411160347)
- **Account Name**: Prabhudas Lilladher Pvt Ltd
- **Intended Use**: Programmatica Access for Google Ad campaigns and Keyword Research

## 🔧 Remaining Setup Steps

### Step 1: Enable Google Ads API in Google Cloud

**Option A: Via Console (Easiest)**
1. Visit: https://console.cloud.google.com/apis/library/googleads.googleapis.com?project=website-project-473310
2. Click **"Enable"** button
3. Wait for confirmation (takes ~30 seconds)

**Option B: Via gcloud CLI**
```bash
gcloud services enable googleads.googleapis.com --project=website-project-473310
```

### Step 2: Link Service Account to Google Ads Account

Your service account needs permission to access the Google Ads account:

**Service Account Email**: `plindia-ga4@website-project-473310.iam.gserviceaccount.com`

**Steps to Grant Access**:
1. Go to **Google Ads**: https://ads.google.com
2. Select account **341-116-0347** (Prabhudas Lilladher Pvt Ltd)
3. Navigate to: **Admin** → **Access and Security** → **Users**
4. Click the **"+"** (Add User) button
5. Enter email: `plindia-ga4@website-project-473310.iam.gserviceaccount.com`
6. Select access level: **"Standard"** (recommended) or **"Admin"**
7. Click **"Send Invitation"**
8. ⚠️ **Important**: Service accounts auto-accept, no email confirmation needed

### Step 3: Test the Integration

After completing Steps 1 & 2, test with:

```bash
cd /Users/yogs87/Downloads/sanity/enhanced-bulk-generator

# Test basic connection
node research/google-ads-api-client.js

# Test with keywords
node research/google-ads-api-client.js "mutual funds" "SIP investment" "index funds"

# Full integration test
node test-google-ads-mcp.js
```

## 📊 What You'll Get

Once setup is complete, the system will fetch **real Google Ads data**:

### Keyword Metrics Available
- **Search Volume**: Actual monthly searches (e.g., 45,000/month)
- **Competition**: LOW, MEDIUM, HIGH
- **Competition Index**: 0-100 score
- **CPC Estimates**: Low and high bid estimates in ₹
- **Keyword Difficulty**: Calculated 0-100 score
- **Monthly Trends**: Historical search volume data
- **Related Keywords**: Keyword ideas and variations

### Example Output
```javascript
{
  keyword: "mutual funds",
  search_volume: 45000,
  competition: "MEDIUM",
  competition_index: 55,
  low_bid_micros: 5000000,
  high_bid_micros: 15000000,
  cpc: "5.00",
  keyword_difficulty: 55,
  monthly_searches: [...],
  source: "Google Ads API",
  confidence: "very-high"
}
```

## 🔍 Current Status

✅ **Completed**:
- Developer token configured
- Customer ID configured
- Service account credentials configured
- `.env.local` updated with all credentials

⚠️ **Pending** (manual steps):
1. Enable Google Ads API in Google Cloud project
2. Grant service account access to Google Ads account 341-116-0347

## 🚀 Using Google Ads Data in Workflows

Once setup is complete, the system will automatically use Google Ads API for:

### Stage 1: SEO Research
```bash
node main.js stage research
```
- Fetches real search volumes for competitor analysis
- Uses Google Ads data to identify high-volume opportunities

### Stage 2: Topic Generation
```bash
node main.js stage topics
```
- Validates topic potential with actual search data
- Prioritizes based on real search volume

### Stage 3: Deep Research
```bash
node main.js stage deep-research
```
- Gets keyword metrics for each topic
- Analyzes competition levels from Google Ads data

### Direct API Usage
```javascript
const GoogleAdsAPIClient = require('./research/google-ads-api-client');

const client = new GoogleAdsAPIClient({
  developerToken: '2JuZRu2i0VHAvbBwFX5fKg',
  customerId: '3411160347',
  serviceAccountPath: '/Users/yogs87/Downloads/PL/website-project-473310-2de85d4e7a7c.json'
});

const results = await client.getKeywordIdeas(
  ['mutual funds', 'SIP investment'],
  'India',
  'en'
);
```

## 💰 Cost & Limits

### Google Ads API
- **Cost**: FREE (no charges for API calls)
- **Rate Limits**:
  - Basic Access: 15,000 operations/day
  - Standard Access: Higher limits after approval
- **Data Quality**: Official Google data (highest accuracy)

### Alternative: DataForSEO (Backup)
- **Cost**: ₹0.04 per keyword
- **Rate Limits**: Based on your plan
- **Data Quality**: Aggregated from multiple sources

The system automatically falls back to DataForSEO if Google Ads API is unavailable.

## 🐛 Troubleshooting

### Error: "404 Not Found"
**Cause**: Google Ads API not enabled
**Solution**: Complete Step 1 above

### Error: "PERMISSION_DENIED"
**Cause**: Service account doesn't have access
**Solution**: Complete Step 2 above

### Error: "INVALID_CUSTOMER_ID"
**Cause**: Wrong format or ID
**Solution**: Verify ID is `3411160347` (no dashes)

### Error: "DEVELOPER_TOKEN_NOT_APPROVED"
**Cause**: Token needs approval for production
**Solution**:
- Basic Access works for testing (current status)
- Apply for Standard Access for production use
- Visit: https://ads.google.com/aw/apicenter

## 📚 Resources

- **Google Ads API Documentation**: https://developers.google.com/google-ads/api/docs/start
- **Developer Token Guide**: https://developers.google.com/google-ads/api/docs/first-call/dev-token
- **Service Account Setup**: https://cloud.google.com/iam/docs/service-accounts
- **API Reference**: https://developers.google.com/google-ads/api/reference/rpc/v16/KeywordPlanIdeaService

## 📝 Notes

- Your developer token has **"Basic Access"** which is sufficient for testing and development
- For production use with high volume, you may need to apply for **"Standard Access"**
- The Customer ID 341-116-0347 is formatted as 3411160347 (without dashes) in the configuration
- Service account authentication is more secure than OAuth2 for automated workflows
- All API calls are logged for debugging and monitoring

---

**Status**: Configuration complete, awaiting final setup steps (API enable + service account access)
**Created**: 2025-10-16
**Last Updated**: 2025-10-16
