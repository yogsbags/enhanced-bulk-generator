#!/usr/bin/env node

/**
 * Standalone Google Docs Publisher
 * Publishes all created content from created-content.csv to Google Docs
 * Updates created-content.csv with google_docs_url field
 */

require('dotenv').config();
const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parse/sync');
const { stringify } = require('csv-stringify/sync');

class GoogleDocsPublisher {
  constructor() {
    this.clientId = process.env.GOOGLE_CLIENT_ID;
    this.clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    this.refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

    this.createdContentPath = path.join(__dirname, '../data/created-content.csv');

    if (!this.clientId || !this.clientSecret || !this.refreshToken) {
      console.error('❌ Missing Google OAuth credentials in .env');
      console.error('   Required: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN');
      process.exit(1);
    }

    // Initialize OAuth2 client
    this.auth = new google.auth.OAuth2(
      this.clientId,
      this.clientSecret,
      'http://localhost:3000/oauth2callback'
    );

    this.auth.setCredentials({
      refresh_token: this.refreshToken
    });

    this.docs = google.docs({ version: 'v1', auth: this.auth });
  }

  /**
   * Load created content from CSV
   */
  loadCreatedContent() {
    try {
      const csvContent = fs.readFileSync(this.createdContentPath, 'utf-8');
      const records = csv.parse(csvContent, {
        columns: true,
        skip_empty_lines: true,
        relax_quotes: true,
        quote: '"',
        escape: '"'
      });

      console.log(`✅ Loaded ${records.length} content items from CSV`);
      return records;
    } catch (error) {
      console.error('❌ Failed to load created-content.csv:', error.message);
      process.exit(1);
    }
  }

  /**
   * Save updated content back to CSV
   */
  saveCreatedContent(records) {
    try {
      const csvOutput = stringify(records, {
        header: true,
        quoted: true,
        quoted_empty: true
      });

      fs.writeFileSync(this.createdContentPath, csvOutput, 'utf-8');
      console.log(`✅ Updated created-content.csv with Google Docs URLs`);
    } catch (error) {
      console.error('❌ Failed to save created-content.csv:', error.message);
      throw error;
    }
  }

  /**
   * Parse JSON field safely
   */
  parseJSON(field) {
    if (!field) return {};
    try {
      return JSON.parse(field);
    } catch (error) {
      return {};
    }
  }

