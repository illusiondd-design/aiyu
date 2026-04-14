#!/bin/bash
set -euo pipefail

if [ -z "${PIXVERSE_API_KEY:-}" ]; then
  echo "PIXVERSE_API_KEY ist nicht gesetzt"
  exit 1
fi

if [ $# -lt 1 ]; then
  echo "Usage: $0 <video_id>"
  exit 1
fi

VIDEO_ID="$1"
TRACE_ID="$(uuidgen | tr '[:upper:]' '[:lower:]')"

curl -sS -X GET "https://app-api.pixverse.ai/openapi/v2/video/result/${VIDEO_ID}" \
  -H "API-KEY: ${PIXVERSE_API_KEY}" \
  -H "Ai-trace-id: ${TRACE_ID}"
echo
