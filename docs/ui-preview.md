# Restricted local UI preview

The preview catalogue links to real application controllers and Nunjucks templates. It uses one shared synthetic fixture user and disposable in-memory draft/session stores. It is not an authenticated AAT environment, production rate-limit test or backend persistence simulator.

## Prerequisites and host workflow

Use the repository's Node version (`24.21.0`) and tracked Yarn (`4.18.1`). No runtime or browser is downloaded by the launcher. Start from a complete, current-lockfile installation and built assets:

```sh
export YARN_ENABLE_NETWORK=0 YARN_ENABLE_SCRIPTS=0 YARN_ENABLE_TELEMETRY=0
export YARN_ENABLE_HARDENED_MODE=0 PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 PUPPETEER_SKIP_DOWNLOAD=1
node .yarn/releases/yarn-4.18.1.cjs install --immutable --mode=skip-build
node .yarn/releases/yarn-4.18.1.cjs build
node .yarn/releases/yarn-4.18.1.cjs start:ui-preview
```

Installation requires cached locked archives. Missing archives must be supplied through the team's approved dependency-verification process. Do not omit `--mode=skip-build`: the normal root postinstall fetches shared scripts. Disabling hardened mode permits offline installation; it does not verify registry metadata.

Open <http://127.0.0.1:3001/ui-preview>. The foreground supervisor prints its private runtime/log directory. In another terminal in the same checkout:

```sh
node .yarn/releases/yarn-4.18.1.cjs start:ui-preview:logs
node .yarn/releases/yarn-4.18.1.cjs start:ui-preview:down
# Stop the old instance and start a fresh foreground instance:
node .yarn/releases/yarn-4.18.1.cjs start:ui-preview:reset
```

Ctrl+C also stops the supervisor's children. No port-owner search, `pkill`, forced kill or unrelated container shutdown is used. Runtime state is memory-only; a fresh launch resets drafts and sessions. Logs remain in the printed private runtime directory until the operator removes that directory after shutdown.

Defaults are application `3001`, synthetic services `1111` and the token-protected local supervisor `3111`, all on `127.0.0.1`. To use different ports, set `UI_PREVIEW_PORT`, `UI_PREVIEW_STUB_PORT` and `UI_PREVIEW_CONTROL_PORT` consistently for start/stop/reset. `UI_PREVIEW_RUNTIME_DIR` selects a private runtime directory. Occupied ports cause an error; their owners are never terminated.

The child environment is explicitly constructed. Credentials, proxy settings, `.env`, host `NODE_CONFIG` and ordinary service endpoints are not inherited. Every configured backend points to the same local stub endpoint, and a Node preloader checks hostnames and resolved loopback addresses, including custom lookup results. Container connections to `wiremock` require the system resolver and the dedicated internal network. The host responder uses a deliberately limited, validated static mapping subset; unmatched requests return 404 rather than proxying anywhere.

## Enablement and production exclusion

Preview requires both `NODE_ENV=e2eTest` and exactly `UI_PREVIEW_ENABLED=true`. The supported launcher supplies those values and isolated service configuration. Other environments remain disabled even if the flag is true. Do not enable preview against ordinary development services.

The application reuses existing e2e fixture authentication. There is no `/ui-preview` OIDC exemption. Disabled `/ui-preview` and `/ui-preview/` return a plain 404 before authentication and session handling. Prefix, nested and encoded lookalikes receive no exemption. Catalogue POSTs are rejected. Linked journeys retain their existing guards, CSRF, validation and submit contracts.

Application Insights, Dynatrace, GTM (including noscript) and webchat are suppressed only in explicitly enabled preview. Normal production/e2e telemetry markup remains. Preview flags use the existing local e2e TestData provider with event sending disabled. CARM and multi-track flags retain their ordinary e2e defaults; only the documented GA/dashboard/query/Welsh flags are enabled.

The production upload limiter is omitted only in preview because in-memory Redis is not the production Lua-backed limiter. Ordinary e2e and production still register it. Preview cannot establish rate-limit correctness.

## Catalogue and synthetic scenarios

The exact fork provides 316 candidate entries in the checked reference. The current catalogue has 273 Ready entries, 42 prerequisite-dependent entries and one testing-support action. Ready entries are checked against real GET controllers/templates, including sequential browsing without per-page resets and assertions for the affected amounts, addresses and case destinations. The verification metadata records the view; matching a view and HTTP 200 alone is insufficient. Unsupported/session-dependent entries are labelled rather than silently redirected or repaired through production recovery changes. Full-admission “Settle claim” and partial-admission “Part payment received” require an already-paid scenario with a recorded paid amount; the current fixtures do not supply one. “Mediation contact person” requires a business-party scenario with a named contact; the existing individual-defendant fixture has no contact person. Phone confirmation belongs to the CARM availability flow when enabled; CARM is disabled in the default preview. The COSC upload entry requires a confirm-CCJ-debt-paid application. COSC proof-of-debt guidance also requires a compatible certificate fee response; the strike-out scenario instead supplies the £108 general-application fee, so the guidance entry is prerequisite-dependent. “Accept defendant offer” requires a defendant payment-variation application with a corresponding offer. The shared strike-out scenario does not satisfy these prerequisites. “Application submitted” requires a completed fee-exempt hearing-adjournment application with consent and a hearing more than 14 days ahead; the seeded strike-out application instead has a £108 fee. “Agree to order” requires an application reporting consent; the service fixture records no agreement, so use **Respondent agreement**.

