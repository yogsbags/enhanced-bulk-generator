import { NextRequest } from 'next/server'
import { spawn } from 'child_process'
import path from 'path'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      const sendEvent = (data: any) => {
        const message = `data: ${JSON.stringify(data)}\n\n`
        controller.enqueue(encoder.encode(message))
      }

      let currentStage = 0

      try {
        // Parse request body to get topic limit and category
        const body = await req.json()
        const topicLimit = body.topicLimit || 1
        const category = body.category || 'derivatives'

        // Path to main.js (go up from frontend to parent directory)
        const mainJsPath = path.join(process.cwd(), '..', 'main.js')

        sendEvent({ log: '🔧 Initializing workflow execution...' })
        sendEvent({ log: `📍 Executing: ${mainJsPath}` })
        sendEvent({ log: `📊 Topic Limit: ${topicLimit}` })
        sendEvent({ log: `📂 Category Focus: ${category}` })

        // Execute main.js with 'full' command, topic limit, and category
        const args = [mainJsPath, 'full', '--auto-approve', '--topic-limit', topicLimit.toString(), '--category', category]
        const nodeProcess = spawn('node', args, {
          cwd: path.join(process.cwd(), '..'),
          env: { ...process.env },
        })

        sendEvent({ log: `🚀 Command: node ${args.slice(1).join(' ')}` })

        const stageKeywords = [
          'SEO Research', 'research', 'gaps',
          'Topic', 'topic',
          'Deep Research', 'deep',
          'Content', 'content creation',
          'SEO', 'optimization',
          'Publish', 'publication',
          'Complete', 'finished'
        ]

        // Handle stdout
        nodeProcess.stdout.on('data', (data: Buffer) => {
          const output = data.toString()
          const lines = output.split('\n').filter(line => line.trim())

          for (const line of lines) {
            sendEvent({ log: line })

            // Detect stage changes based on output
            const lowerLine = line.toLowerCase()

            if (lowerLine.includes('stage 1') || lowerLine.includes('research gap')) {
              sendEvent({ stage: 1, status: 'running', message: 'Analyzing competitors...' })
              currentStage = 1
            } else if (lowerLine.includes('stage 2') || lowerLine.includes('topic generat')) {
              if (currentStage === 1) {
                sendEvent({ stage: 1, status: 'completed', message: 'Research gaps identified' })
              }
              sendEvent({ stage: 2, status: 'running', message: 'Generating strategic topics...' })
              currentStage = 2
            } else if (lowerLine.includes('stage 3') || lowerLine.includes('deep research')) {
              if (currentStage === 2) {
                sendEvent({ stage: 2, status: 'completed', message: 'Topics generated' })
              }
              sendEvent({ stage: 3, status: 'running', message: 'Deep competitor analysis...' })
              currentStage = 3
            } else if (lowerLine.includes('stage 4') || lowerLine.includes('content creat')) {
              if (currentStage === 3) {
                sendEvent({ stage: 3, status: 'completed', message: 'Research completed' })
              }
              sendEvent({ stage: 4, status: 'running', message: 'Creating E-E-A-T content...' })
              currentStage = 4
            } else if (lowerLine.includes('stage 5') || lowerLine.includes('seo optimiz')) {
              if (currentStage === 4) {
                sendEvent({ stage: 4, status: 'completed', message: 'Content created' })
              }
              sendEvent({ stage: 5, status: 'running', message: 'Optimizing SEO metadata...' })
              currentStage = 5
            } else if (lowerLine.includes('stage 6') || lowerLine.includes('publicat')) {
              if (currentStage === 5) {
                sendEvent({ stage: 5, status: 'completed', message: 'SEO optimized' })
              }
              sendEvent({ stage: 6, status: 'running', message: 'Publishing to WordPress + Sanity...' })
              currentStage = 6
            } else if (lowerLine.includes('stage 7') || lowerLine.includes('complet')) {
              if (currentStage === 6) {
                sendEvent({ stage: 6, status: 'completed', message: 'Content published' })
              }
              sendEvent({ stage: 7, status: 'running', message: 'Finalizing workflow...' })
              currentStage = 7
            }

            // Detect completion
            if (lowerLine.includes('workflow complete') || lowerLine.includes('finished')) {
              sendEvent({ stage: 7, status: 'completed', message: 'Workflow completed!' })
              sendEvent({ log: '✅ All stages completed successfully!' })
            }

            // Detect errors
            if (lowerLine.includes('error') && !lowerLine.includes('0 error')) {
              const stageWithError = currentStage || 1
              sendEvent({
                stage: stageWithError,
                status: 'error',
                message: 'Error occurred - check logs'
              })
            }
          }
        })

        // Handle stderr
        nodeProcess.stderr.on('data', (data: Buffer) => {
          const error = data.toString()
          sendEvent({ log: `⚠️  ${error}` })
        })

        // Handle process completion
        await new Promise<void>((resolve, reject) => {
          nodeProcess.on('close', (code) => {
            if (code === 0) {
              sendEvent({ log: '🎉 Process completed successfully!' })

              // Mark all remaining stages as completed
              for (let i = 1; i <= 7; i++) {
                sendEvent({ stage: i, status: 'completed', message: 'Done' })
              }

              resolve()
            } else {
              sendEvent({ log: `❌ Process exited with code ${code}` })
              reject(new Error(`Process exited with code ${code}`))
            }
          })

          nodeProcess.on('error', (error) => {
            sendEvent({ log: `❌ Process error: ${error.message}` })
            reject(error)
          })
        })

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        sendEvent({ log: `❌ Fatal error: ${errorMessage}` })
        sendEvent({ stage: currentStage || 1, status: 'error', message: errorMessage })
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
