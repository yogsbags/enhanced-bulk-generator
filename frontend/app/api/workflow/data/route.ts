import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { parse } from 'csv-parse/sync'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Map stages to their CSV files
const STAGE_CSV_MAP: Record<number, string> = {
  1: 'research-gaps.csv',
  2: 'generated-topics.csv',
  3: 'topic-research.csv',
  4: 'created-content.csv',
  5: 'created-content.csv', // SEO optimization updates same file
  6: 'published-content.csv',
  7: 'workflow-status.csv'
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const stage = searchParams.get('stage')

    if (!stage) {
      return NextResponse.json({ error: 'Stage parameter required' }, { status: 400 })
    }

    const stageNum = parseInt(stage)
    const csvFile = STAGE_CSV_MAP[stageNum]

    if (!csvFile) {
      return NextResponse.json({ error: 'Invalid stage' }, { status: 400 })
    }

    const csvPath = path.join(process.cwd(), 'backend', 'data', csvFile)

    // Check if file exists
    if (!fs.existsSync(csvPath)) {
      return NextResponse.json({
        data: [],
        message: `CSV file not yet created (${csvFile})`
      })
    }

    // Read and parse CSV
    const csvContent = fs.readFileSync(csvPath, 'utf-8')
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      relax_quotes: true,
      trim: true,
    })

    // Limit to last 10 records to avoid overwhelming the UI
    const limitedRecords = records.slice(-10)

    // Get summary stats
    const summary = {
      total: records.length,
      showing: limitedRecords.length,
      approved: records.filter((r: any) =>
        r.approval_status === 'Yes' || r.approval_status === 'SEO-Ready'
      ).length
    }

    return NextResponse.json({
      data: limitedRecords,
      summary,
      file: csvFile
    })

  } catch (error) {
    console.error('Error reading CSV:', error)
    return NextResponse.json({
      error: 'Failed to read CSV data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
