# NEOVA — Full Redesign Plan

## Scope
Rebuild the public-facing site as a single editorial maison experience. Admin, DocuSign, forms backend, client portal, and email logic remain untouched.

## Approach
Treat this as a **design system swap + homepage rewrite + global chrome rewrite**, not a page-by-page port. Existing public pages (Projects, About, Contact, Method, Find Property, Blog, expertise/SEO landings) keep their routes and data, but inherit the new tokens, fonts, navigation, and footer automatically. Homepage gets the full 9-section rebuild verbatim.

## Work breakdown

### 1. Design tokens (foundation)
- `src/index.css` — replace color tokens with the exact palette (navy, navy-hover, stone, stone-alt, stone-border, ink, terre, accent, accent-hover) as HSL. Update `--background`, `--foreground`, `--primary`, `--accent`, `--border`, `--muted-foreground` to map onto these. Replace existing brass/slate semantics.
- `tailwind.config.ts` — add `cormorant` + `dm-sans` font families; expose new semantic colors.
- `index.html` — load Cormorant Garamond (300) + DM Sans (300,400) from Google Fonts; update `<title>` and `<meta description>` to the exact strings specified.
- Utility classes: rewrite `.eyebrow`, `.display-xl/lg/md`, `.body-lg`, `.btn-solid`, `.btn-line-light`, `.container-editorial`, `.image-frame`, `.numeral`, `.link-underline`, `.panel-stone`, `.reveal`, `.reveal-image` to match the new spec (160px sections, 1160px container, 640px text, Cormorant headlines, DM Sans body, 0.8s cubic-bezier reveal with 0.12s stagger, 0.6s image hover scale 1.025, no rounded corners, no shadows).

### 2. Global chrome
- **Navigation** (`src/components/layout/Navigation.tsx`): transparent → blurred stone on scroll past 60px. Wordmark NEOVA left. Links: Approach · Projects · About · Contact. Vertical accent rule + "Initiate a Project" CTA. Mobile: thin hamburger → full-screen navy overlay with 44px Cormorant items, staggered fade, address at bottom.
- **Footer** (`src/components/layout/Footer.tsx`): navy, continues from Contact with no break, single hairline rule, three-column top row (wordmark+tagline / nav / socials), centered copyright row.

### 3. Homepage (`src/pages/Index.tsx`)
Full rewrite, 9 sections in exact order: Nav (global) → Hero (full-bleed video/image kept, navy overlay, centered headline "The property. The potential. The outcome.") → The Practice (stone, two-column with stats 14 · 9 · €40M+) → The Lifecycle (navy, 2×2 stages I–IV) → Selected Projects (stone, 2-col editorial grid using existing `parisProjects` images) → Editorial Quote (stone-alt) → About (stone, two-column with existing portrait if available) → Contact (navy, two-column with minimal underline-only form) → Footer (global).

Form posts via existing `sendAdminNotification` (no backend change). Fields: name, organisation, email, location, project, timeline.

### 4. Inherited pages
No structural rewrite — they will pick up the new tokens, fonts, nav, and footer automatically. I'll do a light pass on `PageHero`, `Section`, and `SiteShell` so internal pages read consistently with the new aesthetic (Cormorant headlines, stone backgrounds, accent rules). No copy changes on those pages.

### 5. i18n
Hero/About/Contact/etc. currently pull copy from `src/i18n/dict.ts`. For the homepage rewrite I'll hardcode the new English copy directly in `Index.tsx` (per spec — the copy is prescriptive and English-only as written). Other pages keep their existing dictionary-driven copy.

## Out of scope (explicit)
- `src/pages/admin/*`
- `supabase/functions/*`
- `src/lib/docusign.ts`, `src/lib/notifications.ts` (used as-is)
- DocuSign / email / unsubscribe / client portal flows
- `src/integrations/supabase/*`
- French/English dictionary structure (not removed; homepage just bypasses it)

## Files touched
- `index.html` (fonts + meta)
- `src/index.css` (tokens + utilities)
- `tailwind.config.ts` (fonts + colors)
- `src/components/layout/Navigation.tsx` (rewrite)
- `src/components/layout/Footer.tsx` (rewrite)
- `src/components/site/PageHero.tsx` (light retune)
- `src/components/site/Section.tsx` (light retune)
- `src/pages/Index.tsx` (full rewrite)

## Open questions before I build
1. **Stats** — spec says "update with real numbers if different." I'll use the spec's 14 / 9 / €40M+ unless you give me different ones now.
2. **WhatsApp + email** — spec asks me to fill these in. Confirm: email = `info@neovaspace.com` (already in Contact page). WhatsApp number?
3. **Founder portrait** — no obvious portrait asset exists in `src/assets`. OK to use the `--stone-alt` placeholder per spec instruction 5?
4. **Languages line** in About reads `FRENCH · ENGLISH · [ADD OTHERS]`. Keep just French · English, or add Italian/Spanish/etc.?
5. **Internal pages** — confirm light retune only (inherit tokens), not full rewrites. The brief reads as homepage-focused.
