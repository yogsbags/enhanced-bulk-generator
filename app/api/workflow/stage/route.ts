import {
    appendJobLog,
    createJob,
    setJobCompleted,
    setJobFailed,
    updateJob,
} from '@/lib/workflow-job-store'
import { spawn } from 'child_process'
import { NextRequest, NextResponse } from 'next/server'
import path from 'path'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const STAGE_NAMES: Record<number, string> = {
  1: 'research',
  2: 'topics',
  3: 'deep-research',
  4: 'content',
  5: 'validation',
  6: 'seo',
  7: 'publication',
  8: 'completion',
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const usePolling = body.usePolling === true
  const isServerless = process.env.VERCEL === '1' || process.env.NETLIFY === 'true' || process.env.AWS_LAMBDA_FUNCTION_NAME

  const stageId = body.stageId
  const topicLimit = body.topicLimit || 1
  const category = body.category || 'derivatives'
  const customTopic = body.customTopic || ''
  const customTitle = body.customTitle || ''
  const contentOutline = body.contentOutline || ''

  if (!stageId || !STAGE_NAMES[stageId]) {
    return NextResponse.json({ error: `Invalid stage ID: ${stageId}` }, { status: 400 })
  }

  const stageName = STAGE_NAMES[stageId]
  const workingDir = path.join(process.cwd(), 'backend')
  const mainJsPath = path.join(workingDir, 'main.js')
  const parentNodeModules = path.join(process.cwd(), 'node_modules')
  const nodeEnv = {
    ...process.env,
    NODE_PATH: parentNodeModules + (process.env.NODE_PATH ? ':' + process.env.NODE_PATH : ''),
    CONTENT_OUTLINE: contentOutline,
  }
  const args = [mainJsPath, 'stage', stageName, '--auto-approve', '--topic-limit', topicLimit.toString(), '--category', category]
  if (customTopic) args.push('--custom-topic', customTopic)
  if (customTitle) args.push('--custom-title', customTitle)
  if (contentOutline) args.push('--content-outline-provided')

  if (usePolling && !isServerless) {
    const jobId = createJob()
    updateJob(jobId, { stage: stageId, message: `Executing ${stageName}...` })
    appendJobLog(jobId, `🔧 Executing Stage ${stageId}: ${stageName}... (polling mode)`)
    appendJobLog(jobId, `📊 Topic Limit: ${topicLimit}`)
    appendJobLog(jobId, `📂 Category: ${category}`)

    const nodeProcess = spawn('node', args, { cwd: workingDir, env: nodeEnv })
    nodeProcess.stdout.on('data', (data: Buffer) => {
      const lines = data.toString().split('\n').filter((l: string) => l.trim())
      for (const line of lines) {
        appendJobLog(jobId, line)
      }
    })
    nodeProcess.stderr.on('data', (data: Buffer) => {
      appendJobLog(jobId, `⚠️  ${data.toString()}`)
    })
    nodeProcess.on('close', (code) => {
      if (code === 0) {
        appendJobLog(jobId, `✅ Stage ${stageId} completed successfully!`)
        updateJob(jobId, { stage: stageId, message: 'Stage completed' })
        setJobCompleted(jobId)
      } else {
        appendJobLog(jobId, `❌ Stage ${stageId} exited with code ${code}`)
        setJobFailed(jobId, `Process exited with code ${code}`)
      }
    })
    nodeProcess.on('error', (err) => {
      appendJobLog(jobId, `❌ Process error: ${err.message}`)
      setJobFailed(jobId, err.message)
    })
    return NextResponse.json({ jobId })
  }

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      const sendEvent = (data: any) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
      }

      try {
        sendEvent({ log: `🔧 Executing Stage ${stageId}: ${stageName}...` })
        sendEvent({ log: `📊 Topic Limit: ${topicLimit}` })
        sendEvent({ log: `📂 Category Focus: ${category}` })
        if (customTopic) sendEvent({ log: `✨ Custom Topic: "${customTopic}"` })
        if (customTitle) sendEvent({ log: `🚀 Custom Title: "${customTitle}"` })
        if (contentOutline) sendEvent({ log: `📝 Content Outline: ${contentOutline.split('\n').length} lines provided` })
        sendEvent({ stage: stageId, status: 'running', message: `Executing ${stageName}...` })

        const nodeProcess = spawn('node', args, { cwd: workingDir, env: nodeEnv })
        sendEvent({ log: `🚀 Command: node ${args.slice(1).join(' ')}` })

        nodeProcess.stdout.on('data', (data: Buffer) => {
          const lines = data.toString().split('\n').filter((l: string) => l.trim())
          for (const line of lines) sendEvent({ log: line })
        })
        nodeProcess.stderr.on('data', (data: Buffer) => {
          sendEvent({ log: `⚠️  ${data.toString()}` })
        })

        await new Promise<void>((resolve, reject) => {
          nodeProcess.on('close', (code) => {
            if (code === 0) {
              sendEvent({ log: `✅ Stage ${stageId} completed successfully!` })
              sendEvent({ stage: stageId, status: 'completed', message: 'Stage completed' })
              resolve()
            } else {
              sendEvent({ log: `❌ Stage ${stageId} exited with code ${code}` })
              sendEvent({ stage: stageId, status: 'error', message: `Failed with code ${code}` })
              reject(new Error(`Process exited with code ${code}`))
            }
          })
          nodeProcess.on('error', (err) => {
            sendEvent({ log: `❌ Process error: ${err.message}` })
            sendEvent({ stage: stageId, status: 'error', message: err.message })
            reject(err)
          })
        })
      } catch (error) {
        const msg = error instanceof Error ? error.message : 'Unknown error'
        sendEvent({ log: `❌ Fatal error: ${msg}` })
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
