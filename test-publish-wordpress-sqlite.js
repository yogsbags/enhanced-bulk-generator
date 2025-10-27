#!/usr/bin/env node

/**
 * Test script to publish directly to WordPress SQLite database
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Path to WordPress SQLite database
const DB_PATH = '/Users/yogs87/Downloads/sanity/projects/studio-test/wordpress-setup/wordpress/wp-content/database/.ht.sqlite';

async function publishToWordPressSQLite(article) {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        reject(new Error(`Database connection failed: ${err.message}`));
        return;
      }
    });

    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const guid = `http://localhost:8080/?p=`;

    const sql = `
      INSERT INTO wp_posts (
        post_author, post_date, post_date_gmt, post_content, post_title,
        post_excerpt, post_status, comment_status, ping_status, post_name,
        post_modified, post_modified_gmt, post_content_filtered, post_parent,
        guid, menu_order, post_type, post_mime_type, comment_count
      ) VALUES (
        1, ?, ?, ?, ?, ?, 'publish', 'open', 'open', ?, ?, ?, '', 0, ?, 0, 'post', '', 0
      )
    `;

    db.run(
      sql,
      [now, now, article.content, article.title, article.excerpt, article.slug, now, now, guid],
      function (err) {
        if (err) {
          db.close();
          reject(new Error(`Insert failed: ${err.message}`));
          return;
        }

        const postId = this.lastID;
        const finalGuid = `${guid}${postId}`;

        // Update GUID with actual post ID
        db.run(
          'UPDATE wp_posts SET guid = ? WHERE ID = ?',
          [finalGuid, postId],
          (updateErr) => {
            db.close();

            if (updateErr) {
              reject(new Error(`GUID update failed: ${updateErr.message}`));
              return;
            }

            resolve({
              success: true,
              postId,
              url: `http://localhost:8080/${article.slug}/`,
              editUrl: `http://localhost:8080/wp-admin/post.php?post=${postId}&action=edit`
            });
          }
        );
      }
    );
  });
}

async function testPublish() {
  console.log('🧪 Testing WordPress SQLite direct publish...\n');

  // Test article with footer
  const testArticle = {
    title: 'Index Funds vs Mutual Funds: A Comprehensive Indian Market Guide',
    slug: 'index-funds-vs-mutual-funds-comprehensive-guide',
    excerpt: 'Explore index funds vs mutual funds in India. Discover performance, tax implications, and risk strategies.',
    content: `
<style>
/* Table Styles */
table {
  width: 100%;
  border-collapse: collapse;
  margin: 20px 0;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

th {
  background-color: #2c3e50;
  color: white;
  padding: 12px;
  text-align: left;
  font-weight: 600;
}

td {
  border: 1px solid #ddd;
  padding: 12px;
}

tr:nth-child(even) {
  background-color: #f9f9f9;
}

tr:hover {
  background-color: #f5f5f5;
}

/* Footer Styles */
.article-footer {
  border-top: 2px solid #e5e7eb;
  margin-top: 3rem;
  padding-top: 2rem;
}

.article-footer__author {
  margin-bottom: 1.5rem;
}

.article-footer__share {
  margin-bottom: 1.5rem;
}

.share-buttons {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.share-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  transition: all 0.2s;
  text-decoration: none;
  cursor: pointer;
}

.share-button:hover {
  opacity: 0.9;
  transform: scale(1.1);
}

.share-button--facebook {
  background-color: #1877f2;
}

.share-button--twitter {
  background-color: #000000;
}

.share-button--linkedin {
  background-color: #0a66c2;
}

.share-button--instagram {
  background: linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%);
}

.share-button--youtube {
  background-color: #ff0000;
}

.share-button svg {
  width: 20px;
  height: 20px;
  fill: white;
}

.article-footer__disclaimer {
  background-color: #f9fafb;
  border-left: 4px solid #6b7280;
  padding: 1rem 1.25rem;
  margin-top: 1.5rem;
}
</style>

<h2>Understanding Index Funds and Mutual Funds</h2>

<p>In the dynamic landscape of the Indian financial market, investors are often faced with the dilemma of choosing between index funds and mutual funds. Both investment vehicles offer unique advantages and cater to different investor needs.</p>

<h3>What Are Index Funds?</h3>

<p>Index funds are a type of mutual fund designed to replicate the performance of a specific index, such as the NIFTY 50 or BSE Sensex. They offer a passive investment strategy.</p>

<h4>Benefits of Index Funds</h4>
<ul>
  <li><strong>Cost-Effective:</strong> Low expense ratios due to passive management</li>
  <li><strong>Diversification:</strong> Exposure to a broad market segment reduces individual stock risk</li>
  <li><strong>Transparency:</strong> Clear understanding of holdings based on the index</li>
</ul>

<h3>What Are Mutual Funds?</h3>

<p>Mutual funds pool money from various investors to invest in stocks, bonds, or other securities, managed by professional fund managers.</p>

