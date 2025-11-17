# HTML Articles Directory

This directory contains HTML versions of all markdown articles from the `docs/articles/` folder.

## Overview

All articles have been automatically converted from Markdown to HTML format using the custom converter script. The HTML versions:

- ✅ **Raw HTML format** - Content starts from `<h1>` tag (no DOCTYPE, head, or body)
- ✅ **SEO metadata included** - All SEO scripts appended at the end
- ✅ **Schema markup** - FAQ and Article schemas in JSON-LD format
- ✅ **Clean structure** - Semantic HTML5 with proper heading hierarchy
- ✅ **Styled tables** - Enhanced table formatting
- ✅ **Ready for CMS** - Can be directly inserted into WordPress, Sanity, etc.
- ✅ **Embeddable** - Paste directly into any content management system

## Generated Files

All HTML files maintain the same naming convention as their markdown sources:

- `bank-nifty-expiry-day-trading-wednesday-options-strategy-2025.html`
- `bank-nifty-option-chain-analysis-live-oi-interpretation-2025.html`
- `bank-nifty-weekly-options-trading-guide-2025.html`
- `bull-call-spread-strategy-india-complete-guide-2025.html`
- `iron-condor-strategy-nifty-options-range-bound-profit-guide-2025.html`
- `itr-filing-derivatives-traders-itr3-complete-guide-2025.html`
- `nifty-options-strategies-beginners-5-simple-setups-2025.html`
- `nifty-options-trading-india-2025-complete-article.html`
- `nifty-weekly-options-strategy-tuesday-expiry-guide-2025.html`
- `option-chain-analysis-master-nse-reading-2025.html`

## How to Regenerate

If you update the markdown articles and need to regenerate HTML versions:

```bash
# From project root
npm run convert-html
```

Or run the script directly:

```bash
node scripts/markdown-to-html-converter.js
```

## HTML Features

### Styling Highlights

**Color Scheme:**
- Primary brand color: `#0066cc` (PL Capital blue)
- Headings: Blue with underlines
- Body text: `#333` on white background
- Hover effects on tables and links

**Typography:**
- Font: System fonts (-apple-system, BlinkMacSystemFont, Segoe UI, Roboto)
- H1: 2.5em with bottom border
- H2: 1.8em with blue color
- H3: 1.4em
- Body: 16px with 1.8 line-height
- Sentences: Under 15 words for readability

**Special Sections:**
- Executive Summary: Light blue background (`#f0f7ff`) with left border
- Important Notes: Yellow background (`#fff8e1`) with orange border
- Tables: Alternating row colors with hover effects
- Links: Underline on hover for better UX

### Responsive Design

The HTML is fully responsive with mobile breakpoints at 768px:

```css
@media (max-width: 768px) {
  - Reduced heading sizes
  - Adjusted padding
  - Smaller table fonts
}
```

## Converter Script

**Location:** `scripts/markdown-to-html-converter.js`

**Dependencies:**
- `marked` (v12.0.0) - Markdown parser

**Key Functions:**
- `stripSeoMetadata()` - Removes SEO sections
- `generateHtmlTemplate()` - Creates full HTML with styling
- `postProcessHtml()` - Adds special section styling
- `convertFile()` - Processes single markdown file
- `convertAll()` - Batch converts all articles

## Usage Examples

### View in Browser

Simply open any `.html` file in a web browser:

```bash
open docs/html_articles/bull-call-spread-strategy-india-complete-guide-2025.html
```

### Embed in Website

Copy the HTML file to your web server or CMS. The styling is self-contained.

### Extract Content Only

If you need just the content without the template, extract the `<div class="container">` section.

## Maintenance

**Auto-Regeneration:**
Run the converter after any markdown article updates to keep HTML versions synchronized.

**Manual Updates:**
Avoid editing HTML files directly. Make changes in markdown sources and regenerate.

**Styling Changes:**
Edit the CSS in `scripts/markdown-to-html-converter.js` within the `generateHtmlTemplate()` function.

## Quality Checks

All converted HTML files have been verified for:
- ✅ Valid HTML5 structure
- ✅ No SEO metadata included
- ✅ All markdown elements properly converted
- ✅ Tables formatted correctly
- ✅ Links working properly
- ✅ Special sections highlighted
- ✅ Mobile responsiveness

## Last Updated

**Date:** November 17, 2025
**Articles Converted:** 10
**Conversion Success Rate:** 100%

---

**Note:** These HTML files are generated outputs. Always edit the markdown sources in `docs/articles/` and regenerate HTML versions using the converter script.

