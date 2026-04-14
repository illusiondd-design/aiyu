# POSTMEISTER — ACCESS MATRIX v1

Stand: 2026-04-11

## Rollen
- admin
- operator
- customer

## Pakete
- starter
- avant
- proship

## Paketlogik v1

### starter
- brands: 1
- seats: 1
- dashboard: ja
- review: nein
- publishQueue: nein
- autoPublish: nein
- analytics: nein
- videoGenerate: nein
- musicGenerate: nein
- finalCompose: nein

### avant
- brands: 3
- seats: 2
- dashboard: ja
- review: ja
- publishQueue: ja
- autoPublish: nein
- analytics: ja
- videoGenerate: ja
- musicGenerate: ja
- finalCompose: ja

### proship
- brands: viele
- seats: 5
- dashboard: ja
- review: ja
- publishQueue: ja
- autoPublish: ja
- analytics: ja
- videoGenerate: ja
- musicGenerate: ja
- finalCompose: ja

## Aktuelle Pilotlogik
- Paket/Rolle werden aus der zuletzt aktualisierten Brand gelesen
- Quelle: /api/access/context
- echtes User->Brand-Mapping folgt später

## Wichtige Dateien
- app/api/access/context/route.ts
- lib/config/access.ts
- lib/auth/access.ts
- components/dashboard/DashboardAccessShell.tsx
- app/dashboard/page.tsx
- proxy.ts
