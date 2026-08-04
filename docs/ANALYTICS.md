# Roll & Charge — Analytics Specification

**Status:** scaffold is live and inert. Events push to `window.dataLayer` via `assets/analytics.js`. Nothing is collected until a GTM container (or GA4 gtag) snippet with a real ID is pasted into the `<head>` of every page at the marked comment (`<!-- GTM: paste container snippet here -->`). IDs live in `data/site.json → analytics`.

## Setup (one-time)
1. Create GA4 property + GTM container (or GA4 alone).
2. Paste the GTM snippet at the head comment on all 20 pages (search for the comment string, or ask Claude to inject from `data/site.json`).
3. In GTM: add a GA4 Configuration tag, then one GA4 Event tag per event below using dataLayer variable mapping.
4. Verify in GTM Preview + GA4 DebugView before launch.
5. Google Search Console + Bing Webmaster verification: add their meta tags to `<head>` of `index.html` (or DNS verify — preferred, survives redeploys). Vercel Speed Insights: enable in the Vercel dashboard (or `npx vercel speed-insights`).

## Events

| Event | Fires when | Parameters | Mark as conversion? |
|---|---|---|---|
| `rc_attribution` | Page load in a session that arrived with UTM params | `source, medium, campaign, landed` | No (context) |
| `booking_intent_click` | Any click on a CTA linking to `#booking` | `page, cta` (button text) | No |
| `call_click` | Any `tel:` link click | `page` | **Yes** |
| `text_click` | Any `sms:` link click | `page` | **Yes** |
| `form_start` | First focus on any field of the request form | `page` | No |
| `form_step_complete` | Step 1 → Step 2 transition (validated) | `step: 1, service, city` | No |
| `form_error` | Step-2 validation failure on submit | `step: 2` | No |
| `appointment_request_submitted` | Two-step form validated & success panel shown | `service, city, vehicle` | **Yes** (primary) |

Notes:
- `appointment_request_submitted` fires only after full validation — never on button click alone. Honeypot submissions never fire it.
- Second-vehicle interest: parse `notes` mentions operationally, or add a checkbox event later.
- Residential vs fleet: `service` parameter = "Fleet Tire Service" identifies fleet leads.
- New vs returning, confirmed appointment, completed appointment, and revenue attribution happen in the booking/ops system (CRM/scheduler), not on-site — join on phone/email.

## Do not
- Fire conversions on `booking_intent_click` (it's an intent proxy, not a lead).
- Add ad-platform pixels without adding consent management (see LAUNCH-READINESS: consent).
