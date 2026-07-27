# PII logging PR check

DTSCCI-5897 adds a diff-scoped Semgrep check to prevent the PII logging removed
under DTSCCI-5875 from being reintroduced. The check is initially advisory:
findings are attached to the GitHub Actions run as file and line warnings, but do
not fail the build. Invalid rules or scanner failures do fail the build.

## Policy

Do not log:

- names, postal addresses, email addresses, dates of birth, or telephone numbers;
- claim, fee, payment, interest, repayment, or other financial values;
- complete case, claim, application, party, applicant, respondent, payment, or
  financial-detail objects.

CCD case references, field/rule identifiers, template identifiers, and agreed
operational user identifiers may be logged. Prefer stable identifiers and state
transitions over payloads. DTSCCI-5875 separately adds runtime redaction as a
defence-in-depth layer; this PR-time check does not depend on that work.

## Run locally

Install the pinned CI version of Semgrep and run the rule tests:

```shell
python3 -m pip install semgrep==1.136.0
semgrep test .semgrep
```

Scan changes relative to the target branch:

```shell
semgrep scan --strict --metrics=off --no-rewrite-rule-ids \
  --config .semgrep/logging-pii.yml \
  --baseline-commit origin/master \
  --exclude src/main/assets/js/mojAll.js \
  src/main
```

The CI checkout uses full Git history and the pull request base SHA, so findings
that already exist on the target branch are not reported on unrelated pull
requests. When DTSCCI-5875 is merged, its cleaned state naturally becomes the
baseline for subsequent pull requests. The generated `mojAll.js` bundle is
excluded from the raw-console rule; authored JavaScript and TypeScript remain in
scope.

## Initial tuning result

On 17 July 2026, a full post-DTSCCI-5875 scan reported 13 existing findings:
12 financial values or payment payloads and one raw `console` call. Manual review
classified all 13 as policy-relevant. Payment state labels and interest option
identifiers were then added as explicit sanitizers because they are operational
state rather than financial values. The advisory PR phase remains responsible for
measuring the false-positive rate across normal pull requests before the check is
made blocking.

## Justified suppression

First rewrite the log to use an approved identifier. If a finding is demonstrably
safe and cannot be expressed more clearly, add a ticketed reason immediately
above the suppression and limit it to the specific rule:

```typescript
// PII-LOGGING-SUPPRESSION: DTSCCI-1234 - value is a fixed rule identifier.
// nosemgrep: civil.typescript.sensitive-object-to-log
logger.info('Rule selected', application);
```

Suppressions without a ticket and explanation should not be approved. Do not use
blanket `nosemgrep` comments or add source directories to an ignore file.

After an advisory sample of recent pull requests has an acceptable false-positive
rate, remove advisory mode by running the scan with `--error` and make the
`pii-log-check` job a required branch check.
