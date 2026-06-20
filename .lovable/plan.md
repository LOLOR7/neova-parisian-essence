# Request Detail Cockpit — Plan

Goal: make `/admin/demandes/:id` the central operational hub for one request, with 5 tabs and a unified activity log.

## 1. Database (one migration)

### `request_activity_log`
- `id` uuid pk
- `request_id` uuid → property_requests
- `type` text (`email_sent` | `agreement_generated` | `agreement_attached` | `document_attached` | `status_changed` | `manual_note`)
- `title` text
- `description` text null
- `recipient_name` text null
- `recipient_email` text null
- `recipient_role` text null (`client` | `agent` | `professional` | `architect` | `other`)
- `related_agreement_id` uuid null → prepared_agreements
- `related_document_id` uuid null → request_documents
- `metadata` jsonb default `{}`
- `created_by` uuid null
- `created_at` timestamptz

### `request_documents` (sendable library — global, not per-request)
- `id` uuid pk
- `name` text
- `category` text (`brochure` | `service` | `project` | `property_option` | `other`)
- `description` text null
- `file_path` text null  (null = "PDF à importer")
- `file_type` text default `pdf`
- `is_active` bool default true
- `sort_order` int default 0
- created_at / updated_at

Seed ~6 placeholder rows (Neova brochure, Property Finder, Renovation, Property Management, Example Project, Property Option).

### RLS / GRANTs
- Both tables: admin-only via `has_role(auth.uid(), 'admin')`. Service role full access. No anon.
- Reuse `agreements` bucket; documents stored under `documents/<id>.pdf`.

## 2. Routing / Page changes

`AdminDemandeDetail.tsx` — add two tabs between Contacts and Historique:

```
Résumé | Contacts | Contrats à envoyer | Options à envoyer | Historique
```

### Tab "Contrats à envoyer"
- Renders 3 cards from `AGREEMENT_TEMPLATES`.
- Per card: name, short description, badge, **Préparer** (navigates to `/admin/accords/preparer?template=<slug>&requestId=<id>&returnTo=request`), **DOCX original** (existing signed-URL download).
- Below: list of `prepared_agreements` rows already linked to this `request_id` with **Télécharger** + **Joindre au mail**.

### Tab "Options à envoyer"
- Grid of cards from `request_documents` where `is_active`.
- Per card: name, category badge, description, **Prévisualiser** (signed URL, new tab), **Joindre au mail**, **Télécharger**. If `file_path` null → "PDF à importer" disabled state.

### Composer integration
- "Joindre au mail" from either tab → navigates to `/admin/envois?requestId=<id>&attach=<kind>:<id>` (kind = `agreement` | `document`). `AdminEnvois` already exists; we extend it to:
  - Read query params, prefill recipient = client of request, append a "Document joint : <name>" line with signed URL into body.
  - On send, insert a row into `request_activity_log` (`email_sent`, `agreement_attached` or `document_attached`).

### Tab "Historique" (rewrite)
- Query unified feed: `request_activity_log` for this request, ordered desc.
- Also backfill on read: merge legacy `demand_contact_outreach` rows so existing history is not lost.
- Vertical timeline: time, icon by type, title, recipient chip, role badge (client/agent/pro), optional secondary actions (voir email / voir PDF / ouvrir lien from `metadata`).

## 3. Activity logging hooks

Add a small helper `src/lib/request-activity.ts` with `logActivity(requestId, payload)`. Call sites:
- `AdminAccordPreparer.tsx` after PDF generated → `agreement_generated`.
- `AdminEnvois.tsx` on send → `email_sent` (+ `agreement_attached` / `document_attached` if attached).
- Existing "Contacts à solliciter" send action → `email_sent` with `recipient_role` derived from contact type.
- Status change action in summary tab → `status_changed`.

No changes to email infra, DocuSign, public site.

## 4. Files

Edited:
- `src/pages/admin/AdminDemandeDetail.tsx` (add 2 tabs, rewrite history tab)
- `src/pages/admin/AdminAccordPreparer.tsx` (handle `returnTo=request`, log activity, "Joindre au mail" returns to request composer route)
- `src/pages/admin/AdminEnvois.tsx` (read `requestId` + `attach`, prefill, log on send)
- `src/integrations/supabase/types.ts` (auto-regen after migration)

Created:
- `src/lib/request-activity.ts`
- `src/components/admin/RequestContractsTab.tsx`
- `src/components/admin/RequestDocumentsTab.tsx`
- `src/components/admin/RequestActivityTimeline.tsx`
- migration file (tables + grants + RLS + seed)

## 5. Out of scope
- Real MIME attachments (still signed links in body).
- Uploading documents from UI (admin can drop files into bucket / I can wire upload next round if needed — for v1, file_path is set manually via SQL or a separate admin action).
- Changing existing agreement PDF generator, DocuSign, public website, SEO, forms.

## 6. Open questions before I execute

1. **Document upload UI in v1?** The simplest path is: rows seeded with `file_path = null` ("PDF à importer"), and you upload PDFs later via Supabase or I add a small upload button on each card. Which do you prefer?
2. **Composer destination**: route to existing `/admin/envois` with prefill params (reuses current composer), or build a small inline composer drawer inside the request page? Inline drawer is more "cockpit-like" but ~2x the work.
3. **Backfill history**: should the new Historique tab merge old `demand_contact_outreach` rows alongside the new `request_activity_log`, or only show new events going forward?
