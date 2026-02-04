const MAX_ATTEMPTS = 5 // Increased from 3 to handle Railway timeouts
const INITIAL_RETRY_DELAY_MS = 2000 // Increased from 1500ms

function isTransientNetworkError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error)
  const lower = message.toLowerCase()
  if (lower.includes('failed to fetch')) return true
  if (lower.includes('err_connection_reset')) return true
  if (lower.includes('err_timed_out')) return true
  if (lower.includes('econnreset')) return true
  if (lower.includes('etimedout')) return true
  if (lower.includes('network') && (lower.includes('error') || lower.includes('failed'))) return true
  if (error instanceof TypeError && lower.includes('fetch')) return true
  return false
}

/**
 * Fetches /api/workflow/data?stage=X with exponential backoff retries
 * for transient errors (ERR_CONNECTION_RESET, ERR_TIMED_OUT, "Failed to fetch").
 * Retries up to 5 times with exponential backoff: 2s, 4s, 8s, 16s, 32s.
 */
export async function fetchWorkflowData(stageId: number): Promise<Response> {
  const url = `/api/workflow/data?stage=${stageId}`
  let lastError: unknown

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      // Add timeout to fetch request (60 seconds for large CSVs)
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 60000)

      const response = await fetch(url, {
        signal: controller.signal
      })

      clearTimeout(timeoutId)
      return response

    } catch (error) {
      lastError = error

      // Don't retry if it's not a transient error or last attempt
      if (attempt === MAX_ATTEMPTS || !isTransientNetworkError(error)) {
        throw error
      }

      // Exponential backoff: 2s, 4s, 8s, 16s, 32s
      const delay = Math.min(INITIAL_RETRY_DELAY_MS * Math.pow(2, attempt - 1), 32000)
      console.warn(`Fetch attempt ${attempt} failed, retrying in ${delay}ms:`, error)
      await new Promise((r) => setTimeout(r, delay))
    }
  }

  throw lastError
}
