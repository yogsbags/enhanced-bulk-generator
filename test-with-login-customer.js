#!/usr/bin/env node

const fetch = require('node-fetch');
const { GoogleAuth } = require('google-auth-library');

async function testWithLoginCustomer() {
  try {
    console.log('🔍 Testing Google Ads API with login-customer-id header\n');

    // Get access token
    const auth = new GoogleAuth({
      keyFile: '/Users/yogs87/Downloads/PL/website-project-473310-2de85d4e7a7c.json',
      scopes: ['https://www.googleapis.com/auth/adwords']
    });

    const client = await auth.getClient();
    const accessToken = await client.getAccessToken();

    console.log('✅ Access token obtained\n');

    // Test with login-customer-id header (required for Basic Access tokens)
    console.log('📋 Testing Keyword Planner API with login-customer-id...\n');

    const customerId = '3411160347';

    const response = await fetch(
      `https://googleads.googleapis.com/v16/customers/${customerId}/keywordPlanIdeas:generate`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken.token}`,
          'developer-token': '2JuZRu2i0VHAvbBwFX5fKg',
          'login-customer-id': customerId, // Add login customer ID
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          keywordSeed: {
            keywords: ['mutual funds']
          },
          geoTargetConstants: ['geoTargetConstants/2356'], // India
          language: 'languageConstants/1000', // English
          includeAdultKeywords: false
        })
      }
    );

    const text = await response.text();

    console.log('📊 Response Status:', response.status);
    console.log('📊 Response Headers:', JSON.stringify([...response.headers.entries()], null, 2));
    console.log('\n📊 Response Body (first 2000 chars):');
    console.log(text.substring(0, 2000));

    if (response.ok) {
      try {
        const data = JSON.parse(text);
        console.log('\n✅ SUCCESS! Keyword data received:\n');
        console.log(JSON.stringify(data, null, 2));

        if (data.results && data.results.length > 0) {
          console.log('\n📈 Keyword Metrics:');
          data.results.slice(0, 5).forEach(result => {
            console.log(`\n   🔑 ${result.text}`);
            console.log(`      Search Volume: ${result.keywordIdeaMetrics?.avgMonthlySearches || 'N/A'}`);
            console.log(`      Competition: ${result.keywordIdeaMetrics?.competition || 'N/A'}`);
          });
        }
      } catch (e) {
        console.log('Response text:', text);
      }
    } else {
      console.log('\n❌ Error Response');

      // Try to parse as JSON error
      try {
        const errorData = JSON.parse(text);
        console.log('\n🔍 Error Details:');
        console.log(JSON.stringify(errorData, null, 2));

        // Check for specific error messages
        if (errorData.error?.message) {
          const message = errorData.error.message;

          if (message.includes('DEVELOPER_TOKEN_NOT_APPROVED')) {
            console.log('\n⚠️  Developer token needs approval!');
            console.log('   Visit: https://ads.google.com/aw/apicenter');
            console.log('   Apply for Standard Access');
          } else if (message.includes('permission') || message.includes('authorized')) {
            console.log('\n⚠️  Permission issue detected');
            console.log('   - Verify service account has access');
            console.log('   - May need to wait for propagation (try again in 10 min)');
          } else if (message.includes('CUSTOMER_NOT_FOUND')) {
            console.log('\n⚠️  Customer ID issue');
            console.log('   - Verify: 3411160347 is correct');
            console.log('   - Account may need to be linked to MCC');
          }
        }
      } catch (e) {
        console.log('\nHTML Error (404 - API not accessible):');
        console.log('This usually means:');
        console.log('  1. Developer token is not approved (Basic Access has limits)');
        console.log('  2. API endpoint doesn\'t exist (check version)');
        console.log('  3. Account needs MCC/Manager account setup');
      }
    }

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error.stack);
  }
}

testWithLoginCustomer();
