import { parse } from 'csv-parse/sync'
import fs from 'fs'
import { NextRequest, NextResponse } from 'next/server'
import path from 'path'

/**
 * Convert Markdown to HTML
 */
function markdownToHtml(markdown: string, title: string = 'Article', metaDescription: string = ''): string {
  if (!markdown) return ''

  let html = markdown

  // Convert headings
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>')
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>')
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>')

  // Convert bold and italic
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>')

  // Convert links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')

  // Convert unordered lists
  html = html.replace(/^\* (.+)$/gim, '<li>$1</li>')
  html = html.replace(/^- (.+)$/gim, '<li>$1</li>')

  // Convert ordered lists
  html = html.replace(/^(\d+)\. (.+)$/gim, '<li>$2</li>')

  // Wrap consecutive list items
  html = html.replace(/(<li>.*?<\/li>\n?)+/g, (match) => {
    return '<ul>\n' + match + '</ul>\n'
  })

  // Convert horizontal rules
  html = html.replace(/^---$/gim, '<hr>')

  // Convert paragraphs (lines not already wrapped)
  const lines = html.split('\n')
  const processedLines = lines.map(line => {
    line = line.trim()
    if (!line) return '<br>'
    if (line.startsWith('<')) return line // Already HTML
    if (line.match(/^#{1,6} /)) return line // Heading
    return '<p>' + line + '</p>'
  })

  html = processedLines.join('\n')

  // Add basic HTML structure
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <meta name="description" content="${metaDescription}">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      line-height: 1.6;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      color: #333;
    }
    h1, h2, h3 { margin-top: 1.5em; color: #2c3e50; }
    h1 { font-size: 2em; }
    h2 { font-size: 1.5em; border-bottom: 2px solid #eee; padding-bottom: 0.3em; }
    h3 { font-size: 1.25em; }
    p { margin: 1em 0; }
    ul, ol { margin: 1em 0; padding-left: 2em; }
    li { margin: 0.5em 0; }
    a { color: #3498db; text-decoration: none; }
    a:hover { text-decoration: underline; }
    hr { border: none; border-top: 2px solid #eee; margin: 2em 0; }
    code { background: #f4f4f4; padding: 2px 6px; border-radius: 3px; font-family: 'Courier New', monospace; }
  </style>
</head>
<body>
${html}
</body>
</html>`
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

    // Find the content by ID (exact match required)
    const content = records.find((r: any) => r.content_id === contentId)

    if (!content) {
      console.error(`❌ Content not found in CSV: ${contentId}`)
      return NextResponse.json(
        { error: `Content not found: ${contentId}` },
        {
          status: 404,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )
    }

    // Log which content is being downloaded for debugging
    let seoMetaForLog: any = {}
    try {
      seoMetaForLog = JSON.parse(content.seo_metadata || '{}')
    } catch (e) {
      // Ignore
    }
    console.log(`✅ Downloading HTML for content_id: ${contentId}, title: "${seoMetaForLog.title || 'N/A'}"`)

    // Get markdown content and metadata
    const markdownContent = content.article_content || ''

    let seoMeta: any = {}
    try {
      seoMeta = JSON.parse(content.seo_metadata || '{}')
    } catch (e) {
      // Ignore parse errors
    }

    const title = seoMeta.title || 'Article'
    const metaDescription = seoMeta.meta_description || ''

    // Convert markdown to HTML
    const htmlContent = markdownToHtml(markdownContent, title, metaDescription)

    // Generate filename from title
    const sanitizedTitle = (seoMeta.title || content.topic_id || 'article')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')

    const filename = `${sanitizedTitle}-${contentId}.html`

    // Return HTML file with appropriate headers for download
    return new NextResponse(htmlContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache',
      },
    })
  } catch (error) {
    console.error('HTML download error:', error)
    return NextResponse.json(
      {
        error: 'Failed to download HTML file',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
  }
}
