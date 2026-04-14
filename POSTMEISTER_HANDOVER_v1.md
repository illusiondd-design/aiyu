# POSTMEISTER — SYSTEM HANDOVER (v1)

## STATUS: PRODUKTIV (PHASE 1)

System ist vollständig funktionsfähig:
- Pipeline Board (UI)
- Publish Job System (API)
- Background Runner (LaunchAgent)
- Activity Logging

---

## ARCHITEKTUR

### FRONTEND
- ContentPipelinePanel.tsx → Steuerung
- PublishJobsPanel.tsx → Monitoring (read-only)

### BACKEND (API)
- /api/publish/job/launch → Job erzeugen (mit Duplicate Protection)
- /api/publish/job/list → Jobs abrufen
- /api/publish/job/update → Status ändern
- /api/activity/log → Logging

### RUNNER
- scripts/publish_job_runner.js
- läuft als LaunchAgent
- Polling: 5 Sekunden

---

## JOB FLOW

queued → processing → published | failed

---

## REGELN

1. Publishing NUR über Pipeline Board
2. PublishJobsPanel ist read-only
3. Runner ist einzige Verarbeitungsinstanz
4. Keine Duplikat-Jobs (launch schützt)
5. Provider aktuell: manual

---

## CURRENT MODE

PHASE 1:
- Simulation / Manual Mode
- kein echter API Call
- externe Posting-Tools möglich (Buffer/Later)

---

## DATEIPFADE

Projekt:
- /Users/tom/Projects/postmeister

Runner:
- scripts/publish_job_runner.js

LaunchAgent:
- ~/Library/LaunchAgents/com.postmeister.publish-runner.plist

Logs:
- ~/Library/Logs/postmeister/

---

## WICHTIGE ENTSCHEIDUNGEN

Publishing:
→ Hybrid (Manual jetzt, API später)

Runner:
→ LaunchAgent (Mac mini)

Priorität:
→ Pipeline first, API später

---

## NÄCHSTE SCHRITTE

1. Provider-Abstraktion
   - manual
   - buffer
   - instagram_graph

2. Retry-System für failed Jobs

3. UI:
   - processing Status sichtbar machen

4. Integration:
   - Buffer API ODER
   - Instagram Graph API

---

## RISIKEN

- Kein Locking bei mehreren Runnern
- Keine Retry-Logik
- Keine echte API Integration

---

## SYSTEMZIEL

Automatisierte Content-Maschine:
Input → Video → Musik → Final → Publish → Analytics

---

## ENDSTATE

- Vollautomatisches Posting
- Multi-Plattform
- Skalierbar für KMU Kunden
- KI-gestützt (Lyv / Flow integriert)

---

## HINWEIS

Dieses System ist bewusst minimal gehalten:
→ keine Over-Engineering
→ Fokus: Funktionierende Pipeline

Skalierung erfolgt in Phase 2+
