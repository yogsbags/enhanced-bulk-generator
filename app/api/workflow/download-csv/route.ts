import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const filename = searchParams.get('filename')

    if (!filename) {
      return NextResponse.json(
        { error: 'Filename parameter is required' },
        { status: 400 }
      )
    }

    // Security: Only allow .csv files and sanitize filename
    if (!filename.endsWith('.csv') || filename.includes('..')) {
      return NextResponse.json(
        { error: 'Invalid filename' },
        { status: 400 }
      )
    }

    // Construct path to CSV file
    const csvPath = path.join(process.cwd(), '..', 'data', filename)

    // Check if file exists
    if (!fs.existsSync(csvPath)) {
      return NextResponse.json(
        { error: `File not found: ${filename}` },
        { status: 404 }
      )
    }

    // Read CSV file
    const fileContent = fs.readFileSync(csvPath, 'utf-8')

    // Return CSV file with appropriate headers for download
    return new NextResponse(fileContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache',
      },
    })
  } catch (error) {
    console.error('CSV download error:', error)
    return NextResponse.json(
      { error: 'Failed to download CSV file' },
      { status: 500 }
    )
  }
}
