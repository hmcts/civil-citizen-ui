# Restricted local UI preview

Use the preview catalogue to browse real CUI controllers and Nunjucks templates with synthetic case data. It uses one shared fixture user and disposable in-memory draft and session stores. Real backend persistence, payment processing and production rate limiting need separate environment testing.

## Quick start

Use the Node version selected by `.nvmrc` for local development. The launcher also accepts other stable Node versions meeting the minimum in `package.json` (currently `>=24.18.0`), using the installed runtime without downloading one. The repository's `.yarnrc.yml` selects Yarn `4.18.1`. Run these commands from the repository root; Docker is not required for this host workflow:

```sh
yarn install --immutable --mode=skip-build
yarn build
yarn start:ui-preview
```

Installation may need registry access. Keep `--mode=skip-build` to skip install scripts, including the root post-install hook that fetches shared scripts. The preview launcher uses the installed dependencies and built assets; it does not download runtimes or browsers.

Open <http://127.0.0.1:3001/ui-preview>. The launcher stays in the foreground and prints the location of its runtime files and logs.

## Logs, shutdown and reset

In another terminal in the same checkout, choose the command you need:

| Action | Command |
| --- | --- |
| Show logs | `yarn start:ui-preview:logs` |
| Stop preview | `yarn start:ui-preview:down` |
| Restart with the initial fixtures | `yarn start:ui-preview:reset` |

Use `down` to stop the preview, or `reset` to restart it with the initial fixtures. Ctrl+C also stops the processes started by the launcher. Other processes and containers are left alone. Drafts and sessions are held in memory; logs remain in the printed runtime directory until you remove it after shutdown.

### Ports and runtime files

Defaults are application `3001`, synthetic services `1111` and the token-protected local supervisor `3111`, all on `127.0.0.1`. To use different ports, set `UI_PREVIEW_PORT`, `UI_PREVIEW_STUB_PORT` and `UI_PREVIEW_CONTROL_PORT` consistently for start/stop/reset. `UI_PREVIEW_RUNTIME_DIR` selects a private runtime directory. Occupied ports cause an error; their owners are never terminated.

## Service isolation

The child environment is explicitly constructed. Credentials, proxy settings, `.env`, host `NODE_CONFIG` and ordinary service endpoints are not inherited. Enabled preview skips mounted-secret loading, including `/mnt/secrets`; ordinary e2e and production retain their existing secret configuration.

Every configured backend points to the same local stub endpoint. A Node preloader checks hostnames and resolved loopback addresses, including custom lookup results. Container connections to `wiremock` require the system resolver and the dedicated internal network. The host responder supports a limited, validated subset of static mappings; unmatched requests return 404 rather than being forwarded to another service.

## Enablement and production exclusion

Preview requires both `NODE_ENV=e2eTest` and exactly `UI_PREVIEW_ENABLED=true`. The supported launcher supplies those values and isolated service configuration. Other environments remain disabled even if the flag is true. Do not enable preview against ordinary development services.

The application reuses existing e2e fixture authentication. There is no `/ui-preview` OpenID Connect (OIDC) exemption. Disabled `/ui-preview` and `/ui-preview/` return a plain 404 before authentication and session handling. Prefix, nested and encoded lookalikes receive no exemption. Catalogue POSTs are rejected. Linked journeys retain their existing guards, cross-site request forgery (CSRF) protection, validation and submission behaviour.

Application Insights, Dynatrace, Google Tag Manager (including noscript) and webchat are suppressed only in explicitly enabled preview. Normal production/e2e telemetry markup remains. Preview flags use the existing local e2e TestData provider with event sending disabled. CARM and multi-track flags retain their ordinary e2e defaults; the preview additionally enables general-application (GA), dashboard, query and Welsh flags.

The production upload limiter is omitted only in preview because in-memory Redis is not the production Lua-backed limiter. Ordinary e2e and production still register it. Preview cannot establish rate-limit correctness.

## Catalogue and synthetic scenarios

Catalogue entries are classified as Ready, prerequisite-dependent or testing support. Ready pages are checked against real GET controllers and templates, both individually and during sequential browsing. Checks include relevant amounts, addresses and case destinations as well as the response status and rendered view. Entries needing other data or session state display their prerequisites.

| Claim | Role | Scenario |
| --- | --- | --- |
| `1645882162449409` | Defendant | Existing e2e response, directions questionnaire (DQ) and mediation fixture, cloned into this preview store |
| `1645882162449601` | Claimant | Full admission and instalment offer |
| `1645882162449602` | Claimant | Part admission of £400 of £1,000 |
| `1645882162449603` | Claimant | Case progression, hearing and query threads |
| `1645882162449604` | Defendant/applicant on GA | General application `1732194111758649` |
| `1645882162449605` | Defendant | Part admission and statement of means |

The fixture user is `someID`; the separate claim-issue draft uses that key. Additional case drafts use `<claimId>someID`, and the GA application draft uses `<appId>someID`. Core Case Data (CCD) service responses remain separate from these application models. Original e2e fixture JSON files are unchanged.

A launch captures one fixture clock at UTC noon; draft creation and response deadlines derive from it. Set `UI_PREVIEW_FIXTURE_NOW=2026-10-20T12:00:00Z` before launch to use a fixed fixture date. Other dated narrative and documents are synthetic historical examples.

All fixture writes and expiry settings complete before readiness. Initialisation failures reject startup. Fixture objects are cloned before preview-specific changes are applied. Resetting the instance does not touch a real Redis database or another application process.

### Pages with additional prerequisites

The following entries need data beyond the default fixtures:

