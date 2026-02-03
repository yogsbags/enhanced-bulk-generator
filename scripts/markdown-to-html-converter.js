#!/usr/bin/env node

/**
 * Markdown to HTML Converter
 * Converts articles from markdown to HTML, excluding SEO metadata sections
 */

const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

class MarkdownToHtmlConverter {
  constructor(config = {}) {
    this.articlesDir = config.articlesDir || path.join(__dirname, '../docs/articles');
    this.outputDir = config.outputDir || path.join(__dirname, '../docs/html_articles');

    // Configure marked options for better HTML output
    marked.setOptions({
      gfm: true, // GitHub Flavored Markdown
      breaks: false,
      headerIds: true,
      mangle: false,
      smartLists: true,
      smartypants: true,
    });
  }

  /**
   * Extract SEO metadata section from markdown content
   */
  extractSeoMetadata(content) {
    const headingRegex = /^\s*##\s*SEO Metadata/im;
    const headingIndex = content.search(headingRegex);
    if (headingIndex === -1) {
      return '';
    }
    return content.slice(headingIndex).trim();
  }

  /**
   * Generic helper to pull the contents of a fenced code block that follows a given heading
   */
  extractCodeBlockAfterHeading(seoContent, heading) {
    if (!seoContent) {
      return '';
    }

    const pattern =
      '###\\s*' +
      heading +
      '[\\s\\S]*?```[^\\n]*\\n([\\s\\S]*?)\\n```';
    const regex = new RegExp(pattern, 'i');
    const match = seoContent.match(regex);
    return match ? match[1].trim() : '';
  }

  /**
   * Extract SEO meta title from SEO metadata section
   */
  extractMetaTitle(seoContent) {
    return this.extractCodeBlockAfterHeading(seoContent, 'SEO Meta Title');
  }

  /**
   * Extract SEO meta description from SEO metadata section
   */
  extractMetaDescription(seoContent) {
    return this.extractCodeBlockAfterHeading(seoContent, 'SEO Meta Description');
  }

  /**
   * Extract canonical URL from SEO metadata section
   */
  extractCanonicalUrl(seoContent) {
    const url = this.extractCodeBlockAfterHeading(seoContent, 'SEO Optimized URL');
    return url.startsWith('http') ? url : '';
  }

  /**
   * Extract script tags from SEO metadata
   */
  extractScriptTags(seoContent) {
    const scriptRegex = /```html\n(<script[\s\S]*?<\/script>)\n```/g;
    const scripts = [];
    let match;

    while ((match = scriptRegex.exec(seoContent)) !== null) {
      scripts.push(match[1]);
    }

    return scripts.join('\n\n');
  }

  /**
   * Generate SEO metadata HTML comment block
   */
  generateSeoMetadataBlock(metaTitle, metaDescription, canonicalUrl) {
    if (!metaTitle && !metaDescription && !canonicalUrl) {
      return '';
    }

    return `
<!-- SEO Metadata -->
<!-- SEO Optimized URL: ${canonicalUrl} -->
<!-- SEO Meta Title: ${this.escapeHtml(metaTitle)} -->
<!-- SEO Meta Description: ${this.escapeHtml(metaDescription)} -->
`;
  }

  /**
   * Remove SEO metadata section from markdown content
   */
  stripSeoMetadata(content) {
    const headingRegex = /^\s*##\s*SEO Metadata/im;
    const match = content.match(headingRegex);
    if (!match) {
      return content.trim();
    }
    return content.slice(0, match.index).trim();
  }

  /**
   * Remove research verification section from markdown content
   * Removes everything from "RESEARCH VERIFICATION" heading to the first horizontal rule
   */
  stripResearchVerification(content) {
    // First, unescape any literal \n\n strings in the content
    let processed = content.replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/\\t/g, '\t');

    // Match "### RESEARCH VERIFICATION" heading followed by content until "---" or "## Summary"
    // Be more careful - stop at "## Summary" if it appears before "---"
    const researchRegex = /^###?\s*RESEARCH\s+VERIFICATION\s*\n\n?([\s\S]*?)(?=^---\s*$|^##\s+Summary\s*$)/im;
    processed = processed.replace(researchRegex, (match, p1) => {
      // Only remove if we find "---" separator, otherwise keep the content
      // This handles cases where research verification doesn't have a clear end
      if (match.includes('---')) {
        return '';
      }
      // If no "---" found, try to find where Summary starts
      const summaryIndex = match.indexOf('## Summary');
      if (summaryIndex > 0) {
        return match.substring(summaryIndex);
      }
      return '';
    }).trim();

    // Also handle case where RESEARCH VERIFICATION appears twice (remove first occurrence)
    const duplicateRegex = /^###?\s*RESEARCH\s+VERIFICATION\s*\n\n?[\s\S]*?^###?\s*RESEARCH\s+VERIFICATION\s*\n\n?/im;
    processed = processed.replace(duplicateRegex, '### RESEARCH VERIFICATION\n\n').trim();

