#!/usr/bin/env node

const fetch = require('node-fetch');
const { GoogleAuth } = require('google-auth-library');

async function enableGoogleAdsAPI() {
  try {
    console.log('🔧 Enabling Google Ads API for project: website-project-473310\n');

    // Get access token with cloud-platform scope
    const auth = new GoogleAuth({
      keyFile: '/Users/yogs87/Downloads/PL/website-project-473310-2de85d4e7a7c.json',
      scopes: ['https://www.googleapis.com/auth/cloud-platform']
    });

    const client = await auth.getClient();
    const accessToken = await client.getAccessToken();

    console.log('✅ Access token obtained\n');

    // Enable Google Ads API
    const response = await fetch(
      'https://serviceusage.googleapis.com/v1/projects/website-project-473310/services/googleads.googleapis.com:enable',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken.token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const text = await response.text();

    if (response.ok) {
      console.log('✅ Google Ads API enabled successfully!\n');

      // Parse response
      try {
        const data = JSON.parse(text);
        console.log('📋 Operation Details:');
        console.log(JSON.stringify(data, null, 2));
      } catch (e) {
        console.log('Response:', text);
      }

      console.log('\n🎉 API is now enabled and ready to use!');
      console.log('\n📝 Next step: Grant service account access to Google Ads account');
      console.log('   1. Go to https://ads.google.com');
      console.log('   2. Select account 341-116-0347');
      console.log('   3. Admin → Access and Security → Users → Add (+)');
      console.log('   4. Email: plindia-ga4@website-project-473310.iam.gserviceaccount.com');
      console.log('   5. Access: Standard or Admin');
      console.log('\n✅ Then test with: node research/google-ads-api-client.js');

    } else {
      console.log('⚠️  Status:', response.status);

      try {
        const errorData = JSON.parse(text);
        console.log('❌ Error:', JSON.stringify(errorData, null, 2));

        if (errorData.error?.message?.includes('already enabled')) {
          console.log('\n✅ Good news! The API is already enabled.');
          console.log('\n📝 Next step: Grant service account access (see instructions above)');
        } else if (errorData.error?.message?.includes('permission')) {
          console.log('\n⚠️  The service account needs permission to enable APIs.');
          console.log('   Please enable manually at:');
          console.log('   https://console.cloud.google.com/apis/library/googleads.googleapis.com?project=website-project-473310');
        }
      } catch (e) {
        console.log('Response:', text);
      }
    }

  } catch (error) {
    console.error('❌ Failed to enable API:', error.message);
    console.log('\n💡 Manual alternative:');
    console.log('   Visit: https://console.cloud.google.com/apis/library/googleads.googleapis.com?project=website-project-473310');
    console.log('   Click: Enable button');
  }
}

enableGoogleAdsAPI();
