# Veyro — Detailed Product and Implementation Plan

- Created: 2026-10-14
- Status: Planning reference; application features have not been implemented.
- Working product name: **Veyro**. Domain and trademark availability are unverified.

## How to use this document

This is the reference for building the first public version of Veyro. It consolidates the product interview, records implementation decisions, and defines acceptance criteria. Work through the implementation phases in order, updating their checkboxes as the associated behavior is verified.

- **CONFIRMED** means the founder chose the behavior during the interview or accepted the resulting specification.
- **IMPLEMENTATION DEFAULT** means this plan selects a concrete technical or operational approach to implement the agreed product. These choices do not add new product tiers or replace the chosen platform.
- **ASSUMPTION** means a provisional choice still needs practical validation, such as branding, model quality, or operating cost.
- **LAUNCH GATE** means a condition must be verified before accepting real customer payments. It does not block unrelated local implementation.

Do not treat a planned integration, test, or deployment as already completed. When a product decision changes, update the decision register and the affected behavior, schema, tests, and pricing copy together.

## Contents

1. [Product and decision register](#1-product-and-decision-register)
2. [Scope and commercial rules](#2-scope-and-commercial-rules)
3. [Pages, navigation, and user experience](#3-pages-navigation-and-user-experience)
4. [Architecture and dependencies](#4-architecture-and-dependencies)
5. [Data model and validation](#5-data-model-and-validation)
6. [Application interfaces](#6-application-interfaces)
7. [Authentication, authorization, and autosave](#7-authentication-authorization-and-autosave)
8. [AI generation, review, and credit accounting](#8-ai-generation-review-and-credit-accounting)
9. [Polar billing and reconciliation](#9-polar-billing-and-reconciliation)
10. [Template, preview, and PDF export](#10-template-preview-and-pdf-export)
11. [Privacy, deletion, and security](#11-privacy-deletion-and-security)
12. [Background work and failure handling](#12-background-work-and-failure-handling)
13. [Observability, performance, and cost](#13-observability-performance-and-cost)
14. [Environments, configuration, and deployment](#14-environments-configuration-and-deployment)
15. [Implementation phases](#15-implementation-phases)
16. [Testing and definition of done](#16-testing-and-definition-of-done)
17. [Assumptions, risks, and future direction](#17-assumptions-risks-and-future-direction)
18. [Documentation and version references](#18-documentation-and-version-references)

## 1. Product and decision register

### Product goal

Help an individual job seeker turn their real experience into a clear, professional resume, adapt it to a particular job, and download a usable PDF. Users remain in control of the final wording. The application must remain useful without paid AI usage.

The primary audience is general job seekers creating English-language resumes across professions. The first release is a real, public, paid SaaS, not a tutorial-only demonstration. There is no fixed launch deadline: readiness is defined by the acceptance criteria in this document.

### Confirmed decisions

| Area | Decision |
| --- | --- |
| Hosting | Keep the existing Cloudways Velocity / Managed Node.js deployment. |
| Application framework | Keep Next.js and the App Router. |
| Database | Neon Postgres. |
| Identity | Neon managed authentication with Google sign-in only. |
| Custom server logic | Next.js running on Cloudways, plus one `ai` Neon Function that holds the OpenAI key and is callable only by the app server (added 2026-10-16). |
| AI access | OpenAI API directly, called from the `ai` Neon Function (changed 2026-10-16; previously Neon AI Gateway). |
| Billing | Polar; founder operates from Turkey. |
| Starting a resume | Sign in first, then manually enter information in forms. |
| Resume ownership | Private, individually owned resumes; no shared master profile. |
| Tailoring | An independent copy, preserving the original and consuming a resume slot. |
| Job context | Keep the job description privately with the tailored copy. |
| AI review | Users may edit, accept, or reject individual suggestions. |
| AI factual policy | Use supplied facts only; flag missing details separately. |
| Template | One fixed professional design and fixed section order. |
| Reordering | Reorder entries within sections, including skills; no section rearrangement. |
| Saving | Autosave with visible status and protection against stale updates. |
| Mobile | Full create/edit/AI/billing/export workflow. |
| PDF | Automatic pagination, no watermark, unlimited downloads on both plans. |
| File storage | Generate PDFs on demand; no uploaded or stored files in v1. |
| Free plan | 2 saved resumes and 10 lifetime AI credits. |
| Pro plan | USD $9/month before applicable taxes; 20 resumes and 200 AI credits per billing month. |
| Downgrade | Preserve editing and downloads for all existing resumes; restrict creation to the free limit. |
| Deletion | Confirmed deletion without in-app recovery; account deletion stops future subscription charges. |
| AI retention | Resume text sent for AI actions falls under OpenAI's API data controls (not used for training by default; abuse-monitoring logs kept up to 30 days); Neon's policies cover the database and Function logs. Minimize information sent. |
| Administration | Neon and Polar dashboards, plus a support contact; no custom admin UI. |
| Initial scale | Up to 100 monthly active users during the first three months. |
| Service budget | Target at most $50/month, excluding existing Cloudways hosting and payment-processing fees. |
| Likely v2 | More templates and customization. |

## 2. Scope and commercial rules

### Included in v1

1. Public marketing and pricing pages, Google sign-in, account settings, and support/policy pages.
2. A resume dashboard with create, open, rename, duplicate, and delete actions.
3. A structured editor for contact details, summary, experience, education, skills, and projects.
4. One professional template with live preview and reliable PDF export.
5. Bullet improvement, summary generation, and job tailoring with reviewable suggestions.
6. Free and Pro plans with server-enforced resume and AI limits.
7. Polar checkout, customer portal, verified webhook handling, and subscription reconciliation.
8. Account deletion, basic operational monitoring, and the tests needed for a paid launch.

### Explicitly excluded

No guest editor, PDF/DOCX import, whole-resume paste parsing, LinkedIn import, profile photos, file uploads, public resume links, collaboration, coach/team accounts, custom admin dashboard, cover letters, application tracking, job-match scores, interview coaching, AI chat, custom resume sections, undo history across sessions, restore-from-trash UI, annual plans, credit packs, promotional trials, or automatic refunds.

English is the interface and AI output language. Support real names and ordinary Unicode text, but translated interfaces and multilingual resume-generation guarantees are outside v1. Do not advertise guaranteed ATS scores, interviews, or hiring outcomes.

### Plan rules

| Capability | Free | Pro |
| --- | --- | --- |
| Saved resumes | 2 | 20 |
| AI allowance | 10 credits once per account | 200 credits for each successfully paid billing period |
| Manual editing | Unlimited within ordinary request rate limits | Same |
| PDF downloads | Unlimited; watermark-free | Same |
| Template access | The single v1 template | Same |
| Job tailoring | Available when credits and a resume slot are available | Same |

Credit weights are the accepted default: **bullet improvement = 1; summary generation = 2; tailoring = 5**. Display the cost before every AI action. A valid suggestion saved and made retrievable consumes credits even if the user rejects it. Failed or invalid generations do not consume user credits. Provider charges for failed generations remain an application expense.

Pro credits do not roll over. The original free grant is not replenished by cancellation, renewal, reactivation, or signing out. While Pro is active, use only its current period's allowance; preserve any unused original free credits for a later return to Free. Do not stack the two allowances or silently spend trial credits after paid credits run out.

The billing period comes from Polar's verified paid order and subscription data. It is not a calendar-month counter or a client-clock calculation. Expiration is checked at request time, even if a webhook or background task is delayed.

Cancellation normally stops renewal and preserves paid access until the paid-through date. At expiration, existing resumes remain editable and downloadable, even if their count exceeds 2. New blank resumes, duplicates, and tailored copies are blocked until the count is **below** 2. The equivalent below-20 rule applies to Pro. Deleting a resume restores a slot but never refunds AI credits.

There is no credit card requirement for Free and no additional trial period for Pro. Use Polar's hosted portal for cancellation and payment-method updates. Handle refund requests manually in Polar under the published policy; mandatory customer rights and Polar requirements still apply.

## 3. Pages, navigation, and user experience

### Route map

| Route | Access | Purpose |
| --- | --- | --- |
| `/` | Public | Product promise, real sample resume, feature explanation, and start CTA. |
| `/pricing` | Public | Exact free/paid limits, credit weights, cancellation policy, and upgrade CTA. |
| `/auth/sign-in` | Public | One Google sign-in button, concise terms/privacy notice, actionable errors. |
| `/dashboard` | Authenticated | Resume cards, usage summary, create/duplicate/delete/rename. |
| `/resumes/[resumeId]` | Owner only | Editor, preview, AI suggestions, job context, and export. |
| `/account` | Authenticated | Identity display, AI disclosure, support, and account deletion. |
| `/billing` | Authenticated | Current plan, credits, renewal/expiration, checkout and portal links. |
| `/billing/success` | Authenticated | Verify subscription provisioning after returning from Polar. |
| `/privacy`, `/terms`, `/support` | Public | Actual product policies and a real support contact. |

Use a shared authenticated shell with dashboard, billing, and account links. Keep resume content and identifiers out of public page metadata. Unknown or non-owned resume IDs return the same not-found behavior. OAuth return paths must be validated same-origin paths.

### First-time flow

1. Visitor selects **Create your resume** from the landing or pricing page.
2. Google sign-in completes through Neon Auth.
3. The server creates the local account and its one-time free grant idempotently.
4. The dashboard shows a purposeful empty state and a **Create resume** button.
5. Creating a resume opens a blank draft titled `Untitled resume`; the user can rename it.
6. The user fills in fields, sees autosave status, and sees the template update.
7. AI actions show a brief first-use processing disclosure and the credit cost.
8. The user reviews suggestions and downloads a PDF without a payment requirement.

### Returning users and dashboard

Sort resumes by most recently updated, descending. Show title, last-edited time, and a job/company label for tailored copies. Avoid generating PDF thumbnails for every dashboard card; a simple document icon and metadata are sufficient. Provide a **Continue editing** action for the most recently edited resume.

An empty account offers resume creation. An exhausted AI allowance explains that editing and PDF export remain available. A full resume allowance offers deletion or an upgrade, with the actual count displayed. Deletion uses a named confirmation dialog. Duplicates receive a title such as `Original title — Copy`, fresh entry IDs, and no inherited AI review history.

### Editor behavior

- Desktop: form panel and preview side by side, with a persistent save indicator and export action.
- Mobile/tablet: an **Edit / Preview** switch; preserve form state and scroll position when switching.
- The fixed section order is contact header, summary, experience, education, projects, skills.
- Within repeatable sections, offer accessible move-up/move-down controls. Drag-and-drop is unnecessary for v1.
- Hide empty sections and empty optional lines in the rendered document.
- The summary is editable even if the user never uses AI.
- Keep billing upsells outside the resume document itself.
- Show loading states without clearing existing form data or a previous preview.
- Account, auth, and provider failures get plain-language messages and a retry path.

### Visual and accessibility defaults

Use the provisional Veyro identity, a light interface, neutral surfaces, dark text, and a restrained indigo accent. Keep the PDF itself primarily monochrome. Use the existing Tailwind setup and consistent small components for buttons, fields, dialogs, feedback, and cards. Dark mode is outside v1.

Support keyboard navigation, visible focus, labelled fields, field-level errors, accessible modal focus management, and non-color-only status indicators. Announce save/error state changes politely; do not announce every keystroke. Respect reduced motion. Test at 360 px phone width, tablet widths, and common desktop sizes without horizontal application scrolling.

## 4. Architecture and dependencies

### System boundaries

```text
Browser
  ├─ Public pages and authenticated editor
  ├─ Local form state and PDF preview
  └─ Same-origin requests to Next.js
          ├─ Neon Auth: Google identity and sessions
          ├─ Neon Postgres: resumes, credits, billing state, durable work
          ├─ `ai` Neon Function → OpenAI API: bounded text generation
          └─ Polar: checkout, subscriptions, portal, billing events

Cloudways Velocity runs Next.js and its small durable-work dispatcher.
Neon Storage is not required for v1. The one Neon Function (`ai`) keeps the OpenAI key off the app server and accepts only requests carrying the app server's shared secret plus the user's Neon Auth JWT.
```

The browser never receives database, OpenAI, Function, Polar, or administrative credentials. All business rules live in server-only services. Server Components load initial authenticated data directly through those services; they do not call the application's own HTTP endpoints. Client mutations use Route Handlers that invoke the same service layer.

### Runtime and dependency decisions

Keep the existing Next.js 16.4.0, React 19.3.0, TypeScript, Tailwind 4, npm, and package lock. Target **Node.js 24 LTS** in local development, CI, and Cloudways. Verify availability in the existing deployment; Node 22.13 or newer is the explicit compatibility fallback if Cloudways does not offer 24. Do not change hosting or downgrade Next.js to solve an SDK problem without recording that decision.

The following package versions were observed in npm metadata on 2026-10-14. They are planned starting versions, not installed dependencies or proof of end-to-end compatibility.

| Purpose | Planned library/version | Reason |
| --- | --- | --- |
| Neon managed auth | `@neondatabase/auth` 0.6.0-beta | Official Next.js integration; requires an early compatibility check because the SDK release is labelled beta. |
| SQL mapping | `drizzle-orm` 0.45.4 | Typed Postgres access and explicit transactional operations. |
| Migrations | `drizzle-kit` 0.31.11 | Versioned SQL migrations kept with the application. |
| Postgres connection | `pg` 8.23.1 | TCP connections and interactive transactions suit the persistent Node server. |
| Validation | `zod` 4.6.7 | Shared document, request, and AI-output validation. |
| Form state | `react-hook-form` 7.90.0 and `@hookform/resolvers` 5.9.1 | Repeatable sections and field validation without a global state framework. |
| Billing SDK | `@polar-sh/sdk` 1.0.2 | Official API and webhook verification; metadata requires Node 22+. |
| PDF generation | `@react-pdf/renderer` 4.9.0 | One document component for browser preview generation and server export. |
| Preview display | `pdfjs-dist` 6.4.299 | Consistent PDF page display on mobile and desktop; its Node engine metadata requires 22.13+ or 24+. |
| Tests | Vitest, Testing Library, Playwright | Pin compatible stable versions when installing; browser automation is test-only. |

Call OpenAI's chat-completions API with plain `fetch` inside the `ai` Neon Function, with explicit timeout and response validation; no OpenAI SDK is needed. Do not add Redux, Redis, a vector database, a separate API server, an external queue, or an ORM-generated auth schema.

Drizzle supports the chosen `pg` driver; use a shared small connection pool against Neon's pooled application endpoint. Migration credentials use a separate direct endpoint. Parameterize every query and use real transactions for quota-sensitive operations. [Drizzle Postgres reference](https://orm.drizzle.team/docs/get-started-postgresql)

### Next.js conventions specific to this repository

The current `next.config.ts` enables `cacheComponents` and `partialPrefetching`. Preserve the project's generated agent instructions and consult its installed Next.js guides before implementation.

- Place cookie/session-dependent components beneath appropriate Suspense boundaries.
- Keep identity, resume content, credits, and entitlements out of shared application caches in v1.
- Do not copy legacy `dynamic = 'force-dynamic'` examples into a Cache Components route.
- Use `proxy.ts` for navigation-level auth handling, while enforcing authorization again in the server data layer and every endpoint.
- Use the Node runtime and the existing production build/start workflow, not a static export.
- Return `Cache-Control: private, no-store` for sensitive APIs and PDFs; configure the hosting proxy accordingly.
- Public marketing content and immutable static assets may be cached independently of authenticated content.

These rules follow the installed authentication, Route Handler, migration, and self-hosting guides linked in section 18. A provider quickstart's framework example must be adapted to the installed version rather than copied blindly.

### Proposed code organization

```text
app/                  Pages, layouts, loading/error boundaries, Route Handlers
components/           Shared interface components and editor components
lib/auth/             Neon server/client adapters and local account resolution
lib/db/               Drizzle schema, pooled connection, repositories
lib/resumes/          Document schema, validation, ownership, versioned mutations
lib/ai/               Prompt contracts, gateway adapter, review and quota services
lib/billing/          Polar adapter, reconciliation, entitlement calculation
lib/pdf/              Shared resume document, typography, preview helpers
lib/jobs/             Durable work dispatcher and retry handlers
lib/observability/    Redacted structured events and request correlation
drizzle/              Reviewed SQL migrations
tests/                Unit, database integration, browser, and PDF fixtures
public/fonts/         Bundled licensed fonts used by the PDF renderer
instrumentation.ts    Node startup hook and sanitized server error reporting
```

Keep modules proportional to the application; these boundaries do not imply separate deployable services.

## 5. Data model and validation

### Storage approach

Use relational tables for account ownership, subscriptions, credit grants, and durable operations. Store the editable resume document as validated, versioned **JSONB** on its resume row. Editing, duplicating, and rendering operate on the whole document, so separate tables for each bullet or education entry are unnecessary in v1.

All internal primary keys are UUIDs and timestamps are UTC `timestamptz`. Treat the Neon Auth subject as opaque text. Do not assume it is a UUID or write directly into Neon's managed auth tables. Use database constraints in addition to application validation.

### Application tables

| Table | Important fields and relationships |
| --- | --- |
| `app_users` | `id`, unique `auth_subject`, account status (`active`, `deleting`, `deleted`), timestamps, AI disclosure version/acceptance time. Keep only the minimal identity display fields needed by the app. |
| `resumes` | `id`, `owner_id`, title, `template_id`, `schema_version`, `document` JSONB, integer `version`, optional `source_resume_id`, optional job context JSONB, timestamps. |
| `billing_customers` | Unique `owner_id`, unique Polar customer ID, reconciliation timestamps. The app user UUID is the Polar external customer ID. |
| `subscriptions` | Owner, unique Polar subscription ID, product ID, provider status, period dates, `paid_through`, cancellation flag, revocation/refund state, last authoritative sync time. Retain historical subscriptions; allow at most one live Pro subscription per owner. |
| `credit_grants` | Owner, kind (`trial`, `subscription`), unique grant key, subscription/order references, validity dates, granted/reserved/used integer counts, revoked flag. |
| `ai_requests` | Owner, unique owner/idempotency key, action type, source/target resume references, input fingerprint, baseline snapshot, grant reference, cost, state, lease expiry, optional slot reservation, model/prompt version, token/cost metadata, validated result, safe error code, timestamps. |
| `ai_suggestions` | Request and resume references, stable target entry IDs, original value, proposed value, reason, status (`pending`, `accepted`, `rejected`, `stale`), applied value/time. |
| `billing_events` | Unique provider event ID, event type, customer/order/subscription references, receipt time, processing state, attempt count, safe error code. Retain only necessary verified event fields. |
| `background_jobs` | Kind, unique deduplication key, bounded payload, state, attempts, `run_after`, lease token/expiry, timestamps, safe failure code. |
| `mutation_receipts` | Owner, idempotency key, operation, input fingerprint, result reference, expiry. Used for creates/duplicates and retry-safe save acknowledgement. |
| `rate_limit_buckets` | Hashed subject/operation/window key, counter, expiration. Provides shared limits across server instances. |
| `product_events` | Allowlisted event name, optional pseudonymous owner ID, small non-content properties, timestamp; no session replay or advertising identifiers. |

Use foreign keys and owner-scoped indexes. Index resumes by `(owner_id, updated_at, id)`, jobs by `(state, run_after)`, and pending requests by owner/state/lease expiry. Counts in credit grants must be nonnegative and `reserved + used <= granted`. Enforce uniqueness for a trial grant per local account, a paid grant per verified paid order, and idempotency keys per owner.

Deleting an original resume must not delete a tailored copy: use `source_resume_id` with `ON DELETE SET NULL`. Content records cascade with the deleted resume; any required accounting record survives only with content removed and the content foreign key nulled. Account deletion removes content promptly while the deletion coordinator retains the minimum records needed to finish billing/auth cleanup.

### Resume document contract

Every repeatable item, including an individual bullet, has a stable UUID. Array position determines display order. AI targeting uses IDs rather than array indices.

| Section | Fields |
| --- | --- |
| Contact | Full name, professional headline, email, phone, location, website, LinkedIn, optional GitHub URL. |
| Summary | Plain-text professional summary. |
| Experience | ID, employer, role, location, start month, optional end month, current-role flag, ordered bullet objects with ID/text. |
| Education | ID, institution, degree, field of study, location, start/end month, current-study flag, optional details. |
| Projects | ID, name, role/short description, optional URL, optional dates, ordered bullet objects with ID/text. |
| Skills | Ordered skill objects with ID/name. |
| Presentation | Template ID `professional-v1` and page size (`A4` or `LETTER`); no user-controlled fonts, colors, or section order. |
| Job context | Job title and company if supplied, the pasted description, and the time of tailoring; not printed in the resume. |

Contact data belongs to each resume. Changing one resume does not update another. Copying a resume copies its content, not a live reference to a profile. Duplicating a tailored resume preserves its job context; AI review history is not copied.

### Validation defaults

- Drafts may be incomplete. Require a nonempty internal title; use the default title when creating a blank draft.
- Before PDF export require a full name and at least one substantive section. Email and phone are optional; validate them if provided.
- Store dates as `YYYY-MM` values, not artificial day-level timestamps. End dates cannot precede start dates. A current-role/study flag replaces its end date.
- Allow plain text only. Do not render user text as HTML or accept rich text markup.
- Allow only `https:` and `http:` external link schemes. Contact links are generated safely from validated email/phone fields.
- Proposed safety limits: title 120 characters; normal short fields 200; URLs 2,048; summary 2,000; each bullet 1,000; job description 15,000; 30 experience entries; 20 education entries; 30 projects; 80 skills; 12 bullets per experience/project.
- Limit the complete resume JSON request body to 256 KiB. AI has additional input limits described below; a document can be valid for editing but too long for an AI operation.
- For invalid draft field content, preserve it in the current form and explain why saving is blocked; never silently truncate it or claim it was saved.
- Share validation definitions between browser and server, with the server as the authority. Test accented names, Unicode punctuation, long URLs, and pasted multiline content.

## 6. Application interfaces

These are internal application contracts, not a public developer API. Use JSON for application endpoints and the provider-defined format for auth/webhooks. All owner IDs, plan assignments, credit costs, model IDs, and product IDs come from the authenticated server context or server configuration.

| Method and route | Contract |
| --- | --- |
| `GET /api/resumes` | Owner-scoped dashboard metadata, counts, and limit state; no full resume documents in list results. |
| `POST /api/resumes` | Create a blank draft with an idempotency key; atomically enforce the resume limit. |
| `GET /api/resumes/[id]` | Return the owned resume, version, job context, and pending suggestion metadata. |
| `PATCH /api/resumes/[id]` | Save title/document and allowed metadata with `expectedVersion` and a mutation ID; return the new version and timestamp. |
| `DELETE /api/resumes/[id]` | Confirmed owner-authorized deletion; cancel in-flight work that would recreate or modify it. |
| `POST /api/resumes/[id]/duplicate` | Duplicate an owned document with an idempotency key and atomic slot check. |
| `POST /api/resumes/[id]/ai` | `kind`, expected source version, target IDs when relevant, job context for tailoring, idempotency key; server determines credit cost. |
| `GET /api/ai/requests/[requestId]` | Owner-only processing/failure/completion state, target resume ID, and validated results for recovery after disconnect. |
| `POST /api/ai/suggestions/[suggestionId]/review` | Accept with optional edited text, or reject; acceptance includes expected resume version and verifies the target's original value. |
| `GET /api/resumes/[id]/pdf?version=…` | Owner-only PDF of the exact saved version; return a conflict if the version has changed. |
| `GET /api/billing/status` | Effective plan, counts, remaining/reserved credits, paid-through/reset dates, and pending-sync state. |
| `POST /api/billing/checkout` | Create/reuse a bounded pending checkout for the server-selected Pro product and authenticated customer. |
| `POST /api/billing/portal` | Generate a short-lived portal URL for the authenticated customer's Polar account. |
| `POST /api/billing/sync` | Rate-limited reconciliation for the authenticated customer after checkout or billing changes. |
| `POST /api/webhooks/polar` | Publicly reachable endpoint with mandatory provider signature verification and durable event insertion. |
| `POST /api/account/delete` | Fresh authenticated confirmation; start a retryable deletion operation and return its status. |
| `GET /api/account/deletion-status` | Return only deletion progress for the authenticated deleting account while its session remains available. |
| `GET /api/health` | Minimal process health without environment, account, or database details. |
| `/api/auth/[...path]` | Neon SDK-owned auth proxy contract; do not replace its behavior with app-specific JSON conventions. |

Use a consistent error envelope containing a stable error code, safe human-readable message, optional field errors, and request ID. Use `400/422` for invalid input, `401` for missing/expired sessions, `404` for missing or non-owned resources, `409` for stale versions or idempotency conflicts, `403` for insufficient entitlement, `429` with retry information for rate limits, and `503` for temporary provider unavailability.

Pending AI and deletion operations can return `202`. Never return internal stack traces, raw SQL errors, full provider payloads, or secret configuration. A checkout return URL is not proof of payment.

## 7. Authentication, authorization, and autosave

### Authentication and ownership

Use the Neon Next.js server/client adapters and auth proxy. Configure only Google as the application sign-in method, with production-owned Google OAuth credentials and exact trusted domains. Disable email/password registration and unused providers at the managed-auth configuration level; hiding their buttons is insufficient. Verify this configuration capability in phase 0. Do not rely on shared development Google credentials in production. Follow the current [Neon Next.js integration](https://neon.com/docs/auth/quick-start/nextjs-api-only), adapting its rendering examples to this repository's Cache Components configuration.

Resolve the session to an internal app user in a server-only helper. Create the local account and initial grant using unique constraints and one transaction, so concurrent first requests do not create two trial allowances. Identity comes from the validated provider subject, not an email address supplied by the browser.

Every read and mutation verifies an active account and ownership. Ownership checks apply equally to document reads, AI requests/results, suggestion review, PDF exports, duplicates, job context, and billing portal access. A route guard improves navigation but is never the only security control.

The browser has no direct database access. Use a least-privilege application database role distinct from the migration role. V1 uses a centralized owner-scoped server data layer rather than introducing browser-side Neon Data API access or claiming RLS is configured when it is not. Cross-account integration tests are mandatory.

### Autosave protocol

1. Keep the editable draft and last acknowledged server version in component/form state.
2. Debounce valid changes for 750 ms. Send at most one save per resume at a time; coalesce further keystrokes into the next save.
3. Send the whole validated document with the expected version and a unique mutation ID.
4. Update atomically only when both owner and version match; increment the version and store a retry receipt in the same transaction.
5. Return the authoritative version/timestamp. A retry of the same mutation ID returns its prior acknowledgement rather than reporting a false conflict after a lost response.
6. If another tab changed the resume, return a conflict. Stop autosave, preserve the local draft, and offer to load the latest version or explicitly replace it after review. Never silently use last-write-wins.
7. A deliberate replacement first fetches the latest version and uses normal version-checked saving; another intervening edit can still produce a conflict.
8. Flush pending saves before AI generation, duplication from the editor, and PDF export. If saving fails, do not run those actions against an older document while implying they used current text.

Show `Unsaved`, `Saving`, `Saved`, `Save failed — retry`, or `Conflict — review required` as appropriate. Keep the form editable during transient network failures. Retry transient save failures with bounded delays of 1, 2, and 4 seconds; retain the same mutation ID for an uncertain acknowledgement. Do not retry validation, authorization, or version conflicts automatically.

Use a navigation/unload warning only when there are unacknowledged changes. V1 does not promise offline editing across reloads and does not store resume bodies in localStorage. During session expiry, preserve the in-memory draft and provide sign-in/retry guidance; do not imply unsaved content will survive closing the page.

Server Component reads establish the initial state; the editor owns its active draft afterward. Use local React state for form panels/dialogs and the URL only for non-sensitive navigation state such as the active editor section. No resume text or job description goes into URLs. Reconcile dashboard/billing data after relevant mutations and on focus; real-time sockets are unnecessary.

## 8. AI generation, review, and credit accounting

### Provider and model

Call the OpenAI API directly from the `ai` Neon Function, which holds `OPENAI_API_KEY` as a Function secret. Keep the model ID, endpoint, prompt version, and output schema version in server configuration. The current model is `gpt-5.4-mini` (`reasoning_effort` `none`, `low` for tailoring), chosen after live testing on 2026-10-16; its resume-writing quality beyond those tests remains an **ASSUMPTION**.

The transport is OpenAI's chat-completions endpoint with strict JSON-schema output ([structured outputs](https://developers.openai.com/api/docs/guides/structured-outputs)). Request schema-constrained output when supported and always validate the actual result with Zod. If schema-constrained generation is unavailable, a JSON-only prompt still requires identical server validation; malformed output is a failed request, never content to apply directly. 

### Action contracts

| Action | Input | Allowed result | Credit cost |
| --- | --- | --- | --- |
| Improve bullet | One selected experience bullet and relevant role context | One rewritten bullet and a short explanation/missing-detail note | 1 |
| Generate summary | Relevant experience, education, projects, and skills | One concise professional summary and optional missing-detail notes | 2 |
| Tailor to job | Saved resume snapshot and pasted job description | Proposed summary, experience/project text replacements, and a permutation of existing skills | 5 |

Do not ask the model for the entire application document schema when only a bullet is changing. Do not let a model response choose owner IDs, prices, SQL, URLs to fetch, or arbitrary object paths. A tailoring result uses allowlisted operations and stable existing entry IDs. An existing skill may move; an unlisted skill may not appear. Dates, employers, qualifications, and job titles are not AI-editable fields in v1.

Target concise English wording with clear action verbs and concrete supplied facts. Do not invent metrics, seniority, tools, achievements, degrees, employers, responsibilities, or credentials. Avoid statements of proficiency not supported by the input. Missing details are notes for the user, not fabricated placeholders inserted into the resume.

Treat job descriptions and resume fields as untrusted source text, including any instructions embedded in them. Delimit them from the system task; provide no tools, browsing, file access, or privileged data to the model. Reject unrecognized target IDs, duplicate operations, oversized text, invalid skill permutations, or malformed JSON. Human review remains required because schema validation cannot prove factual accuracy.

Before the first AI use, explain that relevant resume content is processed by OpenAI. Exclude full name, email, phone, street address, personal URLs, and internal account identifiers. Preserve employer, education, and project context when relevant to the requested writing task; do not claim the remaining content is anonymous.

### Request limits and timeouts

IMPLEMENTATION DEFAULT: allow one in-flight AI operation per account and a maximum of 5 AI starts per minute per account. Validate content size and token allowance before reserving credits. An initial generation has a 45-second timeout, and its database reservation has a 120-second lease.

Use these initial token budgets, counting system instructions and schema overhead within the input allowance:

| Action | Maximum input tokens | Maximum billable output tokens |
| --- | --- | --- |
| Bullet | 2,000 | 600 |
| Summary | 8,000 | 1,200 |
| Tailoring | 12,000 | 4,000 |

Use a compatible tokenizer or a verified conservative bound. Do not silently truncate a job description or remove resume facts to fit. Explain the limit and ask the user to shorten the relevant input. Confirm how the selected model counts reasoning/output tokens before treating these limits as cost bounds.

Do not silently switch models, retry through a different provider, or perform paid follow-up calls. V1 has no automatic generation retry. A user-requested retry is a new idempotency key and a new reservation. Reading an already completed result never generates again.

### Atomic reservation and completion

1. Authenticate, verify account/ownership, flush and check the source version, validate inputs, and apply abuse limits.
2. Lock the owner's account row in a short database transaction. All create, duplicate, tailor-reservation, and credit-reservation operations use this same lock order.
3. Check whether the idempotency key already exists. An identical operation returns its saved state; the same key with different input returns a conflict.
4. Resolve the effective plan and eligible grant. Check available credits as `granted - used - reserved`.
5. For tailoring, check `saved resumes + active reserved slots < plan limit` and reserve one slot as well as 5 credits.
6. Persist the request, a bounded private baseline snapshot, reservation, and lease. Commit before calling the model; never hold a database lock while waiting for AI.
7. Call Neon once. Validate the response and allowed changes.
8. In a new short transaction, verify the operation still owns a live lease and has not been canceled by deletion or account revocation.
9. Persist the result and suggestions. For tailoring, create the independent copy from the captured baseline, assign fresh content IDs with a server-maintained mapping, attach job context, and release the slot reservation.
10. Settle reserved credits into used credits atomically with the retrievable result. A successfully committed result is considered delivered even if the HTTP response is lost; the client can retrieve it by request ID.
11. On provider failure, timeout, invalid output, or transaction failure before successful completion, mark the request failed and release its credit/slot reservation exactly once.

A period rollover does not transfer an existing reservation to the next grant. A request that began while eligible may complete within its lease against its original grant; a normal downgrade can therefore leave one already-reserved copy above the new limit. Account deletion, explicit billing revocation, or deletion of the source cancels unfinished operations. Expired leases cannot settle late results.

The maintenance dispatcher expires orphaned leases after a process crash. This restores user credits and resume slots; it does not imply the provider refunded the application. Keep enough non-content metadata to measure these costs.

### Tailoring and review experience

Show that tailoring creates a separate copy and uses a resume slot before the user starts. A failed generation creates no visible extra resume. A successful generation opens the copy with original text and pending suggestions; rejecting every suggestion leaves an unchanged copy that the user can keep or delete.

Show original/proposed text and a brief reason for each suggestion. Users may edit the proposed text before accepting. Summary generation is one reviewable suggestion, not an immediate overwrite. Skill prioritization is a single reviewable reorder operation.

Acceptance flushes local edits, checks the server version and target's original value, applies the allowed change atomically, records the review, and returns the updated document/version. If the target changed, mark the suggestion stale and preserve the current content; allow copying its text manually but do not force it onto a different entry. Rejection changes only review state and never refunds a successful generation.

Persist pending suggestions so refreshing or briefly leaving does not lose a paid result. They are private content, not observability logs. Retain review content for 30 days or until the associated resume/account is deleted, whichever comes first. Keep accepted text as part of the resume regardless of review-history cleanup.

On a lost HTTP response, poll the same operation while it is unresolved; do not submit a new generation automatically. Poll every 2 seconds while the editor is visible, stop once resolved, and stop/slow when hidden. A process crash eventually produces a recoverable failed status after lease cleanup.

## 9. Polar billing and reconciliation

### Ownership and checkout

Create one monthly Pro product at USD $9 before applicable taxes, with no annual option or additional free trial. Polar owns payment collection, subscription billing, receipts, and the customer portal. The application owns resume limits, its internal AI credit grants, and entitlement enforcement. These app credits are unrelated to Neon's dollar-denominated prepaid Gateway balance.

Bind the Polar customer to the app user's immutable UUID using the external customer identifier. Never associate a checkout based solely on a client-supplied email, customer ID, or return URL. The server selects the allowed product and checks for an existing active subscription before creating checkout. Reuse a still-valid pending checkout for duplicate clicks and expire pending-checkout records.

If Pro is already active, direct the user to billing/portal instead of creating another subscription. Detect any unexpected second live subscription during reconciliation, alert the operator, and resolve it in Polar rather than granting another allowance.

After checkout, `/billing/success` shows verification progress and invokes authenticated reconciliation. A successful redirect is not an entitlement. If verification is delayed, keep existing access, show a refresh action, and allow the user to leave the page safely.

### Verified event ingestion

Read the unmodified request body, validate Polar's signature with the current SDK and the environment-specific secret, then insert the event and a deduplicated reconciliation job in one transaction. Respond successfully only after this durable write. Invalid signatures receive a rejection and no database mutation.

Keep ingestion fast; do not call the AI service or run account cleanup inside a webhook request. Duplicate event IDs return success without duplicating work. Provider retries and signature formats must follow the current SDK; Polar changed signing behavior for newer secrets, so do not hand-roll assumptions from old examples. [Webhook verification and delivery reference](https://polar.sh/docs/integrate/webhooks/delivery)

Subscribe to `customer.state_changed`, `subscription.updated`, `order.paid`, `order.updated`, and `order.refunded`. Treat these as signals to reconcile current authoritative customer/subscription/order state. In particular, a billing-cycle event can precede payment; new period dates alone must not award a paid credit grant. [Polar event lifecycle](https://polar.sh/docs/integrate/webhooks/events)

### Reconciliation rules

- Fetch current customer/subscription state and the relevant paid order through Polar's server API. Use the existing external customer mapping. [Customer state reference](https://polar.sh/docs/integrate/customer-state)
- Only the configured monthly Pro product can grant application Pro benefits.
- Issue the 200-credit grant once for an eligible successfully paid initial/renewal order. Record both order ID and its verified billing interval. Also guard against granting twice for the same subscription interval.
- Correlate a paid order with its own billing interval; never attach an old delayed payment to the newest period just because the subscription has advanced.
- Record historical paid periods idempotently, but do not make an expired grant spendable. A late event cannot revive a revoked/refunded grant.
- Do not issue monthly grants for a merely created order, a cycle event, an unpaid invoice, a portal visit, or an unrelated subscription adjustment.
- Use current authoritative state and a per-customer synchronization lease so concurrent or out-of-order events cannot overwrite newer entitlement state with an older snapshot.
- Do not derive access only from a status string: require an eligible paid interval, no applicable immediate revocation, and an active local account.

### Billing state behavior

| Situation | Application behavior |
| --- | --- |
| Initial paid order verified | Activate Pro and create its first 200-credit grant once. |
| Successful renewal verified | Start the new paid interval and grant 200 once; unused previous credits expire. |
| Cancellation scheduled | Keep access through the current paid-through date; show that renewal is off. |
| Paid period ends without successful renewal | Apply Free limits; preserve all existing resumes and their manual editing/export. |
| Payment is past due | Show payment-recovery guidance; do not invent a new paid grant or extend paid-through. |
| Immediate subscription revocation | Stop Pro privileges and revoke unspent current paid credits. |
| Full refund of current paid interval | Revoke that interval's remaining credits and paid entitlement; retain already-written resume content. Coordinate future cancellation through Polar administration. |
| Partial refund | Keep entitlement unless the operator separately revokes the subscription; do not manufacture extra credits. |
| Refund of an older interval | Revoke only that grant; do not remove a later independently paid entitlement. |
| Provider unavailable | Retain previously verified access only until its known paid-through date; do not grant new benefits speculatively. |
| Duplicate event/order | Acknowledge without extra credits or extra resumes. |

Refresh after checkout/portal return, after relevant webhooks, and in a daily reconciliation pass. A request at a period boundary may trigger one rate-limited sync if local billing state is stale. During a billing outage, explain delayed activation; never lock existing resume editing or PDF downloads behind billing recovery.

## 10. Template, preview, and PDF export

### One document renderer

Use one `@react-pdf/renderer` document component driven by the validated resume document and presentation settings. Browser preview generation and server-side export both invoke this component, using the same bundled fonts, measurements, content filtering, and page-size rules. Do not maintain a separate hand-styled HTML resume that can drift from the PDF.

The library documents React 19 support and a Node buffer-rendering API. The observed package versions still need the real Next.js/React/Node production-build smoke test in phase 0. [Compatibility](https://react-pdf.org/docs/v4/compatibility) · [Node rendering API](https://react-pdf.org/docs/v4/node)

### Template design

- Template ID `professional-v1`; persist it separately from the content schema version.
- One column, a strong name header, readable contact line, clear section headings, consistent dates, and standard bullet indentation.
- Default to A4; allow US Letter as a page-size setting without introducing a second template.
- Bundle licensed Noto Sans regular/bold fonts with Latin-extended support and retain their license. Do not fetch arbitrary fonts or images from user URLs during rendering.
- Use 10.5 pt body text, 1.35 line height, 44 pt page margins, a 24 pt name, and 11.5 pt bold section headings as the initial fixed constants. Adjust only through a documented template revision after visual QA, not through user style controls.
- Keep headings with following content, avoid isolated lines, and allow long entries to continue across pages rather than clipping or shrinking the entire document.
- Preserve selectable text, text extraction order, Unicode names, and valid clickable links. The PDF contains no product watermark, account UI, job description, AI notes, or subscription information.

### Live preview

Generate the PDF from the latest valid local form snapshot in a client-only, dynamically loaded preview module. Use the library's on-demand generation interface and display PDF pages with PDF.js rather than relying on a browser's embedded PDF plugin on mobile. [On-demand rendering reference](https://react-pdf.org/docs/v4/advanced/on-the-fly-rendering)

Debounce regeneration for 750 ms, allow one generation at a time, and discard obsolete generation results. Keep the previous preview visible with an updating indicator. Lazy-load the PDF libraries only in the editor, and generate on mobile when Preview is visible. Revoke obsolete object URLs and cancel obsolete PDF.js render tasks to prevent memory leaks.

Typing must remain usable on a representative mid-range phone. If profiling identifies blocking PDF work, move generation into a bundled browser worker using the same document contract before release; do not replace the canonical renderer with screenshots or a divergent HTML template. The compatibility phase must establish the worker bundling approach if it is needed.

### Export

1. Flush autosave and validate export readiness.
2. Request the PDF with the acknowledged saved version.
3. Authenticate and load that owned current version on the server; return a conflict if it changed.
4. Render into memory and respond with `application/pdf`, a sanitized attachment filename, and private/no-store caching headers.
5. Do not write to Neon Storage, application disk, a public URL, or an external rendering service.

Apply technical abuse limits without a commercial download quota. Keep browser preview generation independent of server export throttling. In the initial single server deployment, bound concurrent server PDF generation to 2 and return a short retry response when busy. Log timing and outcome, not document content.

Test first-page layout, multipage flow, missing optional sections, very long bullets/URLs, accented names, and both page sizes. Verify selectable text using extraction, then visually inspect representative rendered pages. Check iOS Safari's download/open behavior with the actual authenticated endpoint.

## 11. Privacy, deletion, and security

### Data handling

All resumes and saved job descriptions are private. No public sharing route or public bucket exists. Avoid PII in logs, analytics, filenames used for telemetry, URLs, cache tags, and error tracking. Operational identifiers should be opaque IDs.

Exclude contact details from AI input and clearly disclose the remaining resume content that is processed. Neon's published policy allows temporary provider-side input/output retention for abuse monitoring; the privacy notice must not promise zero retention or immediate erasure from provider backups. [Neon AI data retention](https://neon.com/docs/ai-gateway/data-retention)

Store secrets only in environment configuration. Authenticate every sensitive server operation; enforce same-origin/CSRF protection for cookie-authenticated mutation endpoints, reject unexpected content types, and use the auth SDK's OAuth/state protections. The signed Polar webhook is exempt from browser-origin checks, not from signature verification.

Use HTTPS, secure cookie settings, safe return URLs, output escaping, parameterized SQL, explicit body limits, and safe link schemes. Set a Content Security Policy that permits the self-hosted PDF.js worker/blob needs deliberately instead of adding unrestricted script origins. Disable any unnecessary public runtime diagnostics from development tooling in the production deployment.

Do not expose a generic model prompt API, generic SQL endpoint, or arbitrary URL fetching. Treat AI output as untrusted data. Rate limits must use authenticated identities and trusted hosting proxy information, not a spoofable forwarded IP header supplied directly by a client.

### Resume deletion

Delete the active resume content, its job context, and associated pending/review content. Cancel its unfinished AI requests and release reservations exactly once. A late generation completion must check the deleted/canceled state before committing. Preserve other independent copies. Minimal charge/accounting metadata may remain without the deleted content.

### Account deletion state machine

1. Show the exact effect, a confirmation input, and any active subscription. Require fresh authenticated verification for this destructive action.
2. Mark the account `deleting` and durably create the deletion job. Block new resume/AI/checkout mutations immediately.
3. Remove resume/job/suggestion content and release/cancel pending work. Keep only a restricted deletion-status view available to the session.
4. Cancel all live subscriptions for the mapped Polar customer and verify that no future renewal remains scheduled. Retry if Polar is unavailable; do not report completed cancellation prematurely.
5. Revoke sessions and delete the managed auth user through the supported Neon service API. Do not modify the `neon_auth` schema directly.
6. Delete or anonymize remaining application records after required coordination. Retain only documented billing/security records for a defined purpose and period.
7. Mark the operation complete only when required remote steps have succeeded. Keep a redacted job reference for support; never allow webhook reconciliation to recreate a deleted profile.

Deleting an account is not an automatic refund. Explain this before confirmation. If a provider outage prevents billing cancellation, surface the pending state and alert the operator so it cannot remain unnoticed near a renewal date.

### Retention defaults

| Data | Initial retention policy |
| --- | --- |
| Active resumes and saved job context | Until the user deletes the resume/account. |
| AI baseline snapshots and review content | At most 30 days; remove earlier with the resume/account. |
| AI token/cost and grant accounting metadata | 90 days for application operations, with content removed; statutory billing records remain governed separately. |
| Sanitized logs | 14 days where supported by the hosting configuration. |
| Product events | 90 days; delete/anonymize account linkage on account deletion. |
| Mutation receipts and rate-limit buckets | Expire after 24 hours or the shorter relevant request window. |
| Processed billing event details | 30 days for the minimal extracted payload; retain deduplication identifiers separately while needed for replay protection. |
| Resume text sent to OpenAI for AI actions | Per OpenAI's [API data controls](https://developers.openai.com/api/docs/guides/your-data): not used for training unless opted in; abuse-monitoring logs up to 30 days. Re-check before launch. |
| Neon backups and Polar financial records | Provider/configuration-specific; verify and state the actual retention before launch. |

Do not promise immediate deletion from backups. A restore runbook must reapply completed deletion records so a restored database does not re-expose removed accounts or content. Avoid using production data in test environments; a Neon branch is not inherently a sanitized dataset.

## 12. Background work and failure handling

### Durable work on the existing Node host

Use the Postgres `background_jobs` table for billing reconciliation, account deletion coordination, daily retention cleanup, and expired AI reservations. Do not add a paid queue service; the `ai` Neon Function serves AI requests only.

IMPLEMENTATION DEFAULT: start a small dispatcher from the root `instrumentation.ts` Node startup hook when `BACKGROUND_JOBS_ENABLED=true`. Registration starts the dispatcher and returns; it must not await an infinite loop. The persistent production process checks for due jobs every 60 seconds and also receives an immediate local wake-up after ingestion. Postgres remains the durable source of truth if that wake-up is lost.

Guard startup against duplicate local registration, disable it during build/test unless explicitly enabled, and use database leases so multiple production instances can run safely. Verify startup without incoming traffic, orderly shutdown, and process restart behavior on the actual Cloudways deployment. The local Next.js instrumentation guide documents the startup hook; using it for this dispatcher is an application design decision, not a managed job guarantee.

Lease jobs in short transactions with `FOR UPDATE SKIP LOCKED` or an equivalent atomic update. Release database locks before provider network calls. Use deduplication keys, lease tokens, and bounded batches. A task that loses its lease cannot commit a competing result.

Retry retryable operational jobs after roughly 1, 5, 15, 60, and 240 minutes, with jitter. After repeated failure, keep the job visible as failed and alert the operator. Account deletion/cancellation jobs must not be silently abandoned; retain them for manual intervention and further retries. Permanent validation/configuration failures require operator correction rather than endless rapid retries.

No durable task depends solely on an in-memory timer, `after()` callback, or an unawaited request promise. The timer only discovers persisted work. AI calls themselves are bounded foreground operations with persistent status and lease cleanup; they are not automatically regenerated by the dispatcher.

### Required failure behavior

| Failure | User-visible result and recovery |
| --- | --- |
| Slow/failed autosave | Keep the local draft, show unsaved status, retry safely, and prevent stale export/AI actions. |
| Concurrent tab edit | Explain the conflict and preserve local text for review. |
| Expired session | Prompt sign-in; do not treat the user as having a new account or grant. |
| Neon database outage | Show temporary failure; do not pretend a save succeeded or perform unrecorded paid AI work. |
| AI refusal, invalid JSON, timeout, or provider limit | Preserve the resume, release user credits/slot, and offer an explicit retry. |
| Browser disconnect during AI | Recover the existing request by ID; no automatic extra call or duplicate charge. |
| Process crash after AI reservation | Lease cleanup releases credits/slot; a late response cannot settle after expiration. |
| PDF generation error | Keep content and offer retry; no download quota consumed. |
| Polar checkout abandoned | Keep the current plan unchanged. |
| Webhook delayed or duplicated | Durable reconciliation and idempotent grants; success page communicates pending verification. |
| Polar outage during deletion | Content remains inaccessible, deletion stays pending, operator receives an actionable alert. |
| Scheduled work stops | Worker heartbeat/oldest-job age alerts; persisted jobs resume on recovery. |

Use retries only where they preserve the original operation's identity. Never hide an unavailable paid feature behind an endless spinner.

## 13. Observability, performance, and cost

### Operational visibility

Use structured, redacted application logs and the existing Cloudways, Neon, and Polar dashboards initially. Do not introduce a paid analytics or error-monitoring subscription as an unstated prerequisite. Provide restricted operator scripts for job inspection/retry, billing reconciliation, and aggregate metrics; these are not public administration endpoints.

Capture request ID, operation name, safe account/resource IDs when needed, outcome/error code, duration, environment, and application release. AI telemetry additionally records model ID, prompt/schema versions, actual token counts, estimated provider cost, and whether user credits were settled or released. Never log prompts, resumes, job descriptions, suggestions, cookies, authorization headers, webhook secrets, checkout URLs, or full billing payloads.

Track these content-free product events: account created, resume created/duplicated/deleted, first successful save, AI requested/completed/failed, suggestion accepted/rejected, PDF exported, checkout started, Pro activated, renewal succeeded, cancellation scheduled, account deletion requested/completed. Avoid an event for every keystroke or autosave. Treat activation as a user's first successful PDF export.

Review activation rate, free-to-paid conversion, successful AI calls by type, AI failure rate, cost per active/paying user, export failures, save conflicts, and customer-support incidents. Purchases and renewals are recorded from verified billing events, not browser tracking.

Expose worker heartbeat, oldest pending job age, failed deletion operations, billing lag, and expired-reservation count through operator tooling. Configure Cloudways process/host alert delivery to the founder and verify it in staging. During the initial small launch, review application/provider failures and billing jobs daily; an additional error tracker is a future option, not assumed to exist.

Operational thresholds to investigate: any account-isolation incident; any negative/double-counted credit balance; a pending cancellation/deletion failure; billing synchronization lag over 5 minutes; no worker heartbeat for 5 minutes while the app is running; sustained AI error rate above 5%; repeated PDF failures; or spend approaching the monthly target. Do not claim an alert is automatic until its delivery mechanism has been configured and tested.

### Performance targets

These are acceptance targets to measure, not guarantees already established:

| Area | Initial target |
| --- | --- |
| Public landing page | Mobile LCP around 2.5 seconds or less under a representative test connection; no editor/PDF bundle in the landing page. |
| Typing | Input remains responsive, normally under 100 ms interaction latency. |
| Autosave | Acknowledged within about 2 seconds of a typing pause under normal conditions. |
| Resume/dashboard API | Warm p95 under 1 second at the initial load target. |
| Preview | A typical 1–3 page draft updates within about 2 seconds after typing pauses. |
| AI | Typical bullet under 10 seconds, summary under 15 seconds, tailoring under 30 seconds; 45-second timeout with visible progress. |
| PDF export | Typical 1–3 page document within 3 seconds on a warm server; bounded processing for larger allowed documents. |
| Billing activation | Usually within 30 seconds after payment verification, with an explicit pending state if delayed. |
| Initial concurrency | Exercise 10 simultaneous active editors, including save traffic, PDF requests, and limited AI work. |

Lazy-load heavy editor/PDF code, minimize form-wide rerenders, use immutable versioned document snapshots, and keep database queries indexed. Set an initial `pg` pool maximum of 5 connections per app instance with a short idle timeout. Do not add shared caching for private documents to chase a benchmark before measuring actual bottlenecks.

### Budget model

The $50/month figure is an operating target, not an automatically enforced guarantee from a vendor. The dispatcher can keep a small Neon compute active, so budget for that instead of assuming every idle minute scales to zero.

| Category | Initial planning allocation |
| --- | --- |
| Neon database/auth and operational data | Up to approximately $25/month; validate actual compute and transfer. |
| AI Gateway usage | Approximately $15/month under the bounded low-cost model scenario. |
| Contingency | Approximately $10/month. |
| Existing Cloudways hosting | Excluded from the agreed service budget; verify whether staging adds a separate hosting charge. |
| Polar processing/payout fees | Excluded from the service budget and deducted from sales economics. |

On the research date, Neon's catalog listed the initial Haiku candidate at $0.10 per million input tokens and $0.50 per million output tokens at ordinary context lengths. At the proposed maximum request budgets, the illustrative inference costs are $0.0005 per bullet, $0.0014 per summary, and $0.0032 per tailoring. Dividing by their 1/2/5 credit weights gives a maximum illustrative cost of $0.0007 per app credit. Thus, 100 Pro users each using all 200 credits would imply roughly $14 of successful-call inference; 100 free users exhausting 10 credits add roughly $0.70 once. This excludes failed calls, extra reasoning not covered by a validated cap, price changes, and infrastructure. [Neon model catalog](https://neon.com/docs/ai-gateway/models)

Validate this model against observed usage before launch. Keep a running cost estimate including failed requests. Warn the operator at 50%, 80%, and 100% of the allocation using available provider budget notifications and daily operational review. Do not unexpectedly deny already-sold allowances solely because an internal estimate reached its target; reduce promotional acquisition or reassess future plan economics. A genuine exhausted provider balance/outage gets a clear temporary-unavailability state and no user credit charge.

Polar's current Starter pricing is listed as 5% + $0.50 per transaction, with possible additional international/payout costs. A $9 sale therefore has a $0.95 base transaction fee before those extras and applicable tax effects. The $9 product price is a demand hypothesis, not a result of market validation. Start with the provider's free Starter plan unless the founder already has a different grandfathered arrangement. [Polar pricing](https://polar.sh/resources/pricing)

## 14. Environments, configuration, and deployment

### Environment separation

| Environment | Application | Neon | Polar |
| --- | --- | --- | --- |
| Local | Local Next.js process | Development-only database/auth configuration and test data | Sandbox |
| CI | Isolated test build/process | Disposable test database/branch with synthetic data | Mocked contracts and controlled sandbox checks |
| Staging | Separate Cloudways app/domain | Separate non-production project/branch and credentials | Sandbox |
| Production | Existing Cloudways Velocity app and final domain | Production project, managed auth, paid Gateway balance | Production product/account |

Prefer a separate non-production Neon project to avoid accidental copies of production identity/content; branches within that project can support tests. Never point local development, previews, or CI at production credentials. Do not assume creating a database branch sanitizes users, sessions, or files.

Choose a Gateway-supported Neon region close to the existing Cloudways server. **ASSUMPTION:** Frankfurt is the initial candidate for this Turkey-operated product, but actual hosting location and provider availability must be checked before provisioning. This is not a promise of EU-only processing. Gateway plan/region availability is documented by Neon and may change. [Gateway availability](https://neon.com/docs/ai-gateway/overview)

Use the final production domain consistently in Google OAuth, Neon trusted domains, Polar checkout return URLs, canonical metadata, and webhook settings. Configure the webhook to its final HTTPS URL without a redirect chain. Confirm the provider can reach it through the hosting proxy.

### Environment variables

Names below are the application's planned configuration contract. Provider credentials must be copied from the actual service setup, not invented from these examples.

| Variable | Purpose | Exposure |
| --- | --- | --- |
| `APP_ORIGIN` | Canonical trusted application origin and allowed return URL base | Server; render public metadata intentionally |
| `APP_ENV` | `development`, `staging`, or `production` | Server |
| `DATABASE_URL` | Neon pooled connection using the application role | Secret, server only |
| `DATABASE_MIGRATION_URL` | Direct connection using the migration role | Secret, migration job only |
| `NEON_AUTH_BASE_URL` | Branch-specific managed auth endpoint | Server configuration |
| `NEON_AUTH_COOKIE_SECRET` | Auth SDK cookie protection | Secret, server only |
| `NEON_AUTH_ADMIN_CREDENTIAL` | Application alias for the supported least-privilege credential used for auth deletion/session revocation | Secret, restricted server use; map to the verified API in phase 0 |
| `NEON_FUNCTION_AI_BASE_URL` | URL of the `ai` Neon Function for the selected branch | Server |
| `AI_FUNCTION_SECRET` | Shared secret proving a Function call comes from the app server | Secret, app server and Function |
| `OPENAI_API_KEY` | OpenAI API credential | Secret, `ai` Function only (never on the app server) |
| `AI_MODEL_ID` | Currently `gpt-5.4-mini`, a constant in `functions/ai.ts` | Function |
| `AI_ENABLED` | Operational availability switch; does not disable manual editing/export | Server |
| `POLAR_ACCESS_TOKEN` | Environment-specific Polar API access | Secret, server only |
| `POLAR_WEBHOOK_SECRET` | Environment-specific webhook verification | Secret, server only |
| `POLAR_SERVER` | Sandbox or production API selection | Server |
| `POLAR_PRO_PRODUCT_ID` | Allowed monthly Pro product | Server |
| `BACKGROUND_JOBS_ENABLED` | Enable persistent dispatcher at runtime, false during build/test | Server |
| `SUPPORT_EMAIL` | Real customer-support contact | Intentionally public when rendered |
| `ABUSE_HASH_SECRET` | Rotate-able secret for short-lived hashed rate-limit identifiers | Secret, server only |

Google client credentials are configured with Neon Auth; they are not embedded in the browser or unnecessarily duplicated in application configuration. No `NEXT_PUBLIC_` database, AI, billing, auth-cookie, or administrative secret is permitted.

Add a placeholder-only `.env.example` when implementing. The current `.gitignore` excludes `.env*`, so add a narrow exception for that example; do not weaken secret-file ignores. Validate required configuration by environment and show safe setup errors without logging values. Pin actual dependency versions in the lockfile rather than relying on a floating `latest` at deploy time.

### Deployment workflow

1. Implement on a feature branch and keep the existing application available while new functionality is incomplete.
2. Run type checking, lint, relevant automated tests, and a production build using the selected Node runtime.
3. Review generated SQL migrations. Apply them to staging with migration credentials and run the staging smoke suite.
4. Deploy the staging application using Cloudways' Git/build/start workflow. Confirm auth redirects, PDF rendering, webhook reachability, persistent dispatcher behavior, and secrets configuration on the actual host.
5. Run production migrations as a controlled step, once per release. Do not run destructive schema changes or migration generation on every application startup.
6. Build with the dispatcher disabled, for example `BACKGROUND_JOBS_ENABLED=false npm run build`; enable it only in the production runtime environment.
7. Start the normal persistent Next.js server with `npm run start`, honoring the platform's port configuration and reverse proxy. Keep authenticated routes/PDFs out of public caching.
8. Run post-deploy smoke checks, inspect billing/job state, and verify the first real paid activation only after the launch gates have passed.

Cloudways provides a managed Node deployment workflow, but account-specific runtime, build settings, staging cost, environment variables, and logging must be checked in the actual application. Do not assume the starter README's Vercel text describes the deployment. [Cloudways Velocity guide](https://support.cloudways.com/en/articles/15550368-how-to-launch-an-application-on-cloudways-velocity)

### CI and rollback

Use the repository's CI provider for a pipeline containing `npm ci`, lint, typecheck, targeted unit/integration tests, and production build. If no provider exists, add GitHub Actions as the implementation default after confirming the repository is hosted there; otherwise implement the same checks in the existing provider. No production migration or paid API call belongs in ordinary pull-request CI.

Use expand/contract migrations that let the previous application version run during rollback. Keep the previous deployable revision, and document rollback through Cloudways. Roll back application code before considering a database restore. A Neon restore is a data operation requiring reconciliation of billing events, credit grants, and deletion records; it must not be treated as a routine code rollback.

Do not redeploy automatically to production on a failing CI result. For the initial launch, use an intentional production release after staging checks, rather than making every development push a live release.

## 15. Implementation phases

The phases are ordered by dependency and risk. Each ends with observable exit criteria. Checkboxes indicate future work, not work completed while writing this document.

### Phase 0 — Verify foundations and integration feasibility

- [ ] Read `AGENTS.md` and the relevant installed Next.js guides; preserve the existing framework/configuration conventions.
- [ ] Record Cloudways region, Node runtime, app domain, build/start commands, environment handling, and staging arrangement.
- [ ] Verify the planned SDK versions against Next.js 16.4.0, React 19.3.0, and the selected Node runtime in a production build.
- [ ] Prove Neon Google login/session read/signout in non-production, including the current Cache Components behavior.
- [ ] Verify the supported managed-auth account/session deletion API and the exact required credential; avoid an unverified admin-token assumption.
- [ ] Confirm Polar account/payout onboarding, create sandbox configuration, and verify webhook signatures with the selected SDK.
- [ ] Confirm Neon Gateway region/model availability, output-shape controls, token accounting, timeout behavior, and current pricing.
- [ ] Render a fixture resume to PDF in both browser preview and Node export; test PDF.js, fonts, page breaks, and mobile performance.
- [ ] Verify the persistent dispatcher can start at runtime, remain idle without HTTP traffic, and recover after a Cloudways restart.

**Exit criteria:** the chosen stack is technically workable on the actual hosting setup. Record any incompatibility and the specific correction before building dependent features. Do not silently replace Neon Auth, Cloudways, or Next.js.

### Phase 1 — Project foundation, identity, and persistence

- [ ] Add the pinned foundational dependencies, environment schema/example, and server-only boundaries.
- [ ] Establish the design primitives, application shell, and error/loading components.
- [ ] Add reviewed Drizzle migrations for accounts, resumes, credit grants, and mutation receipts, followed by the remaining operational tables as their phases require.
- [ ] Set up application/migration database roles and synthetic test fixtures.
- [ ] Integrate Google-only Neon Auth and owner/account resolution.
- [ ] Create the one-time trial grant idempotently and protect all authenticated routes.
- [ ] Add initial auth and cross-account data-access integration tests.

**Exit criteria:** a new and returning user can sign in safely, receive the correct initial allowance once, and access only their own account data.

### Phase 2 — Dashboard, document editor, and autosave

- [ ] Implement the resume document schema, validation, dashboard metadata queries, and slot-limit service.
- [ ] Build create, rename, duplicate, delete, and empty/full-limit states.
- [ ] Build all agreed editor sections, stable entry IDs, and within-section ordering controls.
- [ ] Implement serialized debounced autosave, mutation acknowledgement recovery, version conflicts, and unsaved navigation warnings.
- [ ] Add responsive Edit/Preview navigation and keyboard-accessible forms/dialogs.
- [ ] Test concurrent creates, repeated duplicate clicks, lost save acknowledgements, cross-tab conflicts, and downgrade limits.

**Exit criteria:** users can reliably build, revisit, and manage resumes without AI, with no silent data loss or ownership bypass.

### Phase 3 — Professional template and PDF workflow

- [ ] Finish the canonical professional document component and bundled fonts.
- [ ] Implement browser PDF preview, A4/Letter selection, and server export for the saved version.
- [ ] Validate automatic pagination and hide empty sections without leaving awkward gaps.
- [ ] Implement preview memory cleanup, export rate/concurrency limits, and retry feedback.
- [ ] Perform text extraction checks and visual review of short, long, sparse, and Unicode fixtures.
- [ ] Test the full download workflow on mobile and desktop.

**Exit criteria:** a free user can download a clean, selectable, watermark-free PDF matching the preview, including multiple pages.

### Phase 4 — AI writing, tailoring, and credit accounting

- [ ] Implement action-specific input builders, prompts, schemas, and the server-only Gateway adapter.
- [ ] Add AI disclosure and visible credit costs.
- [ ] Implement atomic reservation/settlement/release, idempotency, token limits, timeout handling, and lease cleanup.
- [ ] Build bullet and summary review, then job-description entry and tailoring with atomic slot reservation.
- [ ] Persist suggestions, recover disconnected operations, and protect acceptance against stale targets.
- [ ] Evaluate the candidate model against realistic fixtures and review for unsupported factual additions.
- [ ] Measure actual tokens, failures, latency, and cost; adjust prompts before increasing model cost or allowances.

**Exit criteria:** AI produces useful reviewable suggestions, never silently edits the source, creates no duplicate charge/copy on retry, and recovers correctly from failures.

### Phase 5 — Polar subscriptions and plan enforcement

- [ ] Configure the sandbox monthly Pro product and immutable customer mapping.
- [ ] Build checkout, portal, billing-status, and success-verification flows.
- [ ] Implement signature verification, durable event ingestion, reconciliation jobs, and order/period grant uniqueness.
- [ ] Test first purchase, renewal, unpaid renewal, scheduled cancellation, expiration, immediate revocation, full/partial refund, and reactivation.
- [ ] Test duplicated/out-of-order events, delayed payment confirmation, forged return parameters, and unexpected duplicate subscriptions.
- [ ] Confirm that all existing resumes remain editable/exportable after downgrade and only new creation is restricted.

**Exit criteria:** the local plan and allowances reflect verified paid state, not browser claims or event arrival order.

### Phase 6 — Privacy, reliability, and launch preparation

- [ ] Complete the account-deletion coordinator, provider retries, session cleanup, and content retention jobs.
- [ ] Implement redacted logs, content-free product events, operator job tooling, and production health checks.
- [ ] Configure and test host/process alerts; document daily application/billing review for launch.
- [ ] Finish real privacy/terms/refund/support content and accurate AI processing disclosure.
- [ ] Add public metadata, canonical URLs, social cards, sitemap, robots rules, and private-page noindex behavior.
- [ ] Complete accessibility, browser, rate-limit, load, security, and production-build checks.
- [ ] Verify backup/restore procedures, retention periods, migration safety, and rollback.

**Exit criteria:** the staging product passes the definition of done and has usable support and operational recovery procedures.

### Phase 7 — Production launch and early review

- [ ] Finalize the working brand/domain and production OAuth/trusted-domain settings.
- [ ] Confirm approved Polar production onboarding, live product ID, webhook secret, and customer portal configuration.
- [ ] Confirm the Neon production plan, model access, balance, database limits, and secret separation.
- [ ] Apply reviewed migrations and deploy the verified revision to Cloudways.
- [ ] Smoke-test real Google sign-in, resume save/reopen, AI review, PDF export, and the production billing setup with controlled accounts.
- [ ] Verify alerts/log redaction, worker heartbeat, and successful reconciliation after a restart.
- [ ] Review activation, failures, support requests, AI cost, and conversion daily during the first launch period.

**Exit criteria:** real users can complete the end-to-end workflow, the paid entitlement is correct, and the founder can detect and recover from failures. No feature checkbox is complete merely because its UI is present.

## 16. Testing and definition of done

### Test strategy

Use unit tests for validation and pure policy rules; integration tests against real disposable Postgres for transactions, constraints, and races; browser tests for core user workflows; and PDF extraction plus visual checks for document quality. Avoid testing only mocked database success paths for quotas or billing.

Mock AI and Polar network responses for repeatable automated failure cases. Keep a small separately invoked live AI evaluation and Polar sandbox suite. Do not make ordinary CI spend real AI credits or create production purchases. For authentication, mock the upstream identity boundary in isolated tests, then perform actual Google/Neon staging checks. Do not ship a production auth-bypass route for convenience.

### Required scenarios

| Area | Acceptance scenarios |
| --- | --- |
| Authentication | First sign-in, repeat sign-in, failed OAuth, signout, expired session, rejected external return URL, deleting account unable to mutate. |
| Ownership | User A cannot list/read/save/delete/duplicate/export user B's resume, view B's AI result/job context, accept B's suggestion, or open B's billing portal. |
| Trial grant | Concurrent first requests create one account and one 10-credit grant; login and cancellation do not replenish it. |
| Resume limits | Concurrent create/duplicate/tailor requests cannot exceed available slots; deleting restores a slot; over-limit downgraded users retain editing/export. |
| Autosave | Debounce, single in-flight save, changes typed during save, response loss/retry receipt, validation failure, offline state, another tab's update, session expiry, stale export prevention. |
| Document validation | Invalid dates/URLs, optional fields, empty sections, max sizes, accented characters, long bullets, stable IDs and ordering. |
| AI credits | Reservation is atomic; failed/invalid requests release once; accepted and rejected valid suggestions are both charged once; duplicate key never calls the model twice. |
| AI lifecycle | Disconnect recovery, lease expiry, server restart, late provider response, source deletion, account deletion, billing-period rollover during generation. |
| Tailoring | Original remains unchanged; successful copy consumes one slot; failed call creates none; job context persists; generated skill order uses existing IDs only. |
| AI review | Edit-and-accept, reject, stale target, duplicate review submission, changing another field while reviewing, refresh with pending suggestions. |
| AI quality | No unsupported employer/degree/skill/metric additions in the evaluated set; relevant wording, correct English, concise summaries, resistance to instructions inside job descriptions. |
| PDF | Text extraction, links, A4/Letter, long-document pagination, no clipped text, no watermark, empty-section omission, preview/export consistency, mobile download. |
| Billing | First paid order, renewal, duplicate/out-of-order events, cycle-before-payment, failed renewal, cancellation, expiry, current/old/partial refunds, provider outage, forged webhook, forged checkout success. |
| Account deletion | Content removed, in-flight AI canceled, subscriptions stopped, auth cleanup retried, no webhook resurrection, no false completion during outage. |
| Background work | Two dispatchers, lease loss, process restart, durable insertion before acknowledgement, retry exhaustion, recurring retention and reconciliation tasks. |
| Privacy and security | No secrets/content in browser bundles or logs, no private CDN caching, CSRF protection, safe links, request size/rate limits, sanitized public errors. |
| Deployment | Clean production build, runtime configuration, startup with no user traffic, staging/production isolation, migration then rollback of compatible code. |

AI quality evaluation should include at least 12 synthetic resumes spanning students, career changers, non-technical roles, and experienced applicants, with two relevant job descriptions each. Include sparse input and adversarial instructions in a job description. Human review is required for factual grounding; passing schema checks alone is insufficient.

### Definition of done for public v1

- [ ] A new user can sign in, create a resume, edit every agreed section, leave, return, and see saved content.
- [ ] Free users can manually edit and export without buying Pro or retaining AI credits.
- [ ] Dashboard actions, quota limits, and ownership checks work under concurrent requests.
- [ ] Preview and exports are legible, selectable, correctly paginated, and work on supported phones/desktops.
- [ ] AI actions show their price, use real supplied facts, require review, and never duplicate a debit or tailored copy on retry.
- [ ] Upgrades, renewals, cancellations, payment failures, and refunds update entitlements correctly.
- [ ] Deletion and provider outages have verified recovery paths; no persistent spinner substitutes for failure handling.
- [ ] Build, lint, type checks, required unit/integration/browser tests, and document QA pass.
- [ ] Required provider accounts/domains are configured, privacy/support pages are real, and production credentials are isolated.
- [ ] Actual cost/latency measurements support the launch allowances and operating budget, or the deviation is explicitly recorded and resolved.
- [ ] The founder can inspect failures, retry durable operations, reconcile billing, and roll back a release.

Support the current and previous stable releases of Chrome, Safari, Firefox, and Edge at implementation time, plus current iOS Safari and Android Chrome. Use Playwright's available engines for repeatable coverage and a manual real-device smoke check for OAuth and PDF downloads.

## 17. Assumptions, risks, and future direction

### Assumptions and implementation defaults not independently validated

| Choice | Status / how to resolve |
| --- | --- |
| Veyro name and brand | Provisional. Check domain and trademark conflicts before publishing the final brand. |
| Light UI with indigo accent | Accepted provisional design direction; establish exact tokens in the UI phase. |
| Haiku candidate model | Not evaluated on this product. Must pass quality, output-shape, latency, and cost checks. |
| Credit weights and non-rollover | Accepted specification defaults; implement consistently in UI, server policy, and tests. |
| Manual refunds and end-of-period cancellation | Accepted default; publish terms consistent with actual Polar configuration and applicable requirements. |
| A4 default with Letter option | Implementation default supporting a general English-language audience. |
| Fixed section order and field bounds | Implementation defaults detailed above; validate against realistic document fixtures. |
| Drizzle/pg, form libraries, and PDF libraries | Technical choices made for this plan; versions observed, not yet installed or smoke-tested. |
| Node 24 and Frankfurt region | Deployment candidates; verify the actual Cloudways runtime/location and Neon access before setup. |
| Background dispatcher in the persistent Next.js process | Must be proven on the Cloudways deployment; durability is in Postgres, not the process timer. |
| In-app operational events without paid analytics | Initial default appropriate to the small launch; founder reviews metrics through restricted tooling. |
| No offline persistence or cross-session revision history | Deliberate v1 boundary; unsaved drafts are protected within the current page only. |
| 30/90-day content/operational retention defaults | Verify provider retention and final policy wording; application cleanup alone does not erase provider backups. |
| $50 monthly service target | A budget hypothesis that needs measurements, especially with persistent dispatcher queries and retries. |

### Open risks and launch gates

1. **SDK compatibility:** the latest observed Neon auth SDK is labelled beta, and third-party docs may lag Next.js/React. Verify actual production builds and runtime flows; do not infer compatibility solely from peer dependencies.
2. **Cloudways configuration:** runtime version, memory, build settings, reverse-proxy caching/timeouts, staging setup, and background-process behavior have not been inspected in the live account.
3. **Provider onboarding:** Polar approval/payout setup, production Google OAuth, Neon paid Gateway access, model availability, and adequate prepaid balance are still setup work.
4. **Managed account deletion:** the precise supported Neon management endpoint/credential and session-revocation behavior must be confirmed before promising fully automatic account removal.
5. **AI quality and factuality:** no model can be assumed to preserve facts perfectly. Keep review mandatory, constrain outputs, and assess actual failures before launch.
6. **Preview performance:** browser PDF generation plus PDF.js can be heavy on phones. Run the early fixture test and isolate rendering work if required.
7. **Billing correctness:** grants must follow verified payment, not cycle creation or webhook arrival order. Test delayed orders/refunds around renewals and ensure failed jobs are visible.
8. **Abuse and repeated signup:** Google-only sign-in and rate limits reduce but do not eliminate trial abuse or account recreation. Watch costs and avoid retaining undisclosed permanent identity fingerprints to solve it.
9. **Costs:** inference price estimates do not prove monthly infrastructure cost, paid conversion, or profitability. Preserve explicit credit/input limits and track failed-call spend.
10. **Privacy and recovery:** verify backup retention, data processing disclosures, restore-time deletion handling, and the actual operator support contact before launch.
11. **Brand and legal pages:** final name/domain availability and real terms/privacy/refund content must be completed; do not publish placeholders as finished policy.

### Future-proof without expanding v1

Keep the document schema versioned, template ID separate, and PDF rendering behind a template registry. This permits new templates and controlled customization without changing resume ownership or billing identity. Keep stable entry IDs so future importers can produce the same document contract.

Keep AI prompt/model configuration isolated and billing entitlement logic centralized so future plan changes do not require rewriting the editor. Do not build a plugin framework, team permissions, shared profile propagation, a vector store, an external event bus, or application tracking before there is a concrete requirement.

If v2 introduces teams, linked variants, imports, or public links, treat the ownership/privacy implications as a new product decision rather than assuming this individual-private model already supports them.

### Decision-change record

| Date | Decision | Reason |
| --- | --- | --- |
| 2026-10-14 | Agreed six-feature public SaaS scope and platform boundaries | Founder interview. |
| 2026-10-14 | Google-only login; no uploads or stored exports | Founder selected the simpler authentication and on-demand PDF flow. |
| 2026-10-14 | Free 2 resumes/10 lifetime credits; Pro $9/20 resumes/200 monthly credits | Founder selected the launch offer. |
| 2026-10-14 | Polar, Turkey, Cloudways Velocity, no fixed deadline | Founder confirmed operating/deployment context. |
| 2026-10-14 | Detailed implementation defaults and phased acceptance criteria | This reference plan; provider/account feasibility remains to be verified. |

## 18. Documentation and version references

Research date: **2026-10-14**. Live service pricing, supported regions, SDK APIs, and package releases can change. Recheck the relevant source when beginning each integration. Package compatibility statements in this document distinguish observed metadata from tests that have not yet run.

### Repository sources

- [Agent instructions](AGENTS.md)
- [Current dependencies and scripts](package.json)
- [Current Next.js configuration](next.config.ts)
- [Next.js deployment guide bundled with this installation](node_modules/next/dist/docs/01-app/01-getting-started/17-deploying.md)
- [Authentication with Cache Components](node_modules/next/dist/docs/01-app/02-guides/authentication-with-cache-components.md)
- [Route Handlers](node_modules/next/dist/docs/01-app/01-getting-started/15-route-handlers.md)
- [Migrating to Cache Components](node_modules/next/dist/docs/01-app/02-guides/migrating-to-cache-components.md)
- [Self-hosting](node_modules/next/dist/docs/01-app/02-guides/self-hosting.md)
- [Instrumentation startup contract](node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/instrumentation.md)

### Official service and library references

- [Neon managed authentication overview](https://neon.com/docs/auth/overview)
- [Neon Next.js integration](https://neon.com/docs/auth/quick-start/nextjs-api-only)
- [Neon AI Gateway overview](https://neon.com/docs/ai-gateway/overview)
- [Neon chat completions](https://neon.com/docs/ai-gateway/chat-completions)
- [Neon model catalog](https://neon.com/docs/ai-gateway/models) and [machine-readable catalog](https://neon.com/models.json)
- [Neon AI data-retention policy](https://neon.com/docs/ai-gateway/data-retention)
- [Neon pricing](https://neon.com/pricing)
- [Polar supported countries](https://polar.sh/docs/merchant-of-record/supported-countries)
- [Polar pricing](https://polar.sh/resources/pricing)
- [Polar Next.js adapter reference](https://polar.sh/docs/integrate/sdk/adapters/nextjs)
- [Polar webhook verification/delivery](https://polar.sh/docs/integrate/webhooks/delivery)
- [Polar webhook events](https://polar.sh/docs/integrate/webhooks/events)
- [Polar customer state](https://polar.sh/docs/integrate/customer-state)
- [Drizzle Postgres integration](https://orm.drizzle.team/docs/get-started-postgresql)
- [React-pdf compatibility](https://react-pdf.org/docs/v4/compatibility)
- [React-pdf Node API](https://react-pdf.org/docs/v4/node)
- [React-pdf on-demand rendering](https://react-pdf.org/docs/v4/advanced/on-the-fly-rendering)
- [Cloudways Velocity application launch](https://support.cloudways.com/en/articles/15550368-how-to-launch-an-application-on-cloudways-velocity)

The current repository initially contained the Glimpse placeholder landing page and no resume/auth/billing implementation. This document is the implementation reference; writing it did not provision services, change application code, install dependencies, or deploy a release.
