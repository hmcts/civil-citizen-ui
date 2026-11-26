# Renovate automerge

## Current configuration

`civil-citizen-ui` uses `.github/renovate.json`, extending the shared HMCTS preset and `local>hmcts/.github//renovate/automerge-minor`, which automerges minor and patch updates only. Major updates wait for review.

Repo-level settings:

- `timezone`: `Europe/London`.
- `schedule` and `automergeSchedule`: after 7am and before 9am, and after 5pm and before 8pm, every weekday.
- `platformAutomerge`: `false`, so Renovate enforces the configured merge windows instead of queuing GitHub auto-merge.
- `rebaseWhen`: `behind-base-branch`, so Renovate refreshes branches that fall behind `master`.
- `automergeStrategy`: `squash`.
- `prConcurrentLimit`: `5`.
- `rangeStrategy`: `pin`, so `package.json` versions are pinned exactly.
- `ignoreTests`: `false`, so automerge waits for checks to pass.
- npm updates wait 7 days after release (`minimumReleaseAge`), matching Yarn's npm age gate, and a PR is only opened once that has passed.
- `vulnerabilityAlerts`: security updates skip the age gate and are opened immediately.

Groups and automerge, in the order they appear in `packageRules`:

| Rule | Matches | Automerge |
|---|---|---|
| Keep major updates for review | every major update | no |
| All non-major updates | minor and patch, except `govuk-frontend` | yes |
| Terraform version | `infrastructure/.terraform-version` | no |
| Jenkins library | `hmcts/cnp-jenkins-library` | minor and patch (from the preset) |
| Helm chart updates | `helmv3`, minor and patch | yes |
| Dockerfile updates | `dockerfile`, minor and patch | yes |
| Playwright | `@playwright/test`, `playwright-core`, `@axe-core/playwright`, minor and patch | yes |
| Allure reporting | `allure-*`, minor and patch | yes |
| ESLint | `eslint`, `typescript-eslint`, `@eslint/*`, `@typescript-eslint/*`, `eslint-*`, minor and patch | yes |
| Stylelint | `stylelint`, `stylelint-*`, majors included | minor and patch only |
| TypeScript | `typescript`, `@types/*`, minor and patch | yes |
| GOV.UK Frontend | `govuk-frontend` | no; reviewed against rendered fixtures and journeys |
| Application Insights and OpenTelemetry | `applicationinsights`, `@azure/monitor-opentelemetry`, `@opentelemetry/*` | no |

When several package rules match, later values win. The named groups come after "All non-major updates", so their minor and patch updates get their own PRs. Stylelint majors are grouped so `stylelint` and its shared configs move together.

## Code-owner review

`CODEOWNERS` assigns `*` to `@hmcts/civil`, then lists the files Renovate updates without an owner, so Renovate PRs that only touch them don't need code-owner review: `.nvmrc`, `.yarn/**`, `.yarnrc.yml`, `Dockerfile`, `package.json`, `yarn.lock`, `charts/**/Chart.yaml`, `infrastructure/.terraform-version`, `infrastructure/_state.tf`, and `.github/workflows/*.yaml` and `*.yml`.

