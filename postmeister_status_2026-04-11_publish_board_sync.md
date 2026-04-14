# POSTMEISTER STATUS — PUBLISH BOARD SYNC

Stand: 2026-04-11

## Erreicht
- `/api/publish/job/launch` erstellt echte Publish-Jobs
- Duplikat-Sperre aktiv:
  - offene Jobs `queued` / `processing` werden wiederverwendet
- `ContentPipelinePanel` nutzt Publish-Job-Launch statt direktem `published`
- Detailpanel zeigt Publish-Jobs des gewählten Posts
- `PublishJobsPanel` ist read-only / Monitoring-only
- Doppelsteuerung entfernt

## Aktuelle Rollen
- `ContentPipelinePanel` = zentrale operative Steuerung
- `PublishJobsPanel` = Monitoring / Debug / Übersicht
- `publish_jobs` = echte Job-Schicht
- `generated_social_posts.publish_status` = abgeleiteter Pipeline-/UI-Status

## Verifiziert
- Post `106` erfolgreich als Referenzpost getestet
- neuer Job wird erzeugt
- zweiter Launch re-used bestehenden offenen Job
- Altlasten `id=2,3,4` auf `failed` gesetzt
- aktiver offener Referenzjob: `id=5`

## Wichtige Dateien
- `components/dashboard/ContentPipelinePanel.tsx`
- `components/dashboard/PublishJobsPanel.tsx`
- `app/api/publish/job/launch/route.ts`

## Nächste sinnvolle Schritte
1. Job-Runner für `queued -> processing -> published/failed`
2. Activity-Log für re-used Jobs erweitern
3. Optional: Board-Spalte/Badge für `queued` und `processing` visuell schärfen
4. Optional: historische Testjobs aus UI kennzeichnen

## Regelwerk
- keine zweite Publish-Steuerung wieder einführen
- Publishing nur noch aus dem Pipeline-Board starten
- `PublishJobsPanel` read-only belassen
- vollständige Dateien / vollständige Terminal-Befehle liefern