<h4>Benefits of Mutual Funds</h4>
<ul>
  <li><strong>Professional Management:</strong> Expertise in selecting securities</li>
  <li><strong>Variety of Options:</strong> Available in equity, debt, hybrid, and other forms</li>
  <li><strong>Active Strategy:</strong> Potential for higher returns than index benchmarks</li>
</ul>

<h2>Performance Comparison</h2>

<table>
  <thead>
    <tr>
      <th>Fund Type</th>
      <th>Average 5-Year Return</th>
      <th>Volatility</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Index Funds</td>
      <td>10%</td>
      <td>Low</td>
    </tr>
    <tr>
      <td>Equity Mutual Funds</td>
      <td>12%</td>
      <td>High</td>
    </tr>
  </tbody>
</table>

<h2>Tax Implications</h2>

<h3>Index Funds</h3>
<ul>
  <li><strong>Long-Term Capital Gains (LTCG):</strong> Taxed at 10% on gains exceeding INR 1 lakh</li>
  <li><strong>Short-Term Capital Gains (STCG):</strong> Taxed at 15%</li>
</ul>

<h3>Mutual Funds</h3>
<ul>
  <li><strong>Equity Funds:</strong> Similar tax treatment as index funds</li>
  <li><strong>Debt Funds:</strong> LTCG taxed at 20% with indexation</li>
</ul>

<h2>Conclusion</h2>

<p>Both index funds and mutual funds have their place in a well-diversified portfolio. The choice between them depends on your investment goals, risk tolerance, and time horizon.</p>

<p>For personalized advice on building your investment portfolio, contact PL Capital's advisory team today.</p>

<!-- Blog Footer -->
<div class="article-footer">
  <hr style="border: 0; border-top: 2px solid #e5e7eb; margin: 0 0 2rem 0;">

  <div class="article-footer__author">
    <h3 style="font-size: 1.125rem; font-weight: 600; color: #111827; margin: 0 0 0.5rem 0;">Article by</h3>
    <p style="margin: 0; font-size: 1rem; color: #374151;">
      <strong>PL Capital</strong>
    </p>
  </div>

  <div class="article-footer__share">
    <h3 style="font-size: 1.125rem; font-weight: 600; color: #111827; margin: 0 0 0.75rem 0;">Share</h3>
    <div class="share-buttons">
      <a href="#" class="share-button share-button--facebook"
         onclick="window.open('https://www.facebook.com/sharer/sharer.php?u='+encodeURIComponent(window.location.href), 'facebook-share', 'width=580,height=296'); return false;"
         aria-label="Share on Facebook">
        <svg viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      </a>

      <a href="#" class="share-button share-button--twitter"
         onclick="window.open('https://twitter.com/intent/tweet?url='+encodeURIComponent(window.location.href)+'&text='+encodeURIComponent(document.title), 'twitter-share', 'width=550,height=420'); return false;"
         aria-label="Share on X (Twitter)">
        <svg viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      </a>

      <a href="#" class="share-button share-button--linkedin"
         onclick="window.open('https://www.linkedin.com/sharing/share-offsite/?url='+encodeURIComponent(window.location.href), 'linkedin-share', 'width=550,height=420'); return false;"
         aria-label="Share on LinkedIn">
        <svg viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      </a>

      <a href="#" class="share-button share-button--instagram"
         onclick="window.open('https://www.instagram.com/plcapital/', 'instagram', 'width=550,height=420'); return false;"
         aria-label="Visit us on Instagram">
        <svg viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      </a>

      <a href="#" class="share-button share-button--youtube"
         onclick="window.open('https://www.youtube.com/@PLCapital', 'youtube', 'width=550,height=420'); return false;"
         aria-label="Visit us on YouTube">
        <svg viewBox="0 0 24 24">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
      </a>
    </div>
  </div>

  <div class="article-footer__disclaimer">
    <p style="margin: 0; font-size: 0.875rem; color: #374151; line-height: 1.6;">
      <strong>Disclaimer:</strong> This blog has been written exclusively for educational purposes.
      The securities mentioned are only examples and not recommendations. It is based on several
      secondary sources on the internet and is subject to changes. Please consult an expert before
      making related decisions.
    </p>
  </div>
</div>
`
  };

  console.log('📄 Article to publish:');
  console.log(`   Title: ${testArticle.title}`);
  console.log(`   Slug: ${testArticle.slug}`);
  console.log(`   Content Length: ${testArticle.content.length} characters`);
  console.log();

  try {
    console.log('🌐 Publishing to WordPress SQLite...');
    const result = await publishToWordPressSQLite(testArticle);

    console.log(`   ✅ Success!`);
    console.log(`   Post ID: ${result.postId}`);
    console.log(`   URL: ${result.url}`);
    console.log(`   Edit URL: ${result.editUrl}`);
    console.log();

    console.log('🎉 Article published successfully!');
    console.log();
    console.log('🔗 Access your article:');
    console.log(`   View: ${result.url}`);
    console.log(`   Edit: ${result.editUrl}`);

  } catch (error) {
    console.error('❌ Publishing failed:', error.message);
    process.exit(1);
  }
}

testPublish();
