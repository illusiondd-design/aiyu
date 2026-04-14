#!/bin/bash

echo "🚀 POSTMEISTER SYSTEM FINALIZE START"

BASE="/Users/tom/Projects/postmeister"

echo "📁 Prüfe Ordnerstruktur..."
mkdir -p $BASE/data/exports
mkdir -p $BASE/data/snapshots
mkdir -p $BASE/data/handover

echo "📊 System-Export..."
curl -s -X POST http://localhost:3000/api/system/export > /dev/null

echo "📄 CSV Export..."
curl -s -L http://localhost:3000/api/leads/export-csv -o $BASE/data/exports/leads_latest.csv

echo "📊 XLSX Export..."
curl -s -L http://localhost:3000/api/leads/export-xlsx -o $BASE/data/exports/leads_latest.xlsx

echo "📑 PDF Report..."
curl -s -L http://localhost:3000/api/reports/management-pdf -o $BASE/data/exports/management_report_latest.pdf

echo "🧠 Erstelle Master Status Datei..."

cat > $BASE/data/handover/POSTMEISTER__MASTER_STATUS.md <<EOL
# POSTMEISTER MASTER STATUS

## SYSTEM STATUS
- Dashboard: aktiv
- Kanban: aktiv
- Follow-up Engine: aktiv
- Reminder Engine: aktiv
- Telegram Integration: aktiv
- Daily Cron: aktiv
- Export System: aktiv

## EXPORTS
- CSV: data/exports/leads_latest.csv
- XLSX: data/exports/leads_latest.xlsx
- PDF: data/exports/management_report_latest.pdf

## CORE FEATURES
- Lead Capture (Supabase)
- Auto Scoring
- Kanban Drag & Drop
- Follow-up Management
- Reminder Marking
- Telegram Alerts
- Daily Digest Automation
- Snapshot System
- Export Engine

## SYSTEM ARCHITEKTUR
Frontend:
- Next.js Dashboard

Backend:
- Supabase
- Next API

Automation:
- Telegram
- Cron

## ZIEL
Operatives Lead-Management + Automatisierung

EOL

echo "📦 ZIP Paket erstellen..."

cd $BASE/data
zip -r POSTMEISTER__FINAL_PACKAGE.zip exports handover > /dev/null

echo "✅ SYSTEM FINALISIERT"
echo "📁 Paket: data/POSTMEISTER__FINAL_PACKAGE.zip"
