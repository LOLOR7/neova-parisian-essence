## Diagnosis

Today `/admin/workflow` is built around the DocuSign API (envelopes, manual mode banner, `docusign_envelopes` table, send buttons). You no longer want that as the primary flow. Instead admins need:

1. A library of contract templates (the 3 DOCX you uploaded → converted to PDF).
2. A way to pick one for a specific client request, fill the variable fields, generate a clean Neova-branded PDF.
3. A way to attach that PDF to an outreach email.

DocuSign stays in the codebase (tables, edge functions, settings page) — just demoted in the UI.

## Scope (what changes / what doesn't)

**Changes**
- New admin section "Accords" with template library + preparation flow.
- Sidebar: add "Accords" entry; rename "Workflow DocuSign" → "Workflow".
- `/admin/workflow` page: soften DocuSign framing, add "Préparer un accord" action.
- `/admin/demandes/:id`: add "Préparer un accord" CTA that opens the template picker with the request prefilled.
- `/admin/envois` (outreach email composer): add "Joindre un accord" picker listing prepared agreements for the current contact/request.

**Untouched**
- DocuSign edge functions, `docusign_envelopes` table, `/admin/settings/docusign`, `src/lib/docusign.ts`.
- Public site, SEO, blog, forms, emails infrastructure, auth.

## Templates (initial seed)

The 3 uploaded DOCX, converted to PDF once and stored as Lovable Assets (CDN). I'll inspect each to extract the variable fields, then map them to the preparation form.

- `client-professional-contract` — *Accord client / professionnel* (Archi + Contractors)
- `property-management-agreement` — *Mandat de gestion*
- `agent-referral-fee-protection` — *Accord professionnel — protection commission*

Each template is described in code (`src/lib/agreement-templates.ts`) with: `id, name, description, category, originalPdfUrl, fields[]`. No DB table for templates in v1 — they are static. Adding a 4th template later = add an entry + upload the PDF asset.

## Routes added

- `/admin/accords` — template library (list of 3 cards).
- `/admin/accords/preparer?templateId=...&requestId=...` — preparation screen.
- `/admin/accords/historique` (optional, v1.1) — list of prepared agreements.

## Data model

One new table only:

```text
prepared_agreements
  id (uuid)
  request_id (uuid, nullable, FK → property_requests)
  template_id (text)            -- matches static template registry
  template_name (text)
  client_name, client_email, phone (text)
  project_type, location, budget, surface (text)
  notes (text)
  field_values (jsonb)          -- all filled fields, for re-render
  generated_pdf_url (text, nullable)
  status (text: draft|ready|attached|sent)
  created_at, updated_at
```

RLS: admin-only (same pattern as the other admin tables — service role + admin session). GRANTs to `authenticated` and `service_role` in same migration. No anon.

No table for templates in v1 (static registry). Can be promoted later.

## PDF generation approach

Direct DOCX/PDF field-fill is brittle. Pragmatic v1:

- Render a **Neova-branded "Agreement Summary" PDF** client-side with `pdf-lib` (already aligned with project — no server dep). Layout: Neova header, agreement title, parties block, request reference, project details table, terms paragraph pulled from the template registry, signature blocks, footer.
- Provide a "Télécharger l'original (non rempli)" button that links to the original PDF asset for the admin to print/fill manually if needed.

This avoids fragile PDF form-field hacks while giving a clean, attachable deliverable in one click.

## Preparation flow UX

```text
/admin/accords
  → grid of 3 template cards (name, description, category, "Ouvrir" / "Préparer pour ce client")

  click "Préparer" →
/admin/accords/preparer?templateId=...&requestId=...
  Left: form (prefilled from request if requestId present)
        - client name, email, phone
        - request reference (NEO-xxxxx)
        - project type, location, budget, surface
        - notes / conditions
        - date, signataire Neova
  Right: live preview (rendered PDF in iframe)
  Bottom actions:
        [Télécharger PDF]  [Joindre au mail]  [Copier le résumé]  [Retour]
```

"Joindre au mail" saves the prepared agreement (status=`ready`), then routes to `/admin/envois?attach=<preparedId>` (or opens the existing composer with the attachment preselected).

## Email composer integration

In the current outreach UI (`AdminEnvois` + any per-request composer in `AdminDemandeDetail`):
- New "Accords disponibles" section listing `prepared_agreements` filtered by `request_id` (or all drafts if none).
- Selecting one shows a chip "📎 Accord joint — {template_name}.pdf" and includes the PDF URL/blob in the send payload (or as a download link in the email body if the existing email function doesn't support attachments — to be confirmed when I read `AdminEnvois`).

If attachments aren't supported by the current send path, fallback: include a signed/public link to the generated PDF in the email body, with a clear note. No backend send changes beyond that.

## Workflow page softening

`/admin/workflow`:
- Title → "Workflow accords"
- Subtitle → "Sélectionnez un template, préparez l'accord, puis joignez-le à votre email."
- DocuSign manual-mode banner: collapsed into a small dismissible note.
- Primary CTA → "Préparer un accord" (opens template library).
- "Ouvrir DocuSign" + "Paramètres DocuSign" buttons kept, demoted to secondary.
- Existing per-request DocuSign status lines: kept but visually de-emphasized (read-only).

## File list (planned)

New:
- `src/lib/agreement-templates.ts` — static registry + field schemas
- `src/lib/agreement-pdf.ts` — pdf-lib generator
- `src/pages/admin/AdminAccords.tsx` — library
- `src/pages/admin/AdminAccordPreparer.tsx` — preparation screen
- `src/components/admin/AgreementPicker.tsx` — modal/picker reused from workflow + demande detail + email composer
- 3 PDF assets under `src/assets/agreements/*.pdf.asset.json` (uploaded via `lovable-assets`)
- 1 Supabase migration: `prepared_agreements` + RLS + GRANTs + updated_at trigger

Edited:
- `src/App.tsx` — 2 new routes
- `src/pages/admin/AdminLayout.tsx` — sidebar entry, rename Workflow item
- `src/pages/admin/AdminWorkflow.tsx` — soften DocuSign, add CTA
- `src/pages/admin/AdminDemandeDetail.tsx` — "Préparer un accord" button
- `src/pages/admin/AdminEnvois.tsx` — attach picker

Dependency:
- `pdf-lib` (add via `bun add`)

## Open questions before I build

1. **Email attachment capability** — does your current outreach send path support real attachments, or is it pure HTML body? If pure body, I'll fall back to a public PDF link. OK with that fallback?
2. **PDF storage** — store generated PDFs in Supabase Storage (new `agreements` bucket, private + signed URLs) so the email link works, or only generate on-demand client-side (no storage, but harder to re-share)? Recommend: **Storage bucket**, private, signed URLs valid 30 days.
3. **Should the 3 DOCX → PDF conversion happen now in the sandbox** (LibreOffice headless) and the resulting PDFs be the originals, or do you have official PDF versions to upload? I'll convert with LibreOffice if you confirm.
4. **Sidebar label** — "Accords" or "Templates accords" or "Agreement Templates"? My recommendation: **"Accords"** (short, French, sits naturally next to "Workflow").

Answer those four and I'll execute the whole plan in one pass.