| Entry | Prerequisite or alternative |
| --- | --- |
| Full-admission **Settle claim** and partial-admission **Part payment received** | An already-paid scenario with a recorded paid amount. The default fixtures do not supply one. |
| **Mediation contact person** | A business party with a named contact. The default individual defendant has no contact person. |
| Phone confirmation | The CARM availability flow. CARM is disabled in the default preview. |
| Certificate of satisfaction or cancellation (COSC) upload | An application to confirm that a county court judgment debt has been paid. |
| COSC proof-of-debt guidance | A compatible certificate application and fee response. The default strike-out scenario supplies a £108 GA fee. |
| **Accept defendant offer** | A defendant payment-variation application with an offer. The default strike-out application does not supply one. |
| **Application submitted** | A completed, fee-exempt hearing-adjournment application with consent and a hearing more than 14 days ahead. The default strike-out application has a £108 fee. |
| **Agree to order** | An application recording consent. The default service response records no agreement; use **Respondent agreement**. |

### Following journeys

Ready means a GET render, not completion of the full journey. In particular:

- Select a different party type through the party-type page before using company/organisation/sole-trader variants.
- Payment outcomes and confirmations require their preceding session/submission; no real payment service is available.
- The full-admission scenario does not support the partial-admission settlement question. Use **Settle admitted** in the part-admission group for the £400 example.
- Use the defendant dashboard for the response/DQ scenario and the claimant dashboard in the case-progression group. Hearing tasks are supplied only for the case-progression claimant; other case/role task lists are explicitly empty.
- Evidence **Check and send** requires an in-progress upload draft. Start at **Upload your documents**, select document types, save a file and Continue. Visiting a dashboard refreshes the claim from the synthetic service and replaces that upload draft; repeat the upload journey afterwards. Preview does not change production draft recovery.
- For mediation, start at **Type of documents**, select **Your statement**, enter the document details, save a file and Continue to **Upload check and send**. A fresh preview seeds the selected category so the upload controls can also be inspected directly, but no document is saved initially. Dashboard refresh clears that selection and any upload draft, so both upload entries display their prerequisites in the catalogue. The overlay changes only the disposable preview copy, not the ordinary e2e fixtures.
- The testing-support create-draft action changes synthetic data and is excluded from read-only sweeps.
- Unmapped final submissions, document downloads and unsupported service calls fail locally. They do not fall back to a real service.
- The upload stub returns synthetic PDF metadata and a new reference. It does not retain file bytes or establish production storage, scanning or document-download behaviour.
- Query threads and GA roles are fixed scenarios. Different browser contexts still share the synthetic user's stored drafts; restart/reset between destructive interaction scenarios.
- Normal no-JavaScript forms retain their production behaviour and limitations. Preview adds no new server fallback for client-only repeated rows.

## Optional container workflow

The separate `Dockerfile.ui-preview` and `compose/ui-preview.yml` leave production deployment files unchanged. This workflow requires Docker and the images `node:24.21.0-alpine` and `wiremock/wiremock:3.13.2`. If either image is missing, pull it explicitly before continuing. Building the application image may also require registry access for dependencies. Compose services use `pull_policy: never` at runtime.

Preview does not mount chart mappings. Its mappings do not require the chart state extension. Export validated aggregate source files into ordinary individual WireMock mapping files first:

```sh
preview_work=$(mktemp -d)
node bin/ui-preview-mappings.cjs --export "$preview_work/mappings"
export UI_PREVIEW_MAPPING_DIR="$preview_work/mappings"
export UI_PREVIEW_PROJECT=cui-ui-preview-local
# Check that the required images are available locally.
docker image inspect node:24.21.0-alpine wiremock/wiremock:3.13.2 >/dev/null
docker compose --env-file /dev/null -f compose/ui-preview.yml config --quiet
# Build the application image before starting the isolated runtime.
docker compose --env-file /dev/null -f compose/ui-preview.yml build --pull=false
docker compose --env-file /dev/null -f compose/ui-preview.yml up --pull never --no-build
# Stop only this explicitly named project:
docker compose --env-file /dev/null -f compose/ui-preview.yml down
```

Choose a project name unique to this local instance. Keep the same project/mapping environment for lifecycle commands. Remove `preview_work` after shutdown. Runtime uses a dedicated internal network, read-only mapping mount, read-only application filesystem and tmpfs; published ports are loopback-only. Container-internal application binding is explicitly `0.0.0.0` and is never the host default.

The Dockerfile-specific ignore file includes the required source, configuration, build tools and preview scripts. It retains webpack's `css-template.njk` and `js-template.njk` source files while excluding their generated outputs. Credentials, installed dependencies and `.git` are also excluded. Installation is immutable with install scripts skipped.

The host checks below do not establish container behaviour or WireMock's response-template upload behaviour.

## Verification and limitations

`node bin/ui-preview-mappings.cjs` validates the separate preview mappings. Existing chart validation remains separate. The integration catalogue probe exercises every Ready entry in English and Welsh using real application assembly, both with in-memory fixtures reset between entries and with sequential browsing without per-entry resets. Separate bilingual sequences exercise response-timeline refresh and the real case-progression and mediation upload prerequisites. Fixture tests check the actual CCD translations and seeded drafts for repayment offers, claimant task lists, statement-of-means answers and mediation document identity.

Tests cover the enablement matrix, real OIDC registration, production exclusion, ordinary e2e isolation, telemetry shells, initialisation failures, local service configuration, port conflicts, readiness and token-owned shutdown. The preview uses isolated fixture services. Authenticated backend saving and operational acceptance require the appropriate integrated environment.

See [the test-pyramid guide](test-pyramid.md#accessibility-and-tooling-regressions) for accessibility prerequisites. Local page and submission checks do not replace QA acceptance.
