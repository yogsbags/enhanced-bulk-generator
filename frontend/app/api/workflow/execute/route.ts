import { spawn } from 'child_process'
import { NextRequest } from 'next/server'
import path from 'path'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 300 // 5 minutes (Vercel Pro plan)

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

        // Check if we're in Netlify environment
        if (process.env.NETLIFY === 'true' || process.env.AWS_LAMBDA_FUNCTION_NAME) {
          // In Netlify: Use the dedicated Netlify Function for workflow execution
          sendEvent({ log: '🔧 Initializing workflow execution via Netlify Function...' })
          sendEvent({ log: `📊 Topic Limit: ${topicLimit}` })
          sendEvent({ log: `📂 Category Focus: ${category}` })

          try {
            // In Netlify, we need to construct the full URL for the function
            // Get the current site URL from environment or construct from request
            const siteUrl = process.env.URL || process.env.DEPLOY_PRIME_URL || 'https://content-creator-pl.netlify.app'
            const functionUrl = `${siteUrl}/.netlify/functions/workflow-execute`

            sendEvent({ log: `📍 Calling function: ${functionUrl}` })

            const response = await fetch(functionUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ topicLimit, category }),
            })

            sendEvent({ log: `📡 Response status: ${response.status} ${response.statusText}` })

            if (!response.ok) {
              const errorText = await response.text()
              sendEvent({ log: `❌ HTTP Error: ${errorText}` })
              sendEvent({ stage: 1, status: 'error', message: `HTTP ${response.status}: ${response.statusText}` })
              return
            }

            const result = await response.json()
            sendEvent({ log: `📦 Response received: ${JSON.stringify(result).substring(0, 200)}...` })

            if (result.success) {
              // Stream output logs
              for (const line of result.output || []) {
                sendEvent({ log: line })
              }
              sendEvent({ log: '🎉 Workflow completed successfully!' })

              // Parse logs to determine actual stage progress, then mark remaining stages
              // For now, conservatively mark only final stage
              sendEvent({ stage: 7, status: 'completed', message: 'Workflow completed!' })
            } else {
              sendEvent({ log: `❌ Error: ${result.error}` })
              if (result.errorOutput) {
                for (const line of result.errorOutput) {
                  sendEvent({ log: `⚠️  ${line}` })
                }
              }
              sendEvent({ stage: 1, status: 'error', message: result.error || 'Unknown error' })
            }
          } catch (error: any) {
            sendEvent({ log: `❌ Fatal error: ${error.message}` })
            sendEvent({ stage: 1, status: 'error', message: error.message })
          }
        } else {
          // Vercel/Local: Execute main.js from backend directory
          const mainJsPath = path.join(process.cwd(), 'backend', 'main.js')
          const workingDir = path.join(process.cwd(), 'backend')

          sendEvent({ log: '🔧 Initializing workflow execution...' })
          sendEvent({ log: `📍 Executing: ${mainJsPath}` })
          sendEvent({ log: `📍 Working Dir: ${workingDir}` })
          sendEvent({ log: `📊 Topic Limit: ${topicLimit}` })
          sendEvent({ log: `📂 Category Focus: ${category}` })

          // Execute main.js with 'full' command, topic limit, and category
          const args = [mainJsPath, 'full', '--auto-approve', '--topic-limit', topicLimit.toString(), '--category', category]

          // Add parent node_modules to NODE_PATH for Vercel deployment
          const parentNodeModules = path.join(process.cwd(), 'node_modules')
          const nodeEnv = {
            ...process.env,
            NODE_PATH: parentNodeModules + (process.env.NODE_PATH ? ':' + process.env.NODE_PATH : '')
          }

          const nodeProcess = spawn('node', args, {
            cwd: workingDir,
            env: nodeEnv,
          })

          sendEvent({ log: `🚀 Command: node ${args.slice(1).join(' ')}` })

          // Handle stdout
          nodeProcess.stdout.on('data', (data: Buffer) => {
            const output = data.toString()
            const lines = output.split('\n').filter(line => line.trim())

            for (const line of lines) {
              sendEvent({ log: line })

              // Detect stage changes based on output
              // Only match actual execution markers (🎯, ✅, ❌) not initialization text
              const lowerLine = line.toLowerCase()

              // Stage 1: Research Phase
              if (lowerLine.includes('🎯 executing stage: research') ||
                  (lowerLine.includes('📍 stage 1:') && lowerLine.includes('research'))) {
                sendEvent({ stage: 1, status: 'running', message: 'Analyzing competitors...' })
                currentStage = 1
              } else if (lowerLine.includes('✅ research stage completed') ||
                         lowerLine.includes('✅ stage 1 complete')) {
                sendEvent({ stage: 1, status: 'completed', message: 'Research gaps identified' })
              }

              // Stage 2: Topic Generation
              else if (lowerLine.includes('🎯 executing stage: topics') ||
                       (lowerLine.includes('📍 stage 2:') && lowerLine.includes('topic'))) {
                sendEvent({ stage: 2, status: 'running', message: 'Generating strategic topics...' })
                currentStage = 2
              } else if (lowerLine.includes('✅ topic generation completed') ||
                         lowerLine.includes('✅ stage 2 complete')) {
                sendEvent({ stage: 2, status: 'completed', message: 'Topics generated' })
              }

              // Stage 3: Deep Research
              else if (lowerLine.includes('🎯 executing stage: deep-research') ||
                       lowerLine.includes('📍 stage 3:')) {
                sendEvent({ stage: 3, status: 'running', message: 'Deep competitor analysis...' })
                currentStage = 3
              } else if (lowerLine.includes('✅ deep research completed') ||
                         lowerLine.includes('✅ stage 3 complete')) {
                sendEvent({ stage: 3, status: 'completed', message: 'Research completed' })
              }

              // Stage 4: Content Creation
              else if (lowerLine.includes('🎯 executing stage: content') ||
                       lowerLine.includes('📍 stage 4:')) {
                sendEvent({ stage: 4, status: 'running', message: 'Creating E-E-A-T content...' })
                currentStage = 4
              } else if (lowerLine.includes('✅ content creation completed') ||
                         lowerLine.includes('✅ stage 4 complete')) {
                sendEvent({ stage: 4, status: 'completed', message: 'Content created' })
              }

              // Stage 5: SEO Optimization
              else if (lowerLine.includes('🎯 executing stage: seo') ||
                       lowerLine.includes('📍 stage 5:')) {
                sendEvent({ stage: 5, status: 'running', message: 'Optimizing SEO metadata...' })
                currentStage = 5
              } else if (lowerLine.includes('✅ seo optimization completed') ||
                         lowerLine.includes('✅ stage 5 complete')) {
                sendEvent({ stage: 5, status: 'completed', message: 'SEO optimized' })
              }

              // Stage 6: Publication
              else if (lowerLine.includes('🎯 executing stage: publication') ||
                       lowerLine.includes('📍 stage 6:')) {
                sendEvent({ stage: 6, status: 'running', message: 'Publishing to WordPress + Sanity...' })
                currentStage = 6
              } else if (lowerLine.includes('✅ publication completed') ||
                         lowerLine.includes('✅ stage 6 complete')) {
                sendEvent({ stage: 6, status: 'completed', message: 'Content published' })
              }

              // Stage 7: Completion
              // Only trigger when actually executing stage 7, not during initialization
              else if (lowerLine.includes('🎯 executing stage: completion') ||
                       (lowerLine.includes('📍 stage 7:') && lowerLine.includes('completion'))) {
                sendEvent({ stage: 7, status: 'running', message: 'Finalizing workflow...' })
                currentStage = 7
              }

              // Detect completion
              if (lowerLine.includes('workflow complete') || lowerLine.includes('finished')) {
                sendEvent({ stage: 7, status: 'completed', message: 'Workflow completed!' })
                sendEvent({ log: '✅ All stages completed successfully!' })
              }

              // Detect FATAL errors only (not warnings or optional API failures)
              // Only trigger on actual stage failures, not Google Ads/API warnings
              if ((lowerLine.includes('❌ stage') ||
                   lowerLine.includes('fatal') ||
                   lowerLine.includes('process exited with code') ||
                   lowerLine.includes('workflow failed')) &&
                  !lowerLine.includes('0 error')) {
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

                // Only mark final stage as completed if not already done
                if (currentStage < 7) {
                  sendEvent({ stage: 7, status: 'completed', message: 'Workflow completed!' })
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
        }

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