`Jenkinsfile_CNP` and `Jenkinsfile_nightly` are not in that list, so Jenkins library PRs (for example #8614) still need `@hmcts/civil` approval before they can automerge. Add both files to the ownerless block if those PRs should merge without review, as `civil-wa-task-configuration` does for `Jenkinsfile_CNP`.

## Merge window and Jenkins availability

PTL Jenkins runs on `cft-ptl-00-aks`, which [`hmcts/auto-shutdown`](https://github.com/hmcts/auto-shutdown) normally stops from 20:00 to 06:30 daily. There is no scheduled weekend startup.

If Renovate updates or rebases a PR while Jenkins is unavailable, the required check can't complete and automerge stays blocked. Branch creation and automerge therefore share the 07:00–09:00 and 17:00–20:00 weekday windows, when Jenkins is online and developer activity is lower. A PR rebased late in the evening window may not finish its build before the 20:00 shutdown; it then merges in a later window.

`platformAutomerge` must stay `false`; otherwise Renovate enables GitHub auto-merge and GitHub can merge whenever checks pass, regardless of `automergeSchedule`.

## Holds

Each hold in `.github/renovate.json` gives its reason in `description`.

| Package | Held below | In use | Reason |
|---|---|---|---|
| `typescript` | 6.1.0 | 6.0.3 | typescript-eslint 8 only supports TypeScript below 6.1.0 |
| `@types/config` | 4.0.0 | 3.3.5 | Version 4 is an empty stub; `config` ships its own types |
| `@types/glob` | 9.0.0 | 8.1.0 | Version 9 is an empty stub; `glob` ships its own types |
| `@types/uuid` | 11.0.0 | 10.0.0 | Version 11 is an empty stub; `uuid` ships its own types |
| `@types/multer` | 3.0.0 | 2.3.0 | Matches Multer 2 |
| `@types/supertest` | 8.0.0 | 7.2.1 | Matches Supertest 7 |
| `@types/chai` | 6.0.0 | 5.2.3 | Matches the Chai 5 test tooling |
| `flat` (resolution) | 6.0.0 | 5.0.2 | `yargs-unparser` 2 (via mocha) calls the default export flat 6 removed |
| `glob-parent` (resolution) | 7.0.0 | 6.0.2 | Version 7 is ESM-only, and eslint, fast-glob, copy-webpack-plugin and chokidar `require()` it |
| `connect-redis` | 9.0.0 | 8.1.0 | Version 9 only supports node-redis v5; the session and draft stores use ioredis |
| `python` (GitHub Actions) | 3.14 | 3.13.18 | The Semgrep toolchain's pydantic-core only builds for Python 3.13 and below |
| `@opentelemetry/instrumentation-http` (resolution) | 0.222.1 | 0.222.0 | Held to the range `@azure/monitor-opentelemetry` declares; raise with the two below |
| `@opentelemetry/core` (resolution) | 2.12.0 | 2.11.0 | instrumentation-http 0.222.0 requires core 2.11.0 exactly |
| `@opentelemetry/api` (resolution) | 1.10.0 | 1.9.1 | core 2.x peers on api below 1.10.0 |

These need checking:

- `@types/node` is held below 25.0.0 to "keep Node types on the supported Node 24 runtime", but `.nvmrc` and `engines` are now Node 26.13.1, and `@types/node` is on 24.19.2. Raise the hold to below 27.0.0 so the types follow the runtime.
- `@types/chai` is held to Chai 5 types, but `chai` is now 6.3.0. Check whether the test tooling still needs the Chai 5 types.

When a Renovate PR fails the build on every rebase, find the cause and add a hold with its reason rather than leaving the PR open: with `rebaseWhen: behind-base-branch`, a PR that can never pass is rebuilt on every merge to `master`.

## Stalled-queue alert

`civil-service`'s `.github/workflows/renovate-stalled-alert.yml` also checks this repository's open Renovate PRs each weekday morning and reports any older than three days.

## Release freeze

Use a Renovate package rule for a planned release freeze, so the freeze is reviewable and recorded in the repository. Add it as the final item under `packageRules` in `.github/renovate.json`:

```json
{
  "description": "Release freeze: disable Renovate automerge",
  "matchPackageNames": ["*"],
  "automerge": false
}
```

It must stay last: later rules win, and several groups above set `automerge: true`. The rule stops automerge but leaves Renovate opening and rebasing PRs. `vulnerabilityAlerts` doesn't set `automerge`, so security PRs are held by the freeze too; check that still holds if `vulnerabilityAlerts` is changed.

### Start a freeze

1. Add the freeze rule in a pull request, with the release or change reference and the intended end date in the description.
2. Merge it before the freeze starts, then run Renovate manually or wait for its next scheduled run.
3. Confirm in the Mend job log that the rule resolves to `automerge: false`, and record that in the release ticket.

### End a freeze

1. Remove the freeze rule through a pull request once the release is approved.
2. Merge it, then run Renovate manually or wait for its next scheduled run.
3. Check that a clean Renovate PR automerges only after all required checks pass.

## Pausing Renovate

Pausing is broader than a release freeze: it also stops new PRs, rebases and PR maintenance.

| | Release freeze (`automerge: false` rule) | Pause |
|---|---|---|
| New PRs and rebases | continue | stop |
| Automerge | stops | stops |
| Renovate's PR queue | stays current; merges are manual | builds up until turned back on |

There are two ways to pause:

- **In the repository:** set `"enabled": false` at the top level of `.github/renovate.json` in a pull request, with the reason and expected end. It takes effect once merged and Renovate next runs. Revert the pull request to turn Renovate back on.
- **In the Mend Developer Portal:** an organisation admin can pause the repository at `https://developer.mend.io/github/hmcts/civil-citizen-ui/-/settings`. This takes effect without a merge, so it suits a freeze that has to start straight away. Turn it back on in the portal.

Changing branch protection is not recommended as a routine toggle: it affects all contributors and makes intentional freezes look like authorisation failures.
