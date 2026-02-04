'use client'

import { useState } from 'react'
import { fetchWorkflowData } from '../lib/fetch-workflow-data'
import EditModal from './components/EditModal'

type WorkflowStage = {
  id: number
  name: string
  status: 'idle' | 'running' | 'completed' | 'error'
  message: string
}

type PublishedUrls = {
  wordpress?: string
  uatWordpress?: string
  frontend?: string
  sanityDesk?: string
}

type StageData = {
  data: any[]
  summary: {
    total: number
    showing: number
    approved: number
  }
  file: string
  googleSheetsUrl?: string
}

export default function Home() {
  const [isRunning, setIsRunning] = useState(false)
  const [stages, setStages] = useState<WorkflowStage[]>([
    { id: 1, name: 'Stage 1: SEO Research', status: 'idle', message: '' },
    { id: 2, name: 'Stage 2: Topic Generation', status: 'idle', message: '' },
    { id: 3, name: 'Stage 3: Deep Research', status: 'idle', message: '' },
    { id: 4, name: 'Stage 4: Content Creation', status: 'idle', message: '' },
    { id: 5, name: 'Stage 5: Content Validation', status: 'idle', message: '' },
    { id: 6, name: 'Stage 6: SEO Optimization', status: 'idle', message: '' },
    { id: 7, name: 'Stage 7: Publication', status: 'idle', message: '' },
    { id: 8, name: 'Stage 8: Completion', status: 'idle', message: '' },
  ])
  const [logs, setLogs] = useState<string[]>([])
  const [publishedUrls, setPublishedUrls] = useState<PublishedUrls>({})
  const [stageData, setStageData] = useState<Record<number, StageData>>({})
  const [expandedStage, setExpandedStage] = useState<number | null>(null)
  const [topicLimit, setTopicLimit] = useState<number>(1)
  const [executionMode, setExecutionMode] = useState<'full' | 'staged'>('full')
  const [executingStage, setExecutingStage] = useState<number | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('derivatives')
  const [customTopic, setCustomTopic] = useState<string>('')
  const [customTitle, setCustomTitle] = useState<string>('')
  const [contentOutline, setContentOutline] = useState<string>('')
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingRow, setEditingRow] = useState<{stageId: number, data: any, index: number} | null>(null)
  const [sessionContentIds, setSessionContentIds] = useState<string[]>([])
  const [stageStartTimes, setStageStartTimes] = useState<Record<number, number>>({})

  // Comprehensive broking & wealth categories
  const categories = [
    { value: 'derivatives', label: 'Derivatives (F&O, Options, Futures)' },
    { value: 'mutual_funds', label: 'Mutual Funds & ETFs' },
    { value: 'stock_market', label: 'Stock Market & Equities' },
    { value: 'commodities', label: 'Commodities (Gold, Silver, Crude)' },
    { value: 'forex', label: 'Currency & Forex Trading' },
    { value: 'bonds', label: 'Bonds & Fixed Income' },
    { value: 'ipo', label: 'IPO & SME IPO' },
    { value: 'tax_planning', label: 'Tax Planning & Optimization' },
    { value: 'retirement_planning', label: 'Retirement & Pension Planning' },
    { value: 'insurance', label: 'Insurance & Risk Management' },
    { value: 'trading_strategies', label: 'Trading Strategies (Intraday, Swing)' },
    { value: 'technical_analysis', label: 'Technical Analysis' },
    { value: 'fundamental_analysis', label: 'Fundamental Analysis' },
    { value: 'portfolio_management', label: 'Portfolio Management (PMS)' },
    { value: 'wealth_management', label: 'Wealth Management (HNI/UHNI)' },
    { value: 'real_estate', label: 'Real Estate Investment' },
    { value: 'alternative_investments', label: 'Alternative Investments (REITs, AIFs)' },
    { value: 'international_investing', label: 'International Investing (US Stocks)' },
    { value: 'demat_account', label: 'Demat Account & Broker Comparison' },
    { value: 'personal_finance', label: 'Personal Finance & Budgeting' },
    { value: 'estate_planning', label: 'Estate Planning & Succession' },
    { value: 'investment_strategies', label: 'Investment Strategies & Asset Allocation' }
  ]

  const updateStage = async (stageId: number, status: WorkflowStage['status'], message: string) => {
    // Track stage start time when it begins running (for full workflow)
    if (status === 'running' && !stageStartTimes[stageId]) {
      setStageStartTimes(prev => ({ ...prev, [stageId]: Date.now() }))
    }

    // Log stage completion duration (for full workflow)
    if (status === 'completed' && stageStartTimes[stageId]) {
      const duration = Date.now() - stageStartTimes[stageId]
      addLog(`⏱️  Stage ${stageId} duration: ${formatDuration(duration)}`)
    }

    setStages(prev => prev.map(stage =>
      stage.id === stageId ? { ...stage, status, message } : stage
    ))

    // Fetch CSV data when stage completes (with retry for transient errors)
    if (status === 'completed') {
      try {
        const response = await fetchWorkflowData(stageId)
        if (response.ok) {
          const data = await response.json()
          setStageData(prev => ({ ...prev, [stageId]: data }))
        }
      } catch (error) {
        console.error(`Failed to fetch data for stage ${stageId}:`, error)
      }
    }
  }

  const formatDuration = (durationMs: number): string => {
    const totalSeconds = Math.floor(durationMs / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60

    if (minutes > 0) {
      return `${minutes}m ${seconds}s`
    }
    return `${seconds}s`
  }

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs(prev => [...prev, `[${timestamp}] ${message}`])

    // Extract URLs from log messages
    if (message.includes('🔗 Local WordPress:')) {
      const url = message.split('🔗 Local WordPress:')[1]?.trim()
      if (url) setPublishedUrls(prev => ({ ...prev, wordpress: url }))
    } else if (message.includes('🔗 UAT WordPress:')) {
      const url = message.split('🔗 UAT WordPress:')[1]?.trim()
      if (url) setPublishedUrls(prev => ({ ...prev, uatWordpress: url }))
    } else if (message.includes('🔗 Frontend:')) {
      const url = message.split('🔗 Frontend:')[1]?.trim()
      if (url) setPublishedUrls(prev => ({ ...prev, frontend: url }))
    } else if (message.includes('🔗 Sanity Desk:')) {
      const url = message.split('🔗 Sanity Desk:')[1]?.trim()
      if (url) setPublishedUrls(prev => ({ ...prev, sanityDesk: url }))
    }
  }

  const pollJobStatus = async (jobId: string) => {
    const pollIntervalMs = 4000
    let lastLogCount = 0
    let consecutiveErrors = 0
    const MAX_CONSECUTIVE_ERRORS = 5

    while (true) {
      try {
        const res = await fetch(`/api/workflow/status?jobId=${encodeURIComponent(jobId)}`)

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`)
        }

        const data = await res.json()

        // Reset error counter on successful fetch
        if (consecutiveErrors > 0) {
          addLog(`✅ Connection restored after ${consecutiveErrors} error(s)`)
          consecutiveErrors = 0
        }
        if (data.logs?.length > lastLogCount) {
          for (let i = lastLogCount; i < data.logs.length; i++) {
            addLog(data.logs[i])
          }
          lastLogCount = data.logs.length
        }
        if (data.stage != null && data.message != null) {
          const status = data.status === 'failed' ? 'error' : (data.status === 'completed' ? 'completed' : 'running')
          await updateStage(data.stage, status, data.message)
        }
        if (data.status === 'completed') {
          addLog('✅ Completed successfully!')
          // Break immediately to reset executing state
          break
        }
        if (data.status === 'failed') {
          addLog(`❌ Failed: ${data.error || 'Unknown error'}`)
          if (data.stage != null) {
            await updateStage(data.stage, 'error', data.error || 'Failed')
          }
          break
        }

        await new Promise(r => setTimeout(r, pollIntervalMs))
      } catch (error) {
        consecutiveErrors++
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        const isTransientError = errorMessage.includes('ERR_CONNECTION_RESET') ||
                                 errorMessage.includes('Failed to fetch') ||
                                 errorMessage.includes('network error') ||
                                 errorMessage.includes('NetworkError') ||
                                 errorMessage.includes('HTTP 5')

        if (isTransientError && consecutiveErrors <= MAX_CONSECUTIVE_ERRORS) {
          // Exponential backoff: 2s, 4s, 8s, 16s, 32s
          const retryDelay = Math.min(pollIntervalMs * Math.pow(2, consecutiveErrors - 1), 32000)
          addLog(`⚠️  Polling error (${consecutiveErrors}/${MAX_CONSECUTIVE_ERRORS}): ${errorMessage}. Retrying in ${retryDelay/1000}s...`)
          await new Promise(r => setTimeout(r, retryDelay))
          continue // Retry the poll
        } else {
          addLog(`❌ Polling failed after ${consecutiveErrors} attempts: ${errorMessage}`)
          break
        }
      }
    }
  }

  const executeStage = async (stageId: number, retryCount = 0): Promise<void> => {
    const MAX_RETRIES = 3
    const RETRY_DELAY_MS = 2000

    if (retryCount === 0) {
      setExecutingStage(stageId)

      // Record start time for performance tracking
      const startTime = Date.now()
      setStageStartTimes(prev => ({ ...prev, [stageId]: startTime }))
      addLog(`🚀 Starting Stage ${stageId} execution...`)

      // Track existing content IDs before Stage 4 execution
      if (stageId === 4) {
        setSessionContentIds([])  // Clear previous session IDs

        const existingIds = stageData[4]?.data
          ?.filter((row: any) => row.content_id)
          ?.map((row: any) => row.content_id) || []

        // Store in closure for comparison after execution
        ;(executeStage as any)._preExecutionIds = existingIds
      }
    } else {
      addLog(`🔄 Retry attempt ${retryCount}/${MAX_RETRIES} for Stage ${stageId}...`)
    }

    try {
      const response = await fetch('/api/workflow/stage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stageId,
          topicLimit,
          category: selectedCategory,
          customTopic,
          customTitle,
          contentOutline,
          usePolling: true,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const contentType = response.headers.get('content-type') || ''
      if (contentType.includes('application/json')) {
        const { jobId } = await response.json()
        if (jobId) {
          await pollJobStatus(jobId)

          // Calculate and log execution duration
          const startTime = stageStartTimes[stageId]
          if (startTime) {
            const duration = Date.now() - startTime
            addLog(`✅ Stage ${stageId} completed! ⏱️  Duration: ${formatDuration(duration)}`)
          } else {
            addLog(`✅ Stage ${stageId} completed!`)
          }

          // Fetch stage data in background with retry (Railway filesystem can be slow)
          const fetchStageDataWithRetry = async (attempt = 1, maxAttempts = 3): Promise<void> => {
            const delay = attempt === 1 ? 3000 : 2000 * attempt // 3s, 4s, 6s

            await new Promise(r => setTimeout(r, delay))

            addLog(`📊 Fetching data for Stage ${stageId}... (attempt ${attempt}/${maxAttempts})`)

            try {
              const dataRes = await fetchWorkflowData(stageId)

              if (dataRes.ok) {
                const stageDataRes = await dataRes.json()

                // Check if we got actual data or empty response
                if (!stageDataRes.data || stageDataRes.data.length === 0) {
                  if (attempt < maxAttempts) {
                    addLog(`⏳ No data yet, retrying in ${2 * (attempt + 1)}s...`)
                    return fetchStageDataWithRetry(attempt + 1, maxAttempts)
                  } else {
                    addLog(`⚠️  Stage ${stageId} completed but no data found after ${maxAttempts} attempts`)
                    return
                  }
                }

                setStageData(prev => ({ ...prev, [stageId]: stageDataRes }))
                addLog(`✅ Data loaded for Stage ${stageId}: ${stageDataRes.summary?.total || 0} items`)

                // For Stage 4: identify and store newly created content IDs
                if (stageId === 4 && stageDataRes.data) {
                  const preExecutionIds = (executeStage as any)._preExecutionIds || []
                  const currentIds = stageDataRes.data
                    .filter((row: any) => row.content_id)
                    .map((row: any) => row.content_id)

                  const newIds = currentIds.filter((id: string) => !preExecutionIds.includes(id))

                  if (newIds.length > 0) {
                    setSessionContentIds(newIds)
                    addLog(`🎯 Session created ${newIds.length} new article(s)`)
                  }
                }
              } else {
                const errorText = await dataRes.text()

                if (attempt < maxAttempts && (dataRes.status === 500 || dataRes.status === 404)) {
                  addLog(`⏳ Data fetch failed (${dataRes.status}), retrying in ${2 * (attempt + 1)}s...`)
                  return fetchStageDataWithRetry(attempt + 1, maxAttempts)
                }

                addLog(`⚠️  Failed to load Stage ${stageId} data: ${dataRes.status} ${errorText}`)
              }
            } catch (err) {
              const error = err as Error

              if (attempt < maxAttempts) {
                addLog(`⏳ Network error, retrying in ${2 * (attempt + 1)}s...`)
                return fetchStageDataWithRetry(attempt + 1, maxAttempts)
              }

              addLog(`❌ Error fetching Stage ${stageId} data: ${error.message}`)
              console.error(`Failed to fetch stage ${stageId} data:`, err)
            }
          }

          fetchStageDataWithRetry()
        }
        return
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (reader) {
        let buffer = '' // Buffer for incomplete SSE messages

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          // Append chunk to buffer (don't decode with flush=true until we're sure)
          buffer += decoder.decode(value, { stream: true })

          // Split by \n\n (SSE message delimiter)
          const messages = buffer.split('\n\n')

          // Last item might be incomplete, keep it in buffer
          buffer = messages.pop() || ''

          // Process complete messages
          for (const message of messages) {
            if (message.startsWith('data: ')) {
              try {
                const jsonStr = message.slice(6).trim()
                if (jsonStr) {
                  const data = JSON.parse(jsonStr)

                  if (data.stage) {
                    await updateStage(data.stage, data.status, data.message)
                    addLog(`Stage ${data.stage}: ${data.message}`)
                  } else if (data.log) {
                    addLog(data.log)
                  }
                }
              } catch (e) {
                console.error('Parse error:', e)
                // Don't break the stream on parse errors
              }
            }
          }
        }

        // Process any remaining buffered data
        if (buffer && buffer.startsWith('data: ')) {
          try {
            const jsonStr = buffer.slice(6).trim()
            if (jsonStr) {
              const data = JSON.parse(jsonStr)
              if (data.stage) {
                await updateStage(data.stage, data.status, data.message)
                addLog(`Stage ${data.stage}: ${data.message}`)
              } else if (data.log) {
                addLog(data.log)
              }
            }
          } catch (e) {
            console.error('Final buffer parse error:', e)
          }
        }
      }

      // Calculate and log execution duration (SSE path)
      const startTime = stageStartTimes[stageId]
      if (startTime) {
        const duration = Date.now() - startTime
        addLog(`✅ Stage ${stageId} completed! ⏱️  Duration: ${formatDuration(duration)}`)
      } else {
        addLog(`✅ Stage ${stageId} completed!`)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      const isTransientError = errorMessage.includes('ERR_CONNECTION_RESET') ||
                               errorMessage.includes('Failed to fetch') ||
                               errorMessage.includes('network error') ||
                               errorMessage.includes('NetworkError')

      if (isTransientError && retryCount < MAX_RETRIES) {
        addLog(`⚠️  Transient network error: ${errorMessage}. Retrying in ${RETRY_DELAY_MS/1000}s...`)
        await new Promise(r => setTimeout(r, RETRY_DELAY_MS))
        return executeStage(stageId, retryCount + 1)
      }

      addLog(`❌ Error in Stage ${stageId}: ${errorMessage}`)
      console.error('Stage error:', error)
      await updateStage(stageId, 'error', errorMessage)
    } finally {
      if (retryCount === 0) {
        setExecutingStage(null)
      }
    }
  }

  const executeWorkflow = async () => {
    setIsRunning(true)
    setLogs([])
    setPublishedUrls({})
    setStageData({})
    setExpandedStage(null)
    setSessionContentIds([])  // Clear session content IDs for new workflow
    setStageStartTimes({})  // Clear stage timings

    setStages(stages.map(s => ({ ...s, status: 'idle', message: '' })))

    const workflowStartTime = Date.now()

    try {
      addLog('🚀 Starting full workflow execution...')

      const response = await fetch('/api/workflow/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topicLimit,
          category: selectedCategory,
          customTopic,
          customTitle,
          contentOutline,
          usePolling: true,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const contentType = response.headers.get('content-type') || ''
      if (contentType.includes('application/json')) {
        const { jobId } = await response.json()
        if (jobId) {
          addLog('📡 Polling mode (avoids proxy timeouts). Refreshing status every few seconds...')
          await pollJobStatus(jobId)

          // Fetch all stage data in background after polling completes (with retry for Railway)
          const fetchAllStagesWithRetry = async () => {
            await new Promise(r => setTimeout(r, 3000)) // Initial 3s delay
            addLog('📊 Fetching data for all stages...')

            for (let s = 1; s <= 7; s++) {
              let attempts = 0
              const maxAttempts = 2

              while (attempts < maxAttempts) {
                attempts++

                try {
                  const dataRes = await fetchWorkflowData(s)

                  if (dataRes.ok) {
                    const stageDataRes = await dataRes.json()
                    setStageData(prev => ({ ...prev, [s]: stageDataRes }))

                    // For Stage 4: store all content IDs as session IDs (full workflow created all of them)
                    if (s === 4 && stageDataRes.data) {
                      const contentIds = stageDataRes.data
                        .filter((row: any) => row.content_id)
                        .map((row: any) => row.content_id)

                      if (contentIds.length > 0) {
                        setSessionContentIds(contentIds)
                        addLog(`🎯 Workflow created ${contentIds.length} article(s) in total`)
                      }
                    }
                    break // Success, exit retry loop
                  } else if (attempts < maxAttempts) {
                    await new Promise(r => setTimeout(r, 2000))
                    continue
                  }
                } catch (err) {
                  if (attempts < maxAttempts) {
                    await new Promise(r => setTimeout(r, 2000))
                    continue
                  }
                  console.warn(`Failed to fetch stage ${s} data after ${maxAttempts} attempts:`, err)
                }
              }
            }
          }

          fetchAllStagesWithRetry()
        }
        return
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          const lines = chunk.split('\n\n')

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6))

                if (data.stage) {
                  updateStage(data.stage, data.status, data.message)
                  addLog(`Stage ${data.stage}: ${data.message}`)
                } else if (data.log) {
                  addLog(data.log)
                }
              } catch (e) {
                console.error('Parse error:', e)
              }
            }
          }
        }
      }

      // Log total workflow duration
      const workflowDuration = Date.now() - workflowStartTime
      addLog(`✅ Workflow completed successfully! ⏱️  Total Duration: ${formatDuration(workflowDuration)}`)
    } catch (error) {
      addLog(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      console.error('Workflow error:', error)
    } finally {
      setIsRunning(false)
    }
  }

  const getStatusIcon = (status: WorkflowStage['status']) => {
    switch (status) {
      case 'idle': return '⚪'
      case 'running': return '🔵'
      case 'completed': return '✅'
      case 'error': return '❌'
    }
  }

  const getStatusColor = (status: WorkflowStage['status']) => {
    switch (status) {
      case 'idle': return 'text-gray-400'
      case 'running': return 'text-blue-500 animate-pulse'
      case 'completed': return 'text-green-500'
      case 'error': return 'text-red-500'
    }
  }

  const handleEditRow = (stageId: number, rowData: any, rowIndex: number) => {
    setEditingRow({ stageId, data: rowData, index: rowIndex })
    setEditModalOpen(true)
  }

  const handleEditSubmit = async (editedData: Record<string, any>) => {
    if (!editingRow) return

    try {
      addLog(`📝 Submitting edited data for ${stages[editingRow.stageId - 1].name}...`)

      const response = await fetch('/api/workflow/edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stageId: editingRow.stageId,
          rowIndex: editingRow.index,
          data: editedData
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      // Refresh stage data (with retry for transient errors)
      const dataResponse = await fetchWorkflowData(editingRow.stageId)
      if (dataResponse.ok) {
        const data = await dataResponse.json()
        setStageData(prev => ({ ...prev, [editingRow.stageId]: data }))
      }

      addLog(`✅ Successfully updated ${stages[editingRow.stageId - 1].name} data`)

      if (result.message) {
        addLog(`   ${result.message}`)
      }
    } catch (error) {
      addLog(`❌ Failed to update data: ${error instanceof Error ? error.message : 'Unknown error'}`)
      throw error
    }
  }

  const isContentStage = (stageId: number) => {
    // Stages 4 (Content Creation) and 5 (Content Validation) use rich text editor
    return stageId === 4 || stageId === 5
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            PL Capital Content Engine
          </h1>
          <p className="text-gray-600 text-lg">
            AI-Powered Content Workflow Automation
          </p>
          <div className="mt-4 flex items-center gap-4">
            <div className="px-4 py-2 bg-blue-50 rounded-lg">
              <span className="text-sm text-gray-600">Target:</span>
              <span className="ml-2 font-semibold text-blue-600">1,800 articles/year</span>
            </div>
            <div className="px-4 py-2 bg-green-50 rounded-lg">
              <span className="text-sm text-gray-600">Goal:</span>
              <span className="ml-2 font-semibold text-green-600">1M monthly visitors</span>
            </div>
          </div>
        </div>

        {/* Main Control */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Workflow Control
          </h2>

          {/* Execution Mode Toggle */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Execution Mode:
            </label>
            <div className="flex gap-4">
              <button
                onClick={() => setExecutionMode('full')}
                disabled={isRunning || executingStage !== null}
                className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all ${
                  executionMode === 'full'
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-blue-300'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <div className="flex items-center justify-center gap-2">
                  <span>⚡</span>
                  <span>Full Workflow</span>
                </div>
                <p className="text-xs mt-1 opacity-80">Execute all 8 stages automatically</p>
              </button>
              <button
                onClick={() => setExecutionMode('staged')}
                disabled={isRunning || executingStage !== null}
                className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all ${
                  executionMode === 'staged'
                    ? 'bg-purple-500 text-white shadow-md'
                    : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-purple-300'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <div className="flex items-center justify-center gap-2">
                  <span>🎯</span>
                  <span>Stage-by-Stage</span>
                </div>
                <p className="text-xs mt-1 opacity-80">Review output and approve each stage</p>
              </button>
            </div>
          </div>

          {/* Controls Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Category Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content Category:
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                disabled={isRunning || executingStage !== null}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none font-medium text-gray-800 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Focus research on specific category
              </p>
            </div>

            {/* Custom Topic Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custom Topic (Optional):
              </label>
              <input
                type="text"
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
                disabled={isRunning || executingStage !== null}
                placeholder="e.g., wealth maximization"
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none font-medium text-gray-800 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">
                ✨ Stage 1 will research this custom topic instead of category (overrides category)
              </p>
            </div>
          </div>

          {/* Custom Title Row */}
          <div className="grid grid-cols-1 gap-6 mb-6">
            {/* Custom Title Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custom Title (Optional):
              </label>
              <input
                type="text"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                disabled={isRunning || executingStage !== null}
                placeholder="e.g., Best Options Strategies for Beginners"
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none font-medium text-gray-800 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">
                🚀 Bypass Stages 1-2 - Jump straight to deep research & content creation (Stage 3+)
              </p>
            </div>
          </div>

          {/* Content Outline Row */}
          <div className="grid grid-cols-1 gap-6 mb-6">
            {/* Content Outline Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content Outline (Optional):
              </label>
              <textarea
                value={contentOutline}
                onChange={(e) => setContentOutline(e.target.value)}
                disabled={isRunning || executingStage !== null}
                placeholder={"## Introduction\nBrief overview of derivatives trading\n\n## What are Derivatives?\n### Types of Derivatives\n- Futures\n- Options\n\n## How to Trade Derivatives\nStep-by-step guide\n\n## Risk Management\nImportant considerations\n\n## Conclusion\nKey takeaways"}
                rows={12}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none font-mono text-sm text-gray-800 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              <div className="flex items-start gap-2 mt-2">
                <div className="flex-1">
                  <p className="text-xs text-gray-500">
                    📝 Provide a custom content structure. AI will follow this exact outline when generating the article.
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    💡 Supports markdown headers (##, ###), bullet points, and plain text. Newlines are preserved as-is.
                  </p>
                </div>
                <div className="text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded border border-gray-200">
                  {contentOutline.split('\n').length} lines • {contentOutline.length} chars
                </div>
              </div>
            </div>
          </div>

          {/* Topic Limit Control Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Topic Limit Control */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Topic Limit:
              </label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setTopicLimit(Math.max(1, topicLimit - 1))}
                  disabled={isRunning || executingStage !== null || topicLimit <= 1}
                  className="w-8 h-8 rounded bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed font-bold text-gray-700"
                >
                  −
                </button>
                <input
                  type="number"
                  value={topicLimit}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 1
                    setTopicLimit(Math.min(50, Math.max(1, val)))
                  }}
                  disabled={isRunning || executingStage !== null}
                  min="1"
                  max="50"
                  className="w-20 px-2 py-2 text-center border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none font-semibold text-gray-800 disabled:bg-gray-100"
                />
                <button
                  onClick={() => setTopicLimit(Math.min(50, topicLimit + 1))}
                  disabled={isRunning || executingStage !== null || topicLimit >= 50}
                  className="w-8 h-8 rounded bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed font-bold text-gray-700"
                >
                  +
                </button>
                <span className="text-xs text-gray-500 ml-2">
                  (1-50 topics)
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Number of topics to generate
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between mb-6">
            <div></div>

            {/* Full Workflow Button (only shown in full mode) */}
            {executionMode === 'full' && (
              <button
                onClick={executeWorkflow}
                disabled={isRunning || executingStage !== null}
                className={`px-8 py-4 rounded-lg font-semibold text-lg transition-all transform hover:scale-105 ${
                  isRunning || executingStage !== null
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl'
                }`}
              >
                {isRunning ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Running...
                  </span>
                ) : (
                  '🚀 Execute Full Workflow'
                )}
              </button>
            )}

            {/* Staged Mode Info */}
            {executionMode === 'staged' && (
              <div className="text-sm text-gray-600 bg-purple-50 px-4 py-3 rounded-lg border-2 border-purple-200">
                <p className="font-semibold text-purple-700">Stage-by-Stage Mode Active</p>
                <p className="text-xs mt-1">Execute and review each stage individually below</p>
              </div>
            )}
          </div>

          {/* Workflow Stages */}
          <div className="space-y-3">
            {stages.map((stage) => (
              <div
                key={stage.id}
                className={`rounded-lg border-2 transition-all ${
                  stage.status === 'running'
                    ? 'border-blue-300 bg-blue-50'
                    : stage.status === 'completed'
                    ? 'border-green-300 bg-green-50'
                    : stage.status === 'error'
                    ? 'border-red-300 bg-red-50'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <span className={`text-2xl ${getStatusColor(stage.status)}`}>
                        {getStatusIcon(stage.status)}
                      </span>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800">{stage.name}</h3>
                        {stage.message && (
                          <p className="text-sm text-gray-600 mt-1">{stage.message}</p>
                        )}
                        {stageData[stage.id]?.summary && (
                          <p className="text-xs text-gray-500 mt-1">
                            📊 {stageData[stage.id].summary.total} items • {stageData[stage.id].summary.approved} approved
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {stage.status === 'running' && (
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      )}

                      {/* Google Sheets Button (available after completion) */}
                      {stageData[stage.id]?.googleSheetsUrl && stage.status === 'completed' && (
                        <a
                          href={stageData[stage.id].googleSheetsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center gap-1"
                          title="View in Google Sheets"
                        >
                          📊 Google Sheets
                        </a>
                      )}

                      {/* View Data Button (available after completion) */}
                      {stageData[stage.id]?.data && stage.status === 'completed' && (
                        <button
                          onClick={() => setExpandedStage(expandedStage === stage.id ? null : stage.id)}
                          className="text-sm px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                        >
                          {expandedStage === stage.id ? '▲ Hide Data' : '▼ View Data'}
                        </button>
                      )}

                      {/* Stage Execution Button (only in staged mode) */}
                      {executionMode === 'staged' && (
                        <>
                          {stage.id === 1 ? (
                            // Stage 1: Always enabled (can start workflow)
                            <button
                              onClick={() => executeStage(stage.id)}
                              disabled={executingStage !== null || isRunning || stage.status === 'completed'}
                              className={`text-sm px-4 py-2 rounded-lg font-semibold transition-all ${
                                executingStage === stage.id
                                  ? 'bg-purple-400 text-white cursor-wait'
                                  : stage.status === 'completed'
                                  ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                                  : 'bg-purple-500 text-white hover:bg-purple-600 shadow-md hover:shadow-lg'
                              }`}
                            >
                              {stage.status === 'completed' ? (
                                '✓ Completed'
                              ) : executingStage === stage.id ? (
                                <span className="flex items-center gap-2">
                                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                  </svg>
                                  Executing...
                                </span>
                              ) : (
                                '▶ Execute Stage'
                              )}
                            </button>
                          ) : (
                            // Stages 2-7: Enabled only if previous stage is completed
                            <button
                              onClick={() => executeStage(stage.id)}
                              disabled={
                                executingStage !== null ||
                                isRunning ||
                                stage.status === 'completed' ||
                                stages[stage.id - 2]?.status !== 'completed'
                              }
                              className={`text-sm px-4 py-2 rounded-lg font-semibold transition-all ${
                                executingStage === stage.id
                                  ? 'bg-purple-400 text-white cursor-wait'
                                  : stage.status === 'completed'
                                  ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                                  : stages[stage.id - 2]?.status !== 'completed'
                                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                  : 'bg-purple-500 text-white hover:bg-purple-600 shadow-md hover:shadow-lg'
                              }`}
                            >
                              {stage.status === 'completed' ? (
                                '✓ Completed'
                              ) : executingStage === stage.id ? (
                                <span className="flex items-center gap-2">
                                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                  </svg>
                                  Executing...
                                </span>
                              ) : stages[stage.id - 2]?.status !== 'completed' ? (
                                '⏸ Waiting'
                              ) : (
                                '✅ Approve & Continue'
                              )}
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Expandable CSV Data */}
                {expandedStage === stage.id && stageData[stage.id]?.data && stageData[stage.id]?.summary && (
                  <div className="border-t-2 border-green-200 p-4 bg-white">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <h4 className="font-semibold text-gray-700">
                          📄 {stageData[stage.id].file} (Showing last {stageData[stage.id].summary.showing} of {stageData[stage.id].summary.total})
                        </h4>
                        <button
                          onClick={async () => {
                            try {
                              const response = await fetch(`/api/workflow/download-csv?filename=${encodeURIComponent(stageData[stage.id].file)}`)
                              if (!response.ok) {
                                const error = await response.json()
                                alert(`Download failed: ${error.error}`)
                                return
                              }
                              const blob = await response.blob()
                              const url = window.URL.createObjectURL(blob)
                              const a = document.createElement('a')
                              a.href = url
                              a.download = stageData[stage.id].file
                              document.body.appendChild(a)
                              a.click()
                              window.URL.revokeObjectURL(url)
                              document.body.removeChild(a)
                            } catch (error) {
                              alert('Download failed: ' + (error instanceof Error ? error.message : 'Unknown error'))
                            }
                          }}
                          className="text-xs px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors flex items-center gap-1"
                        >
                          📥 Download CSV
                        </button>

                        {/* Download Markdown Button (for content stages 4-5) - downloads current session or all visible articles */}
                        {(stage.id === 4 || stage.id === 5) && stageData[stage.id].data.some((row: any) => row.content_id && row.article_content) && (
                          <button
                            onClick={async () => {
                              try {
                                // Use session content IDs if available (current execution only), otherwise all visible
                                const ids = sessionContentIds.length > 0
                                  ? sessionContentIds
                                  : stageData[stage.id].data
                                      .filter((row: any) => row.content_id && row.article_content)
                                      .map((r: any) => r.content_id)

                                if (ids.length === 0) {
                                  alert('No content to download')
                                  return
                                }
                                const query = ids.length === 1
                                  ? `contentId=${encodeURIComponent(ids[0])}`
                                  : `contentIds=${ids.map((id: string) => encodeURIComponent(id)).join(',')}`
                                const response = await fetch(`/api/workflow/download-markdown?${query}`)
                                if (!response.ok) {
                                  const contentType = response.headers.get('content-type') || ''
                                  const error = contentType.includes('application/json')
                                    ? await response.json()
                                    : { error: await response.text() }
                                  alert(`Download failed: ${error.error || error.message || 'Unknown error'}`)
                                  return
                                }
                                const blob = await response.blob()
                                const url = window.URL.createObjectURL(blob)
                                const a = document.createElement('a')
                                a.href = url
                                a.download = response.headers.get('Content-Disposition')?.split('filename=')[1]?.replace(/"/g, '') || (ids.length > 1 ? 'articles-markdown.zip' : 'article.md')
                                document.body.appendChild(a)
                                a.click()
                                window.URL.revokeObjectURL(url)
                                document.body.removeChild(a)
                                addLog(`✅ Downloaded Markdown${ids.length > 1 ? ` (${ids.length} articles)` : ''}`)
                              } catch (error) {
                                alert('Markdown download failed: ' + (error instanceof Error ? error.message : 'Unknown error'))
                              }
                            }}
                            className="text-xs px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center gap-1"
                          >
                            📝 Download Markdown
                          </button>
                        )}

                        {/* Download HTML Button (for content stages 4-5) - downloads current session or all visible articles */}
                        {(stage.id === 4 || stage.id === 5) && stageData[stage.id].data.some((row: any) => row.content_id && row.article_content) && (
                          <button
                            onClick={async () => {
                              try {
                                // Use session content IDs if available (current execution only), otherwise all visible
                                const ids = sessionContentIds.length > 0
                                  ? sessionContentIds
                                  : stageData[stage.id].data
                                      .filter((row: any) => row.content_id && row.article_content)
                                      .map((r: any) => r.content_id)

                                if (ids.length === 0) {
                                  alert('No content to download')
                                  return
                                }
                                const query = ids.length === 1
                                  ? `contentId=${encodeURIComponent(ids[0])}`
                                  : `contentIds=${ids.map((id: string) => encodeURIComponent(id)).join(',')}`
                                const response = await fetch(`/api/workflow/download-html?${query}`)
                                if (!response.ok) {
                                  const contentType = response.headers.get('content-type') || ''
                                  const error = contentType.includes('application/json')
                                    ? await response.json()
                                    : { error: await response.text() }
                                  alert(`Download failed: ${error.error || error.message || 'Unknown error'}`)
                                  return
                                }
                                const blob = await response.blob()
                                const url = window.URL.createObjectURL(blob)
                                const a = document.createElement('a')
                                a.href = url
                                a.download = response.headers.get('Content-Disposition')?.split('filename=')[1]?.replace(/"/g, '') || (ids.length > 1 ? 'articles-html.zip' : 'article.html')
                                document.body.appendChild(a)
                                a.click()
                                window.URL.revokeObjectURL(url)
                                document.body.removeChild(a)
                                addLog(`✅ Downloaded HTML${ids.length > 1 ? ` (${ids.length} articles)` : ''}`)
                              } catch (error) {
                                alert('HTML download failed: ' + (error instanceof Error ? error.message : 'Unknown error'))
                              }
                            }}
                            className="text-xs px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors flex items-center gap-1"
                          >
                            📄 Download HTML
                          </button>
                        )}

                        {/* Download Raw Content Button (for content stages 4-5) - downloads current session or all visible articles */}
                        {(stage.id === 4 || stage.id === 5) && stageData[stage.id].data.some((row: any) => row.content_id && row.article_content) && (
                          <button
                            onClick={async () => {
                              try {
                                // Use session content IDs if available (current execution only), otherwise all visible
                                const ids = sessionContentIds.length > 0
                                  ? sessionContentIds
                                  : stageData[stage.id].data
                                      .filter((row: any) => row.content_id && row.article_content)
                                      .map((r: any) => r.content_id)

                                if (ids.length === 0) {
                                  alert('No content to download')
                                  return
                                }
                                const query = ids.length === 1
                                  ? `contentId=${encodeURIComponent(ids[0])}`
                                  : `contentIds=${ids.map((id: string) => encodeURIComponent(id)).join(',')}`
                                const response = await fetch(`/api/workflow/download-raw-markdown?${query}`)
                                if (!response.ok) {
                                  const contentType = response.headers.get('content-type') || ''
                                  const error = contentType.includes('application/json')
                                    ? await response.json()
                                    : { error: await response.text() }
                                  alert(`Download failed: ${error.error || error.message || 'Unknown error'}`)
                                  return
                                }
                                const blob = await response.blob()
                                const url = window.URL.createObjectURL(blob)
                                const a = document.createElement('a')
                                a.href = url
                                a.download = response.headers.get('Content-Disposition')?.split('filename=')[1]?.replace(/"/g, '') || (ids.length > 1 ? 'articles-raw-markdown.zip' : 'article-raw.md')
                                document.body.appendChild(a)
                                a.click()
                                window.URL.revokeObjectURL(url)
                                document.body.removeChild(a)
                                addLog(`✅ Downloaded Raw Content${ids.length > 1 ? ` (${ids.length} articles)` : ''}`)
                              } catch (error) {
                                alert('Raw content download failed: ' + (error instanceof Error ? error.message : 'Unknown error'))
                              }
                            }}
                            className="text-xs px-3 py-1 bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors flex items-center gap-1"
                          >
                            🔍 Download Raw Content
                          </button>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">
                        ✅ {stageData[stage.id].summary.approved} approved
                      </span>
                    </div>
                    <div className="overflow-x-auto">
                      <div className="max-h-96 overflow-y-auto">
                        {stageData[stage.id].data.map((row: any, idx: number) => (
                          <div key={idx} className="mb-3 p-3 bg-gray-50 rounded border border-gray-200 text-xs relative">
                            {/* Edit Button */}
                            <button
                              onClick={() => handleEditRow(stage.id, row, idx)}
                              className="absolute top-2 right-2 px-3 py-1 bg-amber-500 text-white rounded hover:bg-amber-600 transition-colors flex items-center gap-1 text-xs font-semibold shadow-md hover:shadow-lg"
                              title="Edit this row"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              Edit
                            </button>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 pr-16">
                              {Object.entries(row).slice(0, 6).map(([key, value]) => (
                                <div key={key} className="break-words">
                                  <span className="font-semibold text-gray-600">{key}:</span>
                                  <span className="ml-1 text-gray-800">
                                    {typeof value === 'string' && value.length > 100
                                      ? value.substring(0, 100) + '...'
                                      : String(value)}
                                  </span>
                                </div>
                              ))}
                            </div>
                            {Object.keys(row).length > 6 && (
                              <details className="mt-2">
                                <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                                  Show {Object.keys(row).length - 6} more fields...
                                </summary>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                                  {Object.entries(row).slice(6).map(([key, value]) => (
                                    <div key={key} className="break-words">
                                      <span className="font-semibold text-gray-600">{key}:</span>
                                      <span className="ml-1 text-gray-800">
                                        {typeof value === 'string' && value.length > 100
                                          ? value.substring(0, 100) + '...'
                                          : String(value)}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </details>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Published URLs Section */}
        {Object.keys(publishedUrls).length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              📰 Published Content URLs
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {publishedUrls.wordpress && (
                <div className="p-4 rounded-lg border-2 border-blue-200 bg-blue-50">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                      <span>🌐</span> Local WordPress
                    </h3>
                    <button
                      onClick={() => navigator.clipboard.writeText(publishedUrls.wordpress!)}
                      className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                      Copy
                    </button>
                  </div>
                  <a
                    href={publishedUrls.wordpress}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-800 hover:underline break-all"
                  >
                    {publishedUrls.wordpress}
                  </a>
                </div>
              )}

              {publishedUrls.uatWordpress && (
                <div className="p-4 rounded-lg border-2 border-purple-200 bg-purple-50">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                      <span>🚀</span> UAT WordPress
                    </h3>
                    <button
                      onClick={() => navigator.clipboard.writeText(publishedUrls.uatWordpress!)}
                      className="text-xs px-2 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                    >
                      Copy
                    </button>
                  </div>
                  <a
                    href={publishedUrls.uatWordpress}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-purple-600 hover:text-purple-800 hover:underline break-all"
                  >
                    {publishedUrls.uatWordpress}
                  </a>
                </div>
              )}

              {publishedUrls.frontend && (
                <div className="p-4 rounded-lg border-2 border-green-200 bg-green-50">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                      <span>🎨</span> Next.js Frontend
                    </h3>
                    <button
                      onClick={() => navigator.clipboard.writeText(publishedUrls.frontend!)}
                      className="text-xs px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                    >
                      Copy
                    </button>
                  </div>
                  <a
                    href={publishedUrls.frontend}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-green-600 hover:text-green-800 hover:underline break-all"
                  >
                    {publishedUrls.frontend}
                  </a>
                </div>
              )}

              {publishedUrls.sanityDesk && (
                <div className="p-4 rounded-lg border-2 border-orange-200 bg-orange-50">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                      <span>✏️</span> Sanity Desk
                    </h3>
                    <button
                      onClick={() => navigator.clipboard.writeText(publishedUrls.sanityDesk!)}
                      className="text-xs px-2 py-1 bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors"
                    >
                      Copy
                    </button>
                  </div>
                  <a
                    href={publishedUrls.sanityDesk}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-orange-600 hover:text-orange-800 hover:underline break-all"
                  >
                    {publishedUrls.sanityDesk}
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Live Logs */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Live Logs
          </h2>
          <div className="bg-gray-900 rounded-lg p-4 h-96 overflow-y-auto font-mono text-sm">
            {logs.length === 0 ? (
              <p className="text-gray-500 italic">Waiting for workflow execution...</p>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="text-green-400 mb-1">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-600">
          <p className="text-sm">
            Enhanced Bulk Generator • Port 3003 •
            <span className="ml-2">WordPress: 8080 | Sanity: 3333 | Next.js: 3001</span>
          </p>
        </div>
      </div>

      {/* Edit Modal */}
      {editingRow && (
        <EditModal
          isOpen={editModalOpen}
          onClose={() => {
            setEditModalOpen(false)
            setEditingRow(null)
          }}
          data={editingRow.data}
          stageId={editingRow.stageId}
          stageName={stages[editingRow.stageId - 1]?.name || `Stage ${editingRow.stageId}`}
          onSubmit={handleEditSubmit}
          isContentStage={isContentStage(editingRow.stageId)}
        />
      )}
    </div>
  )
}
