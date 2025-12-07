import { parse } from 'csv-parse/sync'
import fs from 'fs'
import { NextRequest, NextResponse } from 'next/server'
import path from 'path'

/**
 * Format content as markdown file with SEO metadata
 * Replicates ContentExporter.formatMarkdown logic
 */
function formatMarkdown(content: any, primaryKeyword: string | null = null): string {
  const { article_content, compliance } = content
  const research_log = content.research_log || content.__research_verification || ''

  // Parse seo_metadata from JSON string
  let seo_metadata: any
  try {
    seo_metadata = content.__seo || (typeof content.seo_metadata === 'string'
      ? JSON.parse(content.seo_metadata)
      : content.seo_metadata)
  } catch (error) {
    console.warn('⚠️  Failed to parse seo_metadata, using defaults')
    seo_metadata = {}
  }

  let markdown = ''

  // Add H1 title (only at top of file)
  if (seo_metadata?.title) {
    markdown += `# ${seo_metadata.title}\n\n`
  }

  // Add RESEARCH VERIFICATION section (BEFORE Summary)
  if (research_log && research_log !== 'N/A - Fallback mode (JSON parsing failed)') {
    markdown += `### RESEARCH VERIFICATION\n\n${research_log}\n\n---\n\n`
  }

  // Add article content (starts with ## Summary)
  markdown += article_content || ''

  // Add compliance/disclaimer at the end
  if (compliance) {
    markdown += `\n\n---\n\n${compliance}`
  }

  // Add SEO metadata section
  markdown += '\n\n---\n\n## SEO Metadata\n\n'

  if (seo_metadata?.title) {
    markdown += `### SEO Meta Title\n\`\`\`\n${seo_metadata.title}\n\`\`\`\n\n`
  }

  if (seo_metadata?.meta_description) {
    markdown += `### SEO Meta Description\n\`\`\`\n${seo_metadata.meta_description}\n\`\`\`\n\n`
  }

  if (seo_metadata?.focus_keyphrase) {
    markdown += `### Focus Keyword\n\`\`\`\n${seo_metadata.focus_keyphrase}\n\`\`\`\n\n`
  }

  if (seo_metadata?.secondary_keywords && seo_metadata.secondary_keywords.length > 0) {
    markdown += `### Secondary Keywords\n\`\`\`\n${seo_metadata.secondary_keywords.join(', ')}\n\`\`\`\n\n`
  }

  // Add canonical URL
  const keyword = primaryKeyword || content.primary_keyword || content.topic_id || 'article'
  const slug = keyword
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
  const canonicalUrl = `https://www.plindia.com/blog/${slug}`
  markdown += `### SEO Optimized URL\n\`\`\`\n${canonicalUrl}\n\`\`\`\n\n`

  // Extract and add FAQ schema if FAQs exist
  const faqs = extractFAQs(article_content)
  if (faqs.length > 0) {
    markdown += generateFAQSchema(faqs, canonicalUrl)
  }

  return markdown
}

/**
 * Extract FAQs from article content
 */
function extractFAQs(articleContent: string): Array<{ question: string; answer: string }> {
  const faqs: Array<{ question: string; answer: string }> = []
  const faqRegex = /###\s+(.+?)\n\n?([\s\S]+?)(?=\n###|\n##|\n---|\n\n---|$)/gs

  // Check if there's a FAQ section
  const faqSectionMatch = articleContent.match(/##\s+FAQs?.*?\n([\s\S]*?)(?=\n---|##\s+SEO Metadata|$)/i)

  if (faqSectionMatch) {
    const faqSection = faqSectionMatch[1]
    let match

    while ((match = faqRegex.exec(faqSection)) !== null) {
      const question = match[1].trim()
      const answer = match[2].trim().replace(/\n\n/g, ' ').replace(/\n/g, ' ')

      if (question && answer) {
        faqs.push({
          question: question,
          answer: answer
        })
      }
    }
  }

  return faqs
}

/**
 * Generate FAQ Schema JSON-LD
 */
function generateFAQSchema(faqs: Array<{ question: string; answer: string }>, url: string): string {
  if (!faqs || faqs.length === 0) {
    return ''
  }

  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  }

  return `\n### FAQ Schema (JSON-LD)\n\`\`\`html\n<script type="application/ld+json">\n${JSON.stringify(schema, null, 2)}\n</script>\n\`\`\`\n\n`
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const contentId = searchParams.get('contentId')

    if (!contentId) {
      return NextResponse.json(
        { error: 'contentId parameter is required' },
        { status: 400 }
      )
    }

    // Construct path to created-content.csv
    const possiblePaths = [
      path.join(process.cwd(), 'backend', 'data', 'created-content.csv'),
      path.join(process.cwd(), '..', 'data', 'created-content.csv'),
      path.join(process.cwd(), '..', 'backend', 'data', 'created-content.csv')
    ]

    const csvPath = possiblePaths.find(p => fs.existsSync(p))

    if (!csvPath) {
      return NextResponse.json(
        { error: 'created-content.csv not found' },
        { status: 404 }
      )
    }

    // Read and parse CSV
    const fileContent = fs.readFileSync(csvPath, 'utf-8')
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    })

    // Find the content by ID
    const content = records.find((r: any) => r.content_id === contentId)

    if (!content) {
      return NextResponse.json(
        { error: `Content not found: ${contentId}` },
        { status: 404 }
      )
    }

    // Format markdown using inline formatter (includes SEO metadata, FAQ schema, etc.)
    const markdownContent = formatMarkdown(content, content.primary_keyword)

    // Parse SEO metadata for filename
    let seoMeta: any = {}
    try {
      seoMeta = JSON.parse(content.seo_metadata || '{}')
    } catch (e) {
      // Ignore parse errors
    }

    // Generate filename from title (no content_id suffix)
    const sanitizedTitle = (seoMeta.title || content.topic_id || 'article')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')

    const filename = `${sanitizedTitle}.md`

    // Return markdown file with appropriate headers for download
    return new NextResponse(markdownContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/markdown',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache',
      },
    })
  } catch (error) {
    console.error('Markdown download error:', error)
    return NextResponse.json(
      { error: 'Failed to download markdown file' },
      { status: 500 }
    )
  }
}
