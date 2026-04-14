#!/bin/bash
set -euo pipefail

if [ -z "${PIXVERSE_API_KEY:-}" ]; then
  echo "PIXVERSE_API_KEY ist nicht gesetzt"
  exit 1
fi

TRACE_ID="$(uuidgen | tr '[:upper:]' '[:lower:]')"

curl -sS -X POST "https://app-api.pixverse.ai/openapi/v2/video/text/generate" \
  -H "Content-Type: application/json" \
  -H "API-KEY: ${PIXVERSE_API_KEY}" \
  -H "Ai-trace-id: ${TRACE_ID}" \
  -d '{
    "prompt": "professional car workshop, mechanic repairing a car, cinematic lighting",
    "model": "v3.5",
    "duration": 5,
    "quality": "540p",
    "aspect_ratio": "16:9",
    "motion_mode": "normal",
    "seed": 12345
  }'
echo
