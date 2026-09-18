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
tag. The defendant-linking scenarios are explicitly selectable through
`@ui-defendant-linking`; their added PR tag has been removed to restore the
pre-epic default selection. Their bodies and existing skip remain unchanged.

Standard execution retains normal downstream configuration, existing selection
and previous-failure rerun behaviour. Preview startup resource/probe adjustments
and failure-report preservation apply to both modes; they do not remove tests.
Mock-specific setup and routing remain gated by the router/e2e configuration.

## Paired verification

Use the ordinary PR selection with no `pr_ft_*` or `runAllFunctionalTests`
labels. Toggle only `pr-values:optimisedTests`. Do not broaden the selection to
make migrated scenarios appear in this comparison.

Codecept's loader was run against an isolated pre-epic source snapshot and the
current branch using `@civil-citizen-pr`. The baseline selects 19 scenarios:
14 active and five existing skips. After removing the epic-added defendant-linking
PR tag, the branch selects the same scenario identities and skip states, ignoring
only internal routing tags. The active partition is zero mocked, six thin-client
and eight residual. All 14 active tests still use real downstream services.

The five create-claim party variants have only the existing `@ui-create-claim`
selection tag in the pre-epic source. They are outside the default PR baseline.
Their `@mocked-functional` routing metadata sends them to the mocked bucket when
the group is selected with the optimisation label; without the label, they run
against real services. Their bodies and assertions remain unchanged.
Payment-authentication and response-validation mocked scenarios belong to the
nightly selection, not the default PR baseline. The added mocked create-claim
probe is supplementary. None counts as default PR migration progress.

A migration batch must identify scenarios already selected by the pipeline it
optimises. Existing optional groups and nightly coverage must be assessed against
their own pre-epic selections; absence from the PR default does not prove a test
has never been run. Default PR mocked migration coverage is currently 0/14.
Thin-client denotes the existing `@thin-full-stack` classification and does not
represent migration off real services.

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

## Mock setup review

Switching the router alone did not activate the migrated scenarios' setup:
the helpers still used real workflow/assignment APIs and the mock support
routes were restricted to local `e2eTest` mode. The mocked bucket now explicitly
activates that setup. In the shared preview, support requires both the configured
router and its request control header/cookie; ordinary requests retain normal
behaviour. Browser control cookies are HTTP-only so client-side cookie cleanup
does not discard the test session. The old local-only synthetic defendant
dashboard is not enabled in preview.

The SoleTrader-versus-Individual scenario passes against WireMock using normal
application mode and a real local Redis instance, with zero unmatched requests.
The request boundary and cache/submission tests pass. This supplements, and does
not replace, the outstanding paired Jenkins evidence.

The next local variant reaches a pre-existing shared assertion mismatch in
`citizenFeatures/GA/pages/applicationType.js`: it expects the long "Ask the court
to change something on your case" heading, while the application template uses
"Make an application" (unchanged since 2024). The assertion remains unchanged and is outside this PR-baseline migration.
Its failure was reproduced locally, not on master. No production content change
is proposed. Accessibility provisioning is tracked separately in DTSCCI-6415.