| Claim | Role | Scenario |
| --- | --- | --- |
| `1645882162449409` | Defendant | Existing e2e response/DQ/mediation fixture, cloned into this preview store |
| `1645882162449601` | Claimant | Full admission and instalment offer |
| `1645882162449602` | Claimant | Part admission of £400 of £1,000 |
| `1645882162449603` | Claimant | Case progression, hearing and query threads |
| `1645882162449604` | Defendant/applicant on GA | General application `1732194111758649` |
| `1645882162449605` | Defendant | Part admission and statement of means |

The fixture user is `someID`; the separate claim-issue draft uses that key. Additional case drafts use `<claimId>someID`, and the GA application draft uses `<appId>someID`. The CCD-shaped service responses remain separate from these application models. Original e2e fixture JSON files are unchanged.

A launch captures one fixture clock at UTC noon; draft creation and response deadlines derive from it. Set `UI_PREVIEW_FIXTURE_NOW=2026-10-20T12:00:00Z` before launch to reproduce review data. Other dated narrative/documents are deliberately synthetic historical examples, not promises of a current court timetable.

All required seed writes/expiries complete before readiness. Initialization failures reject startup. Fixture objects are cloned before overlays. Resetting the instance does not touch a real Redis database or another application process.

Ready means a GET render, not completion of the full journey. In particular:

- Select a different party type through the party-type page before using company/organisation/sole-trader variants.
- Payment outcomes and confirmations require their preceding session/submission; no real payment service is available.
- The full-admission scenario does not support the partial-admission settlement question. Use **Settle admitted** in the part-admission group for the £400 example.
- Use the defendant dashboard for the response/DQ scenario and the claimant dashboard in the case-progression group. Hearing tasks are supplied only for the case-progression claimant; other case/role task lists are explicitly empty.
- Evidence **Check and send** requires an in-progress upload draft. Start at **Upload your documents**, select document types, save a file and Continue. Visiting a dashboard refreshes the claim from the synthetic service and replaces that upload draft; repeat the upload journey afterward. Preview does not change production draft recovery.
- The testing-support create-draft action changes synthetic data and is excluded from read-only sweeps.
- Unmapped final submissions, document downloads and unsupported service calls fail locally. They do not fall back to a real service.
- The upload stub returns synthetic PDF metadata and a new reference. It does not retain file bytes or establish production storage, scanning or document-download behaviour.
- Query threads and GA roles are fixed scenarios. Different browser contexts still share the synthetic user's stored drafts; restart/reset between destructive interaction scenarios.
- Normal no-JavaScript forms retain their production behaviour and limitations. Preview adds no new server fallback for client-only repeated rows.

## Optional container workflow

The separate `Dockerfile.ui-preview` and `compose/ui-preview.yml` do not modify production Docker/deployment files. Required images are `node:24.21.0-alpine` and `wiremock/wiremock:3.13.2`; obtaining images/build prerequisites requires separate permission. Runtime Compose services have `pull_policy: never`.

Preview does not mount chart mappings. Its mappings do not require the chart state extension. Export validated aggregate source files into ordinary individual WireMock mapping files first:

```sh
preview_work=$(mktemp -d)
node bin/ui-preview-mappings.cjs --export "$preview_work/mappings"
export UI_PREVIEW_MAPPING_DIR="$preview_work/mappings"
export UI_PREVIEW_PROJECT=cui-ui-preview-local
# Check approved images exist before building; do not let a missing image pull implicitly.
docker image inspect node:24.21.0-alpine wiremock/wiremock:3.13.2 >/dev/null
docker compose --env-file /dev/null -f compose/ui-preview.yml config --quiet
# Build only with separately approved prerequisites/network access:
docker compose --env-file /dev/null -f compose/ui-preview.yml build --pull=false
docker compose --env-file /dev/null -f compose/ui-preview.yml up --pull never --no-build
# Stop only this explicitly named project:
docker compose --env-file /dev/null -f compose/ui-preview.yml down
```

Choose a project name unique to this local instance. Keep the same project/mapping environment for lifecycle commands. Remove `preview_work` after shutdown. Runtime uses a dedicated internal network, read-only mapping mount, read-only application filesystem and tmpfs; published ports are loopback-only. Container-internal application binding is explicitly `0.0.0.0` and is never the host default.

The Dockerfile-specific ignore file includes only required source/config/build tools and selected preview scripts. It excludes credentials, installed dependencies, `.git`, generated outputs and the excluded Yarn binary. Installation is immutable with scripts/build hooks skipped. Container execution and WireMock's response-template upload stub require their own verification when the approved images are available.

## Verification and limitations

`node bin/ui-preview-mappings.cjs` validates the separate preview mappings. Existing chart validation remains separate. The integration catalogue probe exercises every Ready entry in English and Welsh using real application assembly, both with in-memory fixtures reset between entries and with sequential browsing without per-entry resets. Separate bilingual sequences exercise response-timeline refresh and the real upload prerequisites.

Tests cover the enablement matrix, real OIDC registration, production exclusion, ordinary e2e isolation, telemetry shells, initialization failures, local service configuration, port conflicts, readiness and token-owned shutdown. Browser evidence and actual limitations are recorded in [PR10 review notes](pr10-ui-preview-review-notes.md).

Do not run browser-installing accessibility wrappers for offline review. Use an installed browser, block external requests and contain profiles/reports. On macOS, Chromium can write shared Crashpad state despite HOME/TMPDIR flags; the review used an explicit write sandbox for final checks. Local rendered-page/POST checks do not establish authenticated persistence or QA acceptance.

PR11 retains remaining general fork tests and final retained/adapted/excluded reconciliation. Hosted evidence, applicable server contracts, operational checks, authenticated journeys and separate QA-person acceptance remain outstanding.
