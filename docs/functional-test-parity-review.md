# DTSCCI-6156 parity review

The baseline is the parent of the first reduced-stack preview change,
`460c1ae6a6` (DTSCCI-5964). The comparison covers every file under
`src/test/functionalTests/tests` at that point: 117 files.

All 117 remain present. Their contents match after ignoring whitespace and the
added `@reduced-stack`, `@mocked-functional` and `@thin-full-stack` routing tags.
This includes scenario names, bodies, helper calls, assertions and existing skips.
Three fixed waits removed by DTSCCI-5974 have been restored: ten seconds before
the bundle login and two seconds at each of two query-management setup steps.
The comments describing removed create-claim variants already existed before
the baseline; this epic did not remove those variants.

Two files were added after the baseline: the supplementary mocked create-claim
probe and the defendant-linking scenarios introduced by DTSCCI-5974. They do
not replace baseline scenarios. The probe has no ordinary pipeline selection
tag; the defendant-linking file retains its current selection and skips.

Standard execution retains normal downstream configuration, existing selection
and previous-failure rerun behaviour. Preview startup resource/probe adjustments
and failure-report preservation apply to both modes; they do not remove tests.
Mock-specific setup and routing remain gated by the router/e2e configuration.

## Paired verification

Use `pr_ft_civil-citizen-pr`, `pr_ft_ui-create-claim` and `runAllFunctionalTests`
for both runs. Toggle only `pr-values:optimisedTests`. This exercises the normal
PR selection plus all five migrated create-claim variants without changing
the ordinary default selection.

Codecept's loader currently selects 26 scenarios: 20 active and six existing
skips. The active partition is five mocked, seven thin-client and eight residual.
Thin-client denotes the existing `@thin-full-stack` classification; these
scenarios still use the full real preview stack during this transitional phase.

`execution-selection.json` records the revision, baseline expression, identities,
bucket ownership and pre-existing skips. `execution-results.json` reconciles
actual Mochawesome reports, failing on missing, duplicate, unexpected, wrongly
routed or newly skipped scenarios. It distinguishes grep-excluded reporter
entries from selected skips. Both files and bucket timings are archived by Jenkins.

Compare the two downloaded result files with:

```sh
node bin/functional-execution-evidence.js compare standard-results.json optimised-results.json
```

The comparison requires the same revision, selection, scenario identities and
outcomes, with no failures or reconciliation errors. Jenkins functional-stage
timings must be recorded alongside the runner timings: deployment and image
reuse make total pipeline time unsuitable as a direct optimisation measurement.

Paired verification is pending. This is partial migration, not an epic-wide
performance result. This ticket does not require QA-person involvement;
developer review and automated verification are required.
