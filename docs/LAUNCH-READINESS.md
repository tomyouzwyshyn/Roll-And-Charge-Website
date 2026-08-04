# Roll & Charge — Launch Readiness Report
*2026-08-04 · CRO / technical SEO / local SEO / UX pass. Staging: roll-and-charge-website.vercel.app · Production target: rollandcharge.com*

## 1. Summary of changes (this pass)
- **Staging protected:** `vercel.json` now serves `X-Robots-Tag: noindex, nofollow` on any `*.vercel.app` host; production domain unaffected. All canonicals/sitemap/schema URLs already use `rollandcharge.com` only.
- **Consistency bugs fixed:** Burlington/Milton pages showed "Oakville Pricing. No Asterisks." (now per-city); Halton Hills added to hero badge ("Now Serving All of Halton Region"), pricing copy, homepage FAQ, and the booking city dropdown; winter-guide $79 wording scoped to on-rim.
- **Source of truth created:** `data/site.json` — prices, NAP, hours, guarantees, policies, service areas, booking mode, analytics IDs, with `*IsPlaceholder` flags.
- **Booking honesty + conversion:** every "Book" CTA renamed to "Request an Appointment" (or variant); form rebuilt as a **two-step request** (Step 1: service/vehicle/city/timeframe → Step 2: contact/address/notes) with inline validation, error messages, honeypot, duplicate-submit lock, success state with explicit "not confirmed until we reply — 30-minute business-hours text-back," privacy/consent notice, and email/SMS handoff (no backend yet).
- **Policies:** `/policies/` — Privacy, Terms, Cancellation, Weather, Warranty, 45-Day Promise terms, Storage terms, Payment/Refund, Accessibility; legal-review flags inline; linked from every footer + the form.
- **7 new service landing pages** (unique copy, included/excluded, duration, process, FAQs + FAQPage/Service/Breadcrumb schema): seasonal-tire-change, tire-swap-on-rims, tire-changeover, flat-tire-repair, wheel-balancing, tire-storage, multi-vehicle. Existing /tires/, /roadside/, /electric-vehicles/, /services/fleet/ complete the 11-service set. Homepage cards + footers now link to them.
- **A11y:** skip-to-content link, `:focus-visible` outlines, `<main id>` landmarks, form labels/aria-invalid, reduced-motion already supported.
- **Analytics scaffold:** `assets/analytics.js` on all 20 pages — dataLayer events (call/text/booking-intent clicks, form start/step/error/submit, UTM persistence). Inert until GTM/GA4 ID added. Spec: `docs/ANALYTICS.md`.
- **AI search:** robots.txt explicitly allows OAI-SearchBot/Perplexity/Claude, flags GPTBot as a documented business decision; llms.txt refreshed with all pages+prices; Q&A blocks and crawlable pricing already sitewide.
- **SEO infra:** sitemap regenerated (20 URLs), Wix 301 map updated to deeper targets (e.g. mobile-tire-repair → /services/flat-tire-repair/), asset cache headers (1y immutable).

## 2. Unresolved placeholders
| Item | Where | Blocking? |
|---|---|---|
| Phone (555) 123-4567 | sitewide + schema | **YES** |
| hello@rollandcharge.com unverified | footer, form handoff | **YES** |
| Form endpoint (email/SMS compose fallback in use) | `data/site.json → booking.formEndpoint` | **YES** (works, but a real endpoint/scheduler converts far better) |
| Photo: tech + van | welcome + all service pages (`assets/placeholders/photo-team-van.svg`) | No (labelled placeholder) |
| Video: 60-second swap | homepage on-site section | No (labelled) |
| Insurer name / policy details | policies page, trust copy | Before publishing specifics |
| Cancellation fee $49 | policies | Confirm amount |
| Social profiles | schema `sameAs` (empty) | No |
| GTM/GA4 IDs | `data/site.json → analytics` | Before paid traffic |

## 3. Launch-blocking issues
1. Real phone number (voice + SMS) → replace sitewide (see §12).
2. Working inbox for hello@ (or chosen address).
3. Form destination: Formspree-class endpoint minimum; Square/scheduler preferred.
4. Legal review of /policies/ (drafts are flagged).
5. Pricing final sign-off (currently owner-approved launch set, flagged in site.json).
6. DNS cutover Wix → Vercel + add rollandcharge.com to the Vercel project (301 map is ready).
7. Google Business Profile created + verified (Map Pack is above every organic result).

## 4. Legal review required
All /policies/ sections marked "Draft"; the 45-Day Promise scope; storage disposal clause; cancellation fee; insurance claims wording; CASL compliance of consent line (form collects consent for transactional contact only).

