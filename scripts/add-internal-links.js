#!/usr/bin/env node

/**
 * Internal Linking Assistant
 * Uses Gemini 3 Pro to suggest and insert 3-5 contextual internal links per HTML article.
 */

const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { jsonrepair } = require('jsonrepair');

require('dotenv').config();

const DEFAULT_MODEL = process.env.INTERNAL_LINK_MODEL || 'gemini-3-pro-preview';
const STOPWORDS = new Set([
  'the', 'and', 'for', 'that', 'with', 'this', 'from', 'have', 'they', 'you', 'your',
  'are', 'was', 'were', 'will', 'what', 'when', 'where', 'how', 'why', 'can', 'should',
  'would', 'could', 'about', 'into', 'than', 'then', 'such', 'their', 'them', 'its',
  'india', 'indian', 'pl', 'capital', 'plindia', 'blog', 'blogs', 'analysis', 'guide'
]);

class InternalLinkAssistant {
  constructor(options) {
    this.htmlDir = options.htmlDir;
    this.htmlFile = options.htmlFile || null;
    this.sitemapPath = options.sitemapPath;
    this.maxLinks = options.maxLinks || 5;
    this.minLinks = options.minLinks || 3;
    this.maxCandidates = options.maxCandidates || 40;
    this.modelName = options.modelName || DEFAULT_MODEL;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured.');
    }

    this.genAI = new GoogleGenerativeAI(apiKey);
    this.linksCatalog = this.loadSitemap();
  }

  loadSitemap() {
    if (!fs.existsSync(this.sitemapPath)) {
      throw new Error(`Sitemap CSV not found: ${this.sitemapPath}`);
    }
    const csvContent = fs.readFileSync(this.sitemapPath, 'utf-8');
    const records = parse(csvContent, { columns: true, skip_empty_lines: true });
    return records
      .map((row) => {
        const url = (row.url || row.loc || '').trim();
        if (!url) return null;
        return {
          url,
          slug: this.extractSlug(url),
          lastmod: row.lastmod || '',
          priority: parseFloat(row.priority || '0') || 0,
        };
      })
      .filter(Boolean);
  }

  extractSlug(url) {
    if (!url) return '';
    const clean = url.replace(/\/+$/, '');
    const parts = clean.split('/');
    const last = parts[parts.length - 1] || '';
    return last.replace(/\.html?$/, '');
  }

  gatherHtmlFiles() {
    if (this.htmlFile) {
      return [this.htmlFile];
    }

    const files = [];
    const walk = (dir) => {
      const entries = fs.readdirSync(dir);
      entries.forEach((entry) => {
        const fullPath = path.join(dir, entry);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          walk(fullPath);
        } else if (entry.endsWith('.html')) {
          files.push(fullPath);
        }
      });
    };
    walk(this.htmlDir);
    return files;
  }

  extractCanonical(htmlContent, fallbackSlug) {
    const match = htmlContent.match(/<!--\s*SEO Optimized URL:\s*(https?:\/\/[^\s]+)\s*-->/i);
    if (match) {
      return match[1].trim();
    }
    if (fallbackSlug) {
      return `https://www.plindia.com/blog/${fallbackSlug}`;
    }
    return null;
  }

  cleanText(htmlContent) {
    return htmlContent
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .toLowerCase();
  }

  buildKeywordFrequency(text) {
    const freq = {};
    const tokens = text.match(/[a-z0-9]+/g) || [];
    tokens.forEach((token) => {
      if (token.length < 3 || STOPWORDS.has(token)) return;
      freq[token] = (freq[token] || 0) + 1;
    });
    return freq;
  }

  scoreCandidate(candidate, freqMap) {
    const tokens = (candidate.slug || '').split('-').filter(Boolean);
    if (tokens.length === 0) return 0;
    return tokens.reduce((score, token) => {
      const clean = token.replace(/[^a-z0-9]/g, '');
      if (!clean || STOPWORDS.has(clean)) return score;
      return score + (freqMap[clean] || 0);
    }, 0);
  }

  selectCandidates(articleText, canonicalUrl) {
    const freqMap = this.buildKeywordFrequency(articleText);
    const scored = this.linksCatalog
      .filter((link) => link.url !== canonicalUrl)
      .map((link) => {
        const score = this.scoreCandidate(link, freqMap);
        return {
          ...link,
          score,
          lastmodTs: link.lastmod ? Date.parse(link.lastmod) || 0 : 0,
        };
      })
      .sort((a, b) => {
        if (b.score === a.score) {
          return b.lastmodTs - a.lastmodTs;
        }
        return b.score - a.score;
      });

    const topMatches = scored.filter((item) => item.score > 0).slice(0, this.maxCandidates);
    if (topMatches.length >= this.maxCandidates) {
      return topMatches;
    }

    const remaining = this.linksCatalog
      .filter(
        (link) =>
          link.url !== canonicalUrl && !topMatches.find((item) => item.url === link.url)
      )
      .map((link) => ({
        ...link,
        lastmodTs: link.lastmod ? Date.parse(link.lastmod) || 0 : 0,
      }))
      .sort((a, b) => b.lastmodTs - a.lastmodTs)
      .slice(0, this.maxCandidates - topMatches.length);

    return [...topMatches, ...remaining];
  }

  buildPrompt(htmlContent, candidates, canonicalUrl, slug) {
    return `
You are an internal linking strategist for PL Capital. Insert ${this.minLinks}-${this.maxLinks} internal links into the provided HTML by wrapping short, meaningful phrases (2-6 words) with <a> tags that point to the most contextually relevant URLs from the candidate list.

Rules:
- Only link to provided candidate URLs. Each URL can be used at most once.
- Do not link to the article's canonical URL (${canonicalUrl || 'unknown'}).
- Do not invent new sentences. Keep the original HTML structure and text identical except for the added anchor tags.
- Avoid linking already-linked text or headings. Favor descriptive nouns or phrases inside paragraph text.
- Keep anchor text natural; never use raw URLs.
- Output JSON with the following structure:
{
  "updated_html": "<full HTML with new anchors>",
  "links": [
    { "target_url": "https://...", "anchor_text": "text inserted", "reason": "short reason" }
  ]
}

ARTICLE_HTML:
${htmlContent}

CANDIDATE_URLS (JSON):
${JSON.stringify(
  candidates.map((item) => ({
    url: item.url,
    slug: item.slug,
    lastmod: item.lastmod,
    score: item.score,
  })),
  null,
  2
)}

Return valid JSON only.
`;
  }

  async callGemini(prompt) {
    const model = this.genAI.getGenerativeModel({
      model: this.modelName,
      generationConfig: {
        temperature: 0.35,
        topP: 0.9,
        maxOutputTokens: 4096,
        responseMimeType: 'application/json',
      },
    });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  }

  parseModelResponse(raw) {
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch (error) {
      try {
        const repaired = jsonrepair(raw);
        return JSON.parse(repaired);
      } catch (repairError) {
        console.error('⚠️  Failed to parse Gemini response:', repairError.message);
        return null;
      }
    }
  }

  async processFile(filePath) {
    const htmlContent = fs.readFileSync(filePath, 'utf-8');
    const slug = path.basename(filePath, '.html');
    const canonicalUrl = this.extractCanonical(htmlContent, slug);
    const articleText = this.cleanText(htmlContent);
    const candidates = this.selectCandidates(articleText, canonicalUrl).slice(
      0,
      this.maxCandidates
    );

    if (candidates.length === 0) {
      console.warn(`⚠️  No candidate internal links found for ${filePath}`);
      return { filePath, updated: false, links: [] };
    }

    const prompt = this.buildPrompt(htmlContent, candidates, canonicalUrl, slug);

    try {
      const rawResponse = await this.callGemini(prompt);
      const parsed = this.parseModelResponse(rawResponse);
      if (!parsed || !parsed.updated_html) {
        console.warn(`⚠️  Gemini returned no updated HTML for ${filePath}`);
        return { filePath, updated: false, links: [] };
      }
      fs.writeFileSync(filePath, parsed.updated_html.trim() + '\n', 'utf-8');
      const links = Array.isArray(parsed.links) ? parsed.links : [];
      console.log(
        `✅ Linked ${links.length} internal URL(s) in ${path.basename(filePath)}`
      );
      links.forEach((link) => {
        console.log(
          `   ↳ ${link.anchor_text || '(anchor)'} → ${link.target_url || '(url)'}`
        );
      });
      return { filePath, updated: true, links };
    } catch (error) {
      console.error(`❌ Failed to enrich ${filePath}: ${error.message}`);
      return { filePath, updated: false, links: [] };
    }
  }

  async run() {
    const files = this.gatherHtmlFiles();
    if (files.length === 0) {
      console.log('⚠️  No HTML files found to process.');
      return;
    }

    console.log(`\n🔗 Enhancing ${files.length} HTML file(s) with internal links...\n`);
    const results = [];
    for (const file of files) {
      const result = await this.processFile(file);
      results.push(result);
    }

    const updatedCount = results.filter((r) => r.updated).length;
    console.log('\n' + '='.repeat(60));
    console.log('📊 INTERNAL LINKING SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Updated files: ${updatedCount}/${results.length}`);
    console.log(`📁 Source HTML: ${this.htmlFile || this.htmlDir}`);
    console.log(`📄 Sitemap CSV: ${this.sitemapPath}`);
    console.log('='.repeat(60) + '\n');
  }
}

