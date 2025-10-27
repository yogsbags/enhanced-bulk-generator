#!/usr/bin/env node

require('dotenv').config();
const fetch = require('node-fetch');

async function testGroqAPI() {
  const models = [
    'groq/compound',
    'groq/compound-mini',
    'openai/gpt-oss-20b',
    'openai/gpt-oss-120b'
  ];

  for (const model of models) {
    console.log(`\n🔄 Testing ${model}...`);

    try {
      const requestBody = {
        model: model,
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant.'
          },
          {
            role: 'user',
            content: 'Generate 3 topic ideas about investing in India. Return JSON format with a "topics" array.'
          }
        ],
        temperature: 0.4,
        top_p: 0.95,
        frequency_penalty: 0.3,
        presence_penalty: 0.2,
        max_tokens: 2000,
        response_format: { type: 'json_object' }
      };

      // Add search settings for compound models
      if (model.includes('groq/compound')) {
        requestBody.search_settings = {
          country: "india",
          include_domains: ["*.in"],
          exclude_domains: ["wikipedia.org"]
        };
        console.log('   🌐 Added search_settings');
      }

      // Add browser search for openai models
      if (model.includes('openai/gpt-oss')) {
        requestBody.tools = [{ type: "browser_search" }];
        requestBody.tool_choice = "auto";
        // Remove response_format when using tools - JSON mode can't be combined with tool calling
        delete requestBody.response_format;
        console.log('   🌐 Added browser_search tools (JSON mode disabled for compatibility)');
      }

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      console.log(`   📊 Response status: ${response.status}`);

      if (!response.ok) {
        const errorBody = await response.text();
        console.log(`   ❌ Error response: ${errorBody.substring(0, 500)}`);
      } else {
        const data = await response.json();
        console.log(`   ✅ Success! Response length: ${JSON.stringify(data).length} chars`);
      }

    } catch (error) {
      console.log(`   ❌ Exception: ${error.message}`);
    }
  }
}

testGroqAPI().catch(err => {
  console.error('\n❌ Fatal error:', err.message);
  process.exit(1);
});
