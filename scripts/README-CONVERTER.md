# Markdown to HTML Converter

## Quick Start

```bash
# Convert all articles to HTML
npm run convert-html

# Or run directly
node scripts/markdown-to-html-converter.js
```

## What It Does

1. **Reads** all `.md` files from `docs/articles/`
2. **Strips** SEO metadata sections (everything after "## SEO Metadata")
3. **Converts** markdown to HTML using the `marked` library
4. **Applies** professional styling with PL Capital branding
5. **Saves** HTML files to `docs/html_articles/`

## Features

✅ **Automatic SEO stripping** - No metadata in output
✅ **Professional styling** - Modern CSS with brand colors
✅ **Responsive design** - Works on mobile and desktop
✅ **Special sections** - Executive Summary & Important Notes highlighted
✅ **Table formatting** - Enhanced tables with hover effects
✅ **Typography** - Optimized for readability
✅ **Self-contained** - All CSS inline, no external dependencies

## Output Example

**Input:** `nifty-options-trading-india-2025-complete-article.md` (with SEO metadata)

**Output:** `nifty-options-trading-india-2025-complete-article.html` (without SEO metadata)

## File Structure

```
scripts/
├── markdown-to-html-converter.js  # Main converter script
└── README-CONVERTER.md            # This file

docs/
├── articles/                      # Source markdown files
│   ├── article-1.md
│   └── article-2.md
└── html_articles/                 # Generated HTML files
    ├── article-1.html
    ├── article-2.html
    └── README.md
```

## Configuration

Default paths (can be customized in script):
- **Input:** `docs/articles/`
- **Output:** `docs/html_articles/`

## Styling

**Color Scheme:**
- Primary: `#0066cc` (PL Capital blue)
- Background: `#f5f5f5` (light gray)
- Text: `#333` (dark gray)
- Executive Summary: `#f0f7ff` (light blue)
- Important Notes: `#fff8e1` (light yellow)

**Typography:**
- Font: System fonts stack
- Base size: 16px
- Line height: 1.8
- Max width: 900px

## Technical Details

**Dependencies:**
- `marked` v12.0.0 - Markdown parser

**Node Version:**
- Requires Node.js >= 14.0.0

**Output Format:**
- HTML5 with inline CSS
- Self-contained (no external files)
- Mobile-responsive (@media queries)

## Common Use Cases

### Convert After Article Updates

```bash
# Edit markdown files
vim docs/articles/my-article.md

# Regenerate HTML
npm run convert-html
```

### Batch Processing

The script automatically processes all `.md` files in the articles directory.

### Custom Styling

Edit CSS in `generateHtmlTemplate()` function within the converter script.

## Troubleshooting

**Error: Cannot find module 'marked'**
```bash
npm install marked
```

**Error: ENOENT: no such file or directory**
- Ensure you're running from project root
- Check that `docs/articles/` exists

**HTML looks broken**
- Check that markdown is valid
- Ensure tables are properly formatted
- Verify no unclosed tags in markdown

## Conversion Log

The script outputs a detailed log:

```
🚀 MARKDOWN TO HTML CONVERTER
============================================================
✅ Created output directory: /path/to/html_articles
📚 Found 10 article(s) to convert

📄 Processing: article-1.md
   ✅ Converted to: article-1.html
...

============================================================
📊 CONVERSION SUMMARY
============================================================
✅ Successfully converted: 10 file(s)
❌ Failed: 0 file(s)
📁 Output directory: /path/to/html_articles
============================================================
```

## Advanced Usage

### Programmatic Usage

```javascript
const MarkdownToHtmlConverter = require('./scripts/markdown-to-html-converter');

const converter = new MarkdownToHtmlConverter({
  articlesDir: '/custom/articles/path',
  outputDir: '/custom/output/path'
});

converter.convertAll();
```

### Convert Single File

```javascript
const converter = new MarkdownToHtmlConverter();
converter.convertFile('/path/to/article.md');
```

## Maintenance

**When to Regenerate:**
- After editing markdown articles
- After adding new articles
- After updating article content
- Before publishing to website

**What NOT to Edit:**
- Don't manually edit HTML files
- Don't add external CSS files
- Don't modify generated HTML directly

Always edit markdown sources and regenerate!

## Performance

- **Speed:** ~50-100ms per article
- **Memory:** Low footprint
- **Batch:** Processes 10 articles in < 1 second

## Created By

**PL Capital Development Team**
**Date:** November 2025
**Version:** 1.0.0

---

For questions or issues, check the main project README or contact the development team.

