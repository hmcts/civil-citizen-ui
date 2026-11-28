# Security Policy

## Purpose

This document outlines how security vulnerabilities should be reported for this
repository, and how civil-citizen-ui runs automated security checks.

HMCTS is committed to responsible vulnerability disclosure and to addressing
legitimate security issues in a timely and coordinated manner.

## Reporting a vulnerability

If you believe you have identified a security vulnerability in this repository, please report it by email to:

HMCTSVulnerabilityDisclosure@justice.gov.uk

This email address is the sole approved point of contact for vulnerability disclosures relating to HMCTS-owned repositories and services.

Please **do not** create public GitHub issues or pull requests to report security vulnerabilities.

## What to Include in a Report

When reporting a vulnerability, please provide as much of the following information as possible:

- The repository, service, or component affected
- A clear description of the vulnerability
- Steps required to reproduce the issue
- Any non-destructive proof of concept or exploitation details

Where available, the following additional information is helpful:

- The suspected vulnerability type (for example, an OWASP category)
- Relevant logs, screenshot or error messages

Reports do not need to be fully validated before submission. If you are unsure whether an issue is exploitable or security-relevant, you are still encouraged to report it.

## Responsible Disclosure Guidelines

When investigating or reporting a vulnerability affecting HMCTS systems, reporters must not:

- Break the law or breach applicable regulations
- Access unnecessary, excessive, or unrelated data
- Modify or delete data
- Perform denial-of-service or other disruptive testing
- Use high-intensity, invasive, or destructive scanning techniques
- Publicly disclose the vulnerability before it has been addressed
- Attempt social engineering, Phishing, or physical attacks
- Demand payment or compensation in exchange for disclosure

These guidelines are intended to protect users, services, and data while allowing good-faith security research.

## Bug Bounty

HMCTS does not operate a paid bug bounty programme.

## Code of Conduct

All contributors and reporters are expected to act in good faith and in accordance with applicable laws and professional standards.

## Scan approach — civil-citizen-ui

This section documents the security scan posture for civil-citizen-ui, including
the approach, suppressions and accepted residual risks. It was last reviewed in November 2026.

### ZAP (DAST)

- Nightly OWASP ZAP via `enableSecurityScan()` in `Jenkinsfile_nightly` against the deployed AAT `TEST_URL`
- Frontend full scan (Node/`YarnBuilder` pipeline), not an OpenAPI API scan
- Config artefacts:
  - `zap_hooks.py` — global passive-rule suppressions
  - `audit.json` — per-URL / fingerprint ignores

Unauthenticated ZAP mainly covers public and login-adjacent pages. Deep
IDAM-protected journeys are out of scope for the initial baseline; authenticated
scanning may be a follow-up.

### Playwright api-security

Targeted checks under `playwright/tests/api-security/` cover injection,
response hardening (headers, CORS, error handling), payment-session access
control, and platform endpoints (health, Express regression).

The suite runs on PR preview via `runPreviewSecurityDiagnostics()` in
`Jenkinsfile_CNP`, and is also ran against AAT on a repeating
schedule (nightly / master).

### Response hardening headers

Application response hardening is applied via Helmet (`src/main/modules/helmet`),
including Referrer-Policy and Content-Security-Policy, plus Helmet defaults
(e.g. `X-Content-Type-Options`, frameguard / HSTS where configured).

Playwright specs under `playwright/tests/api-security/security-headers.spec.ts`
assert key headers on deployed environments.

### Cookie-related findings (ZAP 10010, 10054, 90033)

Civil-citizen-ui is a session-based citizen frontend and **does** set application cookies. Cookie alerts from ZAP must be triaged carefully:

- **App-owned session / nonce cookies** — treat as CUI responsibility; prefer
  fixing Secure / HttpOnly / SameSite in application config over suppressing
- **Upstream cookies** (e.g. Azure App Gateway `ARRAffinity*`, IDAM on proxied
  auth paths) — may be accepted as upstream ownership after review, then
  documented here and suppressed in `zap_hooks.py` / `audit.json`

No cookie rules are globally suppressed until the first AAT ZAP run is triaged.

### ZAP scan rule suppressions (`zap_hooks.py`)

None yet. `rules_to_ignore` is empty until the first AAT run. Add rule IDs only
when the finding is noise for the whole app, with a one-line justification in
this table:

| Rule | Name | Justification |
|------|------|---------------|
| — | — | None yet |

Prefer fixing CUI issues over suppressing. Use `audit.json` for one-off
false positives on a single URL.

### ZAP per-URL ignores (`audit.json`)

Per-URL ignores in audit.json cover specific endpoint + rule combinations that generate noise in an unauthenticated scan context. The file includes a _comment key pointing back to this document. Entries should be reviewed when endpoints are added or removed.

None yet — populated after the first AAT ZAP run.

### Accepted residual risks

- Unauthenticated ZAP does not exercise IDAM-protected citizen journeys
- Playwright api-security only asserts scenarios covered by its specs; ZAP
  remains the broad scanner for unanticipated issues

Further accepted risks will be recorded here after first-run triage.

## Further Reading

- https://www.ncsc.gov.uk/information/vulnerability-reporting
- https://www.gov.uk/help/report-vulnerability
