#!/usr/bin/env bash
#
# Installs a cron job to run the full workflow daily at 02:00 IST.
#
# Usage:
#   ./scripts/install_daily_cron.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
WORKFLOW_SCRIPT="${PROJECT_ROOT}/scripts/run_full_workflow.sh"

if [[ ! -x "${WORKFLOW_SCRIPT}" ]]; then
  echo "Making workflow script executable: ${WORKFLOW_SCRIPT}"
  chmod +x "${WORKFLOW_SCRIPT}"
fi

CRON_HEADER="CRON_TZ=Asia/Kolkata"
CRON_ENTRY="0 2 * * * ${WORKFLOW_SCRIPT}"

TMP_CRON="$(mktemp)"

crontab -l 2>/dev/null | grep -v "${WORKFLOW_SCRIPT}" > "${TMP_CRON}" || true

if ! grep -qxF "${CRON_HEADER}" "${TMP_CRON}"; then
  echo "${CRON_HEADER}" >> "${TMP_CRON}"
fi

echo "${CRON_ENTRY}" >> "${TMP_CRON}"

crontab "${TMP_CRON}"
rm -f "${TMP_CRON}"

echo "✅ Cron job installed:"
echo "  ${CRON_HEADER}"
echo "  ${CRON_ENTRY}"
