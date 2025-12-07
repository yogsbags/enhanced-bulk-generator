import { parse } from 'csv-parse/sync'
import fs from 'fs'
import { NextRequest, NextResponse } from 'next/server'
import path from 'path'

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

    // Get topic_id to find raw response file
    const topicId = content.topic_id || 'unknown'

    // Look for raw response files matching this topic_id
    const rawResponsesPaths = [
      path.join(process.cwd(), 'backend', 'data', 'raw-responses'),
      path.join(process.cwd(), '..', 'data', 'raw-responses'),
      path.join(process.cwd(), '..', 'backend', 'data', 'raw-responses')
    ]

    let rawResponsePath: string | null = null
    let rawResponseContent: string | null = null

    for (const rawDir of rawResponsesPaths) {
      if (fs.existsSync(rawDir)) {
        try {
          const files = fs.readdirSync(rawDir)
          // Find files that start with the topic_id
          const matchingFiles = files.filter((file: string) =>
            file.startsWith(`${topicId}_`) && file.endsWith('.md')
          )

          if (matchingFiles.length > 0) {
            // Get the most recent file (sort by filename which includes timestamp)
            const sortedFiles = matchingFiles.sort().reverse()
            rawResponsePath = path.join(rawDir, sortedFiles[0])
            rawResponseContent = fs.readFileSync(rawResponsePath, 'utf-8')
            break
          }
        } catch (error) {
          console.warn(`⚠️  Error reading raw-responses directory ${rawDir}:`, error)
        }
      }
    }

    if (!rawResponseContent) {
      return NextResponse.json(
        {
          error: `Raw response file not found for content_id: ${contentId}`,
          message: `Searched for files starting with "${topicId}_" in raw-responses directories`
        },
        { status: 404 }
      )
    }

    // Parse SEO metadata for filename
    let seoMeta: any = {}
    try {
      seoMeta = JSON.parse(content.seo_metadata || '{}')
    } catch (e) {
      // Ignore parse errors
    }

    // Generate filename from title (with -raw suffix)
    const sanitizedTitle = (seoMeta.title || content.topic_id || 'article')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')

    const filename = `${sanitizedTitle}-raw.md`

    // Return raw markdown file with appropriate headers for download
    return new NextResponse(rawResponseContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/markdown',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache',
      },
    })
  } catch (error) {
    console.error('Raw markdown download error:', error)
    return NextResponse.json(
      { error: 'Failed to download raw markdown file' },
      { status: 500 }
    )
  }
}
