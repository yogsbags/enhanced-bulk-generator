# Batch Technical Analysis Content Generator

Automated script to generate high-quality technical analysis articles in markdown and HTML formats.

## Features

- ✅ **36 Pre-configured Topics** - Complete list of technical analysis topics
- ✅ **AI Content Generation** - Uses Gemini 3.0 Pro with Google Search
- ✅ **SEO Optimized** - Primary keywords, LSI keywords, internal linking
- ✅ **Markdown Output** - Clean markdown files with SEO metadata
- ✅ **HTML Conversion** - Automatic conversion to HTML
- ✅ **Progress Tracking** - Real-time progress bar and status
- ✅ **Error Recovery** - Continues on failure, logs errors
- ✅ **Rate Limiting** - 3-second delay between topics

## Prerequisites

```bash
# Required environment variables
export GEMINI_API_KEY="your-gemini-api-key"

# Optional (fallback models)
export OPENAI_API_KEY="your-openai-key"
export GROQ_API_KEY="your-groq-key"
```

## Installation

```bash
cd /Users/yogs87/Downloads/sanity/projects/enhanced-bulk-generator
npm install
```

## Usage

### Full Batch Generation (All 36 Topics)

```bash
node scripts/batch-technical-analysis-generator.js
```

This will:
1. Generate 36 markdown articles in `docs/articles/technical analysis/`
2. Convert all to HTML in `docs/html_articles/technical analysis/`
3. Show progress bar and statistics

### Expected Output

```
🚀 BATCH TECHNICAL ANALYSIS CONTENT GENERATOR
======================================================================
📚 Total topics: 36
📁 Markdown output: /path/to/docs/articles/technical analysis
📁 HTML output: /path/to/docs/html_articles/technical analysis
======================================================================

[==========                                        ] 1/36

📝 Processing: "What is Technical Analysis?"
   🔬 Created research object: TA-001
   🤖 Generating content with AI...
   📊 Word count: 2,456 words
   ✅ Saved markdown: what-is-technical-analysis.md
   ✅ Successfully generated: What is Technical Analysis?
   ⏸️  Waiting 3 seconds before next topic...

[====================                              ] 2/36
...
```

## Output Structure

### Markdown Files (`docs/articles/technical analysis/`)

```
what-is-technical-analysis.md
what-is-dupont-analysis.md
what-is-a-chart-pattern.md
...
```

Each markdown file includes:
- H1 title
- Executive Summary
- 5-8 H2 sections (2,400+ words)
- Key Takeaways
- Action Plan
- Conclusion with CTA
- 5 FAQs
- SEO Metadata section

### HTML Files (`docs/html_articles/technical analysis/`)

```
what-is-technical-analysis.html
what-is-dupont-analysis.html
what-is-a-chart-pattern.html
...
```

Each HTML file includes:
- Clean HTML5 markup
- SEO metadata in comments
- Schema.org JSON-LD scripts
- Responsive structure

## Topics Included

1. What is Technical Analysis?
2. What is DuPont Analysis?
3. What is a Chart Pattern?
4. What is a Candle Pattern Chart?
5. What is Scalping Trading?
6. What is Swing Trading?
7. What is FVG in Trading?
8. Difference Between NSE and BSE
9. ETF vs Index Fund
10. What is Sensex and Nifty?
11. What is a Share?
12. What is Mutual Fund?
13. What is ETF?
14. What is Nifty Lot Size?
15. What is Dividend?
16. What is Share Capital?
17. What is Stop Loss?
18. What is HUF?
19. Top Index Funds in India
20. What is Coffee Can Investing?
21. What is Annuity?
22. What are Debentures?
23. What is an IPO Prospectus?
24. AI Stocks in India
25. Navratna Companies in India
26. What is FII?
27. What is CMP?
28. What is AIF?
29. What is SIF?
30. What is Short Covering?
31. What is SME IPO?
32. What is GIFT Nifty?
33. What is Nifty 50?
34. What is NASDAQ?
35. What is Sensex?
36. What is AUM?

## Performance

- **Generation Speed**: ~30-60 seconds per article
- **Total Time**: ~30-60 minutes for all 36 topics (with 3-second delays)
- **Word Count**: 2,400+ words per article
- **Token Usage**: ~15,000-20,000 input tokens per article
- **Cost Estimate**: Minimal (Gemini 1.5 Pro is free tier compatible)

