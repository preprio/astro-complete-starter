# Hand-off notes for Mandy — Astro complete guide

This folder contains a page-for-page draft of the Astro complete guide, mirroring the published Next.js complete guide at `docs.prepr.io/connecting-a-front-end-framework/nextjs/next-complete-guide`. Source: the `astro-complete-starter` repo at `~/Code/prepr/astro-complete-starter`, tags `guide-step-1` … `guide-step-6`.

## How to publish

- Files map 1:1 to pages: `00-overview.md` → guide index, `01-introduction.md` → Introduction, `02`–`07` → the six chapters. Strip the leading number prefix for the final URL slug (see below).
- Every code block in every chapter was copied verbatim from the matching git tag with `git show <tag>:<path>` — no hand-retyping. If a chapter needs to change later, pull the new code from the corresponding tag the same way rather than editing the block in place, so the guide never drifts from what actually ships in the starter.
- Where the Next.js guide's source markdown used tabs to show multiple files in one block (e.g. Button/Logo/NavBar, Hero/Feature), this draft uses one labeled code block per file instead, since the tab markup didn't survive extraction. Mandy's call on whether to restore tabs in the docs.prepr.io renderer.
- "Highlighted lines" call-outs: the Next.js source used the docs site's own line-highlight syntax inside fenced code blocks, which doesn't have a stable plain-Markdown equivalent. This draft replaces every highlight with a sentence above the block naming what's new or changed, and shows the whole file. Mandy's call whether to re-add actual line highlighting in the docs renderer.

## Proposed URL slugs

All under `https://docs.prepr.io/connecting-a-front-end-framework/astro/astro-complete-guide/`:

| File                                       | Slug                                 |
| ------------------------------------------ | ------------------------------------ |
| `00-overview.md`                           | (index — `.../astro-complete-guide`) |
| `01-introduction.md`                       | `introduction`                       |
| `02-step-1-set-up-an-astro-project.md`     | `step-1-set-up-an-astro-project`     |
| `03-step-2-make-the-project-dynamic.md`    | `step-2-make-the-project-dynamic`    |
| `04-step-3-set-up-data-collection.md`      | `step-3-set-up-data-collection`      |
| `05-step-4-add-ab-testing.md`              | `step-4-add-ab-testing`              |
| `06-step-5-add-personalization.md`         | `step-5-add-personalization`         |
| `07-step-6-install-the-preview-toolbar.md` | `step-6-install-the-preview-toolbar` |

Note the Next.js guide's step-6 slug is `step-6-install-the-preview-bar` (old "preview bar" naming); this draft uses `-toolbar` throughout since that's the current product name. Flagging in case Mandy wants the slug to match the Next.js guide's URL exactly for consistency, even though the on-page text says "toolbar" everywhere now.

All chapter cross-links inside the guide text use these proposed slugs. They are unverified against the real docs.prepr.io routing config — treat as proposed, not final.

## Screenshots

### Reused from the Next.js guide

Every Prepr-UI screenshot (access tokens, segments page, A/B test settings modal, metrics panels, tracking code page, toolbar) and every rendered-site screenshot (static site, dynamic home page, electric lease landing page, personalized home page, toolbar overlay) is reused as-is from the Next.js guide. Full list, by chapter:

- Introduction: `dynamic-website-with-prepr-content.png`, `a-b-test-on-home-page.png`, `personalized-home-page-electric-lease.png`
- Step 1: `static-website.png` (used twice), `navigation-bar.png` (`4sjn2vin77t0`)
- Step 2: `graphql-api-token-example.png`, `acme-lease-homepage-stack-field.png`, `dynamic-website-with-prepr-content.png`
- Step 3: `updated-event-tracking-screenshot.png`, `page-view-events.png`
- Step 4: `a-b-test-on-home-page.png`, `ab-test-example-electric-landing-page.png`, `ab-test-example-settings-modal.png`, `clear-cookies.png`, `ab-test-example-awaiting-data.png`, `ab-test-example-metrics.png`
- Step 5: `personalized-home-page-electric-lease.png`, `acme-lease-homepage-adaptive-content-hero-and-feature-sections.png`, `electric-car-buyers-segment.png` (asset filename kept even though the segment shown is now named "Electric Car Lovers" — see Deviations), `acme-lease-electric-car-landing-page.png`, `electric-car-buyers-highlight-matching-visitors.png`, `clear-cookies-for-personalization.png`, `acme-lease-homepage-adaptive-content-awaiting-data.png`, `home-page-adaptive-content-metrics-example.png`
- Step 6: `prepr-preview-toolbar.png`, `graphql-preview-access-token.png`, `stega-encoding-example.png`, `toolbar-electric-car-segment.png`, `toolbar-b-variant-example.png`

