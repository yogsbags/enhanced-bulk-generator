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
    const seoMetadataRegex = /\n---\n\n## SEO Metadata([\s\S]*)$/i;
    const match = content.match(seoMetadataRegex);
    return match ? match[1].trim() : '';
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
   * Remove SEO metadata section from markdown content
   */
  stripSeoMetadata(content) {
    // Find the SEO Metadata section and remove everything after it
    const seoMetadataRegex = /\n---\n\n## SEO Metadata[\s\S]*$/i;
    return content.replace(seoMetadataRegex, '').trim();
  }

  /**
   * Generate raw HTML (no template, just content + SEO scripts)
   */
  generateRawHtml(content, seoScripts) {
    let html = content;

    // Add SEO scripts at the end if they exist
    if (seoScripts) {
      html += '\n\n' + seoScripts;
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
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
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

    // Close important notes div at end or before next major section
    html = html.replace(
      /(<div class="important-notes">[\s\S]*?)<p><strong>Created by/,
      '$1</div><p><strong>Created by'
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

      // Extract SEO metadata
      const seoContent = this.extractSeoMetadata(markdownContent);

      // Extract script tags from SEO metadata
      const seoScripts = this.extractScriptTags(seoContent);

      // Strip SEO metadata from content
      const contentWithoutSeo = this.stripSeoMetadata(markdownContent);

      // Convert to HTML
      let htmlContent = marked.parse(contentWithoutSeo);

      // Post-process HTML
      htmlContent = this.postProcessHtml(htmlContent);

      // Generate raw HTML with SEO scripts
      const finalHtml = this.generateRawHtml(htmlContent, seoScripts);

      // Generate output filename
      const baseName = path.basename(filePath, '.md');
      const outputPath = path.join(this.outputDir, `${baseName}.html`);

      // Write HTML file
      fs.writeFileSync(outputPath, finalHtml, 'utf-8');

      console.log(`   ✅ Converted to: ${path.basename(outputPath)}`);
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

