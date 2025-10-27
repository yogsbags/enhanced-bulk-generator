#!/usr/bin/env bash
#
# Daily automation script for Enhanced Bulk Generator
# --------------------------------------------------
# Usage:
#   ./scripts/run_full_workflow.sh
#
# This script:
#   1. Moves to the project root
#   2. Sources .env files (if present)
#   3. Runs the full workflow with auto-approval
#   4. Appends stdout/stderr to logs/workflow-YYYYMMDD.log

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
LOG_DIR="${PROJECT_ROOT}/logs"
DATE_STAMP="$(date +%Y%m%d)"
LOG_FILE="${LOG_DIR}/workflow-${DATE_STAMP}.log"

mkdir -p "${LOG_DIR}"

# Source environment files if they exist
if [[ -f "${PROJECT_ROOT}/.env" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "${PROJECT_ROOT}/.env"
  set +a
fi

if [[ -f "${PROJECT_ROOT}/.env.local" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "${PROJECT_ROOT}/.env.local"
  set +a
fi

cd "${PROJECT_ROOT}"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Starting full workflow..." >> "${LOG_FILE}"
node main.js full --auto-approve >> "${LOG_FILE}" 2>&1
EXIT_CODE=$?
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Workflow completed with exit code ${EXIT_CODE}" >> "${LOG_FILE}"

exit ${EXIT_CODE}