## Error Handling

The script includes robust error handling:

- ✅ **Automatic Retry** - Retries failed articles once
- ✅ **Continues on Error** - Doesn't stop entire batch on single failure
- ✅ **Error Logging** - Logs all errors with topic names
- ✅ **Final Report** - Shows which topics succeeded/failed

Example error output:
```
❌ Failed to generate: What is AUM?
   Error: Gemini API error: Rate limit exceeded

📊 GENERATION SUMMARY
✅ Successfully generated: 35/36 articles
❌ Failed: 1/36 articles

❌ Failed topics:
   - What is AUM?
     Error: Gemini API error: Rate limit exceeded
```

## Customization

### Add/Remove Topics

Edit `batch-technical-analysis-generator.js`:

```javascript
this.topics = [
  "What is Technical Analysis?",
  "Your New Topic Here",
  // ... add more topics
];
```

### Change Output Directories

```javascript
this.markdownDir = path.join(__dirname, '../docs/articles/your-folder');
this.htmlDir = path.join(__dirname, '../docs/html_articles/your-folder');
```

### Adjust Word Count Target

```javascript
this.contentCreator = new ContentCreator({
  minWordCount: 3000, // Change from 2400 to 3000
  generateImages: false
});
```

### Change Rate Limiting Delay

```javascript
// Change from 3 seconds to 5 seconds
await new Promise(resolve => setTimeout(resolve, 5000));
```

## Troubleshooting

### Issue: "GEMINI_API_KEY not configured"

**Solution**: Set your Gemini API key
```bash
export GEMINI_API_KEY="your-api-key-here"
```

### Issue: "No markdown files found"

**Solution**: Markdown files are created first, then converted to HTML. Check:
```bash
ls docs/articles/technical\ analysis/
```

### Issue: Rate limit errors

**Solution**:
1. Increase delay between topics (change 3000 to 5000ms)
2. Use Groq or OpenAI as fallback models
3. Process topics in smaller batches

### Issue: Low word count (< 2,200 words)

**Solution**: The script warns but continues. Articles can be regenerated individually or edited manually.

### Issue: HTML conversion fails

**Solution**: Install marked dependency
```bash
npm install marked
```

## Advanced Usage

### Generate Single Topic

Create a custom script:

```javascript
const generator = new BatchTechnicalAnalysisGenerator();
generator.topics = ["What is Technical Analysis?"]; // Single topic
await generator.generateAll();
```

### Resume Failed Topics

Extract failed topics from summary and create new array:

```javascript
generator.topics = [
  "What is AUM?",
  "What is FII?"
  // ... only failed topics
];
```

### Skip HTML Conversion

Comment out in `generateAll()`:

```javascript
// this.convertToHtml();
```

## File Structure

```
enhanced-bulk-generator/
├── scripts/
│   ├── batch-technical-analysis-generator.js  (Main script)
│   ├── markdown-to-html-converter.js          (HTML converter)
│   └── README-BATCH-GENERATOR.md              (This file)
├── docs/
│   ├── articles/
│   │   └── technical analysis/                (Markdown output)
│   │       ├── what-is-technical-analysis.md
│   │       ├── what-is-dupont-analysis.md
│   │       └── ...
│   └── html_articles/
│       └── technical analysis/                (HTML output)
│           ├── what-is-technical-analysis.html
│           ├── what-is-dupont-analysis.html
│           └── ...
└── frontend/backend/content/
    └── content-creator.js                     (Content generator)
```

## Next Steps

After generation:

1. **Review Articles** - Check `docs/articles/technical analysis/` for quality
2. **Edit if Needed** - Manually edit any articles that need refinement
3. **Publish to WordPress** - Use content-publisher.js
4. **Publish to Sanity** - Use Sanity mutations API
5. **Monitor Performance** - Track rankings and traffic

## Support

For issues or questions:
- Check error logs in console output
- Review content-creator.js for prompt customization
- Check Gemini API documentation for rate limits
- See main project README.md for overall workflow

---

**Generated by**: Enhanced Bulk Generator
**Model**: Gemini 3.0 Pro Preview with Google Search
**Content Quality**: E-E-A-T compliant, SEO optimized, 2,400+ words