  /**
   * Convert markdown to Google Docs API batch update requests
   * @param {string} markdown - Markdown content
   * @param {string} title - Article title to prepend as H1
   */
  markdownToGoogleDocsRequests(markdown, title = null) {
    const lines = markdown.split('\n');
    const requests = [];
    let currentIndex = 1;

    // Add title as H1 heading at the beginning
    if (title) {
      const titleText = title + '\n\n';
      requests.push({
        insertText: {
          location: { index: currentIndex },
          text: titleText
        }
      });
      requests.push({
        updateParagraphStyle: {
          range: {
            startIndex: currentIndex,
            endIndex: currentIndex + title.length
          },
          paragraphStyle: {
            namedStyleType: 'HEADING_1'
          },
          fields: 'namedStyleType'
        }
      });
      currentIndex += titleText.length;
    }

    let i = 0;
    while (i < lines.length) {
      const trimmed = lines[i].trim();

      if (!trimmed) {
        requests.push({
          insertText: {
            location: { index: currentIndex },
            text: '\n'
          }
        });
        currentIndex += 1;
        i++;
        continue;
      }

      // Heading 2 (##)
      if (trimmed.startsWith('## ')) {
        const text = trimmed.replace(/^##\s+/, '') + '\n';
        requests.push({
          insertText: {
            location: { index: currentIndex },
            text
          }
        });
        requests.push({
          updateParagraphStyle: {
            range: {
              startIndex: currentIndex,
              endIndex: currentIndex + text.length - 1
            },
            paragraphStyle: {
              namedStyleType: 'HEADING_2'
            },
            fields: 'namedStyleType'
          }
        });
        currentIndex += text.length;
        i++;
        continue;
      }

      // Heading 3 (###)
      if (trimmed.startsWith('### ')) {
        const text = trimmed.replace(/^###\s+/, '') + '\n';
        requests.push({
          insertText: {
            location: { index: currentIndex },
            text
          }
        });
        requests.push({
          updateParagraphStyle: {
            range: {
              startIndex: currentIndex,
              endIndex: currentIndex + text.length - 1
            },
            paragraphStyle: {
              namedStyleType: 'HEADING_3'
            },
            fields: 'namedStyleType'
          }
        });
        currentIndex += text.length;
        i++;
        continue;
      }

      // Bullet list (-)
      if (trimmed.startsWith('- ')) {
        const text = trimmed.replace(/^-\s+/, '') + '\n';
        requests.push({
          insertText: {
            location: { index: currentIndex },
            text
          }
        });
        requests.push({
          createParagraphBullets: {
            range: {
              startIndex: currentIndex,
              endIndex: currentIndex + text.length - 1
            },
            bulletPreset: 'BULLET_DISC_CIRCLE_SQUARE'
          }
        });
        currentIndex += text.length;
        i++;
        continue;
      }

      // Table detection (|...|)
      if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
        const tableResult = this.processMarkdownTable(lines, i, currentIndex);
        requests.push(...tableResult.requests);
        currentIndex = tableResult.endIndex;
        i = tableResult.nextLineIndex;
        continue;
      }

      // Regular paragraph (strip markdown)
      const text = this.stripMarkdownFormatting(trimmed) + '\n';
      requests.push({
        insertText: {
          location: { index: currentIndex },
          text
        }
      });
      currentIndex += text.length;
      i++;
    }

    return requests;
  }

  /**
   * Process markdown table and convert to Google Docs table
   * @param {string[]} lines - All markdown lines
   * @param {number} startIndex - Starting line index of table
   * @param {number} docIndex - Current document character index
   * @returns {object} - {requests: [...], endIndex: number, nextLineIndex: number}
   */
  processMarkdownTable(lines, startIndex, docIndex) {
    const requests = [];
    const tableRows = [];
    let currentLineIndex = startIndex;

    // Collect all consecutive table rows
    while (currentLineIndex < lines.length) {
      const trimmed = lines[currentLineIndex].trim();

      if (!trimmed.startsWith('|') || !trimmed.endsWith('|')) {
        break;
      }

      // Parse table row
      const cells = trimmed.split('|')
        .filter(c => c.trim())
        .map(c => c.trim());

      // Skip separator rows (e.g., |---|---|)
      if (cells.length > 0 && cells.every(c => /^[-:]+$/.test(c))) {
        currentLineIndex++;
        continue;
      }

      tableRows.push(cells);
      currentLineIndex++;
    }

    if (tableRows.length === 0) {
      return {
        requests: [],
        endIndex: docIndex,
        nextLineIndex: startIndex + 1
      };
    }

    // Convert table to formatted text with pipe separators
    let currentIndex = docIndex;

    for (let rowIndex = 0; rowIndex < tableRows.length; rowIndex++) {
      const row = tableRows[rowIndex];
      const cells = row.map(cell => this.stripMarkdownFormatting(cell));
      const rowText = cells.join(' | ') + '\n';

      // Insert row text
      requests.push({
        insertText: {
          location: { index: currentIndex },
          text: rowText
        }
      });

      // Make header row bold
      if (rowIndex === 0) {
        requests.push({
          updateTextStyle: {
            range: {
              startIndex: currentIndex,
              endIndex: currentIndex + rowText.length - 1
            },
            textStyle: {
              bold: true
            },
            fields: 'bold'
          }
        });
      }

      currentIndex += rowText.length;
    }

    const tableEndIndex = currentIndex;

    // Add spacing after table
    requests.push({
      insertText: {
        location: {
          index: tableEndIndex
        },
        text: '\n'
      }
    });

    return {
      requests,
      endIndex: tableEndIndex + 1,
      nextLineIndex: currentLineIndex
    };
  }

  /**
   * Strip basic markdown formatting for plain paragraphs
   */
  stripMarkdownFormatting(text) {
    return text
      .replace(/\*\*(.+?)\*\*/g, '$1')  // Bold
      .replace(/\*(.+?)\*/g, '$1')      // Italic
      .replace(/`(.+?)`/g, '$1')        // Code
      .replace(/\[(.+?)\]\(.+?\)/g, '$1'); // Links
  }

  /**
   * Publish single article to Google Docs
   */
  async publishArticle(content) {
    try {
      // Extract title from seo_metadata JSON field
      const seoMetadata = this.parseJSON(content.seo_metadata);
      const title = seoMetadata.title || content.title || content.content_id;

      // Create new Google Doc
      const createResponse = await this.docs.documents.create({
        requestBody: {
          title: title
        }
      });

      const documentId = createResponse.data.documentId;
      const documentUrl = `https://docs.google.com/document/d/${documentId}/edit`;

      // Convert markdown to Google Docs format (with title as H1)
      const requests = this.markdownToGoogleDocsRequests(content.article_content, title);

      // Batch update the document
      if (requests.length > 0) {
        await this.docs.documents.batchUpdate({
          documentId,
          requestBody: {
            requests
          }
        });
      }

      return {
        success: true,
        url: documentUrl,
        documentId
      };
    } catch (error) {
      console.error(`   ⚠️  Failed to create Google Doc:`, error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Main publishing workflow
   */
  async run(options = {}) {
    console.log('\n📄 GOOGLE DOCS PUBLISHER');
    console.log('='.repeat(60));

    const allContent = this.loadCreatedContent();

    // Filter content to publish
    let contentToPublish = allContent;

    if (options.force) {
      console.log(`🔄 Force mode: Republishing ALL content`);
    } else if (options.skipExisting) {
      contentToPublish = allContent.filter(c => !c.google_docs_url || c.google_docs_url === '');
      console.log(`📋 Filtering: ${contentToPublish.length} items without Google Docs URLs`);
    }

    if (options.limit) {
      contentToPublish = contentToPublish.slice(0, options.limit);
      console.log(`📋 Limiting to ${options.limit} items`);
    }

    if (contentToPublish.length === 0) {
      console.log('⚠️  No content to publish');
      return;
    }

    console.log(`\n🚀 Publishing ${contentToPublish.length} articles to Google Docs...\n`);

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < contentToPublish.length; i++) {
      const content = contentToPublish[i];
      const title = content.title || content.content_id;

      console.log(`[${i + 1}/${contentToPublish.length}] Publishing: ${title}`);

      const result = await this.publishArticle(content);

      if (result.success) {
        console.log(`   ✅ Success: ${result.url}`);

        // Update the record in allContent array
        const recordIndex = allContent.findIndex(c => c.content_id === content.content_id);
        if (recordIndex !== -1) {
          allContent[recordIndex].google_docs_url = result.url;

          // Update seo_metadata to include google_docs_url
          const seoMetadata = this.parseJSON(allContent[recordIndex].seo_metadata);
          seoMetadata.google_docs_url = result.url;
          seoMetadata.google_docs_id = result.documentId;
          allContent[recordIndex].seo_metadata = JSON.stringify(seoMetadata);
        }

        successCount++;
      } else {
        console.log(`   ❌ Failed: ${result.error}`);
        errorCount++;
      }

      // Rate limiting: wait 1 second between requests
      if (i < contentToPublish.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // Save updated CSV
    if (successCount > 0) {
      this.saveCreatedContent(allContent);
    }

    console.log('\n' + '='.repeat(60));
    console.log(`📊 SUMMARY:`);
    console.log(`   ✅ Successfully published: ${successCount}`);
    console.log(`   ❌ Failed: ${errorCount}`);
    console.log(`   📄 Total processed: ${contentToPublish.length}`);
    console.log('='.repeat(60) + '\n');
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);

  const options = {
    skipExisting: args.includes('--skip-existing'),
    force: args.includes('--force'),
    limit: null
  };

  // Parse --limit flag
  const limitIndex = args.indexOf('--limit');
  if (limitIndex !== -1 && args[limitIndex + 1]) {
    options.limit = parseInt(args[limitIndex + 1], 10);
  }

  // Show help
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Google Docs Publisher - Publish created content to Google Docs

Usage:
  node scripts/publish-to-google-docs.js [options]

Options:
  --skip-existing    Only publish content without google_docs_url
  --force            Republish ALL content (overwrites existing Google Docs URLs)
  --limit N          Limit to N articles (e.g., --limit 5)
  --help, -h         Show this help message

Examples:
  node scripts/publish-to-google-docs.js
  node scripts/publish-to-google-docs.js --skip-existing
  node scripts/publish-to-google-docs.js --force --limit 10
  node scripts/publish-to-google-docs.js --skip-existing --limit 5

Environment Variables Required:
  GOOGLE_CLIENT_ID
  GOOGLE_CLIENT_SECRET
  GOOGLE_REFRESH_TOKEN
`);
    process.exit(0);
  }

  const publisher = new GoogleDocsPublisher();
  await publisher.run(options);
}

// Run if executed directly
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
}

module.exports = GoogleDocsPublisher;
