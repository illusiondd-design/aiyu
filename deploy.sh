#!/bin/bash
set -e

echo "=== DEPLOY START ==="
cd /var/www/aiyu || exit 1

echo "→ npm install"
npm install

echo "→ build"
npm run build

echo "→ restart pm2"
pm2 restart aiyu --update-env

echo "=== DEPLOY DONE ==="
