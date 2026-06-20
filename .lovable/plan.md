## Diagnosis

`src/pages/admin/AdminWorkflow.tsx` (~1590 lines) is a DocuSign-era page:
- 4 tabs (Demandes / Phase 1 Agents / Phase 2 Pros / Visites) each driven by DocuSign envelopes
- per-row buttons "Copier données accord", "Marquer envoyé manuellement", "Marquer signé manuellement", "Données à copier dans DocuSign"
- `MANUAL_MODE_BANNER` block, "DocuSign mode manuel — déplier" panel, JWT-config warning, missing-template warning
- shared sub-components (`DemandCard`, `Phase1Section`, `Phase2Section`, `ViewingsList`, `ProfessionalCard`) all wired to envelopes

The new operational flow is template → prepared agreement (PDF) → email → log. So the workflow page must become a thin operations dashboard sitting on top of `property_requests` + `prepared_agreements` + `request_activity_log` + `email_audit_log`.

## Plan — minimal, frontend-only

Rewrite `src/pages/admin/AdminWorkflow.tsx` as a single-tab dashboard. Keep all DocuSign code paths reachable only via `/admin/settings/docusign`. No DB schema change, no email/PDF logic touched, no other pages touched.

### Header
- Title: `Workflow accords`
- Subtitle: `Préparez, envoyez et suivez les accords liés aux demandes clients.`
- Primary CTA: `Préparer un accord` → `/admin/accords`
- Secondary CTA: `Voir les templates` → `/admin/accords` (same route — that page hosts the template grid)
- Tertiary discreet link: `DocuSign` (small ghost button) → `/admin/settings/docusign`

### KPI cards (top row, 4 cards)
Best-effort counts queried once on mount:
1. **Demandes actives** — `property_requests` where `status` not in (`COMPLETED`,`CANCELLED`,`ARCHIVED`) (fallback: total count)
2. **Accords préparés** — `prepared_agreements` count
3. **Accords à envoyer** — `prepared_agreements` where `status = 'PREPARED'` (or whichever non-sent status exists; fallback = prepared minus those referenced in `email_audit_log`)
4. **Emails envoyés** — `email_audit_log` count where `status = 'sent'`

If a column doesn't exist, the card shows `—` rather than crashing.

### Filters (chips)
`Toutes` · `À préparer` · `Accord prêt` · `À envoyer` · `Envoyé` · `Signé / clôturé`

Derived client-side from each request's joined `prepared_agreements` + last `email_audit_log` row, no DB change.

### Request list (replaces all tabs)
Plain rows / cards, one per `property_request`:
- left: `demand_reference` · client name · email · `location` · `budget` · status badge
- middle: small meta — `N accords préparés`, `Dernière activité: <relative time>`
- right: two CTAs
  - `Ouvrir la demande` → `/admin/demandes/:id`
  - `Préparer un accord` → `/admin/demandes/:id?tab=contrats` (already the "Contrats à envoyer" tab)

Sorted by last activity desc. Search box (client name / reference / email).

### What gets removed from the page UI
- `MANUAL_MODE_BANNER` `<details>` block
- DocuSign JWT auth-failure warning
- `Template Professional Referral non configuré` warning
- All 4 tabs and their sections (`Phase1Section`, `Phase2Section`, `ViewingsList`, old `DemandCard`)
- All manual-mode buttons: `Copier données accord`, `Marquer envoyé manuellement`, `Marquer signé manuellement`, `Données à copier dans DocuSign`
- The "Note interne — validation juridique" footer (DocuSign-era)

### What stays untouched
- `src/lib/docusign.ts` helpers (still imported elsewhere)
- `/admin/settings/docusign` route + page
- `/admin/accords` (templates + preparation)
- `/admin/demandes/:id` and its `Contrats à envoyer` tab
- `prepared_agreements`, `email_audit_log`, PDF generation, email queue
- Public site, SEO, blog, forms, schema

### File touched
- `src/pages/admin/AdminWorkflow.tsx` — full rewrite, ~250 lines, replaces the 1590-line file
- No other file modified

### Risks
- `prepared_agreements.status` / `property_requests.status` enum values — I'll query `supabase--read_query` for actual columns before writing, and degrade gracefully if a status string differs.
- Filter accuracy depends on real status values; worst case the chips reduce to `Toutes` + a "has prepared agreement" filter. Will confirm during implementation.

### Out of scope
- Reworking `/admin/demandes/:id` tabs
- Changing `prepared_agreements` schema or workflow
- Re-skinning DocuSign settings page

## Validation request

Confirm and I implement. Specifically OK to:
1. Drop the 4-tab structure entirely (Phase 1 / Phase 2 / Visites disappear from `/admin/workflow`)?
2. Route `Voir les templates` to `/admin/accords` (same as `Préparer un accord`)? Or do you want a separate `/admin/templates` route?
3. `Préparer un accord` row CTA → deep-link `/admin/demandes/:id?tab=contrats` — OK?