    return processed;
  }

  /**
   * Generate raw HTML (content + SEO metadata + schema scripts)
   */
  generateRawHtml(content, seoMetadataBlock, seoScripts) {
    let html = content;

    // Add SEO metadata block after content
    if (seoMetadataBlock) {
      html += '\n\n' + seoMetadataBlock;
    }

    // Add SEO schema scripts at the end
    if (seoScripts) {
      html += '\n' + seoScripts;
    }

    return html;
  }

  /**
   * Escape HTML special characters
   */
  escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;'
    };
    return text.replace(/[&<>"]/g, m => map[m]);
  }

  /**
   * Extract title from markdown content
   */
  extractTitle(content) {
    const match = content.match(/^#\s+(.+)$/m);
    return match ? match[1] : 'Article';
  }

  /**
   * Post-process HTML to add special styling
   */
  postProcessHtml(html) {
    // Add special class to executive summary section
    html = html.replace(
      /<h2>Executive Summary<\/h2>/i,
      '<h2>Executive Summary</h2><div class="executive-summary">'
    );

    // Close executive summary div before next h2
    html = html.replace(
      /(<div class="executive-summary">[\s\S]*?)<h2>/,
      '$1</div><h2>'
    );

    // Add special class to Important Notes section
    html = html.replace(
      /<p><strong>Important Notes:<\/strong>/i,
      '<div class="important-notes"><p><strong>Important Notes:</strong>'
    );

    // Close important notes div after the "Created by" line
    html = html.replace(
      /(<div class="important-notes">[\s\S]*?<p><strong>Created by PL Capital Research Team[\s\S]*?<\/p>)/,
      '$1\n</div>'
    );

    return html;
  }

  /**
   * Convert a single markdown file to HTML
   */
  convertFile(filePath) {
    console.log(`\n📄 Processing: ${path.basename(filePath)}`);

    try {
      // Read markdown content
      const markdownContent = fs.readFileSync(filePath, 'utf-8');

      // Extract SEO metadata section
      const seoContent = this.extractSeoMetadata(markdownContent);

      // Extract individual SEO components
      const metaTitle = this.extractMetaTitle(seoContent);
      const metaDescription = this.extractMetaDescription(seoContent);
      const canonicalUrl = this.extractCanonicalUrl(seoContent);
      const seoScripts = this.extractScriptTags(seoContent);

      // Generate SEO metadata block
      const seoMetadataBlock = this.generateSeoMetadataBlock(metaTitle, metaDescription, canonicalUrl);

      // Strip research verification section first
      let contentWithoutResearch = this.stripResearchVerification(markdownContent);

      // Strip SEO metadata from content
      const contentWithoutSeo = this.stripSeoMetadata(contentWithoutResearch);

      // Convert to HTML
      let htmlContent = marked.parse(contentWithoutSeo);

      // Post-process HTML
      htmlContent = this.postProcessHtml(htmlContent);

      // Generate raw HTML with SEO metadata and scripts
      const finalHtml = this.generateRawHtml(htmlContent, seoMetadataBlock, seoScripts);

      // Generate output filename
      const baseName = path.basename(filePath, '.md');
      const outputPath = path.join(this.outputDir, `${baseName}.html`);

      // Write HTML file
      fs.writeFileSync(outputPath, finalHtml, 'utf-8');

      console.log(`   ✅ Converted to: ${path.basename(outputPath)}`);
      if (metaTitle) {
        console.log(`      Title: ${metaTitle.substring(0, 60)}...`);
      }
      if (canonicalUrl) {
        console.log(`      URL: ${canonicalUrl}`);
      }
      return true;
    } catch (error) {
      console.error(`   ❌ Error converting ${path.basename(filePath)}: ${error.message}`);
      return false;
    }
  }

  /**
   * Convert all markdown files in articles directory
   */
  convertAll() {
    console.log('\n🚀 MARKDOWN TO HTML CONVERTER');
    console.log('='.repeat(60));

    // Ensure output directory exists
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
      console.log(`✅ Created output directory: ${this.outputDir}`);
    }

    // Get all markdown files
    const files = fs.readdirSync(this.articlesDir)
      .filter(file => file.endsWith('.md'))
      .map(file => path.join(this.articlesDir, file));

    if (files.length === 0) {
      console.log('⚠️  No markdown files found in articles directory');
      return;
    }

    console.log(`\n📚 Found ${files.length} article(s) to convert`);

    // Convert each file
    let successCount = 0;
    let failCount = 0;

    files.forEach(file => {
      const success = this.convertFile(file);
      if (success) {
        successCount++;
      } else {
        failCount++;
      }
    });

    // Print summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 CONVERSION SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Successfully converted: ${successCount} file(s)`);
    if (failCount > 0) {
      console.log(`❌ Failed: ${failCount} file(s)`);
    }
    console.log(`📁 Output directory: ${this.outputDir}`);
    console.log('='.repeat(60) + '\n');
  }
}

// CLI execution
if (require.main === module) {
  const converter = new MarkdownToHtmlConverter();
  converter.convertAll();
}

module.exports = MarkdownToHtmlConverter;