## 5. Information needed from Roll & Charge
Phone/SMS number · confirmed email · legal entity name · insurer + policy type · final prices · cancellation fee · social URLs · GTM/GA4 IDs · real photos/video per shot list (in placeholders + §11) · founder bio for /about/ · first Google reviews when they exist.

## 6. Page-by-page SEO summary (20 pages)
All pages: unique title (keyword-first, ≤105 chars), unique meta description, self-canonical to production domain, single H1, breadcrumbs (visible + schema), OG/Twitter tags, mobile-clean at 390px.
- `/` — AutoRepair+GeoCircle+OfferCatalog(PriceSpecification)+FAQPage+WebSite schema
- 4 city pages — Service+FAQPage+Breadcrumb, deep-local content, nearby-city links
- 7 new service pages + /tires/ /roadside/ /electric-vehicles/ /services/fleet/ — Service+FAQPage+Breadcrumb, price in title where fixed
- /winter-tires-ontario/ — Article+FAQPage+Breadcrumb, dated
- /policies/ — Breadcrumb, indexable
- /about/ /careers/ — AboutPage / JobPosting

## 7. Structured-data validation
All JSON-LD blocks parse (automated check on every page, every audit run) and mirror visible content; no AggregateRating anywhere (no reviews yet — by design). Final step for owner: run 3–4 key pages through Google's Rich Results Test after DNS cutover (can't be automated from here).

## 8. Performance
Static HTML, self-hosted images (one preloaded hero JPEG ~230KB, SVG placeholders ~4KB), no fonts to load (system stack), analytics deferred, 1-year immutable caching on /assets/. Expected CWV: LCP well under 2.5s on 4G (hero preload + no render-blocking beyond Tailwind CDN), CLS ~0 (explicit image dimensions), INP minimal (almost no JS). **Known debt:** Tailwind CDN script (~100KB, runtime-generated styles) — acceptable at launch, flagged for a build-step swap post-launch. Replacing placeholders: keep images ≤250KB (see §11) and CWV holds.

## 9. Accessibility found/corrected
Added: skip link, :focus-visible outlines (all interactive elements), main landmarks, aria-invalid + inline error association on form fields, sr-only legends on fieldsets, aria-hidden on decorative SVGs, honeypot removed from tab order. Already present: reduced-motion support, labelled inputs, correct mobile keyboards (tel/email/numeric), AA contrast (verified when re-paletting), alt text (descriptive or empty-decorative). Remaining note: mobile menu is a simple toggle (no focus trap) — acceptable, tracked.

## 10. Analytics events
See `docs/ANALYTICS.md` (8 events, 3 conversions, setup steps, GTM/GSC/Bing/Speed-Insights checklist).

## 11. Replacing placeholder media
Swap files at the same path, same format or JPG/WebP at listed dimensions, ≤250KB:
- `assets/placeholders/photo-team-van.svg` (900×675) → real tech+van driveway photo (shot spec is printed on the placeholder)
- `assets/placeholders/video-driveway-swap.svg` (1280×720) → replace the `<img>` with a click-to-play embed + poster (storyboard on the placeholder)
- `assets/tires-hero.jpg` (1600×1067) → real hero shot; keep filename to keep the preload
Shot list for the content day: van arriving · tech greeting · equipment unload · tire off/on · balancing · torque close-up · EV lift-puck · finished car · clean driveway · customer testimonial · founder intro · 60-sec how-it-works.

## 12. Changing prices / cities / contact info
Canonical values: `data/site.json`. Today the HTML carries the same values inline; to change one: update site.json, then find-and-replace the old value across `*.html` (all instances are consistent — one search per value), or ask Claude to sync. The QA harness (`.tmp/qa-audit.mjs`) verifies price tokens and phone consistency on every page and fails loudly on drift. Adding a city: copy a city page, replace content per the deepening checklist (neighbourhoods, roads, FAQs must be locally true), add to navs/footers/sitemap/nearby-links.

## 13. Pre-launch QA checklist
- [ ] Replace phone/email sitewide; re-run `.tmp/qa-audit.mjs` (validates consistency)
- [ ] Connect form endpoint or scheduler; test a real submission end-to-end on a phone
- [ ] Legal sign-off on /policies/; remove "Draft" flags
- [ ] Final prices confirmed; site.json + pages in sync (audit passes)
- [ ] GTM/GA4 live; conversions verified in DebugView; GSC + Bing verified; Speed Insights on
- [ ] GBP verified with matching NAP
- [ ] Add rollandcharge.com to Vercel project; DNS cutover; confirm 301s from old Wix URLs
- [ ] Confirm production serves NO X-Robots-Tag noindex; staging still does
- [ ] Rich Results Test on /, one city page, one service page
- [ ] Real photos/video in place; page weight re-checked
- [ ] Lighthouse mobile run ≥90 performance on / and a city page
- [ ] Submit sitemap in GSC
