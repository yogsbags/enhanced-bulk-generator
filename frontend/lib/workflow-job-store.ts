/**
 * In-memory job store for workflow execution.
 * Used so the client can poll status instead of holding one long-lived request,
 * avoiding corporate proxy/firewall timeouts (e.g. 60s–5min) on Stage 4 (5–7min).
 */

export type JobStatus = 'running' | 'completed' | 'failed'

export interface WorkflowJobState {
  status: JobStatus
  stage?: number
  message?: string
  logs: string[]
  error?: string
  startTime: number
}

const jobs = new Map<string, WorkflowJobState>()

const MAX_LOGS = 2000
const JOB_TTL_MS = 60 * 60 * 1000 // 1 hour

function pruneOldJobs() {
  const now = Date.now()
  for (const [id, job] of jobs.entries()) {
    if (job.status !== 'running' && now - job.startTime > JOB_TTL_MS) {
      jobs.delete(id)
    }
  }
}

export function createJob(): string {
  pruneOldJobs()
  const jobId = `job_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
  jobs.set(jobId, {
    status: 'running',
    logs: [],
    startTime: Date.now(),
  })
  return jobId
}

export function getJob(jobId: string): WorkflowJobState | undefined {
  return jobs.get(jobId)
}

export function updateJob(
  jobId: string,
  update: Partial<Pick<WorkflowJobState, 'status' | 'stage' | 'message' | 'error'>>
) {
  const job = jobs.get(jobId)
  if (!job) return
  if (update.status !== undefined) job.status = update.status
  if (update.stage !== undefined) job.stage = update.stage
  if (update.message !== undefined) job.message = update.message
  if (update.error !== undefined) job.error = update.error
}

export function appendJobLog(jobId: string, line: string) {
  const job = jobs.get(jobId)
  if (!job) return
  job.logs.push(line)
  if (job.logs.length > MAX_LOGS) {
    job.logs = job.logs.slice(-MAX_LOGS)
  }
}

export function setJobCompleted(jobId: string) {
  updateJob(jobId, { status: 'completed' })
}

export function setJobFailed(jobId: string, error: string) {
  updateJob(jobId, { status: 'failed', error })
}
