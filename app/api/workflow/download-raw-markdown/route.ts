import { parse } from 'csv-parse/sync'
import fs from 'fs'
import JSZip from 'jszip'
import { NextRequest, NextResponse } from 'next/server'
import path from 'path'

const rawResponsesPaths = [
  path.join(process.cwd(), 'backend', 'data', 'raw-responses'),
  path.join(process.cwd(), '..', 'data', 'raw-responses'),
  path.join(process.cwd(), '..', 'backend', 'data', 'raw-responses')
]

function getRawContentForRecord(content: any, contentId: string): string | null {
  const topicId = content.topic_id || 'unknown'
  const creationDate = content.creation_date || ''

  for (const rawDir of rawResponsesPaths) {
    if (!fs.existsSync(rawDir)) continue
    try {
      const files = fs.readdirSync(rawDir).filter((f: string) => f.endsWith('.md'))
      let matchingFiles = files.filter((f: string) => f.startsWith(`${topicId}_`))
      if (matchingFiles.length === 0) {
        for (const file of files) {
          try {
            const filePath = path.join(rawDir, file)
            const fc = fs.readFileSync(filePath, 'utf-8')
            if (fc.includes(`Topic ID: ${topicId}`) || fc.includes(`content_id: ${contentId}`) ||
                fc.includes(`"topic_id": "${topicId}"`)) {
              matchingFiles.push(file)
              break
            }
          } catch {
            continue
          }
        }
      }
      if (matchingFiles.length === 0 && creationDate) {
        const datePart = creationDate.split('T')[0] || creationDate
        matchingFiles = files.filter((f: string) =>
          f.includes(datePart.replace(/-/g, '')) || f.includes(datePart))
      }
      if (matchingFiles.length > 0) {
        const sorted = matchingFiles.sort().reverse()
        return fs.readFileSync(path.join(rawDir, sorted[0]), 'utf-8')
      }
    } catch {
      continue
    }
  }
  return null
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const contentId = searchParams.get('contentId')
    const contentIdsParam = searchParams.get('contentIds')

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

    // Multiple content IDs → return ZIP of raw markdown files
    if (contentIdsParam) {
      const ids = contentIdsParam.split(',').map((id: string) => id.trim()).filter(Boolean)
      if (ids.length === 0) {
        return NextResponse.json(
          { error: 'contentIds must contain at least one ID' },
          { status: 400 }
        )
      }

      const contents = ids
        .map((id: string) => records.find((r: any) => r.content_id === id))
        .filter(Boolean) as any[]

      if (contents.length === 0) {
        return NextResponse.json(
          { error: `No content found for IDs: ${ids.join(', ')}` },
          { status: 404 }
        )
      }

      const zip = new JSZip()
      for (const content of contents) {
        let rawContent = getRawContentForRecord(content, content.content_id)
        if (!rawContent) {
          rawContent = (content.article_content || '').replace(/\\n/g, '\n')
        }
        let seoMeta: any = {}
        try {
          seoMeta = JSON.parse(content.seo_metadata || '{}')
        } catch (e) {
          // Ignore
        }
        const sanitizedTitle = (seoMeta.title || content.topic_id || content.content_id || 'article')
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '')
        zip.file(`${sanitizedTitle}-raw.md`, rawContent ?? '')
      }

      const zipBuffer = await zip.generateAsync({ type: 'uint8array' })
      return new NextResponse(zipBuffer as unknown as BodyInit, {
        status: 200,
        headers: {
          'Content-Type': 'application/zip',
          'Content-Disposition': 'attachment; filename="articles-raw-markdown.zip"',
          'Cache-Control': 'no-cache',
        },
      })
    }

    if (!contentId) {
      return NextResponse.json(
        { error: 'contentId or contentIds parameter is required' },
        { status: 400 }
      )
    }

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

    let seoMetaForLog: any = {}
    try {
      seoMetaForLog = JSON.parse(content.seo_metadata || '{}')
    } catch (e) {
      // Ignore
    }
    console.log(`✅ Downloading raw content for content_id: ${contentId}, topic_id: ${content.topic_id || 'N/A'}, title: "${seoMetaForLog.title || 'N/A'}"`)

    let rawResponseContent: string | null = getRawContentForRecord(content, contentId)

    if (!rawResponseContent) {
      rawResponseContent = (content.article_content || '').replace(/\\n/g, '\n')
      if (!rawResponseContent) {
        let availableFiles: string[] = []
        let checkedDirs: string[] = []
        for (const rawDir of rawResponsesPaths) {
          if (fs.existsSync(rawDir)) {
            checkedDirs.push(rawDir)
            try {
              const files = fs.readdirSync(rawDir).filter((f: string) => f.endsWith('.md'))
              availableFiles = [...availableFiles, ...files]
            } catch (e) {
              // Ignore errors
            }
          }
        }
        return NextResponse.json(
          {
            error: `Raw response file not found for content_id: ${contentId}`,
            message: 'No raw response file or article content available.',
            details: { content_id: contentId, topic_id: content.topic_id, searched_directories: checkedDirs, available_files_count: availableFiles.length }
          },
          { status: 404 }
        )
      }
    }

    let seoMeta: any = {}
    try {
      seoMeta = JSON.parse(content.seo_metadata || '{}')
    } catch (e) {
      // Ignore parse errors
    }

    const sanitizedTitle = (seoMeta.title || content.topic_id || 'article')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')

    const filename = `${sanitizedTitle}-raw.md`

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
      {
        error: 'Failed to download raw markdown file',
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
