#!/usr/bin/env node

const fetch = require('node-fetch');

async function testGroqQuickWins() {
  const apiKey = process.env.GROQ_API_KEY || 'gsk_YOUR_GROQ_API_KEY_HERE';
  const apiUrl = 'https://api.groq.com/openai/v1/chat/completions';

  const requestBody = {
    model: 'groq/compound',
    messages: [{
      role: 'user',
      content: `You are an Elite SEO Research Analyst. Generate a JSON response with:
1. content_gaps array (2 items)
2. quick_wins array (3 items)

Return ONLY valid JSON in this exact format:
{
  "research_id": "RESEARCH-20251006-TEST",
  "content_gaps": [
    {
      "gap_id": "GAP-001",
      "gap_title": "Test Gap 1",
      "quick_win": false
    },
    {
      "gap_id": "GAP-002",
      "gap_title": "Test Gap 2",
      "quick_win": false
    }
  ],
  "quick_wins": [
    {
      "gap_id": "GAP-QW-001",
      "topic_title": "Quick Win 1"
    },
    {
      "gap_id": "GAP-QW-002",
      "topic_title": "Quick Win 2"
    },
    {
      "gap_id": "GAP-QW-003",
      "topic_title": "Quick Win 3"
    }
  ]
}`
    }],
    temperature: 0.3,
    max_tokens: 2000,
    search_settings: {
      enabled: true,
      location: { country: 'IN' }
    }
  };

  console.log('🧪 Testing Groq with quick_wins array...\n');

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();

    if (!response.ok) {
      console.log('❌ Error response:', JSON.stringify(data, null, 2));
      return;
    }

    const content = data.choices[0].message.content;
    console.log('✅ Groq responded successfully!\n');
    console.log('Raw response:', content);

    // Try to parse as JSON
    try {
      const parsed = JSON.parse(content);
      console.log('\n📊 Parsed JSON:');
      console.log('  content_gaps:', parsed.content_gaps?.length || 0);
      console.log('  quick_wins:', parsed.quick_wins?.length || 0);

      if (parsed.quick_wins && parsed.quick_wins.length > 0) {
        console.log('\n✅ Quick wins array found!');
        console.log(JSON.stringify(parsed.quick_wins, null, 2));
      } else {
        console.log('\n❌ No quick_wins array in response');
      }
    } catch (parseError) {
      console.log('\n⚠️  Could not parse as JSON:', parseError.message);
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testGroqQuickWins();
