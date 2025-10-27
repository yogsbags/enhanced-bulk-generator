#!/usr/bin/env node

const fetch = require('node-fetch');

async function testGemini() {
  const apiKey = process.env.GEMINI_API_KEY || 'AIzaSyAcCCA2Kt0TMVF4-uiOW2iRU--WSiGMk8k';
  const apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent';

  const requestBody = {
    contents: [{
      parts: [{
        text: 'What are the top 3 Indian WealthTech companies in 2025? Focus on Groww, Zerodha, and ETMoney. Be brief.'
      }]
    }],
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 500
    },
    tools: [{
      googleSearch: {}
    }]
  };

  console.log('🧪 Testing Gemini 2.5 Pro with Google Search grounding...\n');

  try {
    const response = await fetch(`${apiUrl}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();

    if (!response.ok) {
      console.log('❌ Error response:', JSON.stringify(data, null, 2));
      return;
    }

    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (content) {
      console.log('✅ Gemini 2.5 Pro responded successfully!\n');
      console.log('Response:', content);
      console.log('\n🔍 Search grounding metadata:');
      console.log(JSON.stringify(data.candidates[0].groundingMetadata || {}, null, 2));
    } else {
      console.log('⚠️  No content in response');
      console.log(JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testGemini();
