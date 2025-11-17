const fs = require('fs');
const csvParse = require('csv-parse/sync').parse;

const csvData = fs.readFileSync('data/created-content.csv', 'utf-8');
const records = csvParse(csvData, { columns: true, skip_empty_lines: true, relax_quotes: true });

if (records.length > 0) {
  const article = records[0].article_content;

  // Find all markdown links
  const linkPattern = /\[([^\]]+)\]\(([^)]+)\)/g;
  const links = [];
  let match;

  while ((match = linkPattern.exec(article)) !== null) {
    links.push({
      text: match[1],
      url: match[2]
    });
  }

  console.log('📊 Links found in article:', links.length);

  if (links.length === 0) {
    console.log('✅ No links found - all external links removed!');
  } else {
    console.log('\n🔗 Links in article:');
    links.forEach((link, idx) => {
      const isInternal = link.url.includes('plindia.com');
      const icon = isInternal ? '✅' : '❌';
      console.log(`  ${icon} [${idx + 1}] ${link.text} → ${link.url}`);
    });

    const externalLinks = links.filter(l => !l.url.includes('plindia.com'));
    if (externalLinks.length > 0) {
      console.log(`\n❌ Found ${externalLinks.length} external link(s) that should be removed!`);
    } else {
      console.log('\n✅ All links are internal PL Capital links!');
    }
  }

  // Also check for URL-like text that might have been converted to plain text
  const urlPattern = /https?:\/\/[^\s)]+/g;
  const plainUrls = article.match(urlPattern) || [];
  const externalPlainUrls = plainUrls.filter(url => !url.includes('plindia.com'));

  if (externalPlainUrls.length > 0) {
    console.log(`\n⚠️  Found ${externalPlainUrls.length} plain-text external URL(s):`);
    externalPlainUrls.forEach((url, idx) => {
      console.log(`  [${idx + 1}] ${url}`);
    });
  } else {
    console.log('\n✅ No plain-text external URLs found!');
  }
}
