#!/usr/bin/env node

const fetch = require('node-fetch');
const { GoogleAuth } = require('google-auth-library');

async function testAccountAccess() {
  try {
    console.log('🔍 Testing Google Ads Account Access\n');

    // Get access token
    const auth = new GoogleAuth({
      keyFile: '/Users/yogs87/Downloads/PL/website-project-473310-2de85d4e7a7c.json',
      scopes: ['https://www.googleapis.com/auth/adwords']
    });

    const client = await auth.getClient();
    const accessToken = await client.getAccessToken();

    console.log('✅ Access token obtained\n');

    // Try to list accessible customers
    console.log('📋 Attempting to list accessible customers...\n');

    const customerResponse = await fetch(
      'https://googleads.googleapis.com/v16/customers:listAccessibleCustomers',
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken.token}`,
          'developer-token': '2JuZRu2i0VHAvbBwFX5fKg'
        }
      }
    );

    const customerText = await customerResponse.text();

    console.log('Status:', customerResponse.status);
    console.log('Response:', customerText.substring(0, 1000), '\n');

    if (customerResponse.ok) {
      const customerData = JSON.parse(customerText);
      console.log('✅ Accessible Customers:');
      console.log(JSON.stringify(customerData, null, 2));

      if (customerData.resourceNames) {
        console.log('\n📊 Customer IDs found:');
        customerData.resourceNames.forEach(name => {
          const id = name.split('/')[1];
          console.log(`   - ${id} (use in .env.local)`);
        });
      }
    } else {
      console.log('❌ Failed to list customers');

      // Try direct customer lookup
      console.log('\n🔍 Trying direct customer ID: 3411160347\n');

      const directResponse = await fetch(
        'https://googleads.googleapis.com/v16/customers/3411160347',
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken.token}`,
            'developer-token': '2JuZRu2i0VHAvbBwFX5fKg'
          }
        }
      );

      const directText = await directResponse.text();
      console.log('Status:', directResponse.status);
      console.log('Response:', directText.substring(0, 500));
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
  }
}

testAccountAccess();
