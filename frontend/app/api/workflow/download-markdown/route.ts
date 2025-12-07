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

  // Check if article_content already includes RESEARCH VERIFICATION section
  // If it does, it will be included when we add article_content below
  // If it doesn't, we don't need to add it separately since it should have been added during content creation

  // Add article content (which should already include RESEARCH VERIFICATION if it was extracted)
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
  } else {
    // Debug: Log if FAQs weren't found (for troubleshooting)
    console.log('⚠️  No FAQs extracted from article content. FAQ section may be missing or in unexpected format.')
  }

  return markdown
}

/**
 * Extract FAQs from article content
 * Handles multiple formats:
 * 1. H3 format: ### Question text?
 * 2. Q&A format: **Q1. Question text?** followed by A: answer
 */
function extractFAQs(articleContent: string): Array<{ question: string; answer: string }> {
  const faqs: Array<{ question: string; answer: string }> = []

  // Check if there's a FAQ section (various possible headings)
  // Match FAQ section until: ---, ## SEO Metadata, ## Talk to, ## Conclusion, or end of content
  // Use non-greedy match to capture until the first occurrence of these patterns
  const faqSectionMatch = articleContent.match(/##\s+(?:FAQs?|Frequently Asked Questions|FAQ)[^\n]*\n([\s\S]*?)(?=\n---|\n##\s+(?:SEO Metadata|Talk to|Conclusion)|$)/i)

  if (faqSectionMatch) {
    const faqSection = faqSectionMatch[1]

    // Try H3 format first (### Question)
    const h3Regex = /###\s+(.+?)\n\n?([\s\S]+?)(?=\n###|\n##|\n---|\n\n---|$)/g
    let match

    while ((match = h3Regex.exec(faqSection)) !== null) {
      const question = match[1].trim()
      const answer = match[2].trim().replace(/\n\n/g, ' ').replace(/\n/g, ' ')

      if (question && answer) {
        faqs.push({
          question: question,
          answer: answer
        })
      }
    }

    // If no H3 FAQs found, try Q&A format (**Q1. Question?** followed by A:)
    if (faqs.length === 0) {
      // Match **Q1. Question text?** followed by A: answer text
      // Handles both single-line and multi-line answers
      const qaRegex = /\*\*Q\d+\.\s*(.+?)\*\*\s*\n\s*A:\s*([\s\S]+?)(?=\n\*\*Q\d+\.|\n---|\n##|$)/g
      let qaMatch

      while ((qaMatch = qaRegex.exec(faqSection)) !== null) {
        const question = qaMatch[1].trim()
        // Clean up answer: remove extra newlines, preserve sentence structure
        let answer = qaMatch[2].trim()
          .replace(/\n{3,}/g, '\n\n')  // Replace 3+ newlines with 2
          .replace(/\n\n/g, ' ')         // Replace double newlines with space
          .replace(/\n/g, ' ')          // Replace single newlines with space
          .replace(/\s+/g, ' ')         // Normalize multiple spaces
          .trim()

        if (question && answer && answer.length > 10) {  // Ensure answer has meaningful content
          faqs.push({
            question: question,
            answer: answer
          })
        }
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
