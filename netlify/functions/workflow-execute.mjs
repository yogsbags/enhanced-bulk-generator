import { spawn } from 'child_process'
import path from 'path'
import { dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export const handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    }
  }

  const body = JSON.parse(event.body || '{}')
  const topicLimit = body.topicLimit || 1
  const category = body.category || 'derivatives'

  // Backend files are copied to the same directory as the function during build
  // (netlify/functions/workflow-execute/ contains both index.mjs and backend files)
  const functionDir = __dirname
  const mainJsPath = path.join(functionDir, 'main.js')

  console.log('Workflow Execution Request:', {
    functionDir,
    mainJsPath,
    topicLimit,
    category,
  })

  // For streaming responses, we need to use a different approach
  // Netlify Functions don't support SSE well, so we'll return the full output
  return new Promise((resolve, reject) => {
    // In AWS Lambda (Netlify Functions), use process.execPath for the Node.js executable
    // instead of relying on 'node' being in PATH
    const nodeExecutable = process.execPath
    const args = [mainJsPath, 'full', '--auto-approve', '--topic-limit', topicLimit.toString(), '--category', category]

    console.log('Spawning process:', {
      nodeExecutable,
      args,
      cwd: functionDir,
    })

    const nodeProcess = spawn(nodeExecutable, args, {
      cwd: functionDir,
      env: { ...process.env },
    })

    let output = []
    let errorOutput = []

    nodeProcess.stdout.on('data', (data) => {
      const lines = data.toString().split('\n').filter(line => line.trim())
      output.push(...lines)
      console.log('STDOUT:', data.toString())
    })

    nodeProcess.stderr.on('data', (data) => {
      const error = data.toString()
      errorOutput.push(error)
      console.error('STDERR:', error)
    })

    nodeProcess.on('close', (code) => {
      console.log('Process exited with code:', code)

      if (code === 0) {
        resolve({
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            success: true,
            output: output,
            exitCode: code,
          }),
        })
      } else {
        resolve({
          statusCode: 500,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            success: false,
            error: 'Workflow execution failed',
            output: output,
            errorOutput: errorOutput,
            exitCode: code,
          }),
        })
      }
    })

    nodeProcess.on('error', (error) => {
      console.error('Process error:', error)
      resolve({
        statusCode: 500,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          success: false,
          error: error.message,
          output: output,
          errorOutput: errorOutput,
        }),
      })
    })

    // Timeout after 10 minutes (Netlify function limit is 26 seconds on free tier, 60s on Pro)
    setTimeout(() => {
      nodeProcess.kill()
      resolve({
        statusCode: 504,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          success: false,
          error: 'Workflow execution timeout',
          output: output,
          errorOutput: errorOutput,
        }),
      })
    }, 600000)
  })
}
