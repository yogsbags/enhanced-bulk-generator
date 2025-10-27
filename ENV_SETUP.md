# Environment Variables Setup Guide

This document lists all required environment variables for the Enhanced Bulk Generator project.

## Required Environment Variables

### Groq API Configuration
```bash
GROQ_API_KEY=your-groq-api-key-here
```

### OpenAI API Configuration (Optional)
```bash
OPENAI_API_KEY=your-openai-api-key-here
```

### WordPress Configuration
```bash
UAT_WP_BASE_URL=https://uat.plindia.com
UAT_WP_USERNAME=your-username
UAT_WP_APPLICATION_PASSWORD=your-wordpress-app-password-here
```

### Sanity CMS Configuration
```bash
SANITY_PROJECT_ID=1eg1vt8d
SANITY_DATASET=your-dataset
SANITY_TOKEN=your-sanity-token-here
```

### Image Upload Configuration
```bash
IMGBB_API_KEY=your-imgbb-api-key-here
```

### Frontend Configuration
```bash
NEXT_FRONTEND_BASE_URL=https://your-site.netlify.app
```

### Google APIs (Optional)
```bash
GOOGLE_ADS_CLIENT_ID=your-google-ads-client-id
GOOGLE_ADS_CLIENT_SECRET=your-google-ads-client-secret
GOOGLE_ADS_DEVELOPER_TOKEN=your-developer-token
GOOGLE_ADS_REFRESH_TOKEN=your-refresh-token
GOOGLE_ADS_CUSTOMER_ID=your-customer-id
```

## Local Development Setup

1. Copy this list to a `.env` file in the project root
2. Replace all placeholder values with your actual credentials
3. Never commit the `.env` file to git (it's already in .gitignore)

## Netlify Deployment Setup

Set these environment variables in the Netlify dashboard or via CLI:

```bash
netlify env:set GROQ_API_KEY "your-groq-api-key"
netlify env:set OPENAI_API_KEY "your-openai-key"
netlify env:set UAT_WP_BASE_URL "https://uat.plindia.com"
netlify env:set UAT_WP_USERNAME "pl_capital_admin"
netlify env:set UAT_WP_APPLICATION_PASSWORD "your-password"
netlify env:set SANITY_PROJECT_ID "1eg1vt8d"
netlify env:set SANITY_DATASET "production"
netlify env:set SANITY_TOKEN "your-token"
netlify env:set IMGBB_API_KEY "your-imgbb-key"
netlify env:set NEXT_FRONTEND_BASE_URL "https://your-site.netlify.app"
```

