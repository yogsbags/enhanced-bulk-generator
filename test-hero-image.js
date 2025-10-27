#!/usr/bin/env node

require('dotenv').config();
const { generateHeroImage } = require('./integrations/image-generator.js');

(async () => {
  console.log('Testing hero image generation...');
  console.log('OpenAI API key present:', !!process.env.OPENAI_API_KEY);
  console.log('OpenAI API key length:', process.env.OPENAI_API_KEY?.length || 0);

  const result = await generateHeroImage({
    prompt: 'Create a wide landscape hero image (1792×1024 pixels, 16:9 ratio) for an Indian financial article titled "Complete Guide to SIP Investments in 2025". Show expert wealth advisors reviewing market data, charts, and projections in a premium Mumbai office. Emphasize professionalism, trust, and forward-looking strategy. Use natural lighting, modern aesthetics, horizontal composition optimized for blog headers, and avoid text or typography. Ensure the composition works well when cropped to 800×450 pixels.',
    topicId: 'TEST-002',
    title: 'Complete Guide to SIP Investments in 2025',
    focusKeyword: 'SIP investments',
    saveToDisk: true
  });

  console.log('\nResult:');
  console.log(JSON.stringify(result, null, 2));
})().catch(err => {
  console.error('\n❌ Error:', err.message);
  console.error(err.stack);
  process.exit(1);
});