function parseArgs(argv) {
  const options = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    switch (arg) {
      case '--html-dir':
        options.htmlDir = path.resolve(argv[++i]);
        break;
      case '--file':
        options.htmlFile = path.resolve(argv[++i]);
        break;
      case '--sitemap':
        options.sitemapPath = path.resolve(argv[++i]);
        break;
      case '--max-links':
        options.maxLinks = parseInt(argv[++i], 10);
        break;
      case '--min-links':
        options.minLinks = parseInt(argv[++i], 10);
        break;
      case '--max-candidates':
        options.maxCandidates = parseInt(argv[++i], 10);
        break;
      case '--model':
        options.modelName = argv[++i];
        break;
      default:
        break;
    }
  }
  return options;
}

async function main() {
  try {
    const args = parseArgs(process.argv.slice(2));
    const htmlDir =
      args.htmlDir ||
      path.resolve(
        __dirname,
        '../docs/html_articles'
      );
    const sitemapPath =
      args.sitemapPath || path.resolve(process.cwd(), 'plindia_blog_links.csv');

    if (!args.htmlFile && !fs.existsSync(htmlDir)) {
      throw new Error(`HTML directory not found: ${htmlDir}`);
    }

    const assistant = new InternalLinkAssistant({
      htmlDir,
      htmlFile: args.htmlFile,
      sitemapPath,
      maxLinks: args.maxLinks,
      minLinks: args.minLinks,
      maxCandidates: args.maxCandidates,
      modelName: args.modelName,
    });

    await assistant.run();
  } catch (error) {
    console.error('❌ Internal linking failed:', error.message);
    process.exit(1);
  }
}

main();
