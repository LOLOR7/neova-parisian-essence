## Scope

Full visual + copy overhaul of the public site, anchored by a rebuilt homepage. Admin, DocuSign, forms backend, client portal, email logic untouched. Existing images, projects data, blog posts, SEO landing pages preserved.

## Diagnosis

Current site already uses Cormorant Garamond + ivory/bone/brass palette and an editorial shell (`SiteShell`, `PageHero`, `Section`). The brief asks for a sharper, darker, more "private house" register with:
- new tokens (parchment `#F4F1EC`, near-black `#111009`, bronze `#9C865A`)
- DM Sans (replacing Inter) for body/labels
- a completely rewritten homepage (8 sections, exact copy)
- new nav labels (Approach / Expertise / Projects / About / Contact) + CTA "Initiate a Project"
- new footer (minimal, dark, 2 rows)
- new meta title/description

Most other pages (About, Services, Method, Projects, FindProperty, Blog, AppartementHaussmannien, PropertyFinderParis) will inherit the new tokens + font automatically and look consistent without bespoke rewrites in this pass.

## Plan

### 1. Design system (foundations)
- **`index.html`**: swap Google Fonts import from Inter → **DM Sans** (300/400/500). Keep Cormorant Garamond. Update `<title>` and `<meta name="description">` to the new copy.
- **`src/index.css`**: redefine HSL tokens to match exact hex values:
  - `--background` → `#F4F1EC` (parchment)
  - `--foreground` → `#1C1914`
  - `--bg-dark` (new) → `#111009`
  - `--surface` → `#EAE6DE`
  - `--accent` → `#9C865A` (bronze)
  - `--muted-foreground` → `#6B6459`
  - `--hairline` → bronze at low opacity
  - Tighten `display-xl/lg` letter-spacing to `-0.03em`, line-height 1.05.
  - Body min size 17px, line-height 1.75.
  - Eyebrow utility: DM Sans caps, tracking 0.18em, 11px.
  - Buttons: rebuild `.btn-line` (outlined → fills on hover) and add `.btn-accent` (bronze bg).
  - Add `.fade-up` reveal with the exact 0.7s cubic-bezier and 30px translateY.
- **`tailwind.config.ts`**: replace `sans` font stack with `DM Sans`. Keep `display: Cormorant Garamond`. Add `bg-dark` / `surface` color refs that map to the new vars.

### 2. Navigation
- **`src/components/layout/Navigation.tsx`**:
  - Replace logo image with wordmark "NEOVA" in Cormorant Garamond 22px, tracking 0.1em.
  - New link set: Approach (`/method`), Expertise (`/services`), Projects (`/projects`), About (`/about`), Contact (`/contact`).
  - CTA button text → "Initiate a Project" → routes to `/contact`.
  - Scrolled state: `backdrop-blur(12px)` + `rgba(244,241,236,0.88)` background.
  - Mobile menu: full-screen `--bg-dark` overlay, large serif items, staggered fade-in.

### 3. Homepage rebuild
Rewrite **`src/pages/Index.tsx`** as 7 stacked sections (nav is global, footer is global) using the exact copy provided. New small components colocated in the page file (or under `src/components/site/home/`):
1. **Hero** — full-viewport dark, best existing image as bg with 0.55 dark overlay, eyebrow + 88px serif headline + sub + paragraph + 2 CTAs + bronze rule + breathing chevron.
2. **Positioning / Ecosystem** — light, two-column, serif statement + body + 3 stats (14 / 9 / €40M+).
3. **Asset Lifecycle** — dark, 2×2 grid with Roman numerals I–IV (Acquisition, Transformation, Execution, Stewardship).
4. **Selected Projects** — light, 2-col grid pulling from existing `parisProjects` data, image + caps reference + serif title + descriptor; "View all projects →" link.
5. **Distinction** — `--surface` band, 3 columns (Not a contractor / Not an agency / Not a project manager).
6. **Contact** — dark, two-column: left address/email/WhatsApp, right minimal underline-only form (name, organisation, email, location, project nature textarea, timeline select, submit). Reuse existing `sendAdminNotification` so backend stays intact.
7. **(Footer handled globally — see step 4.)**

### 4. Footer
- **`src/components/layout/Footer.tsx`**: replace with minimal 2-row dark version per spec. Keep the existing hidden `/admin` access dot. Keep address text. Drop the SEO-landing link bloat (those pages stay reachable via sitemap + internal blog links).

### 5. Meta + tagline
- Hero, About, footer all use "The asset lifecycle, controlled." as the primary tagline.
- `index.html` title: `NEOVA — Private Real Estate Operator · Paris`.

### 6. What is NOT touched
- Admin pages, DocuSign flows, edge functions, email templates.
- Existing routes (Services, Method, Projects, Blog, BlogPost, FindProperty, AppartementHaussmannien, PropertyFinderParis, ParisProjectDetail, ProjectDetail) — they will visually inherit the new tokens + DM Sans automatically. No copy rewrites in this pass.
- `parisProjects` / `blogPosts` / project data — untouched.
- i18n dictionary — homepage will use hardcoded English copy from the brief (it's prescriptive); other pages keep their i18n. If you want the full site re-copied across FR/EN, that's a separate, larger pass.

## Open questions before I build

1. **Homepage copy language** — the brief is English-only. Should the homepage be English-only (matching the brief verbatim), or do you want me to also produce the FR translation and wire it into `i18n/dict.ts`? Brief verbatim is faster and matches the tone exactly.
2. **Hero background image** — I'll use `projectVictorHugo` (current strongest editorial shot) unless you point to a specific asset.
3. **Stats numbers** — "14 projects completed / 9 nationalities served / €40M+ assets advised" — confirm these are real and publishable.
4. **WhatsApp + email** — brief shows `[number]` and `[email]` placeholders. Use existing `info@neovaspace.com`? What WhatsApp number?
5. **Other pages** — confirm you're OK with About/Services/Method/etc. inheriting the new look automatically in this pass, with a follow-up to rewrite their copy in the same register later.

Answer those five and I'll execute.