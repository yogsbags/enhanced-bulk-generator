#!/usr/bin/env node

const fetch = require('node-fetch');
const { GoogleAuth } = require('google-auth-library');

async function debugGoogleAds() {
  try {
    // Get access token
    const auth = new GoogleAuth({
      keyFile: '/Users/yogs87/Downloads/PL/website-project-473310-2de85d4e7a7c.json',
      scopes: ['https://www.googleapis.com/auth/adwords']
    });

    const client = await auth.getClient();
    const accessToken = await client.getAccessToken();

    console.log('✅ Access token obtained');

    // Try API call
    const response = await fetch(
      'https://googleads.googleapis.com/v16/customers/3411160347/keywordPlanIdeas:generate',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken.token}`,
          'developer-token': '2JuZRu2i0VHAvbBwFX5fKg',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          keywordSeed: { keywords: ['mutual funds'] },
          geoTargetConstants: ['geoTargetConstants/2356'],
          language: 'languageConstants/1000'
        })
      }
    );

    const text = await response.text();
    console.log('\n📋 Response Status:', response.status);
    console.log('📋 Response Headers:', JSON.stringify([...response.headers.entries()], null, 2));
    console.log('\n📋 Response Body:');
    console.log(text.substring(0, 1000));

    if (response.ok) {
      const data = JSON.parse(text);
      console.log('\n✅ Success!');
      console.log('Results:', JSON.stringify(data, null, 2));
    } else {
      console.log('\n❌ Error Response');
      try {
        const errorData = JSON.parse(text);
        console.log('Error Details:', JSON.stringify(errorData, null, 2));
      } catch (e) {
        console.log('HTML Error Page:', text.substring(0, 500));
      }
    }

  } catch (error) {
    console.error('❌ Debug failed:', error.message);
    console.error(error.stack);
  }
}

debugGoogleAds();
