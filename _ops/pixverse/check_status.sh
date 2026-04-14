#!/bin/bash
set -euo pipefail

if [ -z "${PIXVERSE_API_KEY:-}" ]; then
  echo "PIXVERSE_API_KEY ist nicht gesetzt"
  exit 1
fi

if [ -z "${1:-}" ]; then
  echo "Usage: $0 <task_id>"
  exit 1
fi

TASK_ID="$1"

curl -sS -X GET "https://app-api.pixverse.ai/openapi/v2/video/status/${TASK_ID}" \
  -H "API-KEY: ${PIXVERSE_API_KEY}"
echo
