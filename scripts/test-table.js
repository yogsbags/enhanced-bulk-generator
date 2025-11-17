#!/usr/bin/env node

/**
 * Test Google Docs Table Creation
 * Creates a simple table to understand the structure
 */

require('dotenv').config();
const { google } = require('googleapis');

async function testTable() {
  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    'http://localhost:3000/oauth2callback'
  );

  auth.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN
  });

  const docs = google.docs({ version: 'v1', auth });

  // Create a test document
  console.log('📄 Creating test document...');
  const createResponse = await docs.documents.create({
    requestBody: {
      title: 'Table Test Document'
    }
  });

  const documentId = createResponse.data.documentId;
  console.log(`✅ Created document: https://docs.google.com/document/d/${documentId}/edit`);

  // Insert a simple 2x2 table
  console.log('\n📋 Inserting 2x2 table...');
  await docs.documents.batchUpdate({
    documentId,
    requestBody: {
      requests: [
        {
          insertTable: {
            rows: 2,
            columns: 2,
            location: {
              index: 1
            }
          }
        }
      ]
    }
  });

  console.log('✅ Table inserted');

  // Get document structure to see indices
  console.log('\n🔍 Fetching document structure...');
  const doc = await docs.documents.get({
    documentId
  });

  console.log('\n📊 Document Structure:');
  console.log(JSON.stringify(doc.data.body.content, null, 2));

  console.log('\n✅ Test complete!');
  console.log(`🔗 Check the document: https://docs.google.com/document/d/${documentId}/edit`);
}

testTable().catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
