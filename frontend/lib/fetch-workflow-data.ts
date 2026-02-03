const MAX_ATTEMPTS = 3
const RETRY_DELAY_MS = 1500

function isTransientNetworkError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error)
  const lower = message.toLowerCase()
  if (lower.includes('failed to fetch')) return true
  if (lower.includes('err_connection_reset')) return true
  if (lower.includes('econnreset')) return true
  if (lower.includes('etimedout')) return true
  if (lower.includes('network') && (lower.includes('error') || lower.includes('failed'))) return true
  if (error instanceof TypeError && lower.includes('fetch')) return true
  return false
}

/**
 * Fetches /api/workflow/data?stage=X with retries for transient errors
 * (e.g. ERR_CONNECTION_RESET, "Failed to fetch"). Retries up to 2 times
 * with a short delay so a single reset doesn't break the UI.
 */
export async function fetchWorkflowData(stageId: number): Promise<Response> {
  const url = `/api/workflow/data?stage=${stageId}`
  let lastError: unknown
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const response = await fetch(url)
      return response
    } catch (error) {
      lastError = error
      if (attempt === MAX_ATTEMPTS || !isTransientNetworkError(error)) {
        throw error
      }
      await new Promise((r) => setTimeout(r, RETRY_DELAY_MS))
    }
  }
  throw lastError
}