The Prepr-UI screenshots need no retaking. **The rendered-site screenshots should be retaken** (for both guides): they were captured before the `globals.css` fixes (see below), so they show no side padding and wrong mobile heading sizes. Retake them from either starter after the fix — both now render identically: `static-website.png`, `navigation-bar.png`, `dynamic-website-with-prepr-content.png`, `a-b-test-on-home-page.png`, `personalized-home-page-electric-lease.png`, `acme-lease-electric-car-landing-page.png`, `toolbar-electric-car-segment.png`, `toolbar-b-variant-example.png`.

### New placeholders (need real screenshots of the Astro flow)

Every placeholder uses the form `![TODO-SCREENSHOT: <description>](NEW)`. Full list:

1. Step 1 — walkthrough video (Next.js step 1 embeds a video; no Astro equivalent recorded). Open question: is a new video planned, or should this line be dropped?
2. Step 1 — `npm create astro@latest` terminal prompts (the Next.js "options when installing" screenshot shows `create-next-app` prompts; Astro's prompt sequence and options differ and need a fresh capture).

That's the full placeholder count: **2**. No `.astro` file tree screenshot was added — the brief allowed for one but the guide's prose file-by-file walkthrough covers the structure without it; add one if Mandy's format wants it.

## Deviations from the Next.js guide (reader-visible)

Pulled from the project's Decisions table where the swap changes what the reader sees or types:

- **Apollo Client → typed fetch helper.** No official Astro/Apollo integration exists. `src/lib/prepr.ts` is a small typed `fetch` wrapper instead, matching the pattern already published in the Astro quick-start guide. Reader impact: no `apollo-client.ts` file, no `@apollo/client` packages; one new file, `src/lib/prepr.ts`.
- **Catch-all route.** Next.js uses `app/[[...slug]]/page.tsx` (optional catch-all, so `page.tsx` exists at two levels during the transition). Astro uses `src/pages/[...slug].astro` and the reader renames `index.astro` directly — no separate root page file, and `Astro.params.slug` is already a joined string (`undefined` on `/`), so there's no `Array.isArray` / `.join('/')` step like the Next.js code has.
- **`force-dynamic` + `fetchPolicy: 'no-cache'` → `output: 'server'`.** Astro's SSR mode has no result cache to disable, so this guide has one caching sentence instead of the Next.js guide's caching paragraph plus two separate cache-disabling settings.
- **`notFound()` → `Astro.rewrite('/404')` + `src/pages/404.astro`.** Reader creates one extra file (`404.astro`) that didn't exist in the Next.js flow at this point.
- **`next/image` + `images.remotePatterns` → `<Image>` from `astro:assets` + `image.domains`.** Same guide beat, different import and config key name.
- **`next/font/google` → Astro `fonts` config + `<Font>`.** Font is declared in `astro.config.mjs` and rendered via `<Font cssVariable="..." preload />` in the layout head, instead of a font object piped into a `className`.
- **`classnames` package → Astro's built-in `class:list`.** No install step for this in the Astro guide (Next.js guide has `npm install classnames`).
- **`process.env.PREPR_GRAPHQL_URL` → `astro:env/server`.** Typed, schema-validated env access; the reader adds an `env.schema` block to `astro.config.mjs` that has no Next.js equivalent.
- **`proxy.ts` → `src/middleware.ts`.** Astro's built-in middleware file convention replaces the Next.js `proxy.ts` + `createPreprMiddleware` pattern; the toolkit call is `onPreprRequest` instead.
- **Preview flag: `PREPR_ENV === 'preview'` instead of hardcoded `true`.** Deliberate, called out in-guide: a hardcoded `true` would let production visitors override segments/variants via the toolbar's query parameters. The Next.js guide hardcodes `preview: true` in the final `proxy.ts` — this is a real behavioral improvement in the Astro guide, not just a syntax swap. Flag to Mandy: should the Next.js guide be updated to match, to avoid teaching a weaker pattern there?
- **No `try`/`catch` or `<Suspense>` around the toolbar.** `getToolbarProps` never throws by design (it swallows fetch failures), so the Astro layout skips the defensive wrapping the Next.js `layout.tsx` needs for static-generation edge cases that don't apply to Astro's SSR-only setup here.
- **Toolbar render order.** Astro's layout renders `{toolbarProps && <PreprToolbar />}` after `<slot />` (page content); Next.js renders it before `{children}`. No visible difference since the toolbar is a fixed-position overlay — noted in the guide text as a one-line aside, not a warning.
- **Commands and port.** Guide uses `npm`/`npx` throughout (matching the Next.js guide's command style even though the starter repo itself uses pnpm) and `localhost:4321` (Astro's default) instead of `:3000`.
- **Repo name and links.** Repo is `astro-complete-starter` (`github.com/preprio/astro-complete-starter`, not yet created — see Open questions). The demo website link (`https://acme-lease.prepr.io/`) is unchanged from the Next.js intro since the same demo environment serves both starters.
- **Overview blurb wording.** "Apollo Client" replaced with "a GraphQL fetch helper" in the overview card blurb for step 2, since there's no Apollo Client in the Astro stack.
- **`src/lib/prepr.ts` HTTP status check.** The guide includes an `if (!response.ok)` check added after the guide-step tags were cut; the starter's HEAD matches the guide.

## `globals.css` bugs fixed in both starters

The Next.js starter's `globals.css` had three bugs. They are now fixed in both `next-complete-starter` and `astro-complete-starter`, and the Astro guide's step 1 shows the fixed CSS. **The Next.js guide's step 1 (`globals.css` block) still shows the old CSS and needs the same update:**

- `--font-size-mb-4xl` / `--font-size-mb-5xl` → `--text-mb-4xl` / `--text-mb-5xl`. Tailwind 4 reads font sizes from the `--text-*` namespace, so the `text-mb-*` classes generated no CSS and mobile headings fell back to 16px.
- `p-spacing` was used on every section but never defined, so there was no horizontal page gutter. Added `@utility p-spacing { @apply px-4 sm:px-6 lg:px-8 xl:px-18 2xl:px-20; }`, matching the live demo (acme-lease.prepr.io).
- `--color-secondary-500: #4748B` (invalid 5-digit hex) → `#64748B`, the value on the live demo.

The Astro `guide-step-*` tags predate these fixes; the starter's HEAD matches the guide.

## Verification status

Verified in a browser by the controller during this project:

- The preview toolbar opens and renders.
- Switching segments in the toolbar swaps in the electric-lease hero on `/`.
- `?prepr_preview_ab=A` / `?prepr_preview_ab=B` query params switch the A/B variant shown on `/electric-lease`.

**Not verified** (no Prepr login available in this session) — Mandy/Kevin should confirm these while taking screenshots, since the guide's instructions assume they work as described:

- Segments page showing a new visitor entry with a _View_ event after visiting the homepage (Step 3 test).
- A/B test metrics (impressions/clicks) appearing in the _Electric Lease Landing Page_ content item after clicking **Find your car** (Step 4 test).
- Adaptive content metrics appearing in the _Homepage_ content item's adaptive content block (Step 5 test).
- The edit-mode hover outline / visual editing affordance in preview mode (not explicitly covered by a guide step, but worth a sanity check since the preview access token has edit mode enabled).

## Demo content drift flagged during this build

- **Electric Lease Landing Page A/B headings.** The live demo environment currently shows variant A as _"Drive electric ⚡ Save more. Lease smarter."_ and variant B as _"Lease electric ⚡ Save bigger. Lease smarter."_ The published Next.js guide says _"Drive Electric…"_ (A) / _"Go Electric…"_ (B) — stale relative to the current demo data. This Astro draft uses the real current text. Recommend updating the Next.js guide to match at the same time, since both guides describe the same demo environment.
- **Segment naming inconsistency.** The demo environment's segment is named "Electric Car Lovers". The published Next.js guide calls it "Electric Car Buyers" in step 5 (personalization) but "Electric Car Lovers" in step 6 (preview toolbar) — an existing inconsistency within the Next.js guide itself. This Astro draft uses "Electric Car Lovers" consistently in both chapters. Recommend reconciling the Next.js guide's step 5 wording to match step 6 (or vice versa) rather than carrying the inconsistency forward.
- Some reused screenshot filenames (e.g. `electric-car-buyers-segment.png`) still reference the old "Buyers" name — cosmetic only, the images show the real segment UI regardless of filename.

## Open questions for Mandy / Kevin

1. **Final URL structure.** Is `/connecting-a-front-end-framework/astro/astro-complete-guide/...` the confirmed path, or should it match the Next.js guide's `-bar` vs `-toolbar` naming in step 6's slug specifically (see slug table above)?
2. **Video for step 1.** The Next.js guide embeds a walkthrough video for step 1. Is an Astro equivalent planned? If not, should that line be removed rather than left as a placeholder?
3. **Should the overview page link both frameworks?** Currently each framework guide only links its own starter repo and the shared demo site. Worth considering a cross-link ("also available for Next.js / Nuxt") from the Astro overview, and vice versa, now that three framework guides exist side by side.
4. **Repo creation timing.** `github.com/preprio/astro-complete-starter` doesn't exist yet (planned as a separate task with explicit user confirmation before pushing). The guide and HANDOFF both link it already — confirm the repo is public and populated before this guide goes live, or the intro/overview links will 404.
5. **Stale content in the Next.js guide.** Given the two drift items above (A/B headings, segment naming), should this task also file a follow-up to refresh the Next.js guide's text, so the two guides don't silently disagree about the same demo environment?
6. **Feedback link at the end of step 6.** The "give us feedback" link scraped from the Next.js source resolved to a Cloudflare email-obfuscation artifact (`https://docs.prepr.io/cdn-cgi/l/email-protection#...`), not a real destination. This draft replaced it with plain, unlinked text. What's the real feedback link used on the published Next.js guide (a form, a mailto, a Slack link)? Restore it here once known.
