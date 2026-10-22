# PR9 presentation review notes

## Status and references

PR9 implements the remaining selected production presentation work for DTSCCI-6593 under DTSCCI-4185. It is local, unstaged and uncommitted. These results do not establish hosted approval, authenticated journey/operational verification, separate QA or whole-ticket acceptance.

The original verification tables below describe the implementation before independent review. They include the saved-state fixture limitations discovered during review and must not be treated as renewed verification of the corrected fixtures. The dated review-correction record near the end gives the follow-up scope and results.

Current merge qualification: no PR9 production-code correction was established by the latest review, but both subsequent full-coverage attempts exited 1. Merge readiness remains unresolved pending investigation, successful current-candidate verification and required approvals. See [Latest full-coverage review evidence](#latest-full-coverage-review-evidence--19-october-2026); earlier passing runs do not replace these results.

- Branch: `DTSCCI-6593-frontend-presentation`.
- Starting PR8 HEAD/base: `d7114cb1308445400caa16c1db02ca8483bc2152`; working tree and index initially clean.
- Local PR8 branch is `DTSCCI-6593-frontend-uploads`; PR7, integration and local master are ancestors. No reconciliation, branch switch or ref update was needed.
- Local master: `63ca34e08c509abd9776192f437fb325dbfd39ce`; integration: `a0dbfad7eac20d3595668f08b2730e24bd245dfb`.
- Source fork/reference: `486994338cd584ac728dc0dedacbc31cc0b11406` at `/Users/abusalam/Documents/GitHub/civil-citizen-ui-improvements`; clean at inspection.
- Historical ancestor: `00e10d5cf52fe14079e4983ff6277f14adf9e94b`.
- Raw starting index SHA-256: `217c85a2e45caa268f170b04e2a4d3d35902dc3025f8ca8f33a1650e4bf1df00`.
- Read-only comparisons used `git --no-optional-locks`: ancestor → exact fork, PR8 → candidate, fork → candidate. Fork working-tree files were verified separately. Its instructions/version/preview assumptions were not imported.
- Governing ticket and historical PR3–PR7 dispositions were read from the excluded decision log. Current PR8 qualifications are in [pr8-upload-review-notes.md](pr8-upload-review-notes.md). Historical deferrals already completed by PR7/PR8 were not implemented again.

## Delivered scope and adaptation decisions

| Group | Fork work retained/adapted | Preservation/local correction |
| --- | --- | --- |
| Header/breadcrumbs | Official locked GOV.UK header and breadcrumb macros | Production homepage, service/account/logout, back/crumb precedence, page titles, language toggle, footer and nonces retained. Review found the dashboard shell had dropped master’s Dynatrace user metadata; the shared include is now restored and covered with signed-in shell regressions. Preview navigation excluded. |
| Dashboard/tabs | Official table and tabs composition | Both roles, draft expiry/order, formatted amounts/status HTML, pagination, empty states, IDs/fragments and complete panels retained. Existing bilingual About claim wording labels the tabs. PR4 task lists untouched. |
| Amount/judgment/timeline | Official tables | No calculations changed; preserve conversion/rounding, zero versus absent, interest Details, fees/subtotals/already-paid and all ordered rows. Citizen reasons/descriptions are text. The unused legacy row token remains on date cells; no functional selector edits were necessary. |
| Queries | Official list table and extracted message-card macro | One-based initial/court/follow-up rules, raised-by-user/name, hearing data, document order, closed/reviewing/follow-up conditions remain. Message/name/subject fields use text; attachment HTML comes from the existing escaped URL/name formatter. PR8 attachment upload/removal paths are unchanged. |
| Shared renderer | NEW_TAB_BUTTON and SELECT | Button destination/target preserved with `noopener noreferrer`; SELECT retains label/variables/hint/error/items after redundant grouping removal. Every upload and DATE_ARRAY branch from PR8 is retained. |
| Contact/address/documents | Official Details/inset composition and display-date handling | Open contact content becomes natively collapsible but starts open. Omitted open still starts closed. Optional instance IDs support multiple components; the three GA page-call adjustments are defensive instance naming. Those callers replace the parent's entire content block and render one contact component, not an additional inherited sidebar. Exact postal/contact text and links retained. Dates bypass translation lookup; missing optional date hints do not hide documents. |
| Remaining forms | Thirty eligible callers assessed/changed | Official radio legends/insets/date errors, with submitted controls and current content preserved. Company no-contact mode retains a legitimate multi-control group. Citizen-response descriptions use the component’s describedBy API so details and generated errors coexist. |
| Repayment display | Guard/late-initialisation and saved schedule idea | One existing claimant controller supplies display-only data from its actual form; shared browser calculator guards complete roots and binds once. Math.ceil/fortnightly week display and wording remain. No monetary, validation, persistence or recovery rules change. |

### Date errors and focus

Six migrated date forms had inherited model-level summary links targeting a non-focusable group or an absent nested ID. Local template mappings now target the existing day input, without renaming a field or changing validation. Real-model regressions failed for all six before that correction and pass after it. Existing unrelated summary messages and interpolation remain. Inline messages are composed only from real keys, escaped individually before trusted line breaks; no nested/empty error-message wrappers are introduced.

### Explicit exclusions and remaining candidates

| Candidate | Decision |
| --- | --- |
| `claim/fee-change.njk` | Retain current form/CSRF/link-button contract; no required component fix justifies removing that structure here. |
| `claim/interest/how-much-continue-claiming.njk` and adjacent amount defaults in other forms | Do not import missing-value/default changes with composition hunks. Preserve numeric/submitted behaviour. |
| `generalApplication/paying-for-application.njk` | Do not hide a missing fee through presentation fallback. GA fee/recovery decisions remain separate. |
| `mediation/telephone-mediation.njk`, `caseProgression/hearingFee/pay-hearing-fee-start.njk` | Only unused-import cleanup remains; no useful production presentation change needed. |
| `report-detail.njk` | Import remains dormant: no live `reportDetail(...)` call outside its definition. Question legend improved, repeated editor not activated or rebuilt. |
| `dateUtils.ts` | Reject blanket invalid-date-to-blank fallback; widespread consumers and invalid-data semantics require a separate decision. |
| `stringUtils.ts` | Do not turn malformed document URLs into undefined IDs that can form broken links. |
| `documentViewMapper.ts` | Do not silently replace required/missing documents with empty lists; preserve current required-document handling. |
| Timeline/GA/payment recovery, admitted amounts and other model changes | Excluded; comment preservation, association, validation and monetary semantics need separate production-trigger evidence. |
| MOJ/jQuery/upload migration | Already completed by PR8; no dependency/initialisation rollback or new upload behaviour. PR8 partial pending-file limitation remains. |
| Preview/authentication/fixtures/infrastructure | PR10 only; nothing added here. |

## Preservation evidence and harness limits

- New rendering helper uses production Nunjucks filters/globals and actual application shells and locked macros without importing the running app. Fixture locals remain supplied context, not a replacement for controller tests. Review found that the initial citizen-response fixture wrongly cleared a saved response and the defence GET fixture used the invalid-POST model. The follow-up retains the saved response, uses a stored `Claim` for defence GET and `Defence` for invalid POST, and renders the airline control through the production datalist builder.
- Citizen-response GET loads the stored response type. Both PR8 and this candidate still read `form.responseType` rather than `form.model.responseType` in the radio template, so saved selection is not displayed. That inherited behaviour is explicitly characterised without clearing the fixture model; fixing the production selection behaviour is outside this correction. Defence invalid POST likewise has a different model contract from GET and is tested separately.
- Equivalent PR8/current renderings compare complete ordered form controls, action/method/encoding, exact links, visible paragraphs and summary messages. Only the six intentional date-summary destination mappings are normalized explicitly. Saved language/claim-type/unemployment/dependant answers use actual enum/boolean contracts and positive selection assertions.
- Unit checks compare every relevant table cell/message/attachment, not one representative string. URL, quote, ampersand and markup-like content is tested as literal text. Existing trusted producer markup stays intentional.
- Locked GOV.UK fixtures are an independent vendor parity check, not application-shell acceptance. Eight used components provide 137 nonempty fixtures; a further guard preserves significant inline whitespace and attribute values.
- Browser pages use built assets (including loaded GDS Transport fonts), actual templates, supplied language/layout locals and localhost capture endpoints. Authentication, live backend storage, operational session/telemetry behaviour and response security headers are not exercised. Local POST capture proves fields/actions only.
- Earlier-stage browser pages reuse their existing content-rendering helpers inside the actual shell; these helpers’ substituted-shell/model limitations remain. Existing PR3–PR8 unit and route regressions also run on the combined tree.

## Accessibility captures

322 capture files changed: 321 authenticated-header regions and 18 files with additional component regions (including one public eligibility capture). The 35 other captures remain unchanged. No whole-page fixture regeneration was used.

- Header rendering preserves each capture’s existing service/navigation text and destinations, including historical absolute localhost links and Welsh labels. Thirty public/service-header variants and other non-consumers were not rewritten as authenticated headers.
- Form, card and table regions retain original captured controls, selected answers, row/message order, saved document data, CSRF and actions. Radio legends come from actual caller translation keys, not guessed captured headings.
- All 322 changed captures passed complete ordered form-contract comparison and an independent normalized outside-region DOM comparison. Structural tests assert the nonempty 321-header inventory, navigation references and exact query values.
- The HWF reference capture was corrected to match the current official radio ownership after an existing PR6 assertion caught its old grouping.
- The query capture's message date is reconstructed from its retained 23 June 2025 timestamp. Its card title, key labels, values and attachment destination are checked against the actual current macro. The historical `Uploaded documents (optional)` key intentionally becomes the current `Attachments` label; the captured attachment and URL remain unchanged.
- Historical limitations remain: PR8 mediation metadata is not a current complete production form; some old captures are error/empty pages, contain older wording or lack a usable live form. Those were preserved rather than replaced with fabricated case data. Captures are bounded presentation evidence, not a claim that every stored page matches today’s controller.

## Verification environment and network record

- Node **24.21.0**, tracked Yarn **4.18.1**, locked GOV.UK Frontend **6.5.1**; no runtime or dependency changes.
- Installed Chromium **133.0.6943.16**, different from Puppeteer’s pinned Chrome 127. No browser/Node/Java download.
- Candidate and untouched PR8 comparison trees were installed/built independently under `/private/tmp/dtscci-pr9-biwtbxy1`. Source, caches, reports and browser profiles were copied/contained; no installed checkout tree or writable cache link was reused.
- Installation flags: `YARN_ENABLE_NETWORK=0`, `YARN_ENABLE_SCRIPTS=0`, `YARN_ENABLE_TELEMETRY=0`, `YARN_ENABLE_HARDENED_MODE=0`, `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1`, `PUPPETEER_SKIP_DOWNLOAD=1`, `PACT_DO_NOT_TRACK=1`; explicit disposable `YARN_CACHE_FOLDER`, `YARN_GLOBAL_FOLDER`, `YARN_ENABLE_GLOBAL_CACHE=0` and `TMPDIR`.
- Initial offline attempts identified missing cache entries. Checksum-matching copied cache filenames were normalized; **108 exact locked tarballs** were still missing. The existing handoff permission was used for only those registry archive URLs. A downloader independently rejected redirects and checked each package/version against the lockfile. A localhost server allowed only those archive paths; external Node sockets/DNS remained blocked. Yarn verified the unchanged locked archive checksums. A subsequent fully offline immutable install passed.
- An initial Yarn configuration attempted a retained-cache write which the sandbox refused; explicit disposable cache/global paths corrected that verification setup. Retained sources/caches were not used as writable installations.
- Browser requests outside localhost, including analytics, were blocked through routing and a blocking proxy; execution used a Node connection/DNS preload. No remote Git, Jira/GitHub, live audit, registry metadata, browser installer, WireMock download, Pact publication or hosted CI operation ran.
- Offline installation with hardened mode disabled is not hardened registry-metadata verification or a live dependency audit.

### Final reproduced results

| Check | Independently reproduced result |
| --- | --- |
| Immutable install | Passed; subsequent complete install was fully offline; build/postinstall hooks skipped |
| TypeScript | `--noEmit --incremental false` passed, including final fixture/model types |
| Full coverage | **919 suites / 8,406 tests**, four workers, exit 0, 189.654 s; 96.30% statements / 84.99% branches / 96.58% functions / 96.25% lines |
| New PR9 regression coverage | Six new suites / 216 tests included in the full run; actual-template form cases cover both languages and blank/saved/error states |
| Routes | **21 suites / 263 tests**, in band, exit 0 |
| Lint | Stylelint passed; ESLint **0 errors / 454 existing warnings** |
| Development / production builds | Both passed, **seven Sass/deprecation warnings** each |
| Dependency pins | 61 production / 63 development / 58 resolutions; 1,517 required checksums, 20 conditional omissions |
| Functional baseline / shared importers | Passed |
| WireMock mappings | **41** mappings/fixtures validated; server-contract execution blocked as described below |
| Pact tooling | **14 tests**, exit 0 |
| Pact consumers / artifacts | **15 suites / 127 tests**; **three complete artifacts** validated, no publication |
| Final rendered-page browser matrix | **304 cases**: 38 page/branch patterns × two languages × two widths × JS on/off; **76** complete base/current field/table comparisons; **174** native local POST captures; no page errors or introduced overflow |
| Focus / coexistence / repayment | **48** actual date-summary activations; **16** earlier-stage component cases; **four** repayment editing cases; **four** displayed/hidden claim-total checks; **two** mobile header keyboard checks |
| Actual-template accessibility | 76 final initial-state pairs plus 12 model-error pairs; **no new WCAG2AA errors**. The full-shell role=presentation scanner finding remains inherited; no suppression |
| Capture boundary/contracts | **322** complete ordered form-contract and normalized outside-region DOM comparisons passed; focused capture tests repeated after whitespace-only cleanup |
| Capture accessibility | **322** equivalent static capture pairs with matched built CSS/fonts; no increased finding. Aggregate errors 1214 → 11; historical captures are not PR8 live-page equivalence |
| Whitespace | Applied-checkout `git diff --check` passed; only newly introduced trailing whitespace was removed |


### Commands actually executed

Commands ran in the disposable candidate with the above environment and external-connection block. The full coverage command used four workers; focused, route and Pact commands ran in band. No `--forceExit` or forced test shutdown was used.

```sh
node .yarn/releases/yarn-4.18.1.cjs install --immutable --mode=skip-build
node node_modules/typescript/bin/tsc --noEmit --incremental false
node .yarn/releases/yarn-4.18.1.cjs build
node .yarn/releases/yarn-4.18.1.cjs lint
node .yarn/releases/yarn-4.18.1.cjs build:prod
node --no-sparkplug node_modules/jest/bin/jest.js --runInBand --silent --runTestsByPath src/test/unit/modules/nunjucks/presentationTemplates.test.ts src/test/unit/modules/nunjucks/presentationSummaries.test.ts src/test/unit/assets/js/calculate-length-repayment.test.ts src/test/unit/modules/nunjucks/presentationGovukFixtures.test.ts
node --no-sparkplug node_modules/jest/bin/jest.js --runInBand --silent --runTestsByPath src/test/unit/modules/nunjucks/presentationDateErrors.test.ts src/test/unit/modules/nunjucks/presentationTemplates.test.ts
node --no-sparkplug node_modules/jest/bin/jest.js --runInBand --silent --runTestsByPath src/test/unit/modules/nunjucks/formControlTemplates.test.ts src/test/unit/routes/features/claimantResponse/ccj/repaymentPlanInstalmentsController.test.ts
node --disable-warning=DEP0060 --no-sparkplug node_modules/jest/bin/jest.js --coverage --maxWorkers=4 --silent
node --no-sparkplug node_modules/jest/bin/jest.js -c jest.functionaltest.config.js --runInBand --silent
node bin/check-dependency-pins.mjs
node bin/functional-baseline.js check
bash bin/test-civil-shared-import-consumers.sh
node bin/validate-wiremock-mappings.js
node --no-sparkplug node_modules/jest/bin/jest.js -c jest.pact-tooling.config.js --runInBand
node --no-sparkplug node_modules/jest/bin/jest.js -c jest.pact.config.js --runInBand
node src/test/contract/check-artifacts.js
```

`LOG_LEVEL=OFF` was confined to supported Jest/route runs and was unset for Pact. Base-comparison runs set `PR9_BASE_VIEWS` to the independent PR8 views directory. Controlled temporary scripts generated browser pages, enforced local routing, compared capture boundaries and ran direct HTML_CodeSniffer; they are dated harness evidence, not newly committed repository commands. Browser wrappers that install downloads were not run.

### Initial failures and reruns

- The first full run: **918 suites / 8,395 tests, two failures**. One raw-HTML assertion depended on an unescaped apostrophe; it now asserts the unchanged visible error text and absence of nested errors. The other existing PR6 assertion exposed the stale HWF capture ownership, which was corrected. Both affected suites passed together (**452 tests**).
- Six real-model date focus regressions failed before the local summary-target correction. A trial mapping placed the flight error collection too early; the focused check caught that and the collection was moved before mapping. All six then passed in both languages.
- A final form review retained company no-contact grouping and used GOV.UK describedBy for combined response details/errors. New regressions reproduced the missing group in the earlier port. An interim inline Nunjucks call syntax error was caught and corrected before the passing rerun.
- Early harness inputs omitted a controller Date and supplied GenericForm where one information page receives Claim directly; fixtures were corrected without changing application behaviour. Fixtures were further aligned with production enum/boolean selections and nested validation models. TypeScript caught empty-array fixture types; explicit types corrected them.
- Earlier successful coverage runs of **919 / 8,401** and **919 / 8,404** preceded the final branch/fixture regressions. They are not substituted for the final-tree result above. Broad checks were repeated after those substantive corrections; ordinary final exits are reported separately.
- The first capture reconstruction found historical query wording that differed from current keys. Explicit legacy-label aliases preserved captured values, and boundary/contract checks verified the final output. A generic fieldset rewrite was narrowed to actual changed callers; unrelated dependant grouping was retained.
- Initial browser comparisons mixed control interactions into accessibility states. Final comparisons take equivalent initial states before interactions. The first localhost static route omitted absolute GOV.UK font paths; it was corrected, font loading was asserted, and the matrix, focus/coexistence and capture comparisons were rerun. No application change or finding suppression was used to fix the harness.
- Capture accessibility is deliberately a static HTML layer: legacy application scripts are removed, matched local built CSS/fonts and HTML_CodeSniffer are loaded. Active interaction is covered separately by actual-template pages with built application JavaScript. Remaining historical capture findings are recorded rather than treated as production equivalence.
- Newly added trailing whitespace inside replacement capture regions was removed before application. Git’s final hunk classification additionally exposed 141 inherited trailing-whitespace lines in 12 captures; only those reported lines were cleaned. All 322 outside-DOM/form-contract comparisons and the focused capture suite passed afterward; captured controls/data were unchanged.

## Remaining fork tests and final reconciliation

An exact ancestor/fork changed-path inventory finds **171 fork test-suite paths absent under those names**, plus six support/capture paths. This is not 171 missing behaviours: PR3–PR8 replacement suites cover retired repeated-row/upload implementations, and PR9 supplies application regressions plus locked fixture checks under current ownership.

- Tests for removed conditionally-hide/reindex/error-observer scripts are not reintroduced. Meaningful replacement behaviours remain in PR3/PR7/PR8 suites.
- Fork fixture helpers are assessed through the narrower PR9 fixture parity and normalization guard; no vendor-only environment is called full application verification.
- Fork global coverage/configuration assertions, accessibility suppressions and testing-the-fork’s-development-setup assumptions are not imported.
- Remaining compatible service/client/model/validator/module test candidates are substantial. A separate **test-integration/reconciliation PR** is justified if their owner review accepts them; compare each against current APIs, existing coverage and unit/integration ownership. The two-PR estimate must not silently discard this assessment.
- PR10 remains restricted local preview: route/auth enablement, production exclusion, fixture isolation, loopback/runtime/launcher boundaries and documentation. The final whole-fork retained/adapted/excluded matrix remains open until that stage and remaining test decisions are reconciled.
- DTSCCI-5145 / DTSCCI-4187 accounting: this series supplies concrete GOV.UK/frontend component, native interaction, shared-helper, tooling and regression improvements. PR9 adds the presentation groups recorded here. It does not deliver the excluded persistence/route decomposition/translation namespace/multi-party/bulk/DAST work, preview or phase-level QA/operational acceptance. Ticket-specific phase closure and attribution still require the final scope/owner record; neither phase is automatically complete.

## Review/merge and whole-ticket gates

- Independent review and required hosted PR checks/approvals remain.
- Investigate the two latest full-coverage failures and obtain successful current-candidate coverage evidence. Passing isolated reruns do not establish their cause or make either failed full run a pass; see the dated record below.
- WireMock mapping validation is **not** server-contract execution. The clean offline installation lacks the standalone JAR and required state extension; download-capable startup was not invoked. Applicable server-contract evidence remains outstanding.
- Live audit and hardened metadata evidence, where required by CI, remain outside this run.
- Integrated browser/accessibility journeys, authenticated saving, deployment/session/Redis/upload-rate-limit/backend/telemetry checks and separate QA-person evidence remain ticket gates.
- PR9 must not be described as completion of DTSCCI-4185, DTSCCI-5145 or DTSCCI-4187.

## PR-description draft

**Title:** DTSCCI-6593 Integrate remaining fork presentation components

**Base:** DTSCCI-6593-frontend-uploads

Integrates selected GOV.UK header/breadcrumb/table/tab/summary-card/inset/Details composition from fork `486994338c`, retaining PR8/current-master contracts and all earlier stages. Adapts remaining eligible form legends/date errors, adds bounded error-summary focus corrections and saved repayment display. Plain citizen content stays escaped and reviewed trusted attachment/status HTML retains its existing producer boundary.

Keeps meaningful multi-control groups, current English/Welsh wording, exact ordered form controls, financial rules, document references and upload/query actions. No dependency, pipeline, preview, persistence, encryption or payment-flow changes. The header refresh touches many captures; each preserves its captured data and outside-region DOM.

See the dated verification records, including the latest failed full-coverage attempts, and the explicit WireMock/hosted/authenticated/QA limitations. Merge readiness remains conditional on investigation and successful current-candidate verification, required checks and reviewer approval. The later restricted-preview/final reconciliation stages remain required.

## Complete changed-file inventory

383 prospective paths: 374 modified tracked files and 9 new files. No deletions. All implementation edits must remain unstaged/uncommitted. Generated Webpack includes/assets, installations and reports are excluded from this inventory and are not applied.

| Path | Treatment / purpose / provenance |
| --- | --- |
| `docs/pr9-presentation-review-notes.md` (new) | Locally authored durable adaptation, verification, exclusion and handover record. |
| `src/main/assets/js/calculate-length-repayment.js` (modified) | Adapt fork guard/late initialisation; local complete-root/idempotent binding and native input/change handling. Preserve display rounding and frequency wording. |
| `src/main/common/utils/repaymentUtils.ts` (modified) | Adapt fork display-only saved schedule mapping; reject invalid/non-finite display inputs without changing payment rules. |
| `src/main/routes/features/claimantResponse/claimantSuggestedInstalmentsController.ts` (modified) | Supply the actual form’s display schedule on GET/invalid POST; no persistence or calculation change. |
| `src/main/views/claim-details-tpl-dashboard.njk` (modified) | Port official breadcrumbs and omit empty error row; preserve back-link precedence, nonces, analytics, language toggle and footer. |
| `src/main/views/features/caseProgression/cancel-your-upload.njk` (modified) | Selected fork form-component hunks adapted to existing PR8 fields, content, errors, conditional answers and submission controls; unrelated defaults excluded. |
| `src/main/views/features/caseProgression/hearingFee/apply-help-fee-reference.njk` (modified) | Selected fork form-component hunks adapted to existing PR8 fields, content, errors, conditional answers and submission controls; unrelated defaults excluded. |
| `src/main/views/features/caseProgression/hearingFee/apply-help-fee-selection.njk` (modified) | Selected fork form-component hunks adapted to existing PR8 fields, content, errors, conditional answers and submission controls; unrelated defaults excluded. |
| `src/main/views/features/claim/airlines/flight-details.njk` (modified) | Adapt date-error composition and bounded model-error summary links to existing day inputs; preserve interpolation, fields, values and validation; retain monetary defaults. |
| `src/main/views/features/claim/claim-bilingual-language-preference.njk` (modified) | Selected fork form-component hunks adapted to existing PR8 fields, content, errors, conditional answers and submission controls; unrelated defaults excluded. |
| `src/main/views/features/claim/interest/claimant-interest-rate.njk` (modified) | Selected fork form-component hunks adapted to existing PR8 fields, content, errors, conditional answers and submission controls; unrelated defaults excluded. |
| `src/main/views/features/claimantResponse/ccj/judgement-amount-summary.njk` (modified) | Official judgment table preserving interest, fees, already-paid/subtotal/total conditions and all formatted values. |
| `src/main/views/features/claimantResponse/ccj/paid-amount.njk` (modified) | Selected fork form-component hunks adapted to existing PR8 fields, content, errors, conditional answers and submission controls; unrelated defaults excluded. |
| `src/main/views/features/claimantResponse/ccj/repayment-plan-instalments.njk` (modified) | Adapt date-error composition and bounded model-error summary links to existing day inputs; preserve interpolation, fields, values and validation; retain monetary defaults. |
| `src/main/views/features/claimantResponse/instalments-plan.njk` (modified) | Saved schedule/live display, non-heading control legends, escaped ordered date errors and day-input summary activation; retain submitted fields. |
| `src/main/views/features/dashboard/claim-summary.njk` (modified) | Official tabs preserving IDs, labels and complete panels; reuse approved bilingual About claim title rather than English default. |
| `src/main/views/features/dashboard/dashboard.njk` (modified) | Official claimant/defendant tables, retaining draft-first ordering, expiry, amounts, status HTML, pagination and empty states. |
| `src/main/views/features/dashboard/item-content.njk` (modified) | Adapt NEW_TAB_BUTTON and SELECT only; use safe label text/variables and component described content; preserve every PR8 upload/date/security branch. |
| `src/main/views/features/dashboard/orders-and-notices.njk` (modified) | Pass display dates directly; omit only absent optional Created date hint; retain document rows, links and ordering. |
| `src/main/views/features/dashboard/view-response-to-claim.njk` (modified) | Pass display dates directly; omit only absent optional Created date hint; retain document rows, links and ordering. |
| `src/main/views/features/directionsQuestionnaire/experts/expert-report-details.njk` (modified) | Selected fork form-component hunks adapted to existing PR8 fields, content, errors, conditional answers and submission controls; unrelated defaults excluded. |
| `src/main/views/features/directionsQuestionnaire/experts/sent-expert-reports.njk` (modified) | Selected fork form-component hunks adapted to existing PR8 fields, content, errors, conditional answers and submission controls; unrelated defaults excluded. |
| `src/main/views/features/generalApplication/additionalInfoUpload/additional-info.njk` (modified) | Selected fork form-component hunks adapted to existing PR8 fields, content, errors, conditional answers and submission controls; unrelated defaults excluded. |
| `src/main/views/features/generalApplication/additionalInfoUpload/respondToWrittenRepInfo.njk` (modified) | Selected fork form-component hunks adapted to existing PR8 fields, content, errors, conditional answers and submission controls; unrelated defaults excluded. |
| `src/main/views/features/generalApplication/application-costs.njk` (modified) | Local defensive instance naming for the page's single contact component. This caller replaces the parent's content block; it does not also render the parent sidebar. No duplicate-ID defect was established here. |
| `src/main/views/features/generalApplication/hearing-arrangement.njk` (modified) | Local defensive instance naming for the page's single contact component. This caller replaces the parent's content block; it does not also render the parent sidebar. No duplicate-ID defect was established here. |
| `src/main/views/features/generalApplication/hearing-contact-details.njk` (modified) | Local defensive instance naming for the page's single contact component. This caller replaces the parent's content block; it does not also render the parent sidebar. No duplicate-ID defect was established here. |
| `src/main/views/features/generalApplication/response/respondent-want-to-upload-documents.njk` (modified) | Selected fork form-component hunks adapted to existing PR8 fields, content, errors, conditional answers and submission controls; unrelated defaults excluded. |
| `src/main/views/features/generalApplication/want-to-upload-documents.njk` (modified) | Selected fork form-component hunks adapted to existing PR8 fields, content, errors, conditional answers and submission controls; unrelated defaults excluded. |
| `src/main/views/features/mediation/company-telephone-number.njk` (modified) | Adapt radio heading ownership when a contact exists; preserve legitimate multi-control fieldset through official caller block when no contact exists. |
| `src/main/views/features/mediation/uploadDocuments/cancel-your-upload.njk` (modified) | Selected fork form-component hunks adapted to existing PR8 fields, content, errors, conditional answers and submission controls; unrelated defaults excluded. |
| `src/main/views/features/public/eligibility/claim-type.njk` (modified) | Selected fork form-component hunks adapted to existing PR8 fields, content, errors, conditional answers and submission controls; unrelated defaults excluded. |
| `src/main/views/features/queryManagement/qm-questions-template.njk` (modified) | Selected fork form-component hunks adapted to existing PR8 fields, content, errors, conditional answers and submission controls; unrelated defaults excluded. |
| `src/main/views/features/queryManagement/qm-view-queries-template.njk` (modified) | Official table with all six ordered columns, escaped subjects and exact query destinations. |
| `src/main/views/features/queryManagement/qm-view-query-details-template.njk` (modified) | Use extracted card; retain thread order, hearing data, closed/reviewing/follow-up conditions and destinations. |
| `src/main/views/features/response/admission/how-much-have-you-paid.njk` (modified) | Adapt date-error composition and bounded model-error summary links to existing day inputs; preserve interpolation, fields, values and validation; retain monetary defaults. |
| `src/main/views/features/response/admission/partialAdmission/how-much-do-you-owe.njk` (modified) | Selected fork form-component hunks adapted to existing PR8 fields, content, errors, conditional answers and submission controls; unrelated defaults excluded. |
| `src/main/views/features/response/admission/payment-option.njk` (modified) | Selected fork form-component hunks adapted to existing PR8 fields, content, errors, conditional answers and submission controls; unrelated defaults excluded. |
| `src/main/views/features/response/bilingual-language-preference.njk` (modified) | Selected fork form-component hunks adapted to existing PR8 fields, content, errors, conditional answers and submission controls; unrelated defaults excluded. |
| `src/main/views/features/response/citizenResponseType/citizen-response-type.njk` (modified) | Own radio legend through official macro; hidden legend avoids duplicate visible question; describedBy preserves details plus generated error association. |
| `src/main/views/features/response/eligibility/send-your-response-by-email.njk` (modified) | Selected fork form-component hunks adapted to existing PR8 fields, content, errors, conditional answers and submission controls; unrelated defaults excluded. |
| `src/main/views/features/response/repaymentPlan/repaymentPlan.njk` (modified) | Adapt date-error composition and bounded model-error summary links to existing day inputs; preserve interpolation, fields, values and validation; retain monetary defaults. |
| `src/main/views/features/response/responseDeadline/agreed-response-deadline.njk` (modified) | Adapt date-error composition and bounded model-error summary links to existing day inputs; preserve interpolation, fields, values and validation; retain monetary defaults. |
| `src/main/views/features/response/statementOfMeans/dependants/dependants.njk` (modified) | Official error-message markup only; preserve legitimate grouped controls and all numeric values. |
| `src/main/views/features/response/statementOfMeans/unemployment.njk` (modified) | Selected fork form-component hunks adapted to existing PR8 fields, content, errors, conditional answers and submission controls; unrelated defaults excluded. |
| `src/main/views/features/response/your-defence.njk` (modified) | Selected fork form-component hunks adapted to existing PR8 fields, content, errors, conditional answers and submission controls; unrelated defaults excluded. |
| `src/main/views/macro/amount-breakdown.njk` (modified) | Official table preserving pence conversion, interest/details, zero fixed costs, fees, totals and escaped reasons. |
| `src/main/views/macro/contact-us-for-help.njk` (modified) | Adapt open official Details; preserve default visibility/content; optional instance ID supports distinct IDs when multiple contact components are rendered. |
| `src/main/views/macro/create-table-documents.njk` (modified) | Pass display dates directly; omit only absent optional Created date hint; retain document rows, links and ordering. |
| `src/main/views/macro/header.njk` (modified) | Adapt official header composition; retain production GOV.UK destination, service/account/logout links; exclude preview hunks. |
| `src/main/views/macro/paper-form-address.njk` (modified) | Official inset composition with exact approved postal address and heading unchanged. |
| `src/main/views/macro/query-message-card.njk` (new) | Fork extraction using official summary cards; one-based message rules and escaped plain text; retain reviewed prepared attachment HTML. |
| `src/main/views/macro/timeline-summary.njk` (modified) | Official ordered table with escaped descriptions; retain time-line compatibility token on date cells (locked macro has no row-class API). No active functional consumer needs a locator change. |
| `src/test/unit/assets/js/calculate-length-repayment.test.ts` (new) | New real-template server/client schedule agreement across frequencies, division/invalid inputs, repeated/late initialisation and editing. |
| `src/test/unit/modules/nunjucks/presentationCaptures.test.ts` (new) | New non-vacuous header/capture contract, query value and association preservation checks. |
| `src/test/unit/modules/nunjucks/presentationDateErrors.test.ts` (new) | New real-model errors and actual locked GOV.UK error-summary activation for six date forms in both languages. |
| `src/test/unit/modules/nunjucks/presentationGovukFixtures.test.ts` (new) | New locked fixture parity for eight used components; nonempty discovery and significant text/attribute normalization guard. |
| `src/test/unit/modules/nunjucks/presentationSummaries.test.ts` (new) | New complete amount/judgment/timeline, document-date, escaping and contact-instance regressions. |
| `src/test/unit/modules/nunjucks/presentationTemplates.test.ts` (new) | New actual-template/full-shell and base-comparison regressions for headers, tabs, ordered data, query states, all changed forms and grouping/ARIA corrections. |
| `src/test/unit/routes/features/claimantResponse/ccj/repaymentPlanInstalmentsController.test.ts` (modified) | Retain existing route scenario; assert visible escaped date-error text and no nested wrapper instead of raw unescaped HTML substring. |
| `src/test/utils/mocks/a11y/mock-.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-bundle-overview.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-case-progression-apply-help-with-fees-reference-number.html` (modified) | production header macro; captured service/navigation values; official radio grouping; matching current HWF caller ownership; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-case-progression-apply-help-with-fees-start.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-case-progression-apply-help-with-fees.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-case-progression-cancel-document-upload.html` (modified) | production header macro; captured service/navigation values; official radio grouping; legend from actual caller translation; captured controls retained; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-case-progression-check-and-send.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-case-progression-comments-for-reconsideration-check-your-answers.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-case-progression-comments-for-reconsideration-confirmation.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-case-progression-comments-for-reconsideration.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-case-progression-documents-uploaded.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-case-progression-finalise-trial-arrangements-check-trial-arrangements.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-case-progression-finalise-trial-arrangements-confirmation.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-case-progression-finalise-trial-arrangements-has-anything-changed.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-case-progression-finalise-trial-arrangements-hearing-duration-other-info.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-case-progression-finalise-trial-arrangements-is-case-ready.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-case-progression-finalise-trial-arrangements.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-case-progression-pay-hearing-fee-apply-help-fee-selection.html` (modified) | production header macro; captured service/navigation values; official radio grouping; legend from actual caller translation; captured controls retained; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-case-progression-pay-hearing-fee-confirmation.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-case-progression-pay-hearing-fee.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-case-progression-payment-creation.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-case-progression-payment-successful.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-case-progression-payment-unsuccessful.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-case-progression-request-for-reconsideration-check-your-answers.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-case-progression-request-for-reconsideration-confirmation.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-case-progression-request-for-reconsideration.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-case-progression-type-of-documents.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-case-progression-upload-documents.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-case-progression-upload-your-documents.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-ccj-check-and-send.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-ccj-confirmation-ccj.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-ccj-date-of-birth.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-ccj-paid-amount-summary.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-ccj-paid-amount.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-ccj-pay-by-set-date.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-ccj-payment-options.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-ccj-repayment-plan-summary-CLAIMANT.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-ccj-repayment-plan-summary-DEFENDANT.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-ccj-repayment-plan.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-claimant-response-accept-payment-method.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-claimant-response-check-and-send.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-claimant-response-choose-how-to-proceed.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-claimant-response-confirmation.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-claimant-response-counter-offer-accepted.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-claimant-response-county-court-judgement-paid-amount-summary.html` (modified) | production header macro; captured service/navigation values; official table with all captured rows/cells; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-claimant-response-county-court-judgement-paid-amount.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-claimant-response-court-offered-instalments.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-claimant-response-court-offered-set-date.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-claimant-response-defendants-response.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-claimant-response-incomplete-submission.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-claimant-response-intention-to-proceed.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-claimant-response-part-payment-received.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-claimant-response-payment-date.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-claimant-response-payment-option.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-claimant-response-payment-plan.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-claimant-response-rejection-reason.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-claimant-response-settle-admitted.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-claimant-response-settle-claim.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-claimant-response-sign-settlement-agreement.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-claimant-response-task-list.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-claimant-response.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-directions-questionnaire-agreement-reached.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-directions-questionnaire-assign-complexity-band.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-directions-questionnaire-availability-dates.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-directions-questionnaire-cant-attend-hearing-in-next-12-months.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-directions-questionnaire-confirm-your-details.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-directions-questionnaire-consider-claimant-documents.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-directions-questionnaire-court-location.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-directions-questionnaire-determination-without-hearing.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-directions-questionnaire-disclosure-non-electronic-documents.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-directions-questionnaire-disclosure-of-documents.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-directions-questionnaire-disclosure-of-electronic-documents-issues.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-directions-questionnaire-documents-to-be-considered-details.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-directions-questionnaire-documents-to-be-considered.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-directions-questionnaire-expert-can-still-examine.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-directions-questionnaire-expert-details.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-directions-questionnaire-expert-evidence.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-directions-questionnaire-expert-examination.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-directions-questionnaire-expert-guidance.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-directions-questionnaire-expert-report-details.html` (modified) | production header macro; captured service/navigation values; official radio grouping; legend from actual caller translation; captured controls retained; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-directions-questionnaire-expert.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-directions-questionnaire-frc-band-agreed.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-directions-questionnaire-give-evidence-yourself.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-directions-questionnaire-other-witnesses.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-directions-questionnaire-permission-for-expert.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-directions-questionnaire-phone-or-video-hearing.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-directions-questionnaire-reason-for-complexity-band.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-directions-questionnaire-request-extra-4-weeks.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-directions-questionnaire-sent-expert-reports.html` (modified) | production header macro; captured service/navigation values; official radio grouping; legend from actual caller translation; captured controls retained; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-directions-questionnaire-shared-expert.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-directions-questionnaire-subject-to-frc.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-directions-questionnaire-support-required.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-directions-questionnaire-tried-to-settle.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-directions-questionnaire-unavailable-for-hearing.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-directions-questionnaire-vulnerability.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-directions-questionnaire-welsh-language.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-directions-questionnaire-why-not-subject-to-frc.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-evidence-upload-documents.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-general-application-1720536653906339-apply-help-additional-fee-selection.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-general-application-1720536653906339-apply-help-fee-selection.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-general-application-1720536653906339-apply-help-with-fees-reference-number.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-general-application-1720536653906339-apply-help-with-fees-start.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-general-application-1720536653906339-apply-help-with-fees.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-general-application-1720536653906339-pay-additional-fee.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-general-application-1720536653906339-pay-application-fee-confirmation.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-general-application-1720536653906339-payment-successful.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-general-application-1720536653906339-payment-unsuccessful.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-general-application-1720536653906339-provide-more-information.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-general-application-1720536653906339-respond-addln-info.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-general-application-1720536653906339-upload-additional-documents-check-and-send.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-general-application-1720536653906339-upload-additional-documents-submitted.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-general-application-1720536653906339-upload-additional-documents.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-general-application-1720536653906339-upload-documents-directions-order-check-and-send.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-general-application-1720536653906339-upload-documents-directions-order-confirmation.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-general-application-1720536653906339-upload-documents-directions-order.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-general-application-1720536653906339-upload-documents-for-addln-info-check-and-send.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-general-application-1720536653906339-upload-documents-for-addln-info-confirmation.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-general-application-1720536653906339-upload-documents-for-addln-info.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-general-application-1720536653906339-upload-written-representation-docs-check-and-send.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-general-application-1720536653906339-upload-written-representation-docs-submitted.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-general-application-1720536653906339-upload-written-representation-docs.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-general-application-1720536653906339-view-application.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-general-application-add-another-application.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-general-application-agreement-from-other-party.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-general-application-application-costs.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-general-application-application-submitted.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-general-application-application-type.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-general-application-apply-help-fee-selection.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-general-application-check-and-send.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-general-application-claim-application-cost.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-general-application-cosc-ask-proof-of-debt-payment-guidance.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-general-application-cosc-final-payment-date.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-general-application-cosc-upload-documents.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-general-application-hearing-arrangement.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-general-application-hearing-arrangements-guidance.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-general-application-hearing-arrangements.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-general-application-hearing-contact-details.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-general-application-hearing-support.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-general-application-inform-other-parties.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-general-application-order-judge.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-general-application-paying-for-application.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-general-application-response-general-application-summary.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-general-application-submit-general-application-confirmation.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-general-application-summary.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-general-application-unavailability-confirmation.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-general-application-unavailable-dates.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-general-application-upload-documents.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-general-application-upload-n245-form.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-general-application-want-to-upload-documents.html` (modified) | production header macro; captured service/navigation values; official radio grouping; legend from actual caller translation; captured controls retained; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-judgment-online-confirm-you-have-been-paid-confirmation.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-judgment-online-confirm-you-have-been-paid.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-mediation-alternative-contact-person.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-mediation-alternative-email.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-mediation-alternative-phone.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-mediation-can-we-use-company.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-mediation-can-we-use.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-mediation-check-and-send.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-mediation-claimant-phone.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-mediation-confirmation.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-mediation-dates-confirmation.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-mediation-email-confirmation.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-mediation-free-telephone-mediation.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-mediation-i-dont-want-free-mediation.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-mediation-mediation-contact-person.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-mediation-mediation-disagreement.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-mediation-next-three-months.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-mediation-phone-confirmation.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-mediation-start-upload-documents.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-mediation-telephone-mediation.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-mediation-type-of-documents.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-mediation-unavailable-dates.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-mediation-upload-documents-cancel-document-upload.html` (modified) | production header macro; captured service/navigation values; official radio grouping; legend from actual caller translation; captured controls retained; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-mediation-upload-documents.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-mediation-view-mediation-settlement-agreement-document.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-notices-and-orders.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-paid-in-full-confirmation.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-paid-in-full-date-paid.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-payment-successful.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-qm-1-follow-up-message.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-qm-1-follow-up-query-cya.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-qm-confirmation.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-qm-create-query-cya.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-qm-create-query.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-qm-follow-up.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-qm-information-SEND_DOCUMENTS-ENFORCEMENT_REQUESTS.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-qm-share-query.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-qm-start.html` (modified) | production header macro; captured service/navigation values; official radio grouping; legend from actual caller translation; captured controls retained; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-qm-view-query-1-query-details.html` (modified) | production header macro; captured service/navigation values; query card macro; captured message/attachment data; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-qm-view-query.html` (modified) | production header macro; captured service/navigation values; official table with all captured rows/cells; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-qm-what-you-want-to-do-SEND_DOCUMENTS.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-response-agreed-to-more-time.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-response-availability-for-mediation.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-response-bilingual-language-preference.html` (modified) | production header macro; captured service/navigation values; official radio grouping; legend from actual caller translation; captured controls retained; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-response-check-and-send.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-response-claim-details.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-response-confirmation.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-response-eligibility-send-your-response-by-email.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-response-eligibility-under-18.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-response-evidence.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-response-full-admission-payment-date.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-response-full-admission-payment-option.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-response-full-admission-payment-plan.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-response-full-rejection-how-much-have-you-paid.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-response-full-rejection-why-do-you-disagree.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-response-full-rejection-you-have-paid-less.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-response-general-application-1720536653906339-accept-defendant-offer.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-response-general-application-1720536653906339-check-and-send.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-response-general-application-1720536653906339-confirmation.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-response-general-application-1720536653906339-hearing-arrangement.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-response-general-application-1720536653906339-hearing-contact-details.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-response-general-application-1720536653906339-hearing-preference.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-response-general-application-1720536653906339-hearing-support.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-response-general-application-1720536653906339-respondent-agreement.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-response-general-application-1720536653906339-respondent-information.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-response-general-application-1720536653906339-unavailability-confirmation.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-response-general-application-1720536653906339-unavailable-dates.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-response-general-application-1720536653906339-upload-documents.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-response-general-application-1720536653906339-view-application.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-response-general-application-1720536653906339-want-to-upload-document.html` (modified) | production header macro; captured service/navigation values; official radio grouping; legend from actual caller translation; captured controls retained; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-response-general-application-summary.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-response-incomplete-submission.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-response-new-response-deadline.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-response-partial-admission-already-paid.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-response-partial-admission-how-much-do-you-owe.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-response-partial-admission-how-much-have-you-paid.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-response-partial-admission-payment-date.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-response-partial-admission-payment-plan.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-response-partial-admission-why-do-you-disagree.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-response-reject-all-of-claim.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-response-request-more-time.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-response-response-deadline-options.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-response-response-type.html` (modified) | production header macro; captured service/navigation values; official radio grouping; legend from actual caller translation; captured controls retained; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-response-statement-of-means-bank-accounts.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-response-statement-of-means-carer.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-response-statement-of-means-court-orders.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-response-statement-of-means-debts.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-response-statement-of-means-dependants-children-disability.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-response-statement-of-means-dependants-education.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-response-statement-of-means-dependants.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-response-statement-of-means-disability.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-response-statement-of-means-employment-employers.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-response-statement-of-means-employment-self-employment-on-tax-payments.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-response-statement-of-means-employment-self-employment.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-response-statement-of-means-employment.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-response-statement-of-means-explanation.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-response-statement-of-means-intro.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-response-statement-of-means-monthly-expenses.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-response-statement-of-means-monthly-income.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-response-statement-of-means-other-dependants.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-response-statement-of-means-partner-partner-age.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-response-statement-of-means-partner-partner-disability.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-response-statement-of-means-partner-partner-pension.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-response-statement-of-means-partner-partner-severe-disability.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-response-statement-of-means-partner-partner.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-response-statement-of-means-priority-debts.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-response-statement-of-means-residence.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-response-statement-of-means-severe-disability.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-response-statement-of-means-unemployment.html` (modified) | production header macro; captured service/navigation values; official radio grouping; legend from actual caller translation; captured controls retained; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-response-statement-of-means.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-response-task-list.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-response-timeline.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-response-understanding-your-options.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-response-your-defence.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-response-your-dob.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-response-your-phone.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-settlement-agreement-confirmation.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-settlement-agreement-sign-settlement-agreement.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-submit-application-offline.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-view-documents-2.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-view-orders-and-notices.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-view-the-hearing.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-view-the-judgment.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-claim-1645882162449409-confirmation.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-claim-1645882162449409-fee-change.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-claim-1645882162449409-fee.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-claim-amount.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-claim-bilingual-language-preference.html` (modified) | production header macro; captured service/navigation values; official radio grouping; legend from actual caller translation; captured controls retained; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-claim-claimant-company-details.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-claim-claimant-dob.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-claim-claimant-individual-details.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-claim-claimant-organisation-details.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-claim-claimant-party-type-selection.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-claim-claimant-phone.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-claim-claimant-sole-trader-details.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-claim-completing-claim.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-claim-defendant-company-details.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-claim-defendant-email.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-claim-defendant-individual-details.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-claim-defendant-organisation-details.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-claim-defendant-party-type-selection.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-claim-defendant-sole-trader-details.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-claim-delayed-flight.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-claim-evidence.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-claim-flight-details.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-claim-help-with-fees-reference.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-claim-help-with-fees.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-claim-incomplete-submission.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-claim-interest-continue-claiming.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-claim-interest-date.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-claim-interest-end-date.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-claim-interest-how-much.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-claim-interest-rate.html` (modified) | production header macro; captured service/navigation values; official radio grouping; legend from actual caller translation; captured controls retained; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-claim-interest-start-date.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-claim-interest-type.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-claim-interest.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-claim-reason.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-claim-resolving-this-dispute.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-claim-task-list.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-claim-timeline.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-claim-total.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-claim.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-dashboard-1645882162449409-breathing-space-info.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-dashboard-1645882162449409-claimant.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-dashboard-1645882162449409-defendant#4.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-dashboard-1645882162449409-defendant#documents.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-eligibility-claim-type.html` (modified) | official radio grouping; legend from actual caller translation; captured controls retained; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-eligibility-claimant-address.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-first-contact.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-home.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-notification.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-total-income-expense-calculation.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/mocks/a11y/mock-upload-file.html` (modified) | production header macro; captured service/navigation values; original data/form contracts and outside DOM preserved. |
| `src/test/utils/renderPresentationPages.ts` (new) | New test helper: real production Nunjucks registration/full shells and locked components; actual form/nested models, translations and controller contexts; no application startup. |

<details>
<summary>Exact authorized archive downloads (108)</summary>

These were the only external requests. Registry redirects were rejected; Yarn’s locked checksums were retained and enforced. All tarballs/cache output were disposable.

| Exact archive URL | Bytes |
| --- | --- |
| `https://registry.yarnpkg.com/@babel/parser/-/parser-7.29.9.tgz` | 439123 |
| `https://registry.yarnpkg.com/@codeceptjs/configure/-/configure-1.0.6.tgz` | 5112 |
| `https://registry.yarnpkg.com/@codeceptjs/detox-helper/-/detox-helper-1.1.14.tgz` | 10906 |
| `https://registry.yarnpkg.com/@colors/colors/-/colors-1.6.1.tgz` | 11773 |
| `https://registry.yarnpkg.com/@cucumber/cucumber-expressions/-/cucumber-expressions-19.0.1.tgz` | 95302 |
| `https://registry.yarnpkg.com/@cucumber/gherkin/-/gherkin-39.0.0.tgz` | 92734 |
| `https://registry.yarnpkg.com/@dabh/diagnostics/-/diagnostics-2.0.9.tgz` | 10584 |
| `https://registry.yarnpkg.com/@dr.pogodin/csurf/-/csurf-1.18.1.tgz` | 17933 |
| `https://registry.yarnpkg.com/@flatten-js/interval-tree/-/interval-tree-1.1.4.tgz` | 23665 |
| `https://registry.yarnpkg.com/@isaacs/ttlcache/-/ttlcache-1.4.1.tgz` | 8167 |
| `https://registry.yarnpkg.com/@jest/create-cache-key-function/-/create-cache-key-function-29.7.0.tgz` | 2933 |
| `https://registry.yarnpkg.com/@react-native/assets-registry/-/assets-registry-0.81.6.tgz` | 2223 |
| `https://registry.yarnpkg.com/@react-native/codegen/-/codegen-0.81.6.tgz` | 180094 |
| `https://registry.yarnpkg.com/@react-native/community-cli-plugin/-/community-cli-plugin-0.81.6.tgz` | 17720 |
| `https://registry.yarnpkg.com/@react-native/debugger-frontend/-/debugger-frontend-0.81.6.tgz` | 4516144 |
| `https://registry.yarnpkg.com/@react-native/dev-middleware/-/dev-middleware-0.81.6.tgz` | 31602 |
| `https://registry.yarnpkg.com/@react-native/gradle-plugin/-/gradle-plugin-0.81.6.tgz` | 99826 |
| `https://registry.yarnpkg.com/@react-native/js-polyfills/-/js-polyfills-0.81.6.tgz` | 8301 |
| `https://registry.yarnpkg.com/@react-native/normalize-colors/-/normalize-colors-0.81.6.tgz` | 4012 |
| `https://registry.yarnpkg.com/@react-native/virtualized-lists/-/virtualized-lists-0.81.6.tgz` | 49324 |
| `https://registry.yarnpkg.com/@wix-pilot/core/-/core-3.4.2.tgz` | 45788 |
| `https://registry.yarnpkg.com/@wix-pilot/detox/-/detox-1.0.13.tgz` | 10382 |
| `https://registry.yarnpkg.com/@xmldom/xmldom/-/xmldom-0.9.12.tgz` | 109708 |
| `https://registry.yarnpkg.com/anser/-/anser-1.4.10.tgz` | 10267 |
| `https://registry.yarnpkg.com/babel-plugin-syntax-hermes-parser/-/babel-plugin-syntax-hermes-parser-0.29.1.tgz` | 3011 |
| `https://registry.yarnpkg.com/bunyamin/-/bunyamin-1.6.3.tgz` | 89838 |
| `https://registry.yarnpkg.com/bunyan-debug-stream/-/bunyan-debug-stream-3.1.1.tgz` | 17969 |
| `https://registry.yarnpkg.com/bunyan/-/bunyan-2.0.5.tgz` | 60208 |
| `https://registry.yarnpkg.com/caf/-/caf-15.0.1.tgz` | 36025 |
| `https://registry.yarnpkg.com/chromium-edge-launcher/-/chromium-edge-launcher-0.2.0.tgz` | 33251 |
| `https://registry.yarnpkg.com/class-validator/-/class-validator-0.15.1.tgz` | 915522 |
| `https://registry.yarnpkg.com/codeceptjs/-/codeceptjs-3.7.9.tgz` | 515226 |
| `https://registry.yarnpkg.com/color-name/-/color-name-2.1.1.tgz` | 2846 |
| `https://registry.yarnpkg.com/cookie/-/cookie-2.0.1.tgz` | 13277 |
| `https://registry.yarnpkg.com/deepmerge-ts/-/deepmerge-ts-8.0.2.tgz` | 41695 |
| `https://registry.yarnpkg.com/detox/-/detox-20.42.0.tgz` | 13825437 |
| `https://registry.yarnpkg.com/easy-stack/-/easy-stack-1.0.1.tgz` | 4482 |
| `https://registry.yarnpkg.com/enhanced-resolve/-/enhanced-resolve-5.26.0.tgz` | 124037 |
| `https://registry.yarnpkg.com/error-stack-parser/-/error-stack-parser-2.1.4.tgz` | 9214 |
| `https://registry.yarnpkg.com/event-pubsub/-/event-pubsub-4.3.0.tgz` | 5401 |
| `https://registry.yarnpkg.com/exeunt/-/exeunt-1.1.0.tgz` | 7247 |
| `https://registry.yarnpkg.com/flow-enums-runtime/-/flow-enums-runtime-0.0.6.tgz` | 3705 |
| `https://registry.yarnpkg.com/fs-extra/-/fs-extra-11.4.1.tgz` | 16504 |
| `https://registry.yarnpkg.com/govuk-frontend/-/govuk-frontend-6.5.1.tgz` | 1151196 |
| `https://registry.yarnpkg.com/handlebars/-/handlebars-4.7.10.tgz` | 712317 |
| `https://registry.yarnpkg.com/hermes-estree/-/hermes-estree-0.29.1.tgz` | 54695 |
| `https://registry.yarnpkg.com/hermes-estree/-/hermes-estree-0.35.0.tgz` | 57228 |
| `https://registry.yarnpkg.com/hermes-parser/-/hermes-parser-0.29.1.tgz` | 402341 |
| `https://registry.yarnpkg.com/hermes-parser/-/hermes-parser-0.35.0.tgz` | 441373 |
| `https://registry.yarnpkg.com/i18next-fs-backend/-/i18next-fs-backend-2.6.8.tgz` | 142895 |
| `https://registry.yarnpkg.com/i18next-http-middleware/-/i18next-http-middleware-3.9.9.tgz` | 26187 |
| `https://registry.yarnpkg.com/immutable/-/immutable-5.1.9.tgz` | 148909 |
| `https://registry.yarnpkg.com/jest-environment-emit/-/jest-environment-emit-1.2.0.tgz` | 26751 |
| `https://registry.yarnpkg.com/js-message/-/js-message-1.0.7.tgz` | 3211 |
| `https://registry.yarnpkg.com/js-queue/-/js-queue-2.0.2.tgz` | 4230 |
| `https://registry.yarnpkg.com/jsc-safe-url/-/jsc-safe-url-0.2.4.tgz` | 2771 |
| `https://registry.yarnpkg.com/json-cycle/-/json-cycle-1.5.0.tgz` | 4296 |
| `https://registry.yarnpkg.com/lodash.throttle/-/lodash.throttle-4.1.1.tgz` | 5554 |
| `https://registry.yarnpkg.com/memoize-one/-/memoize-one-5.2.1.tgz` | 7122 |
| `https://registry.yarnpkg.com/metro-babel-transformer/-/metro-babel-transformer-0.83.8.tgz` | 3618 |
| `https://registry.yarnpkg.com/metro-cache-key/-/metro-cache-key-0.83.8.tgz` | 1215 |
| `https://registry.yarnpkg.com/metro-cache/-/metro-cache-0.83.8.tgz` | 10478 |
| `https://registry.yarnpkg.com/metro-config/-/metro-config-0.83.8.tgz` | 22577 |
| `https://registry.yarnpkg.com/metro-core/-/metro-core-0.83.8.tgz` | 8784 |
| `https://registry.yarnpkg.com/metro-file-map/-/metro-file-map-0.83.8.tgz` | 115554 |
| `https://registry.yarnpkg.com/metro-minify-terser/-/metro-minify-terser-0.83.8.tgz` | 1893 |
| `https://registry.yarnpkg.com/metro-resolver/-/metro-resolver-0.83.8.tgz` | 31686 |
| `https://registry.yarnpkg.com/metro-runtime/-/metro-runtime-0.83.8.tgz` | 21394 |
| `https://registry.yarnpkg.com/metro-source-map/-/metro-source-map-0.83.8.tgz` | 35965 |
| `https://registry.yarnpkg.com/metro-symbolicate/-/metro-symbolicate-0.83.8.tgz` | 30416 |
| `https://registry.yarnpkg.com/metro-transform-plugins/-/metro-transform-plugins-0.83.8.tgz` | 21816 |
| `https://registry.yarnpkg.com/metro-transform-worker/-/metro-transform-worker-0.83.8.tgz` | 10612 |
| `https://registry.yarnpkg.com/metro/-/metro-0.83.8.tgz` | 225777 |
| `https://registry.yarnpkg.com/mocha/-/mocha-11.7.5.tgz` | 532408 |
| `https://registry.yarnpkg.com/monocart-coverage-reports/-/monocart-coverage-reports-2.12.11.tgz` | 532487 |
| `https://registry.yarnpkg.com/multi-sort-stream/-/multi-sort-stream-1.0.4.tgz` | 2986 |
| `https://registry.yarnpkg.com/nan/-/nan-2.29.0.tgz` | 81426 |
| `https://registry.yarnpkg.com/nanoid/-/nanoid-3.3.19.tgz` | 5694 |
| `https://registry.yarnpkg.com/node-ipc/-/node-ipc-9.2.1.tgz` | 28328 |
| `https://registry.yarnpkg.com/nullthrows/-/nullthrows-1.1.1.tgz` | 1725 |
| `https://registry.yarnpkg.com/ob1/-/ob1-0.83.8.tgz` | 2283 |
| `https://registry.yarnpkg.com/open/-/open-7.4.2.tgz` | 12663 |
| `https://registry.yarnpkg.com/pngjs/-/pngjs-7.0.0.tgz` | 160939 |
| `https://registry.yarnpkg.com/postcss/-/postcss-8.5.28.tgz` | 52195 |
| `https://registry.yarnpkg.com/promise/-/promise-8.3.0.tgz` | 15021 |
| `https://registry.yarnpkg.com/promisify-child-process/-/promisify-child-process-4.1.2.tgz` | 6820 |
| `https://registry.yarnpkg.com/react-devtools-core/-/react-devtools-core-6.1.5.tgz` | 4015904 |
| `https://registry.yarnpkg.com/react-native/-/react-native-0.81.6.tgz` | 24768119 |
| `https://registry.yarnpkg.com/react-refresh/-/react-refresh-0.14.2.tgz` | 15124 |
| `https://registry.yarnpkg.com/sanitize-filename/-/sanitize-filename-1.6.4.tgz` | 6726 |
| `https://registry.yarnpkg.com/sass/-/sass-1.105.1.tgz` | 932694 |
| `https://registry.yarnpkg.com/scheduler/-/scheduler-0.26.0.tgz` | 10015 |
| `https://registry.yarnpkg.com/serialize-javascript/-/serialize-javascript-7.1.2.tgz` | 8893 |
| `https://registry.yarnpkg.com/shell-quote/-/shell-quote-1.11.0.tgz` | 9588 |
| `https://registry.yarnpkg.com/shelljs/-/shelljs-0.10.0.tgz` | 45667 |
| `https://registry.yarnpkg.com/stackframe/-/stackframe-1.3.4.tgz` | 6439 |
| `https://registry.yarnpkg.com/stream-chain/-/stream-chain-2.2.5.tgz` | 9889 |
| `https://registry.yarnpkg.com/stream-json/-/stream-json-1.9.1.tgz` | 16707 |
| `https://registry.yarnpkg.com/supertest/-/supertest-7.3.0.tgz` | 12725 |
| `https://registry.yarnpkg.com/tar-fs/-/tar-fs-3.1.3.tgz` | 5973 |
| `https://registry.yarnpkg.com/telnet-client/-/telnet-client-1.2.8.tgz` | 10984 |
| `https://registry.yarnpkg.com/throat/-/throat-5.0.0.tgz` | 3411 |
| `https://registry.yarnpkg.com/trace-event-lib/-/trace-event-lib-1.4.1.tgz` | 15233 |
| `https://registry.yarnpkg.com/ts-jest/-/ts-jest-29.4.14.tgz` | 77484 |
| `https://registry.yarnpkg.com/type-fest/-/type-fest-0.7.1.tgz` | 10110 |
| `https://registry.yarnpkg.com/undici/-/undici-7.30.0.tgz` | 401782 |
| `https://registry.yarnpkg.com/webpack/-/webpack-5.111.1.tgz` | 2422918 |
| `https://registry.yarnpkg.com/ws/-/ws-8.22.0.tgz` | 35094 |

</details>

<details>
<summary>Remaining changed fork test/support paths for separate assessment</summary>

These paths are an assessment inventory, not an instruction to import them wholesale or evidence of absent behaviour coverage.

- `src/test/a11y/a11y-scan.ts`
- `src/test/a11y/pa11y-options.ts`
- `src/test/unit/a11y/ignoredUrlsMocks.test.ts`
- `src/test/unit/app/auth/launchdarkly/launchDarklyClient.test.ts`
- `src/test/unit/app/client/civilServiceUrls.test.ts`
- `src/test/unit/app/client/common/civilServiceRequest.test.ts`
- `src/test/unit/app/client/common/error/callbackError.test.ts`
- `src/test/unit/app/client/gaServiceUrls.test.ts`
- `src/test/unit/app/client/pcq/generatePcqToken.test.ts`
- `src/test/unit/app/client/pcq/pcqParameters.test.ts`
- `src/test/unit/assets/js/append-row.test.ts`
- `src/test/unit/assets/js/calculate-amount.test.ts`
- `src/test/unit/assets/js/calculate-total-amount.test.ts`
- `src/test/unit/assets/js/conditionally-hide-add-button.test.ts`
- `src/test/unit/assets/js/cookies-controller.test.ts`
- `src/test/unit/assets/js/disable-submit.test.ts`
- `src/test/unit/assets/js/language-toggle.test.ts`
- `src/test/unit/assets/js/reindex-add-another-actions.test.ts`
- `src/test/unit/assets/js/remove-error-content.test.ts`
- `src/test/unit/assets/js/select-toggle.test.ts`
- `src/test/unit/common/form/models/EmailValidationWithMessage.test.ts`
- `src/test/unit/common/form/models/PhoneValidationWithMessage.test.ts`
- `src/test/unit/common/form/models/admission/fullAdmission/baseDate.test.ts`
- `src/test/unit/common/form/models/admission/partialAdmission/partialAdmissionRepaymentPlan.test.ts`
- `src/test/unit/common/form/models/citizenTelephoneNumber.test.ts`
- `src/test/unit/common/form/models/claim/claimant/citizenDate.test.ts`
- `src/test/unit/common/form/models/claim/claimant/dobDate.test.ts`
- `src/test/unit/common/form/models/genericYesNoCarmContactPersonConfirmation.test.ts`
- `src/test/unit/common/form/models/genericYesNoCarmEmailConfirmation.test.ts`
- `src/test/unit/common/form/models/genericYesNoKnownClaimAmount.test.ts`
- `src/test/unit/common/form/models/judmentOnline/confirmYouHaveBeenPaidForm.test.ts`
- `src/test/unit/common/form/models/repaymentPlan/baseRepaymentPlan.test.ts`
- `src/test/unit/common/form/models/simpleFormModelsCoverage.test.ts`
- `src/test/unit/common/form/models/statementOfMeans/debts/debtItems.test.ts`
- `src/test/unit/common/form/models/statementOfMeans/dependants/numberOfChildren.test.ts`
- `src/test/unit/common/form/models/statementOfMeans/expensesAndIncome/transactionSource.test.ts`
- `src/test/unit/common/form/models/statementOfMeans/priorityDebts.test.ts`
- `src/test/unit/common/form/validators/emailValidator.test.ts`
- `src/test/unit/common/form/validators/optionalDateFourDigitValidator.test.ts`
- `src/test/unit/common/form/validators/optionalDateInPastValidator.test.ts`
- `src/test/unit/common/form/validators/optionalDateNotInFutureValidator.test.ts`
- `src/test/unit/common/form/validators/optionalDateNotInPastValidator.test.ts`
- `src/test/unit/common/form/validators/optionalIntegerValidator.test.ts`
- `src/test/unit/common/form/validators/phoneUKValidator.test.ts`
- `src/test/unit/common/form/validators/validationConstraints.test.ts`
- `src/test/unit/common/models/Email.test.ts`
- `src/test/unit/common/models/caseProgression/bundles/bundle.test.ts`
- `src/test/unit/common/models/caseProgression/uploadDocumentsUserForm.test.ts`
- `src/test/unit/common/models/ccdResponse/ccdFixedCosts.test.ts`
- `src/test/unit/common/models/dashboard/dashboard.test.ts`
- `src/test/unit/common/models/dashboard/taskList/civilServiceDashboardTask.test.ts`
- `src/test/unit/common/models/directionsQuestionnaire/experts/expertReportDetails/expertReportDetails.test.ts`
- `src/test/unit/common/models/directionsQuestionnaire/experts/expertReportDetails/reportDetail.test.ts`
- `src/test/unit/common/models/directionsQuestionnaire/witnesses/otherWitnessItems.test.ts`
- `src/test/unit/common/models/feePayment/paymentInformation.test.ts`
- `src/test/unit/common/models/generalApplication/CourtResponseSummary.test.ts`
- `src/test/unit/common/models/generalApplication/hearingSupport.test.ts`
- `src/test/unit/common/models/generalApplication/response/gaResponse.test.ts`
- `src/test/unit/common/models/generalApplication/uploadGAFiles.test.ts`
- `src/test/unit/common/models/generalApplication/uploadN245GAFiles.test.ts`
- `src/test/unit/common/models/mediation/unavailableDatesMediation.test.ts`
- `src/test/unit/common/models/summaryList/summarySections.test.ts`
- `src/test/unit/common/utils/calculateMonthlyIncomeExpenses/amountSchedule.test.ts`
- `src/test/unit/common/utils/checkYourAnswer/changeButton.test.ts`
- `src/test/unit/common/utils/cryptoAes.test.ts`
- `src/test/unit/common/utils/taskList/respondToClaimSectionBuilder.test.ts`
- `src/test/unit/common/utils/taskList/tasks/checkAndSubmitYourResponse.test.ts`
- `src/test/unit/common/utils/taskList/tasks/chooseAResponse.test.ts`
- `src/test/unit/common/utils/taskList/tasks/decideHowYouPay.test.ts`
- `src/test/unit/common/utils/taskList/tasks/shareFinancialDetails.test.ts`
- `src/test/unit/common/utils/taskList/tasks/viewOptionsBeforeDeadline.test.ts`
- `src/test/unit/development.test.ts`
- `src/test/unit/govukFrontend/govukFrontendFixtures.test.ts`
- `src/test/unit/govukFrontend/govukFrontendFixturesHelper.test.ts`
- `src/test/unit/jest.config.coverage.test.ts`
- `src/test/unit/modules/cookie/cookieConfig.test.ts`
- `src/test/unit/modules/csrf/index.test.ts`
- `src/test/unit/modules/draft-store/draftClaimCache.test.ts`
- `src/test/unit/modules/e2eConfiguration/index.test.ts`
- `src/test/unit/modules/health/health-migration-flag-off.test.ts`
- `src/test/unit/modules/helmet/helmet.test.ts`
- `src/test/unit/modules/i18n/languageService.test.ts`
- `src/test/unit/modules/properties-volume/propertiesVolume.test.ts`
- `src/test/unit/routes/features/claimantResponse/courtProposedDateController.test.ts`
- `src/test/unit/routes/features/public/eligibility/youCanUseServiceController.test.ts`
- `src/test/unit/routes/features/uiPreview/uiPreviewController.test.ts`
- `src/test/unit/routes/guards/GaTrackHistory.test.ts`
- `src/test/unit/routes/guards/partAdmitGuard.test.ts`
- `src/test/unit/routes/guards/redisDataFlushForDJGuard.test.ts`
- `src/test/unit/routes/homeController.test.ts`
- `src/test/unit/routes/unauthorisedController.test.ts`
- `src/test/unit/services/features/caseProgression/disclosureContentBuilder.test.ts`
- `src/test/unit/services/features/caseProgression/documentTableBuilder.test.ts`
- `src/test/unit/services/features/caseProgression/expertContentBuilder.test.ts`
- `src/test/unit/services/features/caseProgression/hearingFee/applyHelpFeeReferenceContents.test.ts`
- `src/test/unit/services/features/caseProgression/hearingFee/applyHelpFeeSelectionButtonContents.test.ts`
- `src/test/unit/services/features/caseProgression/hearingFee/applyHelpFeeSelectionContents.test.ts`
- `src/test/unit/services/features/caseProgression/hearingFee/paymentServiceUtils.test.ts`
- `src/test/unit/services/features/caseProgression/requestForReconsideration/requestForReviewCommentsContent.test.ts`
- `src/test/unit/services/features/caseProgression/requestForReconsideration/requestForReviewContent.test.ts`
- `src/test/unit/services/features/caseProgression/requestForReconsideration/requestForReviewService.test.ts`
- `src/test/unit/services/features/caseProgression/trialArrangements/finaliseYourTrialStartScreenContent.test.ts`
- `src/test/unit/services/features/caseProgression/trialArrangements/trialArrangementsConfirmationContent.test.ts`
- `src/test/unit/services/features/caseProgression/trialContentBuilder.test.ts`
- `src/test/unit/services/features/caseProgression/uploadYourDocumentsContents.test.ts`
- `src/test/unit/services/features/caseProgression/witnessContentBuilder.test.ts`
- `src/test/unit/services/features/claim/checkAnswers/claimSection/addEvidence.test.ts`
- `src/test/unit/services/features/claim/checkAnswers/claimSection/addTimeLine.test.ts`
- `src/test/unit/services/features/claim/partyTypeService.test.ts`
- `src/test/unit/services/features/claim/payment/claimFeePaymentConfirmationContent.test.ts`
- `src/test/unit/services/features/claim/payment/claimFeePaymentSuccessfulSectionBuilder.test.ts`
- `src/test/unit/services/features/claim/paymentSuccessfulSectionBuilder.test.ts`
- `src/test/unit/services/features/claimantResponse/checkAnswers/buildFreeTelephoneMediationSection.test.ts`
- `src/test/unit/services/features/claimantResponse/checkAnswers/hearing/addSupportRequiredListService.test.ts`
- `src/test/unit/services/features/claimantResponse/claimantResponseConfirmation/confirmationContentBuilder/ccjConfirmationBuilder.test.ts`
- `src/test/unit/services/features/claimantResponse/claimantResponseConfirmation/confirmationContentBuilder/claimSettleConfirmationBuilder.test.ts`
- `src/test/unit/services/features/claimantResponse/claimantResponseConfirmation/confirmationContentBuilder/confirmationContentBuilder.test.ts`
- `src/test/unit/services/features/claimantResponse/claimantResponseConfirmation/confirmationContentBuilder/disputeConfirmationContentBuilder.test.ts`
- `src/test/unit/services/features/claimantResponse/claimantResponseConfirmation/confirmationContentBuilder/financialDetailsBuilder.test.ts`
- `src/test/unit/services/features/claimantResponse/claimantResponseConfirmation/confirmationContentBuilder/mediationConfirmationContentBuilder.test.ts`
- `src/test/unit/services/features/claimantResponse/claimantResponseConfirmation/confirmationContentBuilder/partAdmitConfirmationContentBuilder.test.ts`
- `src/test/unit/services/features/claimantResponse/claimantResponseTasklistService/claimantResponseTasks/claimantHearingRequirementsSectionTasks.test.ts`
- `src/test/unit/services/features/claimantResponse/claimantResponseTasklistService/claimantResponseTasks/howDefendantRespondSectionTaks.test.ts`
- `src/test/unit/services/features/claimantResponse/defendantResponse/fullAdmissinionDefendantsResponseContent.test.ts`
- `src/test/unit/services/features/claimantResponse/defendantResponse/fullAdmissionPayInstallmentsDefendantResponseContent.test.ts`
- `src/test/unit/services/features/claimantResponse/defendantResponse/fullDisputeDefendantsResponseContent.test.ts`
- `src/test/unit/services/features/claimantResponse/defendantResponse/partAdmissionAlreadyPaidDefendantsResponseContent.test.ts`
- `src/test/unit/services/features/claimantResponse/defendantResponse/partAdmitNotPaidDefendantsResponseContent.test.ts`
- `src/test/unit/services/features/claimantResponse/signSettlmentAgreementService.test.ts`
- `src/test/unit/services/features/common/claimTimelineService.test.ts`
- `src/test/unit/services/features/dashboard/claimSummary/latestUpdate/latestUpdateContent/claimDismissedHearingDueDateUploadContent.test.ts`
- `src/test/unit/services/features/dashboard/claimSummary/latestUpdate/latestUpdateContent/evidenceUploadContent.test.ts`
- `src/test/unit/services/features/dashboard/claimSummary/latestUpdate/latestUpdateContent/newUploadContent.test.ts`
- `src/test/unit/services/features/eligibility/eligibleService.test.ts`
- `src/test/unit/services/features/generalApplication/applicationFeePaymentConfirmationContent.test.ts`
- `src/test/unit/services/features/generalApplication/checkAnswers/addCheckAnswersRows.test.ts`
- `src/test/unit/services/features/generalApplication/submitGeneralApplicationConfirmationContent.test.ts`
- `src/test/unit/services/features/mediation/uploadDocuments/buildYourStatementSummaryRows.test.ts`
- `src/test/unit/services/features/mediation/uploadDocuments/documentsForDocumentsReferredService.test.ts`
- `src/test/unit/services/features/mediation/uploadDocuments/mediationCancelUploadService.test.ts`
- `src/test/unit/services/features/mediation/uploadDocuments/yourStatementService.test.ts`
- `src/test/unit/services/features/queryManagement/viewQueriesService.test.ts`
- `src/test/unit/services/features/response/checkAnswers/caseProgression/requestForReconsideration/buildRequestForReconsiderationConfirmationSection.test.ts`
- `src/test/unit/services/features/response/checkAnswers/financialSection/buildYourFinancialSection.test.ts`
- `src/test/unit/services/features/response/statementOfMeans/employment/employerService.test.ts`
- `src/test/unit/services/features/response/statementOfMeans/employment/employmentConverter.test.ts`
- `src/test/unit/services/features/response/statementOfMeans/partner/cohabitingService.test.ts`
- `src/test/unit/services/features/response/statementOfMeans/partner/partnerAgeService.test.ts`
- `src/test/unit/services/features/response/statementOfMeans/partner/partnerDisabilityService.test.ts`
- `src/test/unit/services/features/response/statementOfMeans/partner/partnerPensionService.test.ts`
- `src/test/unit/services/features/response/statementOfMeans/partner/partnerSevereDisabilityService.test.ts`
- `src/test/unit/services/features/response/statementOfMeans/severeDisabilityService.test.ts`
- `src/test/unit/services/features/response/submitConfirmation/submitConfirmationBuilder/admissionSubmitConfirmationContent.test.ts`
- `src/test/unit/services/features/response/submitConfirmation/submitConfirmationBuilder/fullDefenceConfirmationContent.test.ts`
- `src/test/unit/services/features/response/submitConfirmation/submitConfirmationBuilder/mediationCarmContent.test.ts`
- `src/test/unit/services/features/response/submitConfirmation/submitConfirmationBuilder/partAdmissionConfirmationContent.test.ts`
- `src/test/unit/services/features/response/submitConfirmation/submitConfirmationBuilder/rejectClaimConfirmationContent.test.ts`
- `src/test/unit/services/features/response/submitConfirmation/submitConfirmationBuilder/submitConfirmationBuilder.test.ts`
- `src/test/unit/services/features/settlementAgreement/respondSettlementAgreementConfirmationContentService.test.ts`
- `src/test/unit/services/features/settlementAgreement/respondSettlementAgreementService.test.ts`
- `src/test/unit/services/features/settlementAgreement/settlementAgreementConfirmationBuilder/confirmationContentBuilder.test.ts`
- `src/test/unit/services/features/uiPreview/pageCatalog.test.ts`
- `src/test/unit/services/features/uiPreview/uiPreviewClaimantResponseFixtures.test.ts`
- `src/test/unit/services/features/uiPreview/uiPreviewSomFixtures.test.ts`
- `src/test/unit/services/firstcontact/firstcontactService.test.ts`
- `src/test/unit/services/genericForm/genericFormService.test.ts`
- `src/test/unit/services/translation/caseProgression/requestForReconsideration/convertToCCDRequestForReconsideration.test.ts`
- `src/test/unit/services/translation/claimantResponse/convertToCCDClaimantLiPResponse.test.ts`
- `src/test/unit/services/translation/claimantResponse/convertToCCDClaimantMediation.test.ts`
- `src/test/unit/services/translation/convertToCUI/convertToCUIFixedRecoverableCosts.test.ts`
- `src/test/unit/services/translation/convertToCUI/convertToCUIMediationCarm.test.ts`
- `src/test/unit/services/translation/convertToCUI/convertToCUIYesNo.test.ts`
- `src/test/unit/services/translation/response/convertToCCDFlightDetails.test.ts`
- `src/test/utils/govukFrontendFixturesHelper.ts`
- `src/test/utils/mocks/a11y/mock-case-1645882162449409-response-your-details.html`
- `src/test/utils/mocks/a11y/mock-dashboard.html`
- `src/test/utils/mocks/a11y/mock-make-claim.html`

</details>

## Review corrections — 19 October 2026

Six existing prospective paths were updated; the inventory remains 383 paths, with nothing staged:

- `claim-details-tpl-dashboard.njk`: restored the shared Dynatrace include from PR8/master, retaining `dt-user-id` for the existing consent-controlled identification and cookie flow. Breadcrumb changes remain.
- `renderPresentationPages.ts`: retained saved citizen-response data; separated stored-Claim defence GET from invalid-POST Defence; supplied the actual claimant name and saved reason/defence; used the production airline datalist builder and actual translations. No production response-selection or defence controller behaviour was changed.
- `presentationTemplates.test.ts`: added bilingual positive assertions for the signed-in shell, saved defence, saved response model, real airline control and invalid-POST contracts. The inherited unselected response radios are explicitly characterised rather than hidden by clearing the model.
- Query-details capture: replaced the empty `Your message ()` title with `Your message (23 June 2025)`, using the retained sent-on date. The current `Attachments` key is an intentional label update. Message data and the document URL are preserved.
- `presentationCaptures.test.ts`: compares the capture’s complete card title, keys, values and link against the current production macro using the retained captured data.
- This document: corrected the earlier controller-context and analytics-preservation claims and recorded the qualifications below.

Verification used a fresh disposable installation with Node 24.21.0, tracked Yarn 4.18.1 and unchanged locked dependencies. No installed checkout dependencies were reused. The copied caches lacked 108 exact locked archives: only the URLs and byte counts in the existing 108-entry appendix were downloaded again, from `registry.yarnpkg.com`, totalling 59,537,833 bytes. Redirects were rejected; a localhost server exposed only those archive paths; external Node/browser access remained blocked. All 108 generated cache ZIP SHA-512 values matched the unchanged lockfile. A subsequent fully offline `install --immutable --mode=skip-build` passed.

Fresh results:

- Negative controls: nine targeted regression cases failed against the pre-correction shell/helper/capture, as expected. Both suites failed and Jest exited 1; only the disposable copy was altered for that experiment.
- Focused verification: 12 suites / 285 tests were exercised serially with `--no-sparkplug --runInBand --detectOpenHandles --silent`, including all six PR9 suites, the repayment controller, the three affected form controllers and the existing Dynatrace partial/consent suites. The first run passed 281 tests and failed four assertions in the newly written tests. After the test corrections described below, the affected presentation suite passed all 54 tests; the other 11 suites had already passed. This is the combined result of those runs, not a claim of another full-coverage execution.
- Base/current tests set `PR9_BASE_VIEWS` to an exact PR8 source copy. The corrected saved values and airline control now participate in those comparisons.
- TypeScript `--noEmit --incremental false`, development build, production build and lint passed. Builds retain seven warnings; full lint retains zero errors / 454 warnings. Final changed-file ESLint passed without diagnostics.
- Six independent real-shell consent cases passed across English/Welsh: signed-in consent identifies the user and writes the correlation cookie; refusal and anonymous contexts do neither.
- Installed Chromium 133.0.6943.16 passed four actual airline error-link activations, English/Welsh with JavaScript enabled/disabled, using the real rendered page, built local assets and a disposable profile. External requests were blocked. These are focused local checks, not authenticated journeys or a renewed complete browser matrix.

Initial failures and reruns are retained: cache filename formats were normalised only after verifying copied ZIP bytes; an initial localhost install started before its archive server was ready and failed. Restarting the temporary server without hostname lookup resolved that environment issue. Building the deliberate pre-fix-helper/new-test combination also caught the absent `claimantName` field; the corrected candidate builds passed. A temporary consent probe initially used the wrong working directory for TypeScript configuration; running it in the disposable candidate resolved that harness error.

The four initial positive-run failures were two bilingual test assumptions, not application fixes: short defence reasons have no show-more checkbox ID, so the assertion now checks their actual content element; the production airline control has an ARIA label without a separate label, so GOV.UK leaves fragment navigation native. JSDOM cannot perform that native focus change. The unit assertion verifies that navigation is not cancelled, and the four real-browser activations above establish focus on the airline input.

The separate review also recorded an intermittent mediation POST 500 in an initial full-coverage run, followed by passing isolated/full reruns. Its cause remains unestablished. This follow-up does not claim to diagnose it or rerun full coverage, all routes, Pact, server contracts or the full accessibility matrix. Required hosted/integrated checks, applicable server contracts, operational evidence and separate QA remain outstanding.

Branch, HEAD, raw index, dependencies, excluded context and all original files outside these six paths are preserved. The disposable source/cache/download/build/report/profile files are removed at completion; no staging, commit, ref update, push or PR operation is performed.

## Subsequent review evidence and capture correction — 19 October 2026

This follow-up changes only this document, the query-start accessibility capture and its focused regression in `presentationCaptures.test.ts`. Production behaviour and the three GA contact IDs remain unchanged. The contact-ID descriptions above now distinguish defensive instance naming from a demonstrated duplicate-rendering defect.

The query-start capture's hidden legend now includes the retained caption as well as the title: `Contact or apply to the court What do you want to do?`. The regression compares the complete legend with the actual query template rendered using the production caption/title context, and positively asserts the expected text. Captured controls, selected answers and navigation are preserved.

The following failures were reported by earlier reviews; they are not new executions in this follow-up:

- One review's initial full-coverage run had a mediation POST return 500 instead of 302. Its isolated suite and subsequent full run passed. The cause remains unestablished.
- A later review's initial full-coverage run passed 918 suites / 8,412 tests and failed two assertions in `applicationTypeController.test.ts`: the same-type check-and-send path left `applicationTypeChangeInProgress` true, and the add-another resubmission retained `STAY_THE_CLAIM` instead of updating to `ADJOURN_HEARING`. The isolated 22-test suite passed against both exact PR8 and the candidate; a second full run passed 919 suites / 8,414 tests with four workers and ordinary exit zero. These failures also remain unexplained.

Passing reruns and unchanged filenames do not establish that either failure was harmless or inherited. Neither review established a production-code correction. Preserve this history for merge assessment and investigate request/draft-store state and outstanding asynchronous work if the failures recur. This follow-up does not diagnose them or claim a new full-coverage, route, browser or contract run.

Fresh verification for these three-file changes used Node 24.21.0 and Yarn 4.18.1 in a disposable source copy:

- `node .yarn/releases/yarn-4.18.1.cjs install --immutable --mode=skip-build` passed fully offline, with scripts/telemetry disabled and external Node connections blocked. The manifest and lockfile remained byte-identical.
- `node --no-sparkplug node_modules/jest/bin/jest.js --runInBand --detectOpenHandles --silent --runTestsByPath src/test/unit/modules/nunjucks/presentationCaptures.test.ts` passed one suite / three tests with ordinary exit zero. Before applying the corrected capture to the disposable copy, the new test failed on the missing caption as expected (one failure, two skipped, exit 1).
- TypeScript `--noEmit --incremental false`, ESLint for the changed test and the development build passed with exit zero. The build retained seven warnings; Jest retained its existing ts-jest/Node deprecation diagnostics. No `--forceExit` was used.
- A byte comparison established that only the intended legend text changed in the capture; all other captured markup and data remained identical.

The copied local cache again lacked the same 108 locked archives listed in the appendix. Only those exact `registry.yarnpkg.com` URLs were downloaded, totalling 59,537,833 bytes, with redirects rejected. All 108 generated cache ZIP SHA-512 values matched the unchanged lockfile. The initial localhost-only installation failed because the copy procedure omitted two available local Darwin/ARM64 platform archives (`@pact-foundation/pact-core-darwin-arm64` 16.1.1 and `@parcel/watcher-darwin-arm64` 2.6.0). Copying those exact existing archives resolved the failure; no additional download or invented checksum was needed. The subsequent installation and all checks ran offline. All disposable copies, archives, caches, generated assets and reports were removed at completion.

## Validation-fixture follow-up — 19 October 2026

This follow-up changes only `renderPresentationPages.ts`, `presentationTemplates.test.ts` and this document. It corrects test contexts, not production validation or wording. The prospective inventory remains 383 paths.

The invalid-state helper now supplies the actual POST messages for six callers: claim language, response language, expert-report details, applicant GA upload choice, respondent GA upload choice and hearing-fee help selection. Expert-report fixtures use a real `Claim` state and `isClaimantIntentionPending()` to exercise both controller branches. Hearing-fee fixtures translate the message before constructing `GenericYesNo`, as their controller does. Blank/saved fixture construction remains separate from these invalid-POST messages. The earlier claim-type correction also remains: invalid POST supplies `ERRORS.CLAIM_TYPE_REQUIRED`.

Fourteen new cases cover the six callers, including both expert-report branches, in English and Welsh. They positively assert the model error and complete rendered summary/inline wording in both exact PR8 and current templates (28 rendered comparisons). The respondent-upload Welsh resource currently contains English wording; the regression preserves that existing contract. These checks supplement the existing complete base/current form comparisons; they do not claim authenticated controller execution or correct the inherited saved-response/error-link issues.

Fresh verification used Node 24.21.0, tracked Yarn 4.18.1 and disposable candidate/base copies. All positive checks exited normally with status zero:

- Both copies passed fully offline `install --immutable --mode=skip-build`; manifest and lockfile stayed byte-identical.
- TypeScript `--noEmit --incremental false` and changed-file ESLint passed without diagnostics.
- Candidate and exact PR8 development builds passed, retaining seven warnings each.
- All six PR9 presentation/repayment suites and the six affected controller suites passed together: **12 suites / 278 tests**, serial execution with `--no-sparkplug --runInBand --detectOpenHandles --silent`. `PR9_BASE_VIEWS` pointed to the separately built exact PR8 copy. Existing ts-jest/Node deprecation diagnostics remain; no `--forceExit` was used.
- Negative control: substituting the pre-correction helper only in disposable storage made all 14 new cases fail with the generic fallback error, as expected (56 unrelated cases skipped; Jest exit 1). Restoring the corrected helper preceded the successful complete focused run.
- Final whitespace and original-file integrity checks passed. Only the three named paths changed; production code, captures, dependencies, fork and excluded context were preserved.

The focused test command was:

```sh
PR9_BASE_VIEWS=<exact-PR8-copy>/src/main/views LOG_LEVEL=OFF \
node --no-sparkplug node_modules/jest/bin/jest.js \
  --runInBand --detectOpenHandles --silent --runTestsByPath \
  src/test/unit/modules/nunjucks/presentationTemplates.test.ts \
  src/test/unit/modules/nunjucks/presentationSummaries.test.ts \
  src/test/unit/modules/nunjucks/presentationGovukFixtures.test.ts \
  src/test/unit/modules/nunjucks/presentationCaptures.test.ts \
  src/test/unit/modules/nunjucks/presentationDateErrors.test.ts \
  src/test/unit/assets/js/calculate-length-repayment.test.ts \
  src/test/unit/routes/features/claim/bilingualLangPreferenceController.test.ts \
  src/test/unit/routes/features/response/bilingualLangPreferenceController.test.ts \
  src/test/unit/routes/features/directionsQuestionnaire/experts/expertReportDetailsController.test.ts \
  src/test/unit/routes/features/claim/generalApplication/wantToUploadDocumentsController.test.ts \
  src/test/unit/routes/features/claim/generalApplication/response/respondentWantToUploadDocController.test.ts \
  src/test/unit/routes/features/caseProgression/hearingFee/applyHelpFeeSelectionController.test.ts
```

The first offline installation exited 1 because copied caches lacked the same 108 locked archives recorded in the appendix. Only those exact `registry.yarnpkg.com` URLs were downloaded again, totalling 59,537,833 bytes. Redirects were rejected and package identities checked. All 108 generated cache ZIP SHA-512 values matched the unchanged lockfile. The localhost-only archive installation and subsequent fully offline installations passed. Scripts, telemetry and external Node connections were blocked during installation/checks; localhost test listeners were permitted. No retained cache or checkout installation was modified.

This narrow follow-up did not rerun full coverage, the route-integration suite, production build, Pact, browser/accessibility matrices or server contracts. Earlier results remain attributed to their original runs. The focused results are implementation verification, not separate reviewer approval or whole-ticket acceptance. Disposable copies, archives, caches, assets and reports were removed at completion; no browser was launched, and no staging, commit or ref operation occurred.

## Latest full-coverage review evidence — 19 October 2026

This records the subsequent read-only review in this conversation; this documentation update does not rerun tests. The reviewing agent had authored the preceding fixture corrections, so its fresh checks do not constitute separate-author reviewer approval. The review established no further production-code correction.

Both full-coverage attempts used Node 24.21.0, Yarn 4.18.1, unchanged locked dependencies and four workers in disposable storage:

```sh
node --disable-warning=DEP0060 --no-sparkplug node_modules/jest/bin/jest.js --coverage --maxWorkers=4 --silent
```

| Attempt | Logging | Failure | Actual result |
| --- | --- | --- | --- |
| First | `LOG_LEVEL=OFF` | `src/test/unit/routes/features/claimantResponse/claimantSuggestedPaymentOptionController.test.ts:70`: invalid payment-option submission returned HTTP 500 instead of 200. | 918 suites passed, one failed; 8,430 tests passed, one failed; ordinary exit 1. |
| Diagnostic rerun | `LOG_LEVEL` unset | `src/test/unit/routes/features/dashboard/notificationRedirectController.test.ts:310`: expected one `documentIdExtractor` call, received nine. The redirect assertion passed. | 918 suites passed, one failed; 8,430 tests passed, one failed; ordinary exit 1. |

The payment-option suite passed its isolated candidate rerun (seven tests), and the notification suite passed its isolated candidate rerun (21 tests). Both suites also passed together against exact PR8 `d7114cb1308445400caa16c1db02ca8483bc2152` (two suites / 28 tests). These diagnostic runs were serial, retained `--no-sparkplug` and logging, and exited normally with status 0. The focused PR9/earlier-stage run also passed 12 suites / 842 tests, serially with exit 0.

The unchanged Jest setup uses `jest.retryTimes(2)`; it was not disabled or modified. No run used `--forceExit`. The full-run failure causes remain unestablished. Retry/mock state and outstanding asynchronous work are investigation candidates, not confirmed explanations. Neither unchanged filenames nor passing candidate/base isolated reruns establish that the failures are harmless or inherited.

Earlier successful full runs, including the separately reported 919-suite / 8,415-test review, remain historical evidence. They do not establish a clean full run on this expanded 919-suite / 8,431-test candidate. Production fingerprints support carrying forward relevant source evidence, but do not override the newer failed verification results.

PR9 remains ready for review. Merge readiness remains unresolved until these failures are investigated and successful current-candidate coverage and the applicable required checks/approvals are obtained. No speculative production fix or weakened test assertion is justified by this record. Existing WireMock, browser, authenticated-journey, operational and separate-QA qualifications remain in force.

## Final state confirmation

- Branch and HEAD remain `DTSCCI-6593-frontend-presentation` / `d7114cb1308445400caa16c1db02ca8483bc2152`; raw index fingerprint remains `217c85a2e45caa268f170b04e2a4d3d35902dc3025f8ca8f33a1650e4bf1df00`.
- All 383 intended paths are unstaged; no staging, commit, ref update, remote operation or PR creation.
- Package manifest, lockfile, Yarn settings/releases, runtime and all unrelated original source files retain their baseline contents. PR1–PR8 protections, pipeline and deployment files are unchanged.
- Source-fork HEAD/status and all 4022 captured source fingerprints remain unchanged.
- Excluded decision log SHA-256: `54b2cb74f1716d7150c79c58fb9b644a5ee1aae6078d21772d2970bcf43923d0` (unchanged/excluded).
- Excluded Yarn 3 SHA-256: `81bf69deb72c6cfebaca4389444e034c914cc1a90ea40e4ac55a5e2a1d7063d2` (unchanged/excluded).
- Temporary copies, downloaded archives, caches, generated assets, reports and browser profiles are removed at handover. The pre-existing reusable Node/browser/cache resources remain untouched.


## PR11 — final fork test reconciliation (21 October 2026)

**Scope update (22 October 2026):** PR11 now also contains the bounded final integration corrections described in the closing-batch addendum below. The original test-only implementation, inventories, exclusion statements and verification results remain historical. The 719-path ledger and its summary reflect the current dispositions. Dependencies, runtime, deployment and pipeline choices remain unchanged.

**Historical test-only added-case count (22 October 2026): 387.** Execution enumerates 381 cases in the 51 new suites and nine cases in the extended encryption suite, compared with three encryption cases at the recorded base. Earlier counts and run totals below remain historical.

This section is the PR11 adaptation and verification record. Earlier PR8–PR10 results and unresolved failure histories above remain historical evidence. This is a test/documentation change, not a new production feature or whole-ticket approval.

### Verified starting state and history

- Branch: `DTSCCI-6593-fork-tests-reconciliation`, already present. No switch, merge, ref update, staging or commit was needed.
- Exact PR10 base and unchanged HEAD: `5a6f4fb6b887b4ea4e1b85d01b4705310c6e9572`.
- Exact fork: `486994338cd584ac728dc0dedacbc31cc0b11406`, read from its own clean checkout; ancestor `00e10d5cf52fe14079e4983ff6277f14adf9e94b`.
- Local PR10 remote-tracking ref: `2b098e84cb7f9dcd23ac414f29140162876a5142`. The `0 behind / 48 ahead` count is local history: **HEAD's tree equals that ref's tree**. There is no 48-commit source delta to re-import or reset. No remote was queried.
- Local master `4ab9e3a2f92a18473c93c321f8da6d6097a19a5f` and PR2/PR4–PR10 branch tips are ancestors. Current PR1/integration and PR3 branch tips contain only merge/patch-equivalent history outside HEAD (`git log --cherry-pick --right-only --no-merges HEAD...<ref>` is empty). Their current tips must not be described as literal ancestors. Earlier implementation/protection tests are present and unchanged except the explicitly listed extensions.
- PR2's current audit correction from `c70e15e086` is retained. Jenkins/pipeline/audit/dependency files are unchanged by PR11.
- Starting status: only untracked `docs/pr10-ui-preview-review-notes.md`. It stays untouched and outside the implementation inventory. The excluded historical decision log and Yarn 3 binary also stay untouched and excluded.
- Raw index SHA-256: `875c037e4718362f57f63a213e7a945489d432e09e307c6b693c64b583faa912`. HEAD, refs and index remain unchanged; all changes are unstaged.

### Scope and test decisions

The ancestor-to-exact-fork inventory has **719 changed paths**, including **331 changed test suites**. At the PR10 base, those 331 comprise **27 byte-identical, 133 different and 171 absent paths**. Across every fork test suite, including inherited files, the count is 623 identical / 275 different / 172 absent; the additional absent inherited path is the misspelled `modules/ordance-survey-key/ordanceSurveyKeyService.test.ts`. The historical “88 unchanged” figure used a different earlier tree/comparison and is not reused as a current count. Missing filenames do not establish missing behaviours.

PR11 imports/adapts missing isolated validators, model validation, complete CCD translations, task availability/statuses, client callback handling, language/CSRF helpers, draft writes, query grouping and relevant service contracts. Six fork partner-service files are consolidated into one table-driven suite with exact keys and real read-versus-write failure cases. Existing suites are extended rather than overwritten where they protect master.

Deliberate local corrections include deterministic clocks, complete payload assertions, realistic typed upload fixtures, explicit application/fee pairing, cloned draft/default ownership, fixed-format ciphertext tampering and distinguishable CSRF invocation assertions. Fork tests that assert a fabricated object, constructor-only assignment, obsolete runtime/configuration, global accessibility ignores, removed implementations, first-linked-GA guessing or incompatible encryption are excluded. No production fallback is introduced to satisfy a test.

The ledger below assigns every fork-changed path. A file may contain both previously adapted and deliberately excluded hunks: “Adapted” points to the relevant existing stage/consumer record, not a claim that the entire fork file was copied or independently reapproved here. “Covered differently” names current behavioural owners and does not assert line-for-line coverage equivalence. Exclusions of fork HTTP-under-unit ports preserve the current test-pyramid contract; they do not certify every possible extra handler edge.

No source, template, stylesheet, dependency, runtime, fixture capture, pipeline or deployment change is made. Therefore browser/accessibility matrices are not repeated for this test-only delta; current actual-template, preview isolation and upload/repeated-row suites run in combined coverage/routes. Historical browser results remain attributed, and integrated accessibility/authenticated/QA gates remain open.

### Test-fixture failures exposed before retries

An execution-only subclass of the unchanged Node Jest environment captured `test_fn_failure`/`hook_failure` before the existing two retries. It adds logging only; no retry count, discovery, threshold or assertion was weakened. The existing three suites reproduced six initiating failures even in an otherwise green run:

| Suite | Initiating failures | Diagnosis and correction |
| --- | --- | --- |
| `routes/guards/responseSubmitDateGuard.test.ts` | “should call next if response submit date is set” | A single shared request retains CivilServiceClient's request-scoped promise from the no-date test. A shared `next` mock then makes the deferred retry pass after the later error test. The unchanged suite passes with the affected case invoked twice. Fresh request/response/next fixtures, a cloned response payload, strict next/redirect checks and consumed HTTP mocks remove the false positive. |
| `routes/features/dashboard/claimantDashboardController.test.ts` | Support links for case progression; hidden support links; error propagation; disabled-Welsh banner | New default mock implementations do not clear earlier `mockResolvedValueOnce` queues. Reset the claim/dashboard/flag mocks per scenario. The Welsh tests are outside the nested GET setup and also lacked a stable amount-helper result; set the existing synthetic amount default in the outer setup. Retain every expected link/status/banner assertion. |
| `routes/features/claim/generalApplication/response/respondentUploadEvidenceDocumentsController.test.ts` | POST upload failure expected 500, initially received 302 | The prior “saved file” fixture claimed PDF MIME but contained plain text, so content validation stopped before the upload mock. Its unused one-shot success result survived into the failure case. Use a valid synthetic PDF signature, reset per-case upload/store mocks, use real route IDs and assert that Save/error paths actually call the upload client exactly once with the expected file. |

The first combined correction run passed all 48 tests but still retried the Welsh case; adding the missing outer amount-helper default then passed **3 suites / 48 tests with every invocation count 1 and zero failure events**. No production request-cache, upload validation or dashboard behaviour was changed. This explains these specific deterministic fixture problems, not every historical PR9/PR10 failure. Earlier complexity/debts/mediation/application-type failure records remain preserved and are not retroactively called harmless.

A later full run, after those three corrections, failed the CARM-on phone interior-space case (expected 200, received 500) after three attempts. Other initiating failures were captured in that run before retries; they were not hidden or called harmless. The phone pair passed in an ordinary isolated run, so the initial full-run 500’s initiating cause remains unproven. A controlled reproduction left the suite’s intentional Redis-error fixture active before the phone cases: both then failed. Restoring a fresh valid draft store in each outer `beforeEach` made the same controlled pair pass, and the entire phone suite passed **20 tests with invocation count 1**. Existing intentional failure cases still override that baseline. This removes demonstrated test-order coupling without claiming to diagnose every cause of the earlier full-run failure.

The final combined run passed **973 suites / 8,916 tests**, with **zero captured initiating failures and zero retried test cases**. Route integration passed **24 suites / 270 tests**, also without retries. The final pass follows these bounded test-fixture corrections; it does not erase or explain other historical failures.

### Existing GA recovery finding — separately owned

A temporary direct-handler reproduction used the actual current standard confirmation controller, a real Claim with two linked applications, mocked storage/navigation and empty query parameters. It failed the safety assertion and rendered:

```text
/case/123/general-application/apply-help-fee-selection&appFee=NaN
```

`Number(req.query.appFee)` receives `undefined`, while no explicit application ID is supplied. The production controller/content-service bytes match the starting PR10 base. This is an existing missing-parameter recovery defect, not introduced by PR11. The reproduction calls the real handler without booting Express; it does not establish an authenticated end-to-end request result. It is documented instead of shipping an intentionally failing suite or pinning the bad URL as expected behaviour.

Owning follow-up: **GA confirmation identity-and-fee recovery**. Establish the application identity and matching fee or route to clear recovery; cover missing/blank/whitespace/literal undefined/null parameters and multiple linked applications. Do not select the first linked GA and independently borrow a draft fee. PR11's shipped tests protect the valid explicitly paired application/fee path, including a zero fee and unrelated linked/draft data. Owner acceptance of this recovery decision remains outstanding.

### Disposable installation and network record

Node **24.21.0**, tracked Yarn **4.18.1**, locked GOV.UK Frontend **6.5.1**. The retained package cache location from older runs was absent; the Berry archive cache was copied read-only into disposable storage. No checkout node_modules or writable retained-cache link was used.

The first offline attempts showed missing packages. An initial copy placed mirror-format filenames in a project cache; correcting the disposable mirror/project-cache layout identified the actual **116** missing locked archives. After explicit user authorization, only their exact `registry.yarnpkg.com` tarball URLs were downloaded, **59,569,065 bytes** total. Redirects and proxies were rejected; package name/version in each archive was checked. A localhost exact-path responder served them to tracked Yarn, which verified the unchanged lockfile's full cache checksums. The responder was then stopped and immutable installation repeated fully offline.

All installs used `install --immutable --mode=skip-build`, with scripts, telemetry and hardened metadata checking disabled; final execution used `YARN_ENABLE_NETWORK=0`, skip-browser-download flags and `PACT_DO_NOT_TRACK=1`. No install hook, metadata search, remote Git, Jira/GitHub, live audit, browser/runtime/image/Maven download or Pact publication occurred. Disabling hardened mode is not a hardened registry check or clean audit.

An independent copied Node socket/DNS guard permits localhost and blocks external connections. Initially preloading the *same module under test* populated its CommonJS cache before the preview tests replaced socket functions: nine preview-tool assertions failed, with no native external operation (the tests replace the final socket boundary). An explicit controlled comparison, using identical guard bytes, produced `connected=true` for the cached test module and `connected=false` with the expected blocking error for a separate preloader copy. Using the separate verification copy fixed this harness collision without changing the application or tests; all 38 preview-tool tests passed. The initial failed full result is retained below.

Before dependencies were available, locked-TypeScript syntax/transpilation and nine isolated source-contract groups with four negative controls passed; validator registration was stubbed in that limited check. Those are not presented as normal Jest/type-check results. Subsequent complete installation and normal checks supersede that limitation.

### Independently reproduced verification

| Check | Actual result |
| --- | --- |
| Offline immutable installation | Exit 0; 0.831 seconds; details below / command record. |
| TypeScript without emit/incremental | Exit 0; 6.953 seconds; details below / command record. |
| Lint | Exit 0; 14.056 seconds; details below / command record. |
| Development build | Exit 0; 11.978 seconds; details below / command record. |
| Production build | Exit 0; 12.373 seconds; details below / command record. |
| First 46 focused suites | Exit 0; 2.725 seconds; details below / command record. |
| Four final model suites | Exit 0; 1.045 seconds; details below / command record. |
| Three corrected fixture suites | Exit 0; 3.002 seconds; details below / command record. |
| Initial full coverage (preloader collision) | Exit 1; 175.656 seconds; details below / command record. |
| Corrected-harness full coverage (before fixture corrections) | Exit 0; 155.914 seconds; details below / command record. |
| After first fixture corrections — phone failure | Exit 1; 160.642 seconds; details below / command record. |
| Controlled prior-error phone fixture — before | Exit 1; 8.866 seconds; details below / command record. |
| Controlled prior-error phone fixture — after | Exit 0; 1.934 seconds; details below / command record. |
| Independent phone suite | Exit 0; 2.099 seconds; details below / command record. |
| Final full coverage | Exit 0; 157.798 seconds; details below / command record. |
| Route integration | Exit 0; 63.664 seconds; details below / command record. |
| Dependency pins/checksums | Exit 0; 0.04 seconds; details below / command record. |
| Functional baseline | Exit 0; 0.498 seconds; details below / command record. |
| Shared import consumers | Exit 0; 0.02 seconds; details below / command record. |
| Chart mappings | Exit 0; 0.032 seconds; details below / command record. |
| Preview mappings | Exit 0; 0.032 seconds; details below / command record. |
| Pact tooling | Exit 0; 4.056 seconds; details below / command record. |
| Pact consumers | Exit 0; 6.821 seconds; details below / command record. |
| Pact artifacts | Exit 0; 0.035 seconds; details below / command record. |

Initial full result: **972 suites passed / 1 failed; 8907 tests passed / 9 failed**. Retried cases: 15.
- claimant Dashboard Controller on GET Dashboard Support Links Test should show support links for claimant with caseRole: [CLAIMANT] and ccdState: CASE_PROGRESSION
- claimant Dashboard Controller on GET should show support links for claimant with links hidden
- claimant Dashboard Controller on GET should return status 500 when error thrown
- claimant Dashboard Controller should not show welsh party banner if Welsh feature disabled
- General Application - Respondent GA upload evidence documents  on POST should return http 500 when has error in the get method
- preview tooling boundaries checks resolution of localhost to 192.0.2.1 with custom=false
- preview tooling boundaries blocks direct connections before reaching the underlying socket
- preview tooling boundaries blocks connect connections before reaching the underlying socket
- preview tooling boundaries blocks createConnection connections before reaching the underlying socket
- preview tooling boundaries blocks positional connections before reaching the underlying socket
- preview tooling boundaries blocks http connections before reaching the underlying socket
- preview tooling boundaries blocks https connections before reaching the underlying socket
- preview tooling boundaries blocks unix-options connections before reaching the underlying socket
- preview tooling boundaries blocks unix-path connections before reaching the underlying socket
- Response Submit Date Guard should call next if response submit date is set

Corrected harness full result: **973 suites passed / 0 failed; 8916 tests passed / 0 failed**. Retried cases: 6.
- claimant Dashboard Controller on GET Dashboard Support Links Test should show support links for claimant with caseRole: [CLAIMANT] and ccdState: CASE_PROGRESSION
- claimant Dashboard Controller on GET should show support links for claimant with links hidden
- claimant Dashboard Controller on GET should return status 500 when error thrown
- claimant Dashboard Controller should not show welsh party banner if Welsh feature disabled
- General Application - Respondent GA upload evidence documents  on POST should return http 500 when has error in the get method
- Response Submit Date Guard should call next if response submit date is set

After first fixture corrections (phone failure) full result: **972 suites passed / 1 failed; 8915 tests passed / 1 failed**. Retried cases: 6.
- on POST File upload validation and error handling should reject non-PDF content spoofed as application/pdf
- General Application - Application costs on GET should return page with QM LIP on
- General Application - Respondent GA upload evidence documents  General Application - Respondent upload evidence docs to support application should return upload document page
- Partner Pension on POST should redirect page when "no" and defendant disabled = no
- Payment date on POST should redirect to claim task list page on valid payment date
- Citizen phone number on POST. CARM on should return error on input with interior spaces

Final combined candidate full result: **973 suites passed / 0 failed; 8916 tests passed / 0 failed**. Retried cases: 0.

Final focused coverage comprises **50 suites / 369 tests**, including three previously existing encrypted-session cases: **366 new test cases** are added. Forty-nine new suite files and five existing suite extensions/corrections make **54 test paths**; the two existing documentation updates bring PR11 to **56 changed paths**. Pact tooling passed **1 suite / 14 tests**, consumers passed **15 suites / 127 tests**, and artifact validation accepted **3 complete artifacts**. Dependency checks passed **61 production / 63 development declarations, 58 resolutions and 1,517 required checksums** (20 optional/platform omissions). Functional baseline and shared-import checks passed. Static mapping checks accepted **41 chart / 36 preview mappings**.

WireMock server-contract execution is blocked: the immutable `--mode=skip-build` installation does not contain the standalone JAR, and no cached state extension **0.10.1** was found. The inspected launcher would download the extension from Maven. The available real-checkout standalone JAR was not substituted for the locked disposable installation, and no Maven/Java/image download was requested. Static mapping validation and Pact consumers are separate evidence; neither is claimed as those server contracts.

The first functional-baseline attempt, before installation, failed because `codeceptjs/lib/codecept` was unavailable; the complete-install final check passed. Initial TypeScript/production-build failures caused by the invalid new FileUpload fixture are retained in the command record. No current check table entry is a placeholder.

Five negative controls deliberately broke integer rejection, encrypted-session authentication failure, hearing-reference guarding, application/fee identity and CSRF invocation. Each exited 1 through the intended new assertion; every affected source file was restored byte-for-byte before positive/full checks. These expected failures are not unexplained red runs.

Initial genuine implementation/test mistakes are retained: the new GA fixture incorrectly typed pence as a string, one new CoSC expectation used the wrong existing title order, whitespace from comment removal failed 25 lint checks, and a fork N245 fixture used nonexistent FileUpload.fileName. They were corrected to real current models/content/formatting. No production rule or check was relaxed. The final valid typed upload uses FileUpload.originalname/buffer/mimetype/size.

Warnings: unchanged ts-jest isolatedModules deprecation, DEP0060 where not explicitly suppressed, four existing Yarn peer-provider warnings, 454 lint warnings and seven Sass/deprecation Webpack warnings. No auto-fix or dependency/configuration change is used to hide them.

No browser or capture regeneration is performed for this test/documentation delta. No claim of live audit, hardened metadata verification, Docker-stack approval, WireMock server contracts, authenticated journeys, operational Redis/TTL/rate-limit/telemetry validation, hosted security approval or separate QA follows from these local results.

### Original implementation inventory (before review corrections)

| Path | Purpose / provenance |
| --- | --- |
| `src/test/unit/app/client/common/civilServiceRequest.test.ts` | Adapted fork coverage. Verify current session-auth headers, exact request results, callback/log ordering and original failure propagation. |
| `src/test/unit/app/client/common/error/callbackError.test.ts` | Adapted fork coverage. Combine callback/field errors, filter missing messages and preserve status/warnings and default failure messages. |
| `src/test/unit/common/form/models/EmailValidationWithMessage.test.ts` | Adapted exact-fork isolated unit coverage; production module unchanged. |
| `src/test/unit/common/form/models/PhoneValidationWithMessage.test.ts` | Adapted exact-fork isolated unit coverage; production module unchanged. |
| `src/test/unit/common/form/models/admission/fullAdmission/baseDate.test.ts` | Adapted exact-fork isolated unit coverage; production module unchanged. |
| `src/test/unit/common/form/models/admission/partialAdmission/partialAdmissionRepaymentPlan.test.ts` | Adapted fork coverage. Preserve inherited repayment fields and the current fixed-clock first-payment-date calculation. |
| `src/test/unit/common/form/models/citizenTelephoneNumber.test.ts` | Adapted fork coverage. Protect trimming, optional omission, invalid UK numbers and current party-mandatory validation. |
| `src/test/unit/common/form/models/claim/claimant/citizenDate.test.ts` | Adapted fork coverage. Use a fixed clock to cover valid past dates, invalid parts, future dates and the existing age boundary. |
| `src/test/unit/common/form/models/claim/claimant/dobDate.test.ts` | Adapted fork coverage. Cover optional missing dates, adult/under-18 validation and invalid day/month parts against a fixed clock. |
| `src/test/unit/common/form/models/genericYesNoCarmContactPersonConfirmation.test.ts` | Adapted fork coverage. Validate required contact confirmation with current default/custom message keys and saved answers. |
| `src/test/unit/common/form/models/genericYesNoCarmEmailConfirmation.test.ts` | Adapted fork coverage. Validate required email confirmation with current default/custom message keys and saved answers. |
| `src/test/unit/common/form/models/genericYesNoKnownClaimAmount.test.ts` | Adapted fork coverage. Validate known-amount answers and current default/custom required-message keys. |
| `src/test/unit/common/form/models/repaymentPlan/baseRepaymentPlan.test.ts` | Adapted exact-fork isolated unit coverage; production module unchanged. |
| `src/test/unit/common/form/models/statementOfMeans/debts/debtItems.test.ts` | Adapted fork coverage. Distinguish empty from partially populated debt rows and enforce current positive-currency requirements. |
| `src/test/unit/common/form/models/statementOfMeans/dependants/numberOfChildren.test.ts` | Adapted fork coverage. Convert blank/string age-band counts, total valid integers and reject negative/fractional counts. |
| `src/test/unit/common/form/models/statementOfMeans/expensesAndIncome/transactionSource.test.ts` | Adapted fork coverage. Protect scheduled amounts, income/expense validation and contextual amount/name/frequency error interpolation. |
| `src/test/unit/common/form/validators/emailValidator.test.ts` | Adapted fork coverage. Protect optional missing values, valid email/subdomains and length/domain/TLD rejection with current error keys. |
| `src/test/unit/common/form/validators/optionalDateFourDigitValidator.test.ts` | Adapted exact-fork isolated unit coverage; production module unchanged. |
| `src/test/unit/common/form/validators/optionalDateInPastValidator.test.ts` | Fork optional-date cases adapted to a fixed local clock and exact midnight/millisecond boundaries. |
| `src/test/unit/common/form/validators/optionalDateNotInFutureValidator.test.ts` | Fork optional-date cases adapted to a fixed local clock and exact midnight/millisecond boundaries. |
| `src/test/unit/common/form/validators/optionalDateNotInPastValidator.test.ts` | Fork optional-date cases adapted to a fixed local clock and exact midnight/millisecond boundaries. |
| `src/test/unit/common/form/validators/optionalIntegerValidator.test.ts` | Fork optional-integer cases extended with whitespace, exponent, sign and null boundaries. |
| `src/test/unit/common/form/validators/phoneUKValidator.test.ts` | Adapted fork coverage. Protect optional missing values, UK landline/mobile/international formats and invalid input/error keys. |
| `src/test/unit/common/models/generalApplication/uploadGAFiles.test.ts` | Adapted fork coverage. Protect master null/empty saved-document guards and additional-document type/file requirements. |
| `src/test/unit/common/models/generalApplication/uploadN245GAFiles.test.ts` | Adapted fork coverage. Protect the current saved-document guard using a real typed FileUpload fixture; reject absent/null/empty references. |
| `src/test/unit/common/models/mediation/unavailableDatesMediation.test.ts` | Adapted fork coverage. Use fixed dates to cover single/range from/until validation, missing parts and current CARM past/max-date messages. |
| `src/test/unit/common/utils/taskList/tasks/checkAndSubmitYourResponse.test.ts` | Adapted fork coverage. Protect the check-and-submit task description, route and incomplete status. |
| `src/test/unit/common/utils/taskList/tasks/chooseAResponse.test.ts` | Adapted fork coverage. Protect completion and routes when claim data or response type is absent/present. |
| `src/test/unit/common/utils/taskList/tasks/decideHowYouPay.test.ts` | Adapted fork coverage. Protect payment-option task completion, description and URL. |
| `src/test/unit/common/utils/taskList/tasks/shareFinancialDetails.test.ts` | Adapted fork coverage. Protect individual/company and complete/incomplete financial-detail task branches. |
| `src/test/unit/common/utils/taskList/tasks/viewOptionsBeforeDeadline.test.ts` | Adapted fork coverage. Protect current deadline-extension statuses and destinations before/after the deadline with a fixed clock. |
| `src/test/unit/modules/csrf/index.test.ts` | Adapted fork coverage. Distinguish protected-path csurf invocation from the existing eligibility/first-contact/testing-support exceptions and local token setup. |
| `src/test/unit/modules/draft-store/draftClaimCache.test.ts` | Fork draft-cache suite rewritten for current master: cloned defaults, complete write/TTL/owner payload and rejected writes; no obsolete CARM phone mutation. |
| `src/test/unit/modules/i18n/languageService.test.ts` | Adapted fork coverage. Protect query-over-cookie language precedence and default English selection without booting Express. |
| `src/test/unit/routes/features/claim/generalApplication/response/respondentUploadEvidenceDocumentsController.test.ts` | Local multipart test correction: valid synthetic PDF reaches the mocked upload client, exact calls asserted, one-shot mocks reset and real route IDs supplied; no route behaviour changed. |
| `src/test/unit/routes/features/dashboard/claimantDashboardController.test.ts` | Local test-isolation correction: reset retained one-shot claim and feature-flag results before each existing scenario; preserve every dashboard assertion. |
| `src/test/unit/routes/features/response/citizenPhoneDetails/citizenPhoneController.test.ts` | Local test-fixture independence: restore a fresh valid draft store per scenario/retry. Prior-error-state reproduction fails before and passes after; original initial full-run 500 cause is not claimed diagnosed. |
| `src/test/unit/routes/guards/responseSubmitDateGuard.test.ts` | Local diagnosed test-isolation correction: fresh request/cache and mock callbacks per test; strict redirects/next and consumed HTTP mocks. Original retry hid an invalid cached request and shared next spy. |
| `src/test/unit/services/features/caseProgression/hearingFee/paymentServiceUtils.test.ts` | Fork hearing-payment suite strengthened for master reference guard, exact claim/fee/owner arguments, pending/failed/error paths; no application boot. |
| `src/test/unit/services/features/generalApplication/submitGeneralApplicationConfirmationContent.test.ts` | Fork confirmation-content coverage adapted to explicit current application/fee pair; unsafe first-GA/draft-fee/NaN fallback tests excluded. |
| `src/test/unit/services/features/queryManagement/viewQueriesService.test.ts` | Adapted fork coverage. Protect complete parent/reply grouping, order, thread selection, court/sent/closed states and attachment names. |
| `src/test/unit/services/features/response/statementOfMeans/employment/employerService.test.ts` | Adapted fork coverage. Read saved/absent employers, filter empty rows, preserve exact draft writes and propagate storage failures. |
| `src/test/unit/services/features/response/statementOfMeans/employment/employmentConverter.test.ts` | Adapted fork coverage. Protect declared/undeclared employment mapping in both directions and missing input handling. |
| `src/test/unit/services/features/response/statementOfMeans/partner/partnerServices.test.ts` | Consolidated/adapted six absent fork service suites: exact keys, answer preservation, real read versus write failure, no application boot. |
| `src/test/unit/services/firstcontact/firstcontactService.test.ts` | Adapted exact-fork isolated unit coverage; production module unchanged. |
| `src/test/unit/services/firstcontact/sessionValueCrypto.test.ts` | Local extension of PR1 fixed-format encryption fixture: IV/tag/ciphertext tampering and malformed input. |
| `src/test/unit/services/genericForm/genericFormService.test.ts` | Adapted exact-fork isolated unit coverage; production module unchanged. |
| `src/test/unit/services/translation/caseProgression/requestForReconsideration/convertToCCDRequestForReconsideration.test.ts` | Adapted exact-fork isolated unit coverage; production module unchanged. |
| `src/test/unit/services/translation/claimantResponse/convertToCCDClaimantLiPResponse.test.ts` | Adapted exact-fork isolated unit coverage; production module unchanged. |
| `src/test/unit/services/translation/claimantResponse/convertToCCDClaimantMediation.test.ts` | Fork claimant-mediation coverage strengthened from existence checks to complete individual/decline CCD payloads. |
| `src/test/unit/services/translation/convertToCUI/convertToCUIFixedRecoverableCosts.test.ts` | Adapted exact-fork isolated unit coverage; production module unchanged. |
| `src/test/unit/services/translation/convertToCUI/convertToCUIMediationCarm.test.ts` | Adapted exact-fork isolated unit coverage; production module unchanged. |
| `src/test/unit/services/translation/convertToCUI/convertToCUIYesNo.test.ts` | Fork Yes/No cases cover every public adapter, missing versus No, and independent form values. |
| `src/test/unit/services/translation/response/convertToCCDFlightDetails.test.ts` | Adapted exact-fork isolated unit coverage; production module unchanged. |
| `docs/test-pyramid.md` | Correct stale echo-command guidance to the real PR2 commands; retain current test ownership/retry policy. |
| `docs/pr9-presentation-review-notes.md` | Append this PR11 reconciliation/evidence/PR-description record; earlier history unchanged. |

### Delivered/deferred accounting and gates

- PR1–PR10 production source and preservation tests remain; meaningful fork coverage is selectively integrated. Full translation payloads, saved-document guards, valid payment references, independent draft ownership and master-format encrypted sessions are protected.
- Eight deliberately deferred test assessments are listed individually in the ledger: PCQ wire-format compatibility, legacy cookie-banner DOM, legacy language-toggle URL behaviour, two dormant expert-report model/editor files, GA support required-content semantics, secret-volume configuration isolation and exhaustive GA CYA producer contracts. They are named follow-up/owner decisions, not silently counted as complete or evidence that current behaviour is absent. No dormant editor or backend recovery is activated here.
- Current GA missing-parameter confirmation recovery needs its separately described production decision. Substantive monetary, application-selection, timeline recovery, persistence/route decomposition, translation namespaces, multi-party, bulk/DAST and runtime-major work are excluded rather than guessed into this test PR.
- DTSCCI-5145 and DTSCCI-4187: the series delivers the concrete component/native-interaction, shared-helper, tooling, regression and restricted-preview work recorded by PR1–PR10 and this test reconciliation. The local governing record does not provide authoritative complete acceptance contracts for those two phase tickets; this record does not invent a phase-specific closure. Owner mapping of delivered/deferred items, integrated verification and separate QA/operational evidence remain required for both.
- DTSCCI-4185 acceptance remains open: review/approved merge, final-commit Jenkins/GitHub security evidence, applicable contracts, live audit, operational checks, authenticated bilingual journeys and a separate QA person's record. Earlier unexplained PR9/PR10 full-run failures remain in their historical sections; a new pass is not their diagnosis.

### Historical test-only PR-description draft

**Title:** DTSCCI-6593 Complete fork test integration and final reconciliation

**Summary:** selectively adapt the exact improvements-fork tests to current master contracts and unit/integration ownership. Add direct validator/model/translation/client/service coverage, strengthen request/draft/payment/crypto protections and correct three diagnosed retry-masked legacy test-fixture defects plus the phone suite’s missing independent draft baseline. Keep production code and dependency/tooling choices unchanged.

**Review decisions:** this section's inventory accounts for every one of the 719 fork-changed paths, including exact matches, earlier adapted components, alternative coverage, incompatible/superficial ports and eight named follow-ups. Do not infer completion from absent-filename counts. Retain the separate GA missing-query recovery finding and operational/QA gates. The untracked PR10 notes and excluded historical log/Yarn binary are not part of this PR.

**Verification:** use the final results and command ledger in this section; retain initial failures and the before-retry diagnostics. Five negative controls demonstrate important assertions. All downloads were exact locked npm archives in disposable storage. No staging, commit, remote ref operation or hosted execution was performed.

### Complete ancestor-to-fork path ledger

Evidence codes deduplicate repeated explanations; each row has one primary disposition, with mixed-hunk caveats above. This is a local source/test reconciliation, not a claim of remote merge status or a replacement for independent review.

| Disposition | Paths |
| --- | ---: |
| Adapted | 233 |
| Already integrated | 105 |
| Covered differently | 80 |
| Defer | 8 |
| Exclude | 244 |
| Import/adapt | 49 |

<details>
<summary>All 719 fork-changed paths</summary>

| Path | Disposition | Evidence |
| --- | --- | --- |
| `.cursor/README.md` | Exclude | R001 |
| `.eslintignore` | Already integrated | R002 |
| `.eslintrc.js` | Already integrated | R002 |
| `.github/CONTRIBUTING.md` | Adapted | R003 |
| `.github/renovate.json` | Adapted | R003 |
| `.github/workflows/ci.yml` | Adapted | R003 |
| `.github/workflows/stale-branches.yml` | Adapted | R003 |
| `.github/workflows/stale.yml` | Adapted | R003 |
| `.github/workflows/update-readme-e2e-tables.yml` | Adapted | R003 |
| `.github/workflows/update-readme-ftGroup-tables.yml` | Adapted | R003 |
| `.gitignore` | Already integrated | R004 |
| `.yarn/patches/yargs-unparser-npm-2.0.0-930f3ff3f6.patch` | Adapted | R003 |
| `.yarnrc.yml` | Adapted | R005 |
| `AGENT.md` | Exclude | R001 |
| `AGENTS.md` | Exclude | R001 |
| `Dockerfile.ui-preview` | Adapted | R006 |
| `FRONTEND-RECOMMENDATIONS.md` | Exclude | R001 |
| `KEYCHANGES.md` | Exclude | R001 |
| `README.md` | Adapted | R007 |
| `ai-docs/README.md` | Exclude | R001 |
| `ai-docs/change-impact-matrix.md` | Exclude | R001 |
| `ai-docs/conventions.md` | Exclude | R001 |
| `ai-docs/directory-mirror/INDEX.md` | Exclude | R001 |
| `ai-docs/directory-mirror/charts-compose-bin.md` | Exclude | R001 |
| `ai-docs/directory-mirror/config.md` | Exclude | R001 |
| `ai-docs/directory-mirror/generated-and-ignored.md` | Exclude | R001 |
| `ai-docs/directory-mirror/github-ci.md` | Exclude | R001 |
| `ai-docs/directory-mirror/infrastructure.md` | Exclude | R001 |
| `ai-docs/directory-mirror/playwright.md` | Exclude | R001 |
| `ai-docs/directory-mirror/root-files.md` | Exclude | R001 |
| `ai-docs/directory-mirror/src-integration-test.md` | Exclude | R001 |
| `ai-docs/directory-mirror/src-main-app.md` | Exclude | R001 |
| `ai-docs/directory-mirror/src-main-assets.md` | Exclude | R001 |
| `ai-docs/directory-mirror/src-main-common.md` | Exclude | R001 |
| `ai-docs/directory-mirror/src-main-modules.md` | Exclude | R001 |
| `ai-docs/directory-mirror/src-main-routes.md` | Exclude | R001 |
| `ai-docs/directory-mirror/src-main-services.md` | Exclude | R001 |
| `ai-docs/directory-mirror/src-main-views.md` | Exclude | R001 |
| `ai-docs/directory-mirror/src-main.md` | Exclude | R001 |
| `ai-docs/directory-mirror/src-test.md` | Exclude | R001 |
| `ai-docs/directory-mirror/src.md` | Exclude | R001 |
| `ai-docs/directory-mirror/webpack.md` | Exclude | R001 |
| `ai-docs/do-not.md` | Exclude | R001 |
| `ai-docs/path-aliases-and-imports.md` | Exclude | R001 |
| `ai-docs/playbooks/add-a-screen.md` | Exclude | R001 |
| `ai-docs/playbooks/dependency-bump.md` | Exclude | R001 |
| `ai-docs/playbooks/govuk-frontend-upgrade.md` | Exclude | R001 |
| `ai-docs/playbooks/moj-frontend-v10-upgrade.md` | Exclude | R001 |
| `ai-docs/playbooks/moj-frontend.md` | Exclude | R001 |
| `ai-docs/playbooks/ui-preview-missing-data.md` | Exclude | R001 |
| `ai-docs/pre-change-protocol.md` | Exclude | R001 |
| `ai-docs/scripts-and-commands.md` | Exclude | R001 |
| `ai-docs/service-assessment.md` | Exclude | R001 |
| `bin/check-dependency-pins.mjs` | Adapted | R003 |
| `bin/check-yarn-audit.mjs` | Adapted | R003 |
| `bin/ui-preview.sh` | Adapted | R006 |
| `compose/ui-preview-mappings/reduced-stack/.gitkeep` | Adapted | R006 |
| `compose/ui-preview-mappings/ui-preview-case-progression.json` | Already integrated | R004 |
| `compose/ui-preview-mappings/ui-preview-claims.json` | Adapted | R006 |
| `compose/ui-preview-mappings/ui-preview-full-admit.json` | Adapted | R006 |
| `compose/ui-preview-mappings/ui-preview-ga.json` | Adapted | R006 |
| `compose/ui-preview-mappings/ui-preview-part-admit.json` | Adapted | R006 |
| `compose/ui-preview-mappings/ui-preview-shared-apis.json` | Adapted | R006 |
| `compose/ui-preview-mappings/ui-preview-som.json` | Adapted | R006 |
| `compose/ui-preview.yml` | Adapted | R006 |
| `config/development.yaml` | Adapted | R003 |
| `config/e2eTest.yaml` | Adapted | R003 |
| `docs/README.md` | Exclude | R001 |
| `docs/architecture.md` | Exclude | R001 |
| `docs/ci-cd-and-deployment.md` | Exclude | R001 |
| `docs/citizen-journeys.md` | Exclude | R001 |
| `docs/configuration.md` | Exclude | R001 |
| `docs/contributing.md` | Exclude | R001 |
| `docs/dependency-update-log-2026-08-18.md` | Exclude | R001 |
| `docs/dependency-update-log-2026-08-21.md` | Exclude | R001 |
| `docs/dependency-update-log-2026-08-26.md` | Exclude | R001 |
| `docs/directory-structure.md` | Exclude | R001 |
| `docs/frontend.md` | Exclude | R001 |
| `docs/glossary.md` | Exclude | R001 |
| `docs/integrations.md` | Exclude | R001 |
| `docs/local-development.md` | Exclude | R001 |
| `docs/moj-frontend-v10-migration.md` | Exclude | R001 |
| `docs/moj-frontend.md` | Exclude | R001 |
| `docs/pii-logging-check.md` | Exclude | R001 |
| `docs/project-overview.md` | Exclude | R001 |
| `docs/reduced-stack-wiremock-contracts.md` | Exclude | R001 |
| `docs/security-and-privacy.md` | Exclude | R001 |
| `docs/service-assessment.md` | Exclude | R001 |
| `docs/template-streamlining.md` | Exclude | R001 |
| `docs/testing.md` | Exclude | R001 |
| `eslint.config.mjs` | Adapted | R003 |
| `eslint.config.win.mjs` | Already integrated | R004 |
| `jest.a11y.config.js` | Adapted | R003 |
| `jest.config.js` | Adapted | R003 |
| `jest.routes.config.js` | Adapted | R003 |
| `jest.setup.silence-deprecations.js` | Adapted | R003 |
| `package.json` | Adapted | R003 |
| `playwright/tsconfig.json` | Adapted | R003 |
| `src/main/app/auth/user/oidc.ts` | Adapted | R008 |
| `src/main/app/client/civilServiceClient.ts` | Adapted | R008 |
| `src/main/app/client/serviceAuthProviderClient.ts` | Adapted | R008 |
| `src/main/assets/js/add-another.js` | Adapted | R009 |
| `src/main/assets/js/append-row.js` | Adapted | R009 |
| `src/main/assets/js/calculate-length-repayment.js` | Adapted | R009 |
| `src/main/assets/js/calculate-total-amount.js` | Adapted | R009 |
| `src/main/assets/js/conditionally-hide-add-button.js` | Adapted | R009 |
| `src/main/assets/js/postcode-lookup.js` | Adapted | R009 |
| `src/main/assets/js/reindex-add-another-actions.js` | Adapted | R009 |
| `src/main/assets/js/remove-error-content.js` | Adapted | R009 |
| `src/main/assets/js/select-toggle.js` | Adapted | R009 |
| `src/main/assets/scss/main.scss` | Adapted | R010 |
| `src/main/assets/scss/task-list.scss` | Adapted | R010 |
| `src/main/common/form/validators/emailValidator.ts` | Adapted | R005 |
| `src/main/common/form/validators/phoneUKValidator.ts` | Adapted | R005 |
| `src/main/common/mappers/documentViewMapper.ts` | Exclude | R011 |
| `src/main/common/models/caseProgression/uploadDocumentsSectionBuilder.ts` | Adapted | R009 |
| `src/main/common/models/claim.ts` | Exclude | R012 |
| `src/main/common/models/generalApplication/applicationSummary.ts` | Adapted | R005 |
| `src/main/common/utils/cryptoAes.ts` | Exclude | R013 |
| `src/main/common/utils/dateUtils.ts` | Exclude | R011 |
| `src/main/common/utils/repaymentUtils.ts` | Adapted | R005 |
| `src/main/common/utils/stringUtils.ts` | Adapted | R005 |
| `src/main/index.js` | Adapted | R009 |
| `src/main/modules/appinsights/index.ts` | Adapted | R008 |
| `src/main/modules/e2eConfiguration/index.ts` | Adapted | R008 |
| `src/main/modules/e2eConfiguration/redisData.json` | Adapted | R008 |
| `src/main/modules/e2eConfiguration/uiPreviewRedisData.json` | Adapted | R006 |
| `src/main/modules/error/index.ts` | Adapted | R008 |
| `src/main/modules/nunjucks/filters/govukTaskListItems.ts` | Adapted | R008 |
| `src/main/modules/nunjucks/index.ts` | Adapted | R008 |
| `src/main/modules/oidc/index.ts` | Adapted | R008 |
| `src/main/routes/features/claim/createDraftClaim.ts` | Adapted | R005 |
| `src/main/routes/features/claim/payment/claimFeeBreakDownController.ts` | Adapted | R005 |
| `src/main/routes/features/claimantResponse/claimantSuggestedInstalmentsController.ts` | Adapted | R005 |
| `src/main/routes/features/claimantResponse/courtProposedDateController.ts` | Adapted | R005 |
| `src/main/routes/features/claimantResponse/settleAdmittedController.ts` | Exclude | R012 |
| `src/main/routes/features/document/mediation/viewSettlementAgreementDocumentController.ts` | Adapted | R005 |
| `src/main/routes/features/generalApplication/addAnotherApplicationController.ts` | Exclude | R014 |
| `src/main/routes/features/generalApplication/applicationCostsController.ts` | Exclude | R014 |
| `src/main/routes/features/generalApplication/applicationSummaryController.ts` | Exclude | R014 |
| `src/main/routes/features/generalApplication/certOfSorC/submitCoScApplicationConfirmationController.ts` | Adapted | R014; R087 |
| `src/main/routes/features/generalApplication/hearingArrangementController.ts` | Exclude | R014 |
| `src/main/routes/features/generalApplication/hearingContactDetailsController.ts` | Exclude | R014 |
| `src/main/routes/features/generalApplication/payingForApplicationController.ts` | Exclude | R014 |
| `src/main/routes/features/generalApplication/submitGeneralApplicationConfirmationController.ts` | Adapted | R014; R087 |
| `src/main/routes/features/generalApplication/unavailableHearingDatesControllerConfirmation.ts` | Exclude | R014 |
| `src/main/routes/features/generalApplication/wantToUploadDocuments.ts` | Exclude | R014 |
| `src/main/routes/features/public/firstContact/claimSummaryController.ts` | Exclude | R013 |
| `src/main/routes/features/public/firstContact/pinController.ts` | Exclude | R013 |
| `src/main/routes/features/response/timelineOfEvents/defendantTimelineController.ts` | Exclude | R011 |
| `src/main/routes/features/uiPreview/uiPreviewController.ts` | Adapted | R006 |
| `src/main/routes/guards/partAdmitHowMuchHaveYouPaidGuard.ts` | Adapted | R012; R086 |
| `src/main/routes/guards/uploadRateLimitGuard.ts` | Adapted | R008 |
| `src/main/routes/routes.ts` | Adapted | R008 |
| `src/main/routes/urls.ts` | Adapted | R008 |
| `src/main/services/features/caseProgression/checkYourAnswers/checkAnswersService.ts` | Adapted | R005 |
| `src/main/services/features/caseProgression/disclosureService.ts` | Adapted | R005; R085 |
| `src/main/services/features/caseProgression/expertService.ts` | Adapted | R005; R085 |
| `src/main/services/features/caseProgression/trialService.ts` | Adapted | R005; R085 |
| `src/main/services/features/caseProgression/witnessService.ts` | Adapted | R005; R085 |
| `src/main/services/features/claim/checkAnswers/checkAnswersService.ts` | Adapted | R005 |
| `src/main/services/features/claimantResponse/claimantSuggestedInstalmentsService.ts` | Adapted | R005 |
| `src/main/services/features/generalApplication/applicationCostsService.ts` | Exclude | R014 |
| `src/main/services/features/generalApplication/feeDetailsService.ts` | Exclude | R014 |
| `src/main/services/features/generalApplication/generalApplicationService.ts` | Exclude | R014 |
| `src/main/services/features/generalApplication/response/generalApplicationResponseService.ts` | Exclude | R014 |
| `src/main/services/features/generalApplication/submitGeneralApplicationConfirmationContent.ts` | Adapted | R014; R087 |
| `src/main/services/features/mediation/uploadDocuments/documentsForDocumentsReferredService.ts` | Adapted | R005 |
| `src/main/services/features/mediation/uploadDocuments/yourStatementService.ts` | Adapted | R005 |
| `src/main/services/features/response/statementOfMeans/bankAccounts/bankAccountConverter.ts` | Already integrated | R004 |
| `src/main/services/features/response/timelineOfEvents/defendantTimelineService.ts` | Adapted | R011; R086 |
| `src/main/services/features/uiPreview/pageCatalog.ts` | Adapted | R006 |
| `src/main/services/firstcontact/sessionValueCrypto.ts` | Exclude | R013 |
| `src/main/services/translation/convertToCUI/cuiTranslation.ts` | Adapted | R005 |
| `src/main/views/claim-details-tpl-dashboard.njk` | Adapted | R010; R088 |
| `src/main/views/claim-details-tpl.njk` | Adapted | R010 |
| `src/main/views/features/caseProgression/cancel-your-upload.njk` | Already integrated | R004 |
| `src/main/views/features/caseProgression/hearingFee/apply-help-fee-reference.njk` | Already integrated | R004 |
| `src/main/views/features/caseProgression/hearingFee/apply-help-fee-selection.njk` | Already integrated | R004 |
| `src/main/views/features/caseProgression/hearingFee/pay-hearing-fee-start.njk` | Adapted | R010 |
| `src/main/views/features/caseProgression/trialArrangements/has-anything-changed.njk` | Already integrated | R004 |
| `src/main/views/features/caseProgression/trialArrangements/is-case-ready.njk` | Already integrated | R004 |
| `src/main/views/features/caseProgression/upload-documents.njk` | Adapted | R010 |
| `src/main/views/features/claim/airlines/delayed-flight.njk` | Adapted | R010 |
| `src/main/views/features/claim/airlines/flight-details.njk` | Adapted | R010 |
| `src/main/views/features/claim/amount/claim-amount-breakdown.njk` | Adapted | R010 |
| `src/main/views/features/claim/claim-bilingual-language-preference.njk` | Already integrated | R004 |
| `src/main/views/features/claim/claimant-evidences.njk` | Adapted | R010 |
| `src/main/views/features/claim/details/help-with-fees.njk` | Already integrated | R004 |
| `src/main/views/features/claim/fee-change.njk` | Adapted | R010 |
| `src/main/views/features/claim/interest/claim-interest.njk` | Already integrated | R004 |
| `src/main/views/features/claim/interest/claimant-interest-rate.njk` | Already integrated | R004 |
| `src/main/views/features/claim/interest/continue-claiming-interest.njk` | Already integrated | R004 |
| `src/main/views/features/claim/interest/how-much-continue-claiming.njk` | Adapted | R010; R088 |
| `src/main/views/features/claim/task-list.njk` | Adapted | R010; R088 |
| `src/main/views/features/claim/yourDetails/timeline.njk` | Adapted | R010 |
| `src/main/views/features/claimantResponse/ccj/defendant-dob.njk` | Adapted | R010 |
| `src/main/views/features/claimantResponse/ccj/judgement-amount-summary.njk` | Already integrated | R004 |
| `src/main/views/features/claimantResponse/ccj/paid-amount.njk` | Already integrated | R004 |
| `src/main/views/features/claimantResponse/ccj/repayment-plan-instalments.njk` | Adapted | R010; R088 |
| `src/main/views/features/claimantResponse/claimant-intention-to-proceed.njk` | Already integrated | R004 |
| `src/main/views/features/claimantResponse/claimant-response-task-list.njk` | Adapted | R010; R088 |
| `src/main/views/features/claimantResponse/instalments-plan.njk` | Adapted | R010 |
| `src/main/views/features/claimantResponse/paidInFull/date-paid.njk` | Adapted | R010 |
| `src/main/views/features/claimantResponse/part-payment-received.njk` | Already integrated | R004 |
| `src/main/views/features/claimantResponse/settle-admitted.njk` | Already integrated | R004 |
| `src/main/views/features/claimantResponse/settle-claim.njk` | Already integrated | R004 |
| `src/main/views/features/dashboard/claim-summary-redesign.njk` | Adapted | R010 |
| `src/main/views/features/dashboard/claim-summary.njk` | Adapted | R010 |
| `src/main/views/features/dashboard/dashboard.njk` | Already integrated | R004 |
| `src/main/views/features/dashboard/item-content.njk` | Adapted | R010 |
| `src/main/views/features/dashboard/orders-and-notices.njk` | Already integrated | R004 |
| `src/main/views/features/dashboard/view-response-to-claim.njk` | Already integrated | R004 |
| `src/main/views/features/directionsQuestionnaire/consider-claimant-documents.njk` | Already integrated | R004 |
| `src/main/views/features/directionsQuestionnaire/defendant-yourself-evidence.njk` | Already integrated | R004 |
| `src/main/views/features/directionsQuestionnaire/experts/expert-details.njk` | Adapted | R010 |
| `src/main/views/features/directionsQuestionnaire/experts/expert-evidence.njk` | Already integrated | R004 |
| `src/main/views/features/directionsQuestionnaire/experts/expert-report-details.njk` | Already integrated | R004 |
| `src/main/views/features/directionsQuestionnaire/experts/permission-for-expert.njk` | Already integrated | R004 |
| `src/main/views/features/directionsQuestionnaire/experts/sent-expert-reports.njk` | Already integrated | R004 |
| `src/main/views/features/directionsQuestionnaire/experts/shared-expert.njk` | Already integrated | R004 |
| `src/main/views/features/directionsQuestionnaire/fixedRecoverableCosts/frc-band-agreed.njk` | Already integrated | R004 |
| `src/main/views/features/directionsQuestionnaire/fixedRecoverableCosts/subject-to-frc.njk` | Already integrated | R004 |
| `src/main/views/features/directionsQuestionnaire/hearing/cant-attend-hearing-in-next-12-months.njk` | Already integrated | R004 |
| `src/main/views/features/directionsQuestionnaire/hearing/determination-without-hearing.njk` | Already integrated | R004 |
| `src/main/views/features/directionsQuestionnaire/hearing/phone-or-video-hearing.njk` | Already integrated | R004 |
| `src/main/views/features/directionsQuestionnaire/mintiMultiTrack/claimant-documents-to-be-considered.njk` | Already integrated | R004 |
| `src/main/views/features/directionsQuestionnaire/request-extra-4weeks.njk` | Adapted | R010 |
| `src/main/views/features/directionsQuestionnaire/support-required-list.njk` | Adapted | R010 |
| `src/main/views/features/directionsQuestionnaire/tried-to-settle-claim.njk` | Already integrated | R004 |
| `src/main/views/features/directionsQuestionnaire/vulnerabilityQuestions/vulnerability.njk` | Already integrated | R004 |
| `src/main/views/features/directionsQuestionnaire/witnesses/otherWitnesses/other-witness.njk` | Adapted | R010 |
| `src/main/views/features/directionsQuestionnaire/witnesses/otherWitnesses/other-witnesses.njk` | Adapted | R010 |
| `src/main/views/features/generalApplication/additionalDocuments/upload-additional-documents.njk` | Adapted | R010 |
| `src/main/views/features/generalApplication/additionalFee/help-with-additional-fee.njk` | Already integrated | R004 |
| `src/main/views/features/generalApplication/additionalInfoUpload/additional-info.njk` | Already integrated | R004 |
| `src/main/views/features/generalApplication/additionalInfoUpload/respondToWrittenRepInfo.njk` | Already integrated | R004 |
| `src/main/views/features/generalApplication/additionalInfoUpload/upload-documents.njk` | Adapted | R010 |
| `src/main/views/features/generalApplication/agree-to-order.njk` | Already integrated | R004 |
| `src/main/views/features/generalApplication/application-type.njk` | Adapted | R010 |
| `src/main/views/features/generalApplication/applicationFee/help-with-application-fee-reference.njk` | Already integrated | R004 |
| `src/main/views/features/generalApplication/applicationFee/help-with-application-fee.njk` | Already integrated | R004 |
| `src/main/views/features/generalApplication/certOfSorC/final-payment-date.njk` | Adapted | R010 |
| `src/main/views/features/generalApplication/directionsOrderUpload/upload-documents.njk` | Adapted | R010 |
| `src/main/views/features/generalApplication/paying-for-application.njk` | Adapted | R010 |
| `src/main/views/features/generalApplication/respondent-agreement.njk` | Adapted | R010; R088 |
| `src/main/views/features/generalApplication/response/accept-defendant-offer.njk` | Adapted | R010; R088 |
| `src/main/views/features/generalApplication/response/respondent-upload-documents.njk` | Adapted | R010 |
| `src/main/views/features/generalApplication/response/respondent-want-to-upload-documents.njk` | Already integrated | R004 |
| `src/main/views/features/generalApplication/unavailable-dates-confirmation.njk` | Already integrated | R004 |
| `src/main/views/features/generalApplication/upload-n245-form.njk` | Adapted | R010 |
| `src/main/views/features/generalApplication/upload_documents.njk` | Adapted | R010 |
| `src/main/views/features/generalApplication/want-to-upload-documents.njk` | Already integrated | R004 |
| `src/main/views/features/helpWithFees/help-fees-start.njk` | Already integrated | R004 |
| `src/main/views/features/mediation/can-we-use.njk` | Already integrated | R004 |
| `src/main/views/features/mediation/company-telephone-number.njk` | Adapted | R010 |
| `src/main/views/features/mediation/mediation-disagreement.njk` | Already integrated | R004 |
| `src/main/views/features/mediation/telephone-mediation.njk` | Adapted | R010 |
| `src/main/views/features/mediation/unavailable-dates-mediation.njk` | Adapted | R010 |
| `src/main/views/features/mediation/uploadDocuments/cancel-your-upload.njk` | Already integrated | R004 |
| `src/main/views/features/mediation/uploadDocuments/upload-documents.njk` | Adapted | R010 |
| `src/main/views/features/public/eligibility/claim-against-government.njk` | Already integrated | R004 |
| `src/main/views/features/public/eligibility/claim-type.njk` | Already integrated | R004 |
| `src/main/views/features/public/eligibility/claimant-address-eligibility.njk` | Already integrated | R004 |
| `src/main/views/features/public/eligibility/defendant-eligible-address.njk` | Already integrated | R004 |
| `src/main/views/features/public/eligibility/help-with-fees-reference.njk` | Adapted | R010 |
| `src/main/views/features/public/eligibility/help-with-fees.njk` | Adapted | R010 |
| `src/main/views/features/public/eligibility/known-claim-amount.njk` | Already integrated | R004 |
| `src/main/views/features/public/eligibility/over-18.njk` | Already integrated | R004 |
| `src/main/views/features/public/eligibility/single-defendant.njk` | Already integrated | R004 |
| `src/main/views/features/public/eligibility/some-useful-info-fees.njk` | Adapted | R010 |
| `src/main/views/features/public/eligibility/tenancy-deposit.njk` | Already integrated | R004 |
| `src/main/views/features/queryManagement/createQuery.njk` | Adapted | R010; R088 |
| `src/main/views/features/queryManagement/qm-questions-template.njk` | Already integrated | R004 |
| `src/main/views/features/queryManagement/qm-view-queries-template.njk` | Already integrated | R004 |
| `src/main/views/features/queryManagement/qm-view-query-details-template.njk` | Already integrated | R004 |
| `src/main/views/features/queryManagement/sendFollowUpQuery.njk` | Adapted | R010 |
| `src/main/views/features/response/admission/how-much-have-you-paid.njk` | Adapted | R010; R088 |
| `src/main/views/features/response/admission/partialAdmission/already-paid.njk` | Already integrated | R004 |
| `src/main/views/features/response/admission/partialAdmission/how-much-do-you-owe.njk` | Adapted | R010; R088 |
| `src/main/views/features/response/admission/payment-date.njk` | Adapted | R010 |
| `src/main/views/features/response/admission/payment-option.njk` | Already integrated | R004 |
| `src/main/views/features/response/bilingual-language-preference.njk` | Already integrated | R004 |
| `src/main/views/features/response/citizenDob/citizen-dob.njk` | Adapted | R010 |
| `src/main/views/features/response/citizenResponseType/citizen-response-type.njk` | Adapted | R010 |
| `src/main/views/features/response/eligibility/send-your-response-by-email.njk` | Already integrated | R004 |
| `src/main/views/features/response/evidence/evidences.njk` | Adapted | R010 |
| `src/main/views/features/response/repaymentPlan/repaymentPlan.njk` | Adapted | R010 |
| `src/main/views/features/response/responseDeadline/agreed-response-deadline.njk` | Adapted | R010 |
| `src/main/views/features/response/statementOfMeans/courtOrders/court-order.njk` | Adapted | R010 |
| `src/main/views/features/response/statementOfMeans/courtOrders/court-orders.njk` | Adapted | R010 |
| `src/main/views/features/response/statementOfMeans/dependants/dependants.njk` | Adapted | R010; R088 |
| `src/main/views/features/response/statementOfMeans/employment/who-employs-you.njk` | Adapted | R010 |
| `src/main/views/features/response/statementOfMeans/expenses/regular-expenses.njk` | Adapted | R010 |
| `src/main/views/features/response/statementOfMeans/unemployment.njk` | Adapted | R010; R088 |
| `src/main/views/features/response/task-list.njk` | Adapted | R010; R088 |
| `src/main/views/features/response/timelineOfEvents/defendant-timeline.njk` | Adapted | R010; R088 |
| `src/main/views/features/response/your-defence.njk` | Already integrated | R004 |
| `src/main/views/features/settlementAgreement/respond-settlement-agreement.njk` | Already integrated | R004 |
| `src/main/views/features/ui-preview/index.njk` | Adapted | R010 |
| `src/main/views/macro/amount-breakdown.njk` | Already integrated | R004 |
| `src/main/views/macro/claim-amount.njk` | Adapted | R010 |
| `src/main/views/macro/contact-us-for-help.njk` | Adapted | R010 |
| `src/main/views/macro/create-table-documents.njk` | Already integrated | R004 |
| `src/main/views/macro/employer.njk` | Adapted | R010 |
| `src/main/views/macro/evidence.njk` | Adapted | R010 |
| `src/main/views/macro/header.njk` | Adapted | R010 |
| `src/main/views/macro/paper-form-address.njk` | Already integrated | R004 |
| `src/main/views/macro/postcode-address-form.njk` | Adapted | R010 |
| `src/main/views/macro/query-message-card.njk` | Already integrated | R004 |
| `src/main/views/macro/report-detail.njk` | Adapted | R010 |
| `src/main/views/macro/support-required.njk` | Adapted | R010 |
| `src/main/views/macro/task-list.njk` | Adapted | R010 |
| `src/main/views/macro/task.njk` | Already integrated | R002 |
| `src/main/views/macro/timeline-summary.njk` | Adapted | R010 |
| `src/main/views/macro/transaction-details.njk` | Adapted | R010 |
| `src/main/views/macro/unavailable-date-row.njk` | Adapted | R010 |
| `src/main/views/macro/uploaded-files-summary.njk` | Adapted | R010 |
| `src/main/views/macro/yesNoGenericForm.njk` | Adapted | R010 |
| `src/test/a11y/a11y-README.md` | Adapted | R015 |
| `src/test/a11y/a11y-scan.ts` | Adapted | R015 |
| `src/test/a11y/a11y.mock-test.ts` | Adapted | R015 |
| `src/test/a11y/a11y.test.ts` | Covered differently | R016 |
| `src/test/a11y/a11y.ts` | Adapted | R015 |
| `src/test/a11y/ignored-urls.ts` | Adapted | R015 |
| `src/test/a11y/pa11y-options.ts` | Adapted | R015 |
| `src/test/contract/consumers/CivilServiceCreateClaim.test.ts` | Covered differently | R016 |
| `src/test/contract/consumers/CivilServiceFeePayment.test.ts` | Covered differently | R016 |
| `src/test/contract/consumers/Oidc.test.ts` | Covered differently | R016 |
| `src/test/contract/consumers/ServiceAuthProvider.test.ts` | Covered differently | R016 |
| `src/test/contract/tsconfig.pact.json` | Adapted | R015 |
| `src/test/functionalTests/citizenFeatures/GA/pages/checkAndSend.js` | Adapted | R015 |
| `src/test/functionalTests/citizenFeatures/caseProgression/util/DateUtilsComponent.js` | Already integrated | R004 |
| `src/test/functionalTests/citizenFeatures/response/steps/lipDefendantResponseSteps.js` | Adapted | R015 |
| `src/test/functionalTests/saucelabs.conf.js` | Adapted | R015 |
| `src/test/functionalTests/specClaimHelpers/api/apiRequest.js` | Adapted | R015 |
| `src/test/functionalTests/specClaimHelpers/api/caseAssignment.js` | Adapted | R015 |
| `src/test/functionalTests/specClaimHelpers/api/restHelper.js` | Adapted | R015 |
| `src/test/functionalTests/specClaimHelpers/api/testingSupport.js` | Adapted | R015 |
| `src/test/functionalTests/tests/ui_tests/dj/LipvLip_UI_DefaultJudgment_CoSC_tests.js` | Adapted | R015 |
| `src/test/functionalTests/tests/ui_tests/full-admit/LiPvLiP_FullAdmit_PayImmediately_tests.js` | Adapted | R015 |
| `src/test/functionalTests/tests/ui_tests/full-admit/LipvLip_FullAdmit_PayInstalments_tests.js` | Adapted | R015 |
| `src/test/functionalTests/tests/ui_tests/full-admit/LipvLip_FullAdmit_PaySetDate_CCJ_tests.js` | Adapted | R015 |
| `src/test/functionalTests/tests/ui_tests/full-admit/LipvLip_FullAdmit_PaySetDate_SSA_tests.js` | Adapted | R015 |
| `src/test/functionalTests/tests/ui_tests/ga/LRvLiP_GA_creation_tests.js` | Adapted | R015 |
| `src/test/functionalTests/tests/ui_tests/ga/LiPvLiP_GA_DismissAnOrder_tests.js` | Adapted | R015 |
| `src/test/functionalTests/tests/ui_tests/ga/LiPvLiP_GA_FreeFormOrder_tests.js` | Adapted | R015 |
| `src/test/functionalTests/tests/ui_tests/ga/LiPvLiP_GA_GiveDirectionsWithoutListing_tests.js` | Adapted | R015 |
| `src/test/functionalTests/tests/ui_tests/ga/LiPvLiP_GA_ListForHearing_tests.js` | Adapted | R015 |
| `src/test/functionalTests/tests/ui_tests/ga/LiPvLiP_GA_MakeAnOrder_tests.js` | Adapted | R015 |
| `src/test/functionalTests/tests/ui_tests/ga/LiPvLiP_GA_RequestForMoreInformation_tests.js` | Adapted | R015 |
| `src/test/functionalTests/tests/ui_tests/ga/LiPvLiP_GA_WithoutNoticeToWithNotice_tests.js` | Adapted | R015 |
| `src/test/functionalTests/tests/ui_tests/ga/LiPvLiP_GA_WrittenRepresentations_tests.js` | Adapted | R015 |
| `src/test/functionalTests/tests/ui_tests/jba/LipvLip_UI_JudgmentByAdmissions_tests.js` | Adapted | R015 |
| `src/test/functionalTests/tests/ui_tests/judgment-buffer/LRvLip_UI_DJ_buffer_case_discontinued_tests.js` | Adapted | R015 |
| `src/test/functionalTests/tests/ui_tests/judgment-buffer/LRvLip_UI_DJ_buffer_case_offline_tests.js` | Adapted | R015 |
| `src/test/functionalTests/tests/ui_tests/judgment-buffer/LRvLip_UI_DJ_buffer_caseworker_settle_tests.js` | Adapted | R015 |
| `src/test/functionalTests/tests/ui_tests/judgment-buffer/LRvLip_UI_DJ_buffer_dismiss_case_tests.js` | Adapted | R015 |
| `src/test/functionalTests/tests/ui_tests/judgment-buffer/LRvLip_UI_DJ_buffer_mark_paid_full_tests.js` | Adapted | R015 |
| `src/test/functionalTests/tests/ui_tests/judgment-buffer/LipvLip_UI_DJ_buffer_case_offline_tests.js` | Adapted | R015 |
| `src/test/functionalTests/tests/ui_tests/judgment-buffer/LipvLip_UI_DJ_buffer_case_settled_tests.js` | Adapted | R015 |
| `src/test/functionalTests/tests/ui_tests/judgment-buffer/LipvLip_UI_DJ_buffer_dismiss_case_tests.js` | Adapted | R015 |
| `src/test/functionalTests/tests/ui_tests/judgment-buffer/LipvLip_UI_DJ_buffer_dismiss_scheduler_tests.js` | Adapted | R015 |
| `src/test/functionalTests/tests/ui_tests/judgment-buffer/LipvLip_UI_DJ_buffer_grant_notification_tests.js` | Adapted | R015 |
| `src/test/functionalTests/tests/ui_tests/judgment-buffer/LipvLip_UI_DJ_buffer_grant_welsh_tests.js` | Adapted | R015 |
| `src/test/functionalTests/tests/ui_tests/judgment-buffer/LipvLip_UI_DJ_buffer_stay_lifted_tests.js` | Adapted | R015 |
| `src/test/functionalTests/tests/ui_tests/judgment-buffer/LipvLip_UI_DJ_buffer_tests.js` | Adapted | R015 |
| `src/test/functionalTests/tests/ui_tests/welsh/LipVsLip_claimant_as_welsh_tests.js` | Adapted | R015 |
| `src/test/unit/a11y/ignoredUrlsMocks.test.ts` | Exclude | R017 |
| `src/test/unit/app/auth/launchdarkly/launchDarklyClient.test.ts` | Covered differently | R018 |
| `src/test/unit/app/client/civilServiceUrls.test.ts` | Exclude | R019 |
| `src/test/unit/app/client/common/civilServiceRequest.test.ts` | Import/adapt | R020 |
| `src/test/unit/app/client/common/error/callbackError.test.ts` | Import/adapt | R021 |
| `src/test/unit/app/client/gaServiceUrls.test.ts` | Exclude | R022 |
| `src/test/unit/app/client/pcq/generatePcqToken.test.ts` | Defer | R023 |
| `src/test/unit/app/client/pcq/pcqParameters.test.ts` | Exclude | R024 |
| `src/test/unit/assets/js/add-another.test.ts` | Covered differently | R025 |
| `src/test/unit/assets/js/append-row.test.ts` | Covered differently | R025 |
| `src/test/unit/assets/js/calculate-amount.test.ts` | Covered differently | R025 |
| `src/test/unit/assets/js/calculate-length-repayment.test.ts` | Covered differently | R025 |
| `src/test/unit/assets/js/calculate-total-amount.test.ts` | Covered differently | R025 |
| `src/test/unit/assets/js/conditionally-hide-add-button.test.ts` | Covered differently | R025 |
| `src/test/unit/assets/js/cookies-controller.test.ts` | Defer | R026 |
| `src/test/unit/assets/js/disable-submit.test.ts` | Import/adapt | R027 |
| `src/test/unit/assets/js/language-toggle.test.ts` | Defer | R028 |
| `src/test/unit/assets/js/postcode-lookup.test.ts` | Covered differently | R025 |
| `src/test/unit/assets/js/reindex-add-another-actions.test.ts` | Covered differently | R025 |
| `src/test/unit/assets/js/remove-error-content.test.ts` | Covered differently | R025 |
| `src/test/unit/assets/js/select-toggle.test.ts` | Covered differently | R025 |
| `src/test/unit/common/common/mappers/documentViewMapper.test.ts` | Covered differently | R016 |
| `src/test/unit/common/form/models/EmailValidationWithMessage.test.ts` | Import/adapt | R029 |
| `src/test/unit/common/form/models/PhoneValidationWithMessage.test.ts` | Import/adapt | R029 |
| `src/test/unit/common/form/models/admission/fullAdmission/baseDate.test.ts` | Import/adapt | R029 |
| `src/test/unit/common/form/models/admission/partialAdmission/partialAdmissionRepaymentPlan.test.ts` | Import/adapt | R021 |
| `src/test/unit/common/form/models/citizenTelephoneNumber.test.ts` | Import/adapt | R020 |
| `src/test/unit/common/form/models/claim/claimant/citizenDate.test.ts` | Import/adapt | R021 |
| `src/test/unit/common/form/models/claim/claimant/dobDate.test.ts` | Import/adapt | R021 |
| `src/test/unit/common/form/models/evidence/transformAndRemoveEmptyValues.test.ts` | Already integrated | R004 |
| `src/test/unit/common/form/models/genericYesNo.test.ts` | Already integrated | R004 |
| `src/test/unit/common/form/models/genericYesNoCarmContactPersonConfirmation.test.ts` | Import/adapt | R021 |
| `src/test/unit/common/form/models/genericYesNoCarmEmailConfirmation.test.ts` | Import/adapt | R021 |
| `src/test/unit/common/form/models/genericYesNoKnownClaimAmount.test.ts` | Import/adapt | R021 |
| `src/test/unit/common/form/models/judmentOnline/confirmYouHaveBeenPaidForm.test.ts` | Covered differently | R030 |
| `src/test/unit/common/form/models/repaymentPlan/baseRepaymentPlan.test.ts` | Import/adapt | R029 |
| `src/test/unit/common/form/models/simpleFormModelsCoverage.test.ts` | Import/adapt | R084 |
| `src/test/unit/common/form/models/statementOfMeans/debts/debtItems.test.ts` | Import/adapt | R021 |
| `src/test/unit/common/form/models/statementOfMeans/dependants/numberOfChildren.test.ts` | Import/adapt | R021 |
| `src/test/unit/common/form/models/statementOfMeans/expensesAndIncome/transactionSource.test.ts` | Import/adapt | R032 |
| `src/test/unit/common/form/models/statementOfMeans/priorityDebts.test.ts` | Covered differently | R033 |
| `src/test/unit/common/form/models/timeLineOfEvents/timelineRow.test.ts` | Already integrated | R004 |
| `src/test/unit/common/form/validators/accountBalanceValidator.test.ts` | Already integrated | R004 |
| `src/test/unit/common/form/validators/address.test.ts` | Covered differently | R016 |
| `src/test/unit/common/form/validators/arrayAtLeastOneSelectedValidator.test.ts` | Covered differently | R016 |
| `src/test/unit/common/form/validators/atLeastOneEmployerValidator.test.ts` | Already integrated | R004 |
| `src/test/unit/common/form/validators/atLeastOneFieldIsPopulated.test.ts` | Covered differently | R016 |
| `src/test/unit/common/form/validators/atLeastOnePopulatedRow.test.ts` | Already integrated | R004 |
| `src/test/unit/common/form/validators/atLeastOneRowIsPopulated.test.ts` | Already integrated | R004 |
| `src/test/unit/common/form/validators/claimReferenceValidator.test.ts` | Already integrated | R004 |
| `src/test/unit/common/form/validators/currencyValidator.test.ts` | Already integrated | R004 |
| `src/test/unit/common/form/validators/dateDayValidator.test.ts` | Already integrated | R004 |
| `src/test/unit/common/form/validators/dateMonthValidator.test.ts` | Already integrated | R004 |
| `src/test/unit/common/form/validators/dateNotAfterReferenceDate.test.ts` | Already integrated | R004 |
| `src/test/unit/common/form/validators/dateNotBeforeReferenceDate.test.ts` | Already integrated | R004 |
| `src/test/unit/common/form/validators/dateNotMoreThanDurationValidator.test.ts` | Already integrated | R004 |
| `src/test/unit/common/form/validators/dateYearValidator.test.ts` | Already integrated | R004 |
| `src/test/unit/common/form/validators/emailValidator.test.ts` | Import/adapt | R020 |
| `src/test/unit/common/form/validators/equalToOrLessThanPropertyValueValidator.test.ts` | Already integrated | R004 |
| `src/test/unit/common/form/validators/howMuchOweAmountValidator.test.ts` | Already integrated | R004 |
| `src/test/unit/common/form/validators/mandatoryValidatorForParty.test.ts` | Already integrated | R004 |
| `src/test/unit/common/form/validators/numberOfPeopleValidator.test.ts` | Already integrated | R004 |
| `src/test/unit/common/form/validators/optionalDateFourDigitValidator.test.ts` | Import/adapt | R029 |
| `src/test/unit/common/form/validators/optionalDateInPastValidator.test.ts` | Import/adapt | R034 |
| `src/test/unit/common/form/validators/optionalDateNotInFutureValidator.test.ts` | Import/adapt | R034 |
| `src/test/unit/common/form/validators/optionalDateNotInPastValidator.test.ts` | Import/adapt | R034 |
| `src/test/unit/common/form/validators/optionalIntegerValidator.test.ts` | Import/adapt | R035 |
| `src/test/unit/common/form/validators/phoneUKValidator.test.ts` | Import/adapt | R020 |
| `src/test/unit/common/form/validators/respondAddInfoValidator.test.ts` | Already integrated | R004 |
| `src/test/unit/common/form/validators/validationConstraints.test.ts` | Exclude | R031 |
| `src/test/unit/common/models/Email.test.ts` | Covered differently | R036 |
| `src/test/unit/common/models/caseProgression/bundles/bundle.test.ts` | Exclude | R037 |
| `src/test/unit/common/models/caseProgression/uploadDocumentsSectionBuilder.test.ts` | Covered differently | R016 |
| `src/test/unit/common/models/caseProgression/uploadDocumentsUserForm.test.ts` | Covered differently | R038 |
| `src/test/unit/common/models/ccdResponse/ccdFixedCosts.test.ts` | Covered differently | R039 |
| `src/test/unit/common/models/claim.test.ts` | Covered differently | R016 |
| `src/test/unit/common/models/dashboard/dashboard.test.ts` | Exclude | R040 |
| `src/test/unit/common/models/dashboard/taskList/civilServiceDashboardTask.test.ts` | Exclude | R041 |
| `src/test/unit/common/models/directionsQuestionnaire/experts/expertReportDetails/expertReportDetails.test.ts` | Defer | R042 |
| `src/test/unit/common/models/directionsQuestionnaire/experts/expertReportDetails/reportDetail.test.ts` | Defer | R043 |
| `src/test/unit/common/models/directionsQuestionnaire/witnesses/otherWitnessItems.test.ts` | Covered differently | R044 |
| `src/test/unit/common/models/feePayment/paymentInformation.test.ts` | Exclude | R045 |
| `src/test/unit/common/models/generalApplication/CourtResponseSummary.test.ts` | Exclude | R046 |
| `src/test/unit/common/models/generalApplication/hearingSupport.test.ts` | Defer | R047 |
| `src/test/unit/common/models/generalApplication/response/gaResponse.test.ts` | Exclude | R048 |
| `src/test/unit/common/models/generalApplication/uploadGAFiles.test.ts` | Import/adapt | R032 |
| `src/test/unit/common/models/generalApplication/uploadN245GAFiles.test.ts` | Import/adapt | R032 |
| `src/test/unit/common/models/mediation/unavailableDatesMediation.test.ts` | Import/adapt | R032 |
| `src/test/unit/common/models/summaryList/summaryList.test.ts` | Covered differently | R016 |
| `src/test/unit/common/models/summaryList/summarySections.test.ts` | Exclude | R049 |
| `src/test/unit/common/utils/calculateMonthlyIncomeExpenses/amountSchedule.test.ts` | Covered differently | R050 |
| `src/test/unit/common/utils/checkYourAnswer/changeButton.test.ts` | Exclude | R051 |
| `src/test/unit/common/utils/cryptoAes.test.ts` | Exclude | R052 |
| `src/test/unit/common/utils/dateFormatter.test.ts` | Already integrated | R004 |
| `src/test/unit/common/utils/dateUtils.test.ts` | Covered differently | R016 |
| `src/test/unit/common/utils/documentSizeDisplayFormatter.test.ts` | Already integrated | R004 |
| `src/test/unit/common/utils/escapeHtml.test.ts` | Already integrated | R004 |
| `src/test/unit/common/utils/externalURLs.test.ts` | Already integrated | R004 |
| `src/test/unit/common/utils/numberConverter.test.ts` | Already integrated | R004 |
| `src/test/unit/common/utils/pageSectionBuilder.test.ts` | Covered differently | R016 |
| `src/test/unit/common/utils/repaymentUtils.test.ts` | Covered differently | R016 |
| `src/test/unit/common/utils/requestUtils.test.ts` | Already integrated | R004 |
| `src/test/unit/common/utils/routeParamUtils.test.ts` | Covered differently | R016 |
| `src/test/unit/common/utils/taskList/respondToClaimSectionBuilder.test.ts` | Covered differently | R053 |
| `src/test/unit/common/utils/taskList/tasks/checkAndSubmitYourResponse.test.ts` | Import/adapt | R021 |
| `src/test/unit/common/utils/taskList/tasks/chooseAResponse.test.ts` | Import/adapt | R021 |
| `src/test/unit/common/utils/taskList/tasks/decideHowYouPay.test.ts` | Import/adapt | R021 |
| `src/test/unit/common/utils/taskList/tasks/shareFinancialDetails.test.ts` | Import/adapt | R021 |
| `src/test/unit/common/utils/taskList/tasks/viewOptionsBeforeDeadline.test.ts` | Import/adapt | R021 |
| `src/test/unit/common/utils/urlFormatter.test.ts` | Already integrated | R004 |
| `src/test/unit/development.test.ts` | Exclude | R031 |
| `src/test/unit/govukFrontend/govukFrontendFixtures.test.ts` | Covered differently | R054 |
| `src/test/unit/govukFrontend/govukFrontendFixturesHelper.test.ts` | Covered differently | R054 |
| `src/test/unit/jest.config.coverage.test.ts` | Exclude | R055 |
| `src/test/unit/modules/appinsights/index.test.ts` | Covered differently | R016 |
| `src/test/unit/modules/cookie/cookieConfig.test.ts` | Covered differently | R056 |
| `src/test/unit/modules/csrf/index.test.ts` | Import/adapt | R020 |
| `src/test/unit/modules/draft-store/draftClaimCache.test.ts` | Import/adapt | R057 |
| `src/test/unit/modules/draft-store/draftGADocumentService.test.ts` | Covered differently | R016 |
| `src/test/unit/modules/draft-store/gaHwFeesDraftStore.test.ts` | Covered differently | R016 |
| `src/test/unit/modules/e2eConfiguration/index.test.ts` | Covered differently | R058 |
| `src/test/unit/modules/error/index.test.ts` | Covered differently | R016 |
| `src/test/unit/modules/health/health-migration-flag-off.test.ts` | Exclude | R059 |
| `src/test/unit/modules/helmet/helmet.test.ts` | Covered differently | R060 |
| `src/test/unit/modules/i18n/languageService.test.ts` | Import/adapt | R020 |
| `src/test/unit/modules/nunjucks/filters/dateFilter.test.ts` | Covered differently | R016 |
| `src/test/unit/modules/nunjucks/filters/govukTaskListItems.test.ts` | Covered differently | R016 |
| `src/test/unit/modules/properties-volume/propertiesVolume.test.ts` | Defer | R061 |
| `src/test/unit/routes/features/caseProgression/hearingFee/payHearingFeeConfirmationController.test.ts` | Exclude | R062 |
| `src/test/unit/routes/features/caseProgression/hearingFee/payHearingFeeStartScreenController.test.ts` | Exclude | R062 |
| `src/test/unit/routes/features/caseProgression/requestForReconsideration/commentsConfirmationController.test.ts` | Exclude | R062 |
| `src/test/unit/routes/features/caseProgression/requestForReconsideration/confirmationController.test.ts` | Exclude | R062 |
| `src/test/unit/routes/features/caseProgression/requestForReconsideration/requestForReviewCommentsController.test.ts` | Exclude | R062 |
| `src/test/unit/routes/features/caseProgression/requestForReconsideration/requestForReviewController.test.ts` | Exclude | R062 |
| `src/test/unit/routes/features/caseProgression/trialArrangements/cancelTrialArrangements.test.ts` | Exclude | R062 |
| `src/test/unit/routes/features/caseProgression/trialArrangements/finaliseTrialArrangementsController.test.ts` | Exclude | R062 |
| `src/test/unit/routes/features/caseProgression/trialArrangements/hearingDurationAndOtherInformationController.test.ts` | Exclude | R062 |
| `src/test/unit/routes/features/caseProgression/uploadYourDocumentsController.test.ts` | Exclude | R062 |
| `src/test/unit/routes/features/claim/airlines/flightDetailsController.test.ts` | Exclude | R062 |
| `src/test/unit/routes/features/claim/checkAnswersController.test.ts` | Exclude | R062 |
| `src/test/unit/routes/features/claim/claimTaskListController.test.ts` | Exclude | R062 |
| `src/test/unit/routes/features/claim/createClaimDraft.test.ts` | Exclude | R062 |
| `src/test/unit/routes/features/claim/generalApplication/addAnotherApplicationController.test.ts` | Exclude | R062 |
| `src/test/unit/routes/features/claim/generalApplication/additionalDocuments/submittedController.test.ts` | Exclude | R062 |
| `src/test/unit/routes/features/claim/generalApplication/additionalInfoUpload/checkAnswerController.test.ts` | Exclude | R062 |
| `src/test/unit/routes/features/claim/generalApplication/additionalInfoUpload/moreInfoSubmittedConfirmationController.test.ts` | Exclude | R062 |
| `src/test/unit/routes/features/claim/generalApplication/additionalInfoUpload/respondAddInfoController.test.ts` | Exclude | R062 |
| `src/test/unit/routes/features/claim/generalApplication/applicationSummaryController.test.ts` | Exclude | R062 |
| `src/test/unit/routes/features/claim/generalApplication/certOfSorC/askProofOfDebtPaymentGuidanceController.test.ts` | Exclude | R062 |
| `src/test/unit/routes/features/claim/generalApplication/certOfSorC/submitCoScApplicationConfirmationController.test.ts` | Adapted | R062; R089 |
| `src/test/unit/routes/features/claim/generalApplication/directionsOrderUpload/checkAnswerController.test.ts` | Exclude | R062 |
| `src/test/unit/routes/features/claim/generalApplication/directionsOrderUpload/directionsOrderSubmittedConfirmationController.test.ts` | Exclude | R062 |
| `src/test/unit/routes/features/claim/generalApplication/respondentAgreeToOrderController.test.ts` | Exclude | R062 |
| `src/test/unit/routes/features/claim/generalApplication/respondentRequestChangeInformationController.test.ts` | Exclude | R062 |
| `src/test/unit/routes/features/claim/generalApplication/response/checkAnswersResponseController.test.ts` | Exclude | R062 |
| `src/test/unit/routes/features/claim/generalApplication/response/respondentAgreementController.test.ts` | Exclude | R062 |
| `src/test/unit/routes/features/claim/generalApplication/response/respondentHearingPreferenceController.test.ts` | Exclude | R062 |
| `src/test/unit/routes/features/claim/generalApplication/response/viewApplicationController.test.ts` | Exclude | R062 |
| `src/test/unit/routes/features/claim/generalApplication/submitApplicationOfflineController.test.ts` | Exclude | R062 |
| `src/test/unit/routes/features/claim/generalApplication/submitGeneralApplicationConfirmationController.test.ts` | Adapted | R062; R089 |
| `src/test/unit/routes/features/claim/generalApplication/uploadN245FormController.test.ts` | Exclude | R062 |
| `src/test/unit/routes/features/claim/generalApplication/writtenRepresentationDocs/checkAnswerController.test.ts` | Exclude | R062 |
| `src/test/unit/routes/features/claim/generalApplication/writtenRepresentationDocs/respondWrittenRepController.test.ts` | Exclude | R062 |
| `src/test/unit/routes/features/claim/incompleteClaimIssueSubmissionController.test.ts` | Exclude | R062 |
| `src/test/unit/routes/features/claim/payment/claimFeeBreakDownController.test.ts` | Exclude | R062 |
| `src/test/unit/routes/features/claim/payment/claimFeePaymentSuccessfulController.test.ts` | Exclude | R062 |
| `src/test/unit/routes/features/claim/payment/claimFeePaymentUnsuccessfulController.test.ts` | Exclude | R062 |
| `src/test/unit/routes/features/claim/paymentSuccessfulController.test.ts` | Exclude | R062 |
| `src/test/unit/routes/features/claim/yourDetails/timelineController.test.ts` | Exclude | R062 |
| `src/test/unit/routes/features/claimantResponse/ccj/judgmentAmountSummaryController.test.ts` | Exclude | R062 |
| `src/test/unit/routes/features/claimantResponse/ccj/judgmentAmountSummaryExtendedController.test.ts` | Exclude | R062 |
| `src/test/unit/routes/features/claimantResponse/ccj/repaymentPlanSummaryDefendantController.test.ts` | Exclude | R062 |
| `src/test/unit/routes/features/claimantResponse/claimantResponseTasklistController.test.ts` | Exclude | R062 |
| `src/test/unit/routes/features/claimantResponse/claimantSuggestedInstalmentsController.test.ts` | Exclude | R062 |
| `src/test/unit/routes/features/claimantResponse/courtProposedDateController.test.ts` | Exclude | R062 |
| `src/test/unit/routes/features/claimantResponse/courtProposedPlanController.test.ts` | Exclude | R062 |
| `src/test/unit/routes/features/claimantResponse/rejectionReasonController.test.ts` | Exclude | R062 |
| `src/test/unit/routes/features/claimantResponse/reviewDefendantsResponseController.test.ts` | Exclude | R062 |
| `src/test/unit/routes/features/claimantResponse/settleAdmittedController.test.ts` | Exclude | R062 |
| `src/test/unit/routes/features/dashboard/claimSummaryController.test.ts` | Exclude | R062 |
| `src/test/unit/routes/features/dashboard/claimantDashboardController.test.ts` | Exclude | R062 |
| `src/test/unit/routes/features/dashboard/contactThemController.test.ts` | Exclude | R062 |
| `src/test/unit/routes/features/dashboard/dashboardController.test.ts` | Exclude | R062 |
| `src/test/unit/routes/features/dashboard/notificationRedirectController.test.ts` | Exclude | R062 |
| `src/test/unit/routes/features/dashboard/ordersAndNoticesController.test.ts` | Exclude | R062 |
| `src/test/unit/routes/features/dashboard/viewBreathingSpaceInformationController.test.ts` | Exclude | R062 |
| `src/test/unit/routes/features/dashboard/viewResponseToClaimController.test.ts` | Exclude | R062 |
| `src/test/unit/routes/features/directionsQuestionnaire/fixedRecoverableCosts/chooseComplexityBandController.test.ts` | Exclude | R062 |
| `src/test/unit/routes/features/directionsQuestionnaire/fixedRecoverableCosts/frcBandAgreedController.test.ts` | Exclude | R062 |
| `src/test/unit/routes/features/directionsQuestionnaire/fixedRecoverableCosts/reasonForChoosingComplexityBandController.test.ts` | Exclude | R062 |
| `src/test/unit/routes/features/directionsQuestionnaire/fixedRecoverableCosts/subjectToFRCController.test.ts` | Exclude | R062 |
| `src/test/unit/routes/features/directionsQuestionnaire/fixedRecoverableCosts/whyNotSubjectToFRCController.test.ts` | Exclude | R062 |
| `src/test/unit/routes/features/directionsQuestionnaire/supportRequiredController.test.ts` | Exclude | R062 |
| `src/test/unit/routes/features/document/mediation/viewMediationDocumentsController.test.ts` | Exclude | R062 |
| `src/test/unit/routes/features/document/mediation/viewSettlementAgreementDocumentController.test.ts` | Exclude | R062 |
| `src/test/unit/routes/features/judgmentOnline/confirmYouHaveBeenPaidController.test.ts` | Exclude | R062 |
| `src/test/unit/routes/features/mediation/contactNameMediationConfirmationController.test.ts` | Exclude | R062 |
| `src/test/unit/routes/features/mediation/emailMediationConfirmationController.test.ts` | Exclude | R062 |
| `src/test/unit/routes/features/mediation/mediationUnavailabilityNextThreeMonthsConfirmationController.test.ts` | Exclude | R062 |
| `src/test/unit/routes/features/mediation/mediationUnavailabilitySelectDatesController.test.ts` | Exclude | R062 |
| `src/test/unit/routes/features/mediation/telephoneMediationConfirmationController.test.ts` | Exclude | R062 |
| `src/test/unit/routes/features/mediation/telephoneMediationController.test.ts` | Exclude | R062 |
| `src/test/unit/routes/features/mediation/uploadDocuments/checkAnswersController.test.ts` | Exclude | R062 |
| `src/test/unit/routes/features/public/cookiesController.test.ts` | Exclude | R062 |
| `src/test/unit/routes/features/public/eligibility/eligibleController.test.ts` | Exclude | R062 |
| `src/test/unit/routes/features/public/eligibility/tryNewServiceController.test.ts` | Exclude | R062 |
| `src/test/unit/routes/features/public/eligibility/youCanUseServiceController.test.ts` | Exclude | R062 |
| `src/test/unit/routes/features/public/firstContact/claimSummaryController.test.ts` | Exclude | R062 |
| `src/test/unit/routes/features/queryManagement/createQueryCheckYourAnswerController.test.ts` | Exclude | R062 |
| `src/test/unit/routes/features/queryManagement/qmInformationController.test.ts` | Exclude | R062 |
| `src/test/unit/routes/features/queryManagement/qmStartController.test.ts` | Exclude | R062 |
| `src/test/unit/routes/features/queryManagement/qmViewQueriesController.test.ts` | Exclude | R062 |
| `src/test/unit/routes/features/queryManagement/qmViewQueryDetailsController.test.ts` | Exclude | R062 |
| `src/test/unit/routes/features/queryManagement/qmWhatToDoController.test.ts` | Exclude | R062 |
| `src/test/unit/routes/features/queryManagement/shareQueryConfirmationController.test.ts` | Exclude | R062 |
| `src/test/unit/routes/features/response/eligibility/sendYourResponseByEmailController.test.ts` | Exclude | R062 |
| `src/test/unit/routes/features/response/incompleteSubmissionController.test.ts` | Exclude | R062 |
| `src/test/unit/routes/features/response/responseDeadline/newResponseDeadlineController.test.ts` | Exclude | R062 |
| `src/test/unit/routes/features/response/submitComfirmationController.test.ts` | Exclude | R062 |
| `src/test/unit/routes/features/settlementAgreement/respondSettlementAgreementConfirmationController.test.ts` | Exclude | R062 |
| `src/test/unit/routes/features/uiPreview/uiPreviewController.test.ts` | Covered differently | R058 |
| `src/test/unit/routes/guards/GaTrackHistory.test.ts` | Exclude | R062 |
| `src/test/unit/routes/guards/claimantResponsecheckYourAnswersGuard.test.ts` | Exclude | R062 |
| `src/test/unit/routes/guards/partAdmitGuard.test.ts` | Exclude | R062 |
| `src/test/unit/routes/guards/partAdmitHowMuchHaveYouPaidGuard.test.ts` | Adapted | R062; R089 |
| `src/test/unit/routes/guards/pcqGuard.test.ts` | Exclude | R062 |
| `src/test/unit/routes/guards/pcqGuardClaim.test.ts` | Exclude | R062 |
| `src/test/unit/routes/guards/redisDataFlushForDJGuard.test.ts` | Exclude | R062 |
| `src/test/unit/routes/guards/uploadRateLimitGuard.test.ts` | Exclude | R062 |
| `src/test/unit/routes/homeController.test.ts` | Exclude | R062 |
| `src/test/unit/routes/unauthorisedController.test.ts` | Exclude | R062 |
| `src/test/unit/services/features/caseProgression/disclosureContentBuilder.test.ts` | Exclude | R063 |
| `src/test/unit/services/features/caseProgression/documentTableBuilder.test.ts` | Covered differently | R064 |
| `src/test/unit/services/features/caseProgression/expertContentBuilder.test.ts` | Exclude | R063 |
| `src/test/unit/services/features/caseProgression/hearingFee/applyHelpFeeReferenceContents.test.ts` | Exclude | R063 |
| `src/test/unit/services/features/caseProgression/hearingFee/applyHelpFeeSelectionButtonContents.test.ts` | Exclude | R063 |
| `src/test/unit/services/features/caseProgression/hearingFee/applyHelpFeeSelectionContents.test.ts` | Exclude | R063 |
| `src/test/unit/services/features/caseProgression/hearingFee/paymentServiceUtils.test.ts` | Import/adapt | R065 |
| `src/test/unit/services/features/caseProgression/judgement/judgementService.test.ts` | Covered differently | R016 |
| `src/test/unit/services/features/caseProgression/requestForReconsideration/requestForReviewCommentsContent.test.ts` | Exclude | R063 |
| `src/test/unit/services/features/caseProgression/requestForReconsideration/requestForReviewContent.test.ts` | Exclude | R063 |
| `src/test/unit/services/features/caseProgression/requestForReconsideration/requestForReviewService.test.ts` | Covered differently | R066 |
| `src/test/unit/services/features/caseProgression/trialArrangements/finaliseYourTrialStartScreenContent.test.ts` | Exclude | R063 |
| `src/test/unit/services/features/caseProgression/trialArrangements/trialArrangementsConfirmationContent.test.ts` | Exclude | R063 |
| `src/test/unit/services/features/caseProgression/trialContentBuilder.test.ts` | Exclude | R063 |
| `src/test/unit/services/features/caseProgression/uploadYourDocumentsContents.test.ts` | Exclude | R063 |
| `src/test/unit/services/features/caseProgression/witnessContentBuilder.test.ts` | Exclude | R063 |
| `src/test/unit/services/features/caseProgression/witnessService.test.ts` | Adapted | R016; R089 |
| `src/test/unit/services/features/claim/checkAnswers/checkAnswersService.test.ts` | Covered differently | R016 |
| `src/test/unit/services/features/claim/checkAnswers/claimSection/addEvidence.test.ts` | Covered differently | R067 |
| `src/test/unit/services/features/claim/checkAnswers/claimSection/addTimeLine.test.ts` | Covered differently | R068 |
| `src/test/unit/services/features/claim/partyTypeService.test.ts` | Covered differently | R069 |
| `src/test/unit/services/features/claim/payment/claimFeePaymentConfirmationContent.test.ts` | Exclude | R063 |
| `src/test/unit/services/features/claim/payment/claimFeePaymentSuccessfulSectionBuilder.test.ts` | Covered differently | R070 |
| `src/test/unit/services/features/claim/paymentSuccessfulSectionBuilder.test.ts` | Covered differently | R071 |
| `src/test/unit/services/features/claimantResponse/checkAnswers/buildFreeTelephoneMediationSection.test.ts` | Exclude | R063 |
| `src/test/unit/services/features/claimantResponse/checkAnswers/hearing/addSupportRequiredListService.test.ts` | Exclude | R063 |
| `src/test/unit/services/features/claimantResponse/claimantResponseConfirmation/confirmationContentBuilder/ccjConfirmationBuilder.test.ts` | Exclude | R063 |
| `src/test/unit/services/features/claimantResponse/claimantResponseConfirmation/confirmationContentBuilder/claimSettleConfirmationBuilder.test.ts` | Exclude | R063 |
| `src/test/unit/services/features/claimantResponse/claimantResponseConfirmation/confirmationContentBuilder/confirmationContentBuilder.test.ts` | Exclude | R063 |
| `src/test/unit/services/features/claimantResponse/claimantResponseConfirmation/confirmationContentBuilder/disputeConfirmationContentBuilder.test.ts` | Exclude | R063 |
| `src/test/unit/services/features/claimantResponse/claimantResponseConfirmation/confirmationContentBuilder/financialDetailsBuilder.test.ts` | Exclude | R063 |
| `src/test/unit/services/features/claimantResponse/claimantResponseConfirmation/confirmationContentBuilder/mediationConfirmationContentBuilder.test.ts` | Exclude | R063 |
| `src/test/unit/services/features/claimantResponse/claimantResponseConfirmation/confirmationContentBuilder/partAdmitConfirmationContentBuilder.test.ts` | Exclude | R063 |
| `src/test/unit/services/features/claimantResponse/claimantResponseTasklistService/claimantResponseTasks/claimantHearingRequirementsSectionTasks.test.ts` | Exclude | R063 |
| `src/test/unit/services/features/claimantResponse/claimantResponseTasklistService/claimantResponseTasks/howDefendantRespondSectionTaks.test.ts` | Exclude | R063 |
| `src/test/unit/services/features/claimantResponse/claimantSuggestedInstalmentsService.test.ts` | Covered differently | R016 |
| `src/test/unit/services/features/claimantResponse/defendantResponse/fullAdmissinionDefendantsResponseContent.test.ts` | Exclude | R063 |
| `src/test/unit/services/features/claimantResponse/defendantResponse/fullAdmissionPayInstallmentsDefendantResponseContent.test.ts` | Exclude | R063 |
| `src/test/unit/services/features/claimantResponse/defendantResponse/fullDisputeDefendantsResponseContent.test.ts` | Exclude | R063 |
| `src/test/unit/services/features/claimantResponse/defendantResponse/partAdmissionAlreadyPaidDefendantsResponseContent.test.ts` | Exclude | R063 |
| `src/test/unit/services/features/claimantResponse/defendantResponse/partAdmitNotPaidDefendantsResponseContent.test.ts` | Exclude | R063 |
| `src/test/unit/services/features/claimantResponse/signSettlmentAgreementService.test.ts` | Exclude | R063 |
| `src/test/unit/services/features/common/claimTimelineService.test.ts` | Covered differently | R072 |
| `src/test/unit/services/features/dashboard/claimSummary/latestUpdate/latestUpdateContent/claimDismissedHearingDueDateUploadContent.test.ts` | Exclude | R063 |
| `src/test/unit/services/features/dashboard/claimSummary/latestUpdate/latestUpdateContent/evidenceUploadContent.test.ts` | Exclude | R063 |
| `src/test/unit/services/features/dashboard/claimSummary/latestUpdate/latestUpdateContent/newUploadContent.test.ts` | Exclude | R063 |
| `src/test/unit/services/features/eligibility/eligibleService.test.ts` | Covered differently | R073 |
| `src/test/unit/services/features/generalApplication/applicationCostsService.test.ts` | Covered differently | R016 |
| `src/test/unit/services/features/generalApplication/applicationFeePaymentConfirmationContent.test.ts` | Exclude | R063 |
| `src/test/unit/services/features/generalApplication/checkAnswers/addCheckAnswersRows.test.ts` | Defer | R074 |
| `src/test/unit/services/features/generalApplication/feeDetailsService.test.ts` | Covered differently | R016 |
| `src/test/unit/services/features/generalApplication/generalApplicationService.test.ts` | Covered differently | R016 |
| `src/test/unit/services/features/generalApplication/response/generalApplicationResponseService.test.ts` | Covered differently | R016 |
| `src/test/unit/services/features/generalApplication/response/generalApplicationResponseStoreService.test.ts` | Covered differently | R016 |
| `src/test/unit/services/features/generalApplication/submitGeneralApplicationConfirmationContent.test.ts` | Adapted | R075; R089 |
| `src/test/unit/services/features/mediation/uploadDocuments/buildYourStatementSummaryRows.test.ts` | Exclude | R063 |
| `src/test/unit/services/features/mediation/uploadDocuments/documentsForDocumentsReferredService.test.ts` | Covered differently | R076 |
| `src/test/unit/services/features/mediation/uploadDocuments/mediationCancelUploadService.test.ts` | Covered differently | R077 |
| `src/test/unit/services/features/mediation/uploadDocuments/yourStatementService.test.ts` | Covered differently | R078 |
| `src/test/unit/services/features/queryManagement/viewQueriesService.test.ts` | Import/adapt | R020 |
| `src/test/unit/services/features/response/checkAnswers/caseProgression/requestForReconsideration/buildRequestForReconsiderationConfirmationSection.test.ts` | Covered differently | R079 |
| `src/test/unit/services/features/response/checkAnswers/financialSection/buildYourFinancialSection.test.ts` | Exclude | R080 |
| `src/test/unit/services/features/response/statementOfMeans/bankAccounts/bankAccountConverter.test.ts` | Covered differently | R016 |
| `src/test/unit/services/features/response/statementOfMeans/employment/employerService.test.ts` | Import/adapt | R021 |
| `src/test/unit/services/features/response/statementOfMeans/employment/employmentConverter.test.ts` | Import/adapt | R021 |
| `src/test/unit/services/features/response/statementOfMeans/partner/cohabitingService.test.ts` | Covered differently | R081 |
| `src/test/unit/services/features/response/statementOfMeans/partner/partnerAgeService.test.ts` | Covered differently | R081 |
| `src/test/unit/services/features/response/statementOfMeans/partner/partnerDisabilityService.test.ts` | Covered differently | R081 |
| `src/test/unit/services/features/response/statementOfMeans/partner/partnerPensionService.test.ts` | Covered differently | R081 |
| `src/test/unit/services/features/response/statementOfMeans/partner/partnerSevereDisabilityService.test.ts` | Covered differently | R081 |
| `src/test/unit/services/features/response/statementOfMeans/severeDisabilityService.test.ts` | Covered differently | R081 |
| `src/test/unit/services/features/response/submitConfirmation/submitConfirmationBuilder/admissionSubmitConfirmationContent.test.ts` | Exclude | R063 |
| `src/test/unit/services/features/response/submitConfirmation/submitConfirmationBuilder/fullDefenceConfirmationContent.test.ts` | Exclude | R063 |
| `src/test/unit/services/features/response/submitConfirmation/submitConfirmationBuilder/mediationCarmContent.test.ts` | Exclude | R063 |
| `src/test/unit/services/features/response/submitConfirmation/submitConfirmationBuilder/partAdmissionConfirmationContent.test.ts` | Exclude | R063 |
| `src/test/unit/services/features/response/submitConfirmation/submitConfirmationBuilder/rejectClaimConfirmationContent.test.ts` | Exclude | R063 |
| `src/test/unit/services/features/response/submitConfirmation/submitConfirmationBuilder/submitConfirmationBuilder.test.ts` | Exclude | R063 |
| `src/test/unit/services/features/response/timelineOfEvents/defendantTimelineService.test.ts` | Adapted | R016; R089 |
| `src/test/unit/services/features/settlementAgreement/respondSettlementAgreementConfirmationContentService.test.ts` | Exclude | R063 |
| `src/test/unit/services/features/settlementAgreement/respondSettlementAgreementService.test.ts` | Exclude | R063 |
| `src/test/unit/services/features/settlementAgreement/settlementAgreementConfirmationBuilder/confirmationContentBuilder.test.ts` | Exclude | R063 |
| `src/test/unit/services/features/uiPreview/pageCatalog.test.ts` | Covered differently | R058 |
| `src/test/unit/services/features/uiPreview/uiPreviewClaimantResponseFixtures.test.ts` | Covered differently | R058 |
| `src/test/unit/services/features/uiPreview/uiPreviewSomFixtures.test.ts` | Covered differently | R058 |
| `src/test/unit/services/firstcontact/firstcontactService.test.ts` | Import/adapt | R029 |
| `src/test/unit/services/genericForm/genericFormService.test.ts` | Import/adapt | R029 |
| `src/test/unit/services/translation/caseProgression/requestForReconsideration/convertToCCDRequestForReconsideration.test.ts` | Import/adapt | R029 |
| `src/test/unit/services/translation/claimantResponse/convertToCCDClaimantLiPResponse.test.ts` | Import/adapt | R029 |
| `src/test/unit/services/translation/claimantResponse/convertToCCDClaimantMediation.test.ts` | Import/adapt | R082 |
| `src/test/unit/services/translation/convertToCUI/convertToCUIFixedRecoverableCosts.test.ts` | Import/adapt | R029 |
| `src/test/unit/services/translation/convertToCUI/convertToCUIMediationCarm.test.ts` | Import/adapt | R029 |
| `src/test/unit/services/translation/convertToCUI/convertToCUIYesNo.test.ts` | Import/adapt | R083 |
| `src/test/unit/services/translation/convertToCUI/cuiTranslation.test.ts` | Covered differently | R016 |
| `src/test/unit/services/translation/response/convertToCCDFlightDetails.test.ts` | Import/adapt | R029 |
| `src/test/unit/services/translation/response/convertToCCDRespondToClaim.test.ts` | Covered differently | R016 |
| `src/test/utils/govukFrontendFixturesHelper.ts` | Adapted | R015 |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-case-progression-upload-documents.html` | Adapted | R015 |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-directions-questionnaire-expert-report-details.html` | Adapted | R015 |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-directions-questionnaire-support-required.html` | Adapted | R015 |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-mediation-unavailable-dates.html` | Adapted | R015 |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-mediation-upload-documents.html` | Adapted | R015 |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-response-evidence.html` | Adapted | R015 |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-response-statement-of-means-court-orders.html` | Adapted | R015 |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-response-timeline.html` | Adapted | R015 |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-response-your-details.html` | Adapted | R015 |
| `src/test/utils/mocks/a11y/mock-claim-1645882162449409-fee-change.html` | Adapted | R015 |
| `src/test/utils/mocks/a11y/mock-claim-1645882162449409-fee.html` | Adapted | R015 |
| `src/test/utils/mocks/a11y/mock-claim-evidence.html` | Adapted | R015 |
| `src/test/utils/mocks/a11y/mock-claim-timeline.html` | Adapted | R015 |
| `src/test/utils/mocks/a11y/mock-dashboard.html` | Adapted | R015 |
| `src/test/utils/mocks/a11y/mock-make-claim.html` | Adapted | R015 |
| `tsconfig.jest.integration.json` | Adapted | R003 |
| `tsconfig.jest.json` | Adapted | R003 |
| `tsconfig.json` | Adapted | R003 |
| `webpack.config.js` | Adapted | R009 |
| `webpack/ministryOfJusticeFrontend.js` | Already integrated | R002 |
| `webpack/scss.js` | Adapted | R009 |
| `win.eslint.json` | Already integrated | R002 |
| `yarn-audit-known-issues` | Adapted | R003 |
| `yarn.lock` | Adapted | R003 |

</details>

<details>
<summary>Evidence and adaptation reasons</summary>

| Code | Reason / current owner |
| --- | --- |
| R001 | Fork-wide planning/operational/AI documentation not an application requirement; current README/test-pyramid/stage/preview guidance retained; broad future template consolidation remains separately owned. |
| R002 | Fork retirement already satisfied; path absent. |
| R003 | Retain reconciled PR2 pins/security/audit/automation and master test pyramid/runtime. Deferred fork runtime majors, obsolete scripts and suppressions excluded. PR11 adds the UTC baseline in jest.config.js for host-independent unit date assertions; the other files using this code remain unchanged by PR11. |
| R004 | Current bytes equal exact fork reference. |
| R005 | Current staged implementation and master fixes retained; fork whole-file replacement rejected. Relevant current tests and stage records are the review evidence, not remote/whole-ticket approval. |
| R006 | Restricted PR10 catalogue/fixtures/local service setup replaces unsafe fork exposure; see docs/ui-preview.md and current preview security tests. |
| R007 | Current integrated commands/test ownership and restricted-preview operating guidance replace stale fork instructions. |
| R008 | Retain current supported libraries, master authentication/telemetry/rate-limiter behaviour and explicitly gated PR10 preview; do not import fork runtime-major adaptations or auth exemptions. |
| R009 | Current PR3–PR9 CUI/legacy ownership, server-managed uploads, calculation behaviour and proven MOJ/jQuery retirement replace fork-specific wiring; existing regressions retained. |
| R010 | PR3–PR9 current components/templates preserve master content and contracts; preview-only changes gated in PR10. Exact-fork overwrite excluded; see stage records and actual-template suites. |
| R011 | Do not blanket-hide invalid dates/missing documents or replace timeline recovery/comments. Presentation-safe adaptations already in PR9 are retained; remaining recovery requires a separate trigger/contract decision. |
| R012 | Fork admitted-amount/recovery changes are substantive financial behaviour; preserve current master semantics and existing regressions. |
| R013 | Retain master AES-GCM first-contact rollout format and guards; incompatible fork format is intentionally not integrated. |
| R014 | Retain current GA identity/type/fee/draft guards and explicitly paired fee/application metadata. Fork broad fallback or recovery changes remain separate production-triggered work; PR11 tests valid explicit pairing. |
| R015 | Current stage-specific fixtures/helpers/assertions retain approved captured data and test ownership; see PR3–PR10 evidence and current consumers. |
| R016 | Current same-path suite retained with master/PR1–PR10 behaviour; additional fork-only assertions need the separately recorded route/service assessment, not wholesale overwrite. |
| R017 | Fork suppression/capture inventory assumptions; current presentationCaptures tests preserve real consumers without importing global accessibility ignores. |
| R018 | Current PR10 uiPreviewConfig/Fixtures/Isolation suites exercise explicit enablement, local TestData and ordinary-e2e separation; retain SDK 8 API and do not port SDK-major assumptions. |
| R019 | Constant-expansion smoke tests repeat route constants. Current Pact consumer request paths remain the behavioural contract. |
| R020 | Adapted fork isolated client/language/validation/query/CSRF coverage; no app boot. Omitted implementation-only metadata and invalid-auth smoke assertions; strengthened invocation/order/payload checks. |
| R021 | Adapted fork missing-value/boundary/serialization or task-status coverage for unchanged production module; clock fixed where relevant; service writes asserted completely. |
| R022 | Constant-expansion smoke tests repeat route constants. Current GA Pact consumers check the service request paths. |
| R023 | Named follow-up: PCQ token wire-format compatibility coverage. Hex/determinism smoke checks lack an independent decoder or legacy ciphertext vector; obtain the protocol contract rather than transplanting a weak cryptographic oracle. |
| R024 | Assertions test object literals created by the test against TypeScript interfaces; no runtime production behaviour is executed. |
| R025 | PR3/PR5/PR7 current add-another, dq/remaining-repeated-rows, postcode and PR9 repayment suites test actual rendered markup; deleted legacy implementation ports excluded. |
| R026 | Named follow-up: isolated legacy cookie-banner DOM coverage with actual cookie-page markup. Fork simplified document fixtures are unrelated to the migrated PR3–PR10 components; preserve existing consent/Dynatrace regressions. |
| R027 | The exact fork contains five positive payment-path submit-button cases and one nonmatching-path case. Retain these useful assertions in disable-submit.test.ts, adapting execution to an isolated JSDOM window, native submit-event dispatch and per-test window cleanup. No Node global DOM replacement or production script change is needed. |
| R028 | Named follow-up: legacy language-toggle URL/query preservation using real shell markup. Keep current real-shell language, en/cy template and preview route checks; do not claim those exhaust standalone-script edge cases. |
| R029 | Adapted exact-fork isolated unit coverage; production module unchanged. |
| R030 | Current judgmentOnline/confirmYouHaveBeenPaidController tests exercise saved/invalid date submissions and confirmation; BaseDate/optional-date suites now independently cover date ranges. Constructor-only duplication is not imported. |
| R031 | Import/config/constant/constructor smoke assertions do not add a demonstrated behavioural regression; retain consumer validation tests. |
| R032 | Adapted fork validation coverage for current CARM dates, financial-source messages or master null/empty saved-document guards; no production change. |
| R033 | Current priorityDebtsService and convertToCUIPriorityDebts/convertToCCDRecurringIncome suites assert amounts, schedules and active categories; fork constructor/type-only and existence checks are not stronger conversion evidence. |
| R034 | Fork optional-date cases adapted to a fixed local clock and exact midnight/millisecond boundaries. |
| R035 | Fork optional-integer cases extended with whitespace, exponent, sign and null boundaries. |
| R036 | Current partyDetails/address form tests plus new EmailValidator and EmailValidationWithMessage suites cover optional/invalid/valid email and error mapping; a second constructor smoke suite is not imported. |
| R037 | Two constructor/date-display smoke checks are not adopted as additional behavioural protection; current bundle/document journeys remain. |
| R038 | PR8 uploadTemplates and repeatedUploads/queryUploads integration tests validate all category/action mappings and surviving complete model data. New GA saved-document guard tests cover null/empty references. Fork constructor-only portions omitted. |
| R039 | Current CCD translation suites and new toCUIFixedRecoverableCosts cases assert the financial mapping; do not add another mostly constructor/absent-wrapper smoke file. |
| R040 | Constructor/default-array smoke assertions; actual dashboard/task-list template tests retain ordered data and links. |
| R041 | Copies constructor arguments into assertions without testing task state, navigation or rendering; PR4 adapter/templates own those behaviours. |
| R042 | Named follow-up: dormant expert-report editor/model ownership. Its question template does not activate the repeated report-detail editor. Do not adopt or activate that separate editor as test reconciliation. |
| R043 | Named follow-up: dormant expert-report editor/model ownership and date-validation contract; current active expert-details editor and generic date validators are retained. |
| R044 | PR7 dqRepeatedRowTemplates/dq-repeated-rows tests render actual witness fields and interpret submissions through witness services/models; new email/phone validators separately pin optional/invalid behaviour. |
| R045 | Only assigns constructor arguments/undefined fields. Real claim/GA/hearing payment-reference and persistence tests provide behavioural coverage. |
| R046 | Only assigns constructor arguments; current actual GA/dashboard rendering retains the rows, links and content. |
| R047 | Residual GA support coverage: the real HearingSupport model nests validation only for sign-language, language and other-support details; step-free access/hearing loop have no content fields. The fork standalone Support failure assertion is not an oracle for the real POST model. Preserve current rules; any fuller isolated coverage remains outside this selective suite import, not a promised production correction. |
| R048 | Constructor/default-array smoke checks. Current GA response/draft-store suites preserve submitted models and state. |
| R049 | Constructor smoke assertions duplicate actual summary-list and rendered-table/template coverage without exercising escaping or navigation. |
| R050 | Current monthlyIncomeExpensesCalculator tests exercise frequency-to-month calculations; PR7 remaining-repeated-rows tests cover dynamic totals. Static constructor/constant repetition excluded. |
| R051 | Mocks i18next as key passthrough and checks the same returned key; current bilingual actual-template CYA checks are the rendering evidence. |
| R052 | Fork-only incompatible encryption format; retain firstcontact/sessionValueCrypto fixed legacy ciphertext and tamper cases. |
| R053 | Current common/utils/taskList/taskListBuilder.test.ts checks full/part admission, defence, task ordering and destinations through buildRespondToClaimSection. New five task-provider suites add missing direct status/availability edges. |
| R054 | presentationGovukFixtures.test.ts validates nonempty installed fixture discovery and parity; presentationTemplates/Captures assert actual application composition. |
| R055 | Asserts fork coverage configuration; test ownership/thresholds deliberately retained from master. |
| R056 | Current cookieConfigDynatraceUser and PR9 real-shell consent/Dynatrace suites preserve event/user/consent behaviour; do not replace with the fork bootstrap mock. |
| R057 | Fork draft-cache suite rewritten for current master: cloned defaults, complete write/TTL/owner payload and rejected writes; no obsolete CARM phone mutation. |
| R058 | Current uiPreview unit and route integration suites exercise explicit enablement, real routes, fixture keys and launcher isolation; exclude unconditional fork preview tests. |
| R059 | Fork adds Supertest under unit ownership. Retain current health module suites and security/journey integration ownership; no new unit HTTP application test is introduced. |
| R060 | Current modules/helmet.test.ts checks actual security headers; PR9 real-shell and PR10 boundary tests preserve CSP/nonces and disabled-preview behaviour. Do not import an alternative mock-only bootstrap test. |
| R061 | Named follow-up: configuration/secret-volume unit isolation with explicit environment restoration and fake config; no preview/production secret wiring changes belong to PR11. |
| R062 | Do not import the fork HTTP-under-unit suite/extra HTTP cases. Retain current handler-level assertions and named integration owners in docs/test-pyramid.md. Additional isolated handler edges can be assessed in their owning journey; no claim that every fork assertion is duplicated. |
| R063 | Separate fork content-key/existence smoke suite not adopted; current journey/controller/template assertions retain production content. This is a scope decision, not a claim of line-for-line coverage equivalence. |
| R064 | PR8 upload/document and PR9 document/table rendering tests preserve order, links and empty states from actual builders; a second partial existence/first-row suite is not imported. |
| R065 | Fork hearing-payment suite strengthened for master reference guard, exact claim/fee/owner arguments, pending/failed/error paths; no application boot. |
| R066 | Current requestForReview/requestForReviewComments controller suites and confirmation-content tests exercise claimant/defendant models and returned sections; retain current service inputs. |
| R067 | Current claim checkAnswersService and PR3 real evidence template suites cover empty/populated evidence. Fork title/first-row smoke suite omitted. |
| R068 | Current claim checkAnswersService, PR7 timeline and PR9 presentationSummaries suites retain ordered dates/descriptions and empty data. No alternate timeline recovery imported. |
| R069 | Current party-type handler and claimIssue integration tests retain unknown type/not-found behaviour; avoid a duplicate Express render mock suite. |
| R070 | Current claim payment confirmation and PR9 amount-summary tests assert references/fee data; constructor/first-section existence assertions do not replace those contracts. |
| R071 | Current claim payment confirmation and section-builder consumers retain payment reference/summary; fork first-string smoke checks omitted. |
| R072 | Current timeline/table and checkAnswers suites assert actual ordered date/description output; retain master recovery/comments rather than adding shallow empty/first-row duplication. |
| R073 | Current eligibility.integration and handler suites cover HWF/eligible states and approved content; isolated key-passthrough smoke checks add no distinct submission contract. |
| R074 | Named follow-up: exhaustive GA CYA producer contracts. Reconcile every row with current summaryRowWithTextValue HTML-safety semantics and real application identity before adopting the fork key/existence assertions. Current GA integration/summary safety tests remain. |
| R075 | Fork confirmation-content coverage adapted to explicit current application/fee pair; unsafe first-GA/draft-fee/NaN fallback tests excluded. |
| R076 | Current documentsForDocumentsReferredContentBuilder, PR8 uploadTemplates and repeatedUploads integration suites check saved rows/category/actions; unsafe default-array recovery is not imported. |
| R077 | Current mediation cancel-upload controller/service/route tests retain action values and draft removal; fork first-content/existence smoke duplication omitted. |
| R078 | Current yourStatementContentBuilder, PR8 uploadTemplates and repeatedUploads integration suites preserve both mediation collections and actual server-managed submissions; no fallback producer change. |
| R079 | Current reconsideration controller and response confirmation suites retain claimant/defendant context and comments; fork duplicate content-key construction not imported. |
| R080 | Only checks that a titled section exists, including a missing model. This does not verify financial field values/decisions; current financial model/service and rendered summaries remain the stronger contracts. |
| R081 | PR11 partnerServices.test.ts covers six services, exact write keys, survivor fields, and actual write rejection. |
| R082 | Fork claimant-mediation coverage strengthened from existence checks to complete individual/decline CCD payloads. |
| R083 | Fork Yes/No cases cover every public adapter, missing versus No, and independent form values. |
| R084 | Retain the exact fork simpleFormModelsCoverage.test.ts: it invokes real GenericForm validation for CitizenResponseType, PartyTypeSelection, eligibility ClaimType and RespondAddInfo, including custom message keys and conditional missing-text requirements. These are behavioural assertions, not just constructor smoke coverage. Some default/valid cases overlap existing consumers; the explicit decorator/custom-key and conditional validation contracts justify the isolated suite. |
| R085 | Closing integration correction: guard only a selected category's missing optional saved-row array in the four case-progression providers. Keep real section builders, persisted values, selection pruning, metadata and ordering. Existing multipart parsing creates empty arrays; regressions explicitly resume sparse saved forms rather than claiming every current upload produces undefined collections. |
| R086 | Closing response recovery: missing partial-admission answers use the existing task-list redirect, without invented Yes/No values; a translated comment-only timeline uses fresh empty rows while retaining its comment. The fork's comment-dropping fallback is excluded. |
| R087 | Closing GA confirmation recovery: validate an explicit scalar collection-item ID and finite decimal pounds fee, including zero, before rendering either confirmation. Invalid pairs redirect through getDashboardUrlForParty without cancelling/deleting a draft. Keep exact downstream collection-ID-to-case-reference lookup; exclude first-application and unrelated-draft-fee fallback. |
| R088 | Closing presentation adaptation: ten numeric missing-value defaults preserve zero/submitted values; query date errors use escaped inline messages and focusable day summary links; respondent agreement has its existing translated title; three task headings and the opponent timeline use valid bounded composition. The existing dashboard shell gains a default-preserving summary block only to support the query override. Fee-change cleanup remains excluded. |
| R089 | Existing regression owners extended for closing production corrections: real models/builders, saved-state preservation, call-time persistence snapshots, direct GA handlers, raw numeric attributes, bilingual error/title/table behavior and integration journeys. New unit assertions do not construct Express applications; HTTP remains under integration. This is selective adaptation, not assertion-for-assertion fork-suite parity. |

</details>

<details>
<summary>Exact authorised archive downloads</summary>

| URL | Bytes | SHA-256 |
| --- | ---: | --- |
| `https://registry.yarnpkg.com/@babel/parser/-/parser-7.29.9.tgz` | 439123 | `8f3b9fbc531e0c08e2c329cf1ff57bbe121e2d10061b65a05614a25b2255cc43` |
| `https://registry.yarnpkg.com/@codeceptjs/configure/-/configure-1.0.6.tgz` | 5112 | `1291d31565de676a2ead7469a7bd46cc44d30aeef7056400d8e81fef1bca641d` |
| `https://registry.yarnpkg.com/@codeceptjs/detox-helper/-/detox-helper-1.1.14.tgz` | 10906 | `1a6339bc02ba67bddab9f13f01a64fc417b8e22b4118b2bb0335fd6fc6562183` |
| `https://registry.yarnpkg.com/@colors/colors/-/colors-1.6.1.tgz` | 11773 | `7c13d093c7dc82ad9b024da4fd31cd480da6cbae65a0c492efb897e34bd73929` |
| `https://registry.yarnpkg.com/@cucumber/cucumber-expressions/-/cucumber-expressions-19.0.1.tgz` | 95302 | `f1023fd86e8027eeab71f5765413e60e0b8fc5385c978a1f3390670492adc0e6` |
| `https://registry.yarnpkg.com/@cucumber/gherkin/-/gherkin-39.0.0.tgz` | 92734 | `728c368146f3fd2d1d3daddb094d8a16d6837462a28e676b3233b921f8e3c53a` |
| `https://registry.yarnpkg.com/@dabh/diagnostics/-/diagnostics-2.0.9.tgz` | 10584 | `c2741b20e37a5916d1e934cc577f450fa1b0af10d516740f4e55c26fe6819b86` |
| `https://registry.yarnpkg.com/@dr.pogodin/csurf/-/csurf-1.18.1.tgz` | 17933 | `7a4973c6892680c95aaccadcefc7f93fd9f873359298caa8a4086351894202a0` |
| `https://registry.yarnpkg.com/@flatten-js/interval-tree/-/interval-tree-1.1.4.tgz` | 23665 | `1089b9b95fe45f918215aaaa1beef6f4376b1053e8925a45093f443473dcee42` |
| `https://registry.yarnpkg.com/@isaacs/ttlcache/-/ttlcache-1.4.1.tgz` | 8167 | `4fdc15b3ad32802b471d1fcc07eb08f8958fbcc5e8d1d5830a12ad1bc5b6dd1a` |
| `https://registry.yarnpkg.com/@jest/create-cache-key-function/-/create-cache-key-function-29.7.0.tgz` | 2933 | `8d277e1e25a6400fec9e7117fc47fc4c8eaa384cdd4a301d5080519961abee43` |
| `https://registry.yarnpkg.com/@react-native/assets-registry/-/assets-registry-0.81.6.tgz` | 2223 | `7a6c3966bf013e609140e11acf139101b8745db5b5277528ba465c12ab8c9d1f` |
| `https://registry.yarnpkg.com/@react-native/codegen/-/codegen-0.81.6.tgz` | 180094 | `2d8fb69cee45cf2a43e51dc73a11dab8a3ec5396e4bc1ad5a0bcae603d763cf3` |
| `https://registry.yarnpkg.com/@react-native/debugger-frontend/-/debugger-frontend-0.81.6.tgz` | 4516144 | `d44f66224fc380706847fbe2b39cb70047c5bed6ff13c370b428f0d4d19d7c53` |
| `https://registry.yarnpkg.com/@react-native/community-cli-plugin/-/community-cli-plugin-0.81.6.tgz` | 17720 | `590adf5532428cc89dbec51ce497326b1690dee1dcbe76c18565832f89817bf9` |
| `https://registry.yarnpkg.com/@react-native/dev-middleware/-/dev-middleware-0.81.6.tgz` | 31602 | `06e4bba8a24c538e277a22464fad5924624ba77a647d445c28d640ce44152e01` |
| `https://registry.yarnpkg.com/@react-native/gradle-plugin/-/gradle-plugin-0.81.6.tgz` | 99826 | `5c4a1196a8163b7d7c315c51b1c2365894cf28fd40467cedba6913bf0068ef04` |
| `https://registry.yarnpkg.com/@react-native/js-polyfills/-/js-polyfills-0.81.6.tgz` | 8301 | `bfc7b6bcf2251e010200bd98c282b356fef8d12a9b2a7f6c3d3c3cffd4d24a5d` |
| `https://registry.yarnpkg.com/@react-native/normalize-colors/-/normalize-colors-0.81.6.tgz` | 4012 | `2e93cfba6bf95dca9faf4b1e014303b9f2f0617a6fec7862f40a6c4340a8331f` |
| `https://registry.yarnpkg.com/@react-native/virtualized-lists/-/virtualized-lists-0.81.6.tgz` | 49324 | `15af95564972c161d6c20f5061e4272ae8ca723010a4b1a0dc7749ae35d8a386` |
| `https://registry.yarnpkg.com/@wix-pilot/core/-/core-3.4.2.tgz` | 45788 | `a965861228a4c78a309ed17b7851fda34abc0efe319b8d0d0cf40a79364fd422` |
| `https://registry.yarnpkg.com/@wix-pilot/detox/-/detox-1.0.13.tgz` | 10382 | `27ea0a9801e6861ae17c09ec8d63251a2c8ff60b0daf4c8bbbe7843175eeaca5` |
| `https://registry.yarnpkg.com/@xmldom/xmldom/-/xmldom-0.9.12.tgz` | 109708 | `08245e18c248b957b4c6e07f8549ad5f55ae11b7a8abd4c1113a0fd61ddc67ee` |
| `https://registry.yarnpkg.com/anser/-/anser-1.4.10.tgz` | 10267 | `2f2946fb8190da7260762566f9290c694d217137459b5d43a51f26d7ec9611b0` |
| `https://registry.yarnpkg.com/babel-plugin-syntax-hermes-parser/-/babel-plugin-syntax-hermes-parser-0.29.1.tgz` | 3011 | `a1f313807d729062b31c883fd47268b90e717b655736a85e9aedf7e82d5a52ce` |
| `https://registry.yarnpkg.com/browser-process-hrtime/-/browser-process-hrtime-1.0.0.tgz` | 1887 | `12a753e78dab680f034a1ec22803c10ab0579dd9092f1956be8268f3090134eb` |
| `https://registry.yarnpkg.com/bunyamin/-/bunyamin-1.6.3.tgz` | 89838 | `977658aa517c51a0265d6b7f3c7a1444add1a5dc8188b71077760f24a50f6452` |
| `https://registry.yarnpkg.com/bunyan-debug-stream/-/bunyan-debug-stream-3.1.1.tgz` | 17969 | `862466530915fad20dfaa55a72fd4447f572e07e181b3fb59ca003d16b916410` |
| `https://registry.yarnpkg.com/bunyan/-/bunyan-2.0.5.tgz` | 60208 | `ae158b859fe22602c35ba869e4859bb875163103701d7952e4d00aec63e6b699` |
| `https://registry.yarnpkg.com/caf/-/caf-15.0.1.tgz` | 36025 | `289f1e1f5e4c328768b1e2725747efdf17608d1828b0bb907763336eb04e0a41` |
| `https://registry.yarnpkg.com/chromium-edge-launcher/-/chromium-edge-launcher-0.2.0.tgz` | 33251 | `fb36d48484031ef4f55f3772b5d41547a0afb06e4476a0850cc9b8aabc146f25` |
| `https://registry.yarnpkg.com/ci-info/-/ci-info-2.0.0.tgz` | 4860 | `2959f40b55ad201d6e364db8969537b222067397fb9df1002d28427a332056b9` |
| `https://registry.yarnpkg.com/class-validator/-/class-validator-0.15.1.tgz` | 915522 | `f21b8c29a3103c700db59404e8250a5b0812ee82f60164bf66aaff42e4c3229a` |
| `https://registry.yarnpkg.com/codeceptjs/-/codeceptjs-3.7.9.tgz` | 515226 | `e4aeaea5c2c30300c432de44df8e0459e9e5576d5493e9676b6aef9d38234a25` |
| `https://registry.yarnpkg.com/color-name/-/color-name-2.1.1.tgz` | 2846 | `94fd34b8f6b573fd0a4a07f5f029beaf2c8ee9a2b7cd0d47fdd6c95c89b50125` |
| `https://registry.yarnpkg.com/cookie/-/cookie-2.0.1.tgz` | 13277 | `8516126668fc55128916561047c055db77d0401dee1db108adce7267b4b06ff0` |
| `https://registry.yarnpkg.com/deepmerge-ts/-/deepmerge-ts-8.0.2.tgz` | 41695 | `262091e7457d221379bc6e7759df137c01af6553461bad6cd6d4aa3ff10f874c` |
| `https://registry.yarnpkg.com/detox/-/detox-20.42.0.tgz` | 13825437 | `7a60ff71e476d5c198b3c117b6ef4acb752ce3d71595f04e8ae555262fc61517` |
| `https://registry.yarnpkg.com/easy-stack/-/easy-stack-1.0.1.tgz` | 4482 | `e875506628674d741a70a813875426ac8f5302e0ef4f088dcaa4d3dc94bb2d44` |
| `https://registry.yarnpkg.com/enhanced-resolve/-/enhanced-resolve-5.26.0.tgz` | 124037 | `81a355d6fa1579cc142118e634ab349c33b6f03f16c0b4450f2a4db9f5c687eb` |
| `https://registry.yarnpkg.com/error-stack-parser/-/error-stack-parser-2.1.4.tgz` | 9214 | `e346f48f4fc606d4e52bf75806e439225508d914d147eb741df3076769ac2385` |
| `https://registry.yarnpkg.com/event-pubsub/-/event-pubsub-4.3.0.tgz` | 5401 | `fe48af6ed57c10ec87ab6970c23f3aa88c06305e2b35eaeb6fa7592f6d2a4436` |
| `https://registry.yarnpkg.com/exeunt/-/exeunt-1.1.0.tgz` | 7247 | `cf779b3bd82ff6f44e2c8cfab101ddf11817b1c89d6edb355e53710103d8008b` |
| `https://registry.yarnpkg.com/flow-enums-runtime/-/flow-enums-runtime-0.0.6.tgz` | 3705 | `d5ffdc5e937f8c7b176b992cb286575f42c3d17233491279482dd77da2c84ac1` |
| `https://registry.yarnpkg.com/follow-redirects/-/follow-redirects-1.16.1.tgz` | 10076 | `6e075d999dc5ff568916954508397b11a537b18bde615986d7bd8b3d3fa1799f` |
| `https://registry.yarnpkg.com/fs-extra/-/fs-extra-11.4.1.tgz` | 16504 | `6eee04ab29b3f37ce2fa75014fb3fd4836d8a24a2945edfae11e571409ffcbfa` |
| `https://registry.yarnpkg.com/govuk-frontend/-/govuk-frontend-6.5.1.tgz` | 1151196 | `60fb9472e0e2d588f8e3ba6ae85e8056a558ae1f0e96b94682ed68d8c69ff7dc` |
| `https://registry.yarnpkg.com/handlebars/-/handlebars-4.7.10.tgz` | 712317 | `14f356e6cadb5b064a156d2b39dd843abba8f4b1a38ee036935adecc1a13ad9f` |
| `https://registry.yarnpkg.com/hermes-estree/-/hermes-estree-0.29.1.tgz` | 54695 | `d47d453e904d8e43c76c40d879f6418ff2c397691de9c86e31a9b4196090e845` |
| `https://registry.yarnpkg.com/hermes-estree/-/hermes-estree-0.35.0.tgz` | 57228 | `70a298683920cad85d550a09414653e11a2fcfc0a6e1f6ac4f9800431990a913` |
| `https://registry.yarnpkg.com/hermes-parser/-/hermes-parser-0.29.1.tgz` | 402341 | `35e836e78583de48e58327481b5bd3cb219fba307e557b4cc0a86a9866f0c228` |
| `https://registry.yarnpkg.com/hermes-parser/-/hermes-parser-0.35.0.tgz` | 441373 | `2143c5622ae2603181d29f6a3210ba0b362b461c27bf1550195203b2c8618556` |
| `https://registry.yarnpkg.com/i18next-http-middleware/-/i18next-http-middleware-3.9.9.tgz` | 26187 | `f74c3b2504d266456eee02300b494a69ee346e7ed398a653c8a51abe19645dd7` |
| `https://registry.yarnpkg.com/i18next-fs-backend/-/i18next-fs-backend-2.6.8.tgz` | 142895 | `381d93b2038685a9a36ba584a67ac3259fc9ff4226e4f6b2d185bd807e283295` |
| `https://registry.yarnpkg.com/immutable/-/immutable-5.1.9.tgz` | 148909 | `9481d33c209e07f82933a0f8132348ee9325d72ce196ebc47a93b9b2703f3068` |
| `https://registry.yarnpkg.com/jest-environment-emit/-/jest-environment-emit-1.2.0.tgz` | 26751 | `a3cba6509e130e074d762d162d3c9ab53b83b2b9bbec52ae230ba9b5677ed8d9` |
| `https://registry.yarnpkg.com/js-message/-/js-message-1.0.7.tgz` | 3211 | `315547a01eed7a15b5b627db54c3f5b7e90442973481dfb5c006527ea4ea9d2d` |
| `https://registry.yarnpkg.com/js-queue/-/js-queue-2.0.2.tgz` | 4230 | `4a7cdee6ead28f2a9db0a6edfcedaf60823cf517863524747f137dcfa03d9752` |
| `https://registry.yarnpkg.com/jsc-safe-url/-/jsc-safe-url-0.2.4.tgz` | 2771 | `a615038fb0c6a6cbbdc9fa7bfb9ab3e9e2e753789636b60faa906daf277f2dac` |
| `https://registry.yarnpkg.com/json-cycle/-/json-cycle-1.5.0.tgz` | 4296 | `fd8eb64104cc89bc02be0986af0a3bd5b49a3b841c891d91b468b72509275de7` |
| `https://registry.yarnpkg.com/lodash.throttle/-/lodash.throttle-4.1.1.tgz` | 5554 | `1fc83367c8959627885a11258ed7ae4f87ae3d845705e9ea8631099517cbafcd` |
| `https://registry.yarnpkg.com/memoize-one/-/memoize-one-5.2.1.tgz` | 7122 | `2ff208d9302918f17e7f1f46132f5e89cdd78585b0e424ef95f8d55ad861a5e5` |
| `https://registry.yarnpkg.com/metro-babel-transformer/-/metro-babel-transformer-0.83.8.tgz` | 3618 | `72b17c448a5e7cfd0ace020655ca2f7e4888b742b962af07b28d9b4bdd972633` |
| `https://registry.yarnpkg.com/metro-cache-key/-/metro-cache-key-0.83.8.tgz` | 1215 | `cc77d70f01d0e9918e04cf420ca50988dcf3563bcaf46b5dc84e5c74f825b390` |
| `https://registry.yarnpkg.com/metro-cache/-/metro-cache-0.83.8.tgz` | 10478 | `2dcb012759937f3fd45ef235ff8d15ba58c76e2090c2a31b74645b84fb77995e` |
| `https://registry.yarnpkg.com/metro-config/-/metro-config-0.83.8.tgz` | 22577 | `1696d6408db6ce15ecc465e8bc9c9e9afa0c40bd3b1ca42feddccdc07e10b122` |
| `https://registry.yarnpkg.com/metro-core/-/metro-core-0.83.8.tgz` | 8784 | `be9f15ecbbc8ff4c45649f42942471cfe199ba7240ac8f743d155112e96526c5` |
| `https://registry.yarnpkg.com/metro-file-map/-/metro-file-map-0.83.8.tgz` | 115554 | `e3184b47e23c576a62be7bad8151ed7a9ad309f53a9972630e01a2d81e997684` |
| `https://registry.yarnpkg.com/metro-minify-terser/-/metro-minify-terser-0.83.8.tgz` | 1893 | `f7be62568393f2540110b0d21b3a6a6cfc5e5e8b2c22229c2032c0cbd03d75b7` |
| `https://registry.yarnpkg.com/metro-resolver/-/metro-resolver-0.83.8.tgz` | 31686 | `be274c3467527673433d31714d1f259184245374f365851bdc0259aa35d25274` |
| `https://registry.yarnpkg.com/metro-runtime/-/metro-runtime-0.83.8.tgz` | 21394 | `a0358d5309469bc61a745adf3796cb8e45a07fa64c9d68dab4bff4078d0ef5f2` |
| `https://registry.yarnpkg.com/metro-source-map/-/metro-source-map-0.83.8.tgz` | 35965 | `230a63a4274d16d3750c3c9ab63ef59cb102433aacfdfaabd28fd6b573514eb7` |
| `https://registry.yarnpkg.com/metro-symbolicate/-/metro-symbolicate-0.83.8.tgz` | 30416 | `9ef2febaf8731d9368a748b0678559a4cf92bf4d046b54d2468b478bca0e4385` |
| `https://registry.yarnpkg.com/metro-transform-plugins/-/metro-transform-plugins-0.83.8.tgz` | 21816 | `ddde2bacbc1097d0e7bc35b67dddfcf83862fd42c852a3c2f11f6f77072faf74` |
| `https://registry.yarnpkg.com/metro/-/metro-0.83.8.tgz` | 225777 | `81d624afec660127f3162e89b09a145186dc22f25715c62d36a871c9ca9ff4eb` |
| `https://registry.yarnpkg.com/metro-transform-worker/-/metro-transform-worker-0.83.8.tgz` | 10612 | `bdfc61ff726d1e493cd6875ed431601f79245534a025af200d89159a1dd5ef2a` |
| `https://registry.yarnpkg.com/mocha/-/mocha-11.7.5.tgz` | 532408 | `acd4a16fa42b6cfc850764270ac21bdd32376a641ac4d581b3d16e9705b8415c` |
| `https://registry.yarnpkg.com/monocart-coverage-reports/-/monocart-coverage-reports-2.12.11.tgz` | 532487 | `4706545c64840906414e6735dcbeb3d56e3d633866dc943df59828fa0c0bfdcf` |
| `https://registry.yarnpkg.com/multi-sort-stream/-/multi-sort-stream-1.0.4.tgz` | 2986 | `a1b2811f71e413ab3f549b210e48feebf28b8c488a26d02c773a43902e085fe0` |
| `https://registry.yarnpkg.com/multipipe/-/multipipe-4.0.0.tgz` | 3162 | `2d067d551109c9d1b41c7573e43173d328197656e4bf4b8ffb8b5a04e1fd46cc` |
| `https://registry.yarnpkg.com/nan/-/nan-2.29.0.tgz` | 81426 | `038073cb41dbf5cd49df2cd98439dc7ee73f713801e9989426313420693e8af6` |
| `https://registry.yarnpkg.com/nanoid/-/nanoid-3.3.19.tgz` | 5694 | `4e371b71e3d5081fa0052356d5c1904e7a60e049864c26f0724cfd32dc303849` |
| `https://registry.yarnpkg.com/node-ipc/-/node-ipc-9.2.1.tgz` | 28328 | `10ac01262e7ba29d85dd4c07a1a50191f535389dd874fc982580064b7faac0aa` |
| `https://registry.yarnpkg.com/nullthrows/-/nullthrows-1.1.1.tgz` | 1725 | `9a40efecf9bc160c42e986a8193628745b8913ce7317dd942fc0e5649994c9f2` |
| `https://registry.yarnpkg.com/ob1/-/ob1-0.83.8.tgz` | 2283 | `8df53cca9805e83c381235e6b6e51fb71373045e84c35eb650eeac0fdfd8cab4` |
| `https://registry.yarnpkg.com/open/-/open-7.4.2.tgz` | 12663 | `95437eb98046ba0225c061412811fd7ab93b92e47abd23242021b144eb8eb1b7` |
| `https://registry.yarnpkg.com/pngjs/-/pngjs-7.0.0.tgz` | 160939 | `c4b71873d48a692dd5eeb1dcb62185c7aafe40f2180c7cc7f30ec71e89a080be` |
| `https://registry.yarnpkg.com/postcss-safe-parser/-/postcss-safe-parser-7.0.1.tgz` | 2635 | `075c72a33302e5eab4a52c5a8896f455f9e577b010a1c84861fdfbb94c6cf4fc` |
| `https://registry.yarnpkg.com/postcss/-/postcss-8.5.28.tgz` | 52195 | `f63d6d9bce28989cd083add85af717c0264e44323d35c909ae99ac934e9641a6` |
| `https://registry.yarnpkg.com/promise/-/promise-8.3.0.tgz` | 15021 | `c600d4acbeff7c7f10f6b52acfd209d2b6cdfd80ab92eccd3ee162f401b0b972` |
| `https://registry.yarnpkg.com/promisify-child-process/-/promisify-child-process-4.1.2.tgz` | 6820 | `b1d1b79d1d3d186f426da648732a01153adae1ac2f0a53503e14deb2d7d0c8a2` |
| `https://registry.yarnpkg.com/react-devtools-core/-/react-devtools-core-6.1.5.tgz` | 4015904 | `cfe3ed5cdc7f8391d504fd35b2239d49ec4bd91d64990e80cdeebfbfe717f499` |
| `https://registry.yarnpkg.com/react-native/-/react-native-0.81.6.tgz` | 24768119 | `f82ad6b768934902a986b97ff7b7f67d27a4c3f5c93fbaebd0887257381d60cd` |
| `https://registry.yarnpkg.com/react-refresh/-/react-refresh-0.14.2.tgz` | 15124 | `c504db3a5043fdec8251c84fa2d83002489273338abcc408c667f60f412f3e5b` |
| `https://registry.yarnpkg.com/sanitize-filename/-/sanitize-filename-1.6.4.tgz` | 6726 | `42936e205a6243aaf030e457bd3e68dca8036aeaf1b761b5ebd1a5a40fabf3ea` |
| `https://registry.yarnpkg.com/sass/-/sass-1.105.1.tgz` | 932694 | `f7fc3d2884afb479e48861eaf5c63cf9eb39a8796c902d9bb33eee18834cb2f6` |
| `https://registry.yarnpkg.com/scheduler/-/scheduler-0.26.0.tgz` | 10015 | `1bbc5d3401d25b848a2a76d4f8f77d99cc95cdff6db054483a7d4067c279d72a` |
| `https://registry.yarnpkg.com/serialize-error/-/serialize-error-2.1.0.tgz` | 1936 | `497427e3ec97f128dc96316e8c57e914348d35b24f2681cf3259f3adb0849363` |
| `https://registry.yarnpkg.com/serialize-javascript/-/serialize-javascript-7.1.2.tgz` | 8893 | `74e5f9d5202df2acfa19c064a50b6d937c2fc8d24b06b461f2abe3150f64c8dd` |
| `https://registry.yarnpkg.com/shell-quote/-/shell-quote-1.11.0.tgz` | 9588 | `028be526afacb2bf5c6c008a95d5435b5d205135f68bb48afd0bb947610393f1` |
| `https://registry.yarnpkg.com/shelljs/-/shelljs-0.10.0.tgz` | 45667 | `0908d4921a9e304cbf0aacf161f31aafaa7d5920b403c1493d1c99646ace9ff2` |
| `https://registry.yarnpkg.com/stackframe/-/stackframe-1.3.4.tgz` | 6439 | `fb928460cb97df0ba99a1dfbeec6cb1dc9b12f9a9838a003fda25019ad9be929` |
| `https://registry.yarnpkg.com/stacktrace-parser/-/stacktrace-parser-0.1.11.tgz` | 3673 | `cbf9701441ee1adf6ae59591d2eab4329de8ea15fc03bb99cb3679feb7294e7c` |
| `https://registry.yarnpkg.com/stream-chain/-/stream-chain-2.2.5.tgz` | 9889 | `f9539671f2c9a4dd367733f6eb017ab37eede1b769d120a88157aeab95cf8db2` |
| `https://registry.yarnpkg.com/stream-json/-/stream-json-1.9.1.tgz` | 16707 | `3f8cf5812a4abb69d5a8837944373a0b9e7d3cec3e91a5850c95f211a06ae7c3` |
| `https://registry.yarnpkg.com/supertest/-/supertest-7.3.0.tgz` | 12725 | `6d3b734289966f9399b4be724fa9d72b87a04762ef0b78814ba026c5ed538f71` |
| `https://registry.yarnpkg.com/tar-fs/-/tar-fs-3.1.3.tgz` | 5973 | `7116c8ba6bb20aafdbe5d6c1c5aa2c7120f6c4cdd5cadcfbca97f84f45448b4f` |
| `https://registry.yarnpkg.com/telnet-client/-/telnet-client-1.2.8.tgz` | 10984 | `d661c5a7c84f5000d49afdf6323640165eed2cbf6e89036f07ba4ae7e4617445` |
| `https://registry.yarnpkg.com/throat/-/throat-5.0.0.tgz` | 3411 | `acdada0100c9fc4695e51636b057ed4200fd75b68da3d59aca9246d93200d23e` |
| `https://registry.yarnpkg.com/trace-event-lib/-/trace-event-lib-1.4.1.tgz` | 15233 | `c13595405bc9e3aff28031fadd3f5829dfa6c0c67970b938c07b0040f1354c96` |
| `https://registry.yarnpkg.com/ts-jest/-/ts-jest-29.4.14.tgz` | 77484 | `7ca70a3fa5162598d616d838ba28a9a7f6b6cccdaf196c2fdc6ab642e4ca4ac3` |
| `https://registry.yarnpkg.com/type-fest/-/type-fest-0.7.1.tgz` | 10110 | `23518bcb4ad6bafc7892e08e83119089732ce23462c87fb002c09ccd701c6293` |
| `https://registry.yarnpkg.com/undici/-/undici-7.30.0.tgz` | 401782 | `afa0d7be8598012c601fff7ed0fdea01868184f5a223a6f656a4fce1da077819` |
| `https://registry.yarnpkg.com/utf8-byte-length/-/utf8-byte-length-1.0.5.tgz` | 3003 | `afb0f76e4271dbe3bfeae359804c0149ca533254db40c59cc22f5fdd6a4b93b1` |
| `https://registry.yarnpkg.com/webpack/-/webpack-5.111.1.tgz` | 2422918 | `6d1f5b3890768c6669417f040363b2811e56cc26a9d90556742aaf598e02a39c` |
| `https://registry.yarnpkg.com/ws/-/ws-8.22.0.tgz` | 35094 | `ca9b3798b2e11ce8fac6713f50ef0501aa12b09b330623c1dc409dff94e7abc8` |

</details>

<details>
<summary>Commands and ordinary exit status from this run</summary>

- `yarn-config`: exit **0**, 0.14s — `node .yarn/releases/yarn-4.18.1.cjs config --json`
- `install-cache-mode`: exit **1**, 0.401s — `node .yarn/releases/yarn-4.18.1.cjs install --immutable --mode=skip-build`
- `install-mirror`: exit **1**, 0.612s — `node .yarn/releases/yarn-4.18.1.cjs install --immutable --mode=skip-build`
- `pins`: exit **0**, 0.041s — `node bin/check-dependency-pins.mjs`
- `baseline`: exit **1**, 0.03s — `node bin/functional-baseline.js check`
- `shared`: exit **0**, 0.02s — `bash bin/test-civil-shared-import-consumers.sh`
- `mappings`: exit **0**, 0.033s — `node bin/validate-wiremock-mappings.js`
- `preview-mappings`: exit **0**, 0.029s — `node bin/ui-preview-mappings.cjs`
- `isolated-contracts`: exit **0**, 0.307s — `node $DISPOSABLE/isolated-checks.cjs`
- `isolated-contracts-final`: exit **0**, 0.342s — `node $DISPOSABLE/isolated-checks.cjs`
- `isolated-reviewed`: exit **0**, 0.356s — `node $DISPOSABLE/isolated-checks.cjs`
- `install-offline-final`: exit **0**, 0.831s — `node .yarn/releases/yarn-4.18.1.cjs install --immutable --mode=skip-build`
- `focused-new`: exit **1**, 3.909s — `env LOG_LEVEL=OFF node --no-sparkplug node_modules/jest/bin/jest.js --runInBand --detectOpenHandles --silent --runTestsByPath src/test/unit/common/form/validators/optionalDateFourDigitValidator.test.ts src/test/unit/common/form/models/EmailValidationWithMessage.test.ts src/test/unit/common/form/models/PhoneValidationWithMessage.test.ts src/test/unit/common/form/models/admission/fullAdmission/baseDate.test.ts src/test/unit/common/form/models/repaymentPlan/baseRepaymentPlan.test.ts src/test/unit/services/genericForm/genericFormService.test.ts src/test/unit/services/firstcontact/firstcontactService.test.ts src/test/unit/services/translation/caseProgression/requestForReconsideration/convertToCCDRequestForReconsideration.test.ts src/test/unit/services/translation/claimantResponse/convertToCCDClaimantLiPResponse.test.ts src/test/unit/services/translation/convertToCUI/convertToCUIFixedRecoverableCosts.test.ts src/test/unit/services/translation/convertToCUI/convertToCUIMediationCarm.test.ts src/test/unit/services/translation/response/convertToCCDFlightDetails.test.ts src/test/unit/common/form/validators/optionalIntegerValidator.test.ts src/test/unit/common/form/validators/optionalDateInPastValidator.test.ts src/test/unit/common/form/validators/optionalDateNotInPastValidator.test.ts src/test/unit/common/form/validators/optionalDateNotInFutureValidator.test.ts src/test/unit/services/translation/convertToCUI/convertToCUIYesNo.test.ts src/test/unit/services/firstcontact/sessionValueCrypto.test.ts src/test/unit/modules/draft-store/draftClaimCache.test.ts src/test/unit/services/features/caseProgression/hearingFee/paymentServiceUtils.test.ts src/test/unit/services/features/generalApplication/submitGeneralApplicationConfirmationContent.test.ts src/test/unit/services/translation/claimantResponse/convertToCCDClaimantMediation.test.ts src/test/unit/services/features/response/statementOfMeans/partner/partnerServices.test.ts src/test/unit/app/client/common/error/callbackError.test.ts src/test/unit/common/form/models/genericYesNoCarmContactPersonConfirmation.test.ts src/test/unit/common/form/models/genericYesNoCarmEmailConfirmation.test.ts src/test/unit/common/form/models/genericYesNoKnownClaimAmount.test.ts src/test/unit/common/form/models/statementOfMeans/debts/debtItems.test.ts src/test/unit/common/form/models/statementOfMeans/dependants/numberOfChildren.test.ts src/test/unit/common/form/models/claim/claimant/citizenDate.test.ts src/test/unit/common/form/models/claim/claimant/dobDate.test.ts src/test/unit/common/form/models/admission/partialAdmission/partialAdmissionRepaymentPlan.test.ts src/test/unit/common/utils/taskList/tasks/checkAndSubmitYourResponse.test.ts src/test/unit/common/utils/taskList/tasks/chooseAResponse.test.ts src/test/unit/common/utils/taskList/tasks/decideHowYouPay.test.ts src/test/unit/common/utils/taskList/tasks/shareFinancialDetails.test.ts src/test/unit/common/utils/taskList/tasks/viewOptionsBeforeDeadline.test.ts src/test/unit/services/features/response/statementOfMeans/employment/employmentConverter.test.ts src/test/unit/services/features/response/statementOfMeans/employment/employerService.test.ts`
- `typescript`: exit **2**, 6.796s — `node node_modules/typescript/bin/tsc --noEmit --incremental false`
- `focused-confirmation-corrected`: exit **0**, 0.729s — `env LOG_LEVEL=OFF node --no-sparkplug node_modules/jest/bin/jest.js --runInBand --detectOpenHandles --silent --runTestsByPath src/test/unit/services/features/generalApplication/submitGeneralApplicationConfirmationContent.test.ts`
- `typescript-corrected`: exit **0**, 6.393s — `node node_modules/typescript/bin/tsc --noEmit --incremental false`
- `focused-all`: exit **0**, 2.725s — `env LOG_LEVEL=OFF node --no-sparkplug node_modules/jest/bin/jest.js --runInBand --detectOpenHandles --silent --runTestsByPath src/test/unit/common/form/validators/optionalDateFourDigitValidator.test.ts src/test/unit/common/form/models/EmailValidationWithMessage.test.ts src/test/unit/common/form/models/PhoneValidationWithMessage.test.ts src/test/unit/common/form/models/admission/fullAdmission/baseDate.test.ts src/test/unit/common/form/models/repaymentPlan/baseRepaymentPlan.test.ts src/test/unit/services/genericForm/genericFormService.test.ts src/test/unit/services/firstcontact/firstcontactService.test.ts src/test/unit/services/translation/caseProgression/requestForReconsideration/convertToCCDRequestForReconsideration.test.ts src/test/unit/services/translation/claimantResponse/convertToCCDClaimantLiPResponse.test.ts src/test/unit/services/translation/convertToCUI/convertToCUIFixedRecoverableCosts.test.ts src/test/unit/services/translation/convertToCUI/convertToCUIMediationCarm.test.ts src/test/unit/services/translation/response/convertToCCDFlightDetails.test.ts src/test/unit/common/form/validators/optionalIntegerValidator.test.ts src/test/unit/common/form/validators/optionalDateInPastValidator.test.ts src/test/unit/common/form/validators/optionalDateNotInPastValidator.test.ts src/test/unit/common/form/validators/optionalDateNotInFutureValidator.test.ts src/test/unit/services/translation/convertToCUI/convertToCUIYesNo.test.ts src/test/unit/services/firstcontact/sessionValueCrypto.test.ts src/test/unit/modules/draft-store/draftClaimCache.test.ts src/test/unit/services/features/caseProgression/hearingFee/paymentServiceUtils.test.ts src/test/unit/services/features/generalApplication/submitGeneralApplicationConfirmationContent.test.ts src/test/unit/services/translation/claimantResponse/convertToCCDClaimantMediation.test.ts src/test/unit/services/features/response/statementOfMeans/partner/partnerServices.test.ts src/test/unit/app/client/common/error/callbackError.test.ts src/test/unit/common/form/models/genericYesNoCarmContactPersonConfirmation.test.ts src/test/unit/common/form/models/genericYesNoCarmEmailConfirmation.test.ts src/test/unit/common/form/models/genericYesNoKnownClaimAmount.test.ts src/test/unit/common/form/models/statementOfMeans/debts/debtItems.test.ts src/test/unit/common/form/models/statementOfMeans/dependants/numberOfChildren.test.ts src/test/unit/common/form/models/claim/claimant/citizenDate.test.ts src/test/unit/common/form/models/claim/claimant/dobDate.test.ts src/test/unit/common/form/models/admission/partialAdmission/partialAdmissionRepaymentPlan.test.ts src/test/unit/common/utils/taskList/tasks/checkAndSubmitYourResponse.test.ts src/test/unit/common/utils/taskList/tasks/chooseAResponse.test.ts src/test/unit/common/utils/taskList/tasks/decideHowYouPay.test.ts src/test/unit/common/utils/taskList/tasks/shareFinancialDetails.test.ts src/test/unit/common/utils/taskList/tasks/viewOptionsBeforeDeadline.test.ts src/test/unit/services/features/response/statementOfMeans/employment/employmentConverter.test.ts src/test/unit/services/features/response/statementOfMeans/employment/employerService.test.ts src/test/unit/app/client/common/civilServiceRequest.test.ts src/test/unit/modules/i18n/languageService.test.ts src/test/unit/modules/csrf/index.test.ts src/test/unit/common/form/models/citizenTelephoneNumber.test.ts src/test/unit/services/features/queryManagement/viewQueriesService.test.ts src/test/unit/common/form/validators/emailValidator.test.ts src/test/unit/common/form/validators/phoneUKValidator.test.ts`
- `build-development`: exit **0**, 12.396s — `node .yarn/releases/yarn-4.18.1.cjs build`
- `lint`: exit **1**, 14.898s — `node .yarn/releases/yarn-4.18.1.cjs lint`
- `negative-integer`: exit **1**, 0.603s — `env LOG_LEVEL=OFF node --no-sparkplug node_modules/jest/bin/jest.js --runInBand --silent --json --outputFile=$DISPOSABLE/logs/negative-integer.json --runTestsByPath src/test/unit/common/form/validators/optionalIntegerValidator.test.ts`
- `negative-crypto`: exit **1**, 0.492s — `env LOG_LEVEL=OFF node --no-sparkplug node_modules/jest/bin/jest.js --runInBand --silent --json --outputFile=$DISPOSABLE/logs/negative-crypto.json --runTestsByPath src/test/unit/services/firstcontact/sessionValueCrypto.test.ts`
- `negative-hearing`: exit **1**, 0.561s — `env LOG_LEVEL=OFF node --no-sparkplug node_modules/jest/bin/jest.js --runInBand --silent --json --outputFile=$DISPOSABLE/logs/negative-hearing.json --runTestsByPath src/test/unit/services/features/caseProgression/hearingFee/paymentServiceUtils.test.ts`
- `negative-ga-pair`: exit **1**, 0.883s — `env LOG_LEVEL=OFF node --no-sparkplug node_modules/jest/bin/jest.js --runInBand --silent --json --outputFile=$DISPOSABLE/logs/negative-ga-pair.json --runTestsByPath src/test/unit/services/features/generalApplication/submitGeneralApplicationConfirmationContent.test.ts`
- `negative-csrf`: exit **1**, 0.49s — `env LOG_LEVEL=OFF node --no-sparkplug node_modules/jest/bin/jest.js --runInBand --silent --json --outputFile=$DISPOSABLE/logs/negative-csrf.json --runTestsByPath src/test/unit/modules/csrf/index.test.ts`
- `focused-validation-gaps`: exit **0**, 1.045s — `env LOG_LEVEL=OFF node --no-sparkplug node_modules/jest/bin/jest.js --runInBand --detectOpenHandles --silent --runTestsByPath src/test/unit/common/models/mediation/unavailableDatesMediation.test.ts src/test/unit/common/form/models/statementOfMeans/expensesAndIncome/transactionSource.test.ts src/test/unit/common/models/generalApplication/uploadGAFiles.test.ts src/test/unit/common/models/generalApplication/uploadN245GAFiles.test.ts`
- `typescript-final`: exit **2**, 7.58s — `node node_modules/typescript/bin/tsc --noEmit --incremental false`
- `build-production`: exit **1**, 13.498s — `node .yarn/releases/yarn-4.18.1.cjs build:prod`
- `lint-corrected`: exit **0**, 14.429s — `node .yarn/releases/yarn-4.18.1.cjs lint`
- `ga-missing-query-reproduction`: exit **1**, 0.973s — `env LOG_LEVEL=OFF node --no-sparkplug node_modules/jest/bin/jest.js --runInBand --silent --runTestsByPath src/test/unit/services/features/generalApplication/pr11MissingParameters.reproduction.test.ts`
- `typescript-verified`: exit **0**, 6.896s — `node node_modules/typescript/bin/tsc --noEmit --incremental false`
- `build-production-corrected`: exit **0**, 12.308s — `node .yarn/releases/yarn-4.18.1.cjs build:prod`
- `preview-tools-separate-guard`: exit **0**, 1.858s — `env LOG_LEVEL=OFF node --no-sparkplug node_modules/jest/bin/jest.js --runInBand --silent --runTestsByPath src/test/unit/modules/uiPreview/uiPreviewTools.test.ts`
- `full-coverage`: exit **1**, 175.656s — `env LOG_LEVEL=OFF node --disable-warning=DEP0060 --no-sparkplug node_modules/jest/bin/jest.js --coverage --maxWorkers=4 --silent --json --outputFile=$DISPOSABLE/logs/full-coverage.json --env=$DISPOSABLE/first-failure-environment.cjs`
- `request-guard-before`: exit **0**, 1.826s — `env LOG_LEVEL=OFF PR11_CAPTURE_RUN=guard-before node --no-sparkplug node_modules/jest/bin/jest.js --runInBand --silent --json --outputFile=$DISPOSABLE/logs/request-guard-before.json --env=$DISPOSABLE/first-failure-environment.cjs --runTestsByPath src/test/unit/routes/guards/responseSubmitDateGuard.test.ts`
- `full-coverage-corrected-harness`: exit **0**, 155.914s — `env LOG_LEVEL=OFF PR11_CAPTURE_RUN=corrected node --disable-warning=DEP0060 --no-sparkplug node_modules/jest/bin/jest.js --coverage --maxWorkers=4 --silent --json --outputFile=$DISPOSABLE/logs/full-coverage-corrected.json --env=$DISPOSABLE/first-failure-environment.cjs`
- `retry-isolation-corrected`: exit **0**, 6.03s — `env LOG_LEVEL=OFF PR11_CAPTURE_RUN=isolation-fixed node --no-sparkplug node_modules/jest/bin/jest.js --runInBand --silent --json --outputFile=$DISPOSABLE/logs/retry-isolation-corrected.json --env=$DISPOSABLE/first-failure-environment.cjs --runTestsByPath src/test/unit/routes/guards/responseSubmitDateGuard.test.ts src/test/unit/routes/features/dashboard/claimantDashboardController.test.ts src/test/unit/routes/features/claim/generalApplication/response/respondentUploadEvidenceDocumentsController.test.ts`
- `retry-isolation-final`: exit **0**, 3.002s — `env LOG_LEVEL=OFF PR11_CAPTURE_RUN=isolation-final node --no-sparkplug node_modules/jest/bin/jest.js --runInBand --silent --json --outputFile=$DISPOSABLE/logs/retry-isolation-final.json --env=$DISPOSABLE/first-failure-environment.cjs --runTestsByPath src/test/unit/routes/guards/responseSubmitDateGuard.test.ts src/test/unit/routes/features/dashboard/claimantDashboardController.test.ts src/test/unit/routes/features/claim/generalApplication/response/respondentUploadEvidenceDocumentsController.test.ts`
- `typescript-final-isolation`: exit **0**, 7.677s — `node node_modules/typescript/bin/tsc --noEmit --incremental false`
- `production-final-isolation`: exit **0**, 13.523s — `node .yarn/releases/yarn-4.18.1.cjs build:prod`
- `lint-final-isolation`: exit **0**, 15.416s — `node .yarn/releases/yarn-4.18.1.cjs lint`
- `full-coverage-final`: exit **1**, 160.642s — `env LOG_LEVEL=OFF PR11_CAPTURE_RUN=final node --disable-warning=DEP0060 --no-sparkplug node_modules/jest/bin/jest.js --coverage --maxWorkers=4 --silent --json --outputFile=$DISPOSABLE/logs/full-coverage-final.json --env=$DISPOSABLE/first-failure-environment.cjs`
- `phone-isolation-before`: exit **0**, 2.559s — `env LOG_LEVEL=OFF PR11_CAPTURE_RUN=phone-before node --no-sparkplug node_modules/jest/bin/jest.js --runInBand --silent --json --outputFile=$DISPOSABLE/logs/phone-isolation-before.json --env=$DISPOSABLE/first-failure-environment.cjs --runTestsByPath src/test/unit/routes/features/response/citizenPhoneDetails/citizenPhoneController.test.ts --testNamePattern 'interior spaces'`
- `phone-prior-error-before`: exit **1**, 8.866s — `env LOG_LEVEL=OFF node --no-sparkplug node_modules/jest/bin/jest.js --runInBand --silent --setupFilesAfterEnv ./jest.setup.redis-mock.js ./jest.setup.js $DISPOSABLE/prior-store-error.setup.cjs --runTestsByPath src/test/unit/routes/features/response/citizenPhoneDetails/citizenPhoneController.test.ts --testNamePattern 'interior spaces'`
- `phone-prior-error-after`: exit **0**, 1.934s — `env LOG_LEVEL=OFF node --no-sparkplug node_modules/jest/bin/jest.js --runInBand --silent --setupFilesAfterEnv ./jest.setup.redis-mock.js ./jest.setup.js $DISPOSABLE/prior-store-error.setup.cjs --runTestsByPath src/test/unit/routes/features/response/citizenPhoneDetails/citizenPhoneController.test.ts --testNamePattern 'interior spaces'`
- `phone-suite-final`: exit **0**, 2.099s — `env LOG_LEVEL=OFF PR11_CAPTURE_RUN=phone-fixed node --no-sparkplug node_modules/jest/bin/jest.js --runInBand --silent --json --outputFile=$DISPOSABLE/logs/phone-suite-final.json --env=$DISPOSABLE/first-failure-environment.cjs --runTestsByPath src/test/unit/routes/features/response/citizenPhoneDetails/citizenPhoneController.test.ts`
- `typescript-complete`: exit **0**, 6.953s — `node node_modules/typescript/bin/tsc --noEmit --incremental false`
- `lint-complete`: exit **0**, 14.056s — `node .yarn/releases/yarn-4.18.1.cjs lint`
- `build-development-complete`: exit **0**, 11.978s — `node .yarn/releases/yarn-4.18.1.cjs build`
- `build-production-complete`: exit **0**, 12.373s — `node .yarn/releases/yarn-4.18.1.cjs build:prod`
- `coverage-complete`: exit **0**, 157.798s — `env LOG_LEVEL=OFF PR11_CAPTURE_RUN=complete node --disable-warning=DEP0060 --no-sparkplug node_modules/jest/bin/jest.js --coverage --maxWorkers=4 --silent --json --outputFile=$DISPOSABLE/logs/coverage-complete.json --env=$DISPOSABLE/first-failure-environment.cjs`
- `routes-final`: exit **0**, 63.664s — `env LOG_LEVEL=ERROR node --no-sparkplug node_modules/jest/bin/jest.js -c jest.functionaltest.config.js --runInBand --silent --json --outputFile=$DISPOSABLE/logs/routes-final.json`
- `pins-final`: exit **0**, 0.04s — `node bin/check-dependency-pins.mjs`
- `baseline-final`: exit **0**, 0.498s — `node bin/functional-baseline.js check`
- `shared-final`: exit **0**, 0.02s — `bash bin/test-civil-shared-import-consumers.sh`
- `mappings-final`: exit **0**, 0.032s — `node bin/validate-wiremock-mappings.js`
- `preview-mappings-final`: exit **0**, 0.032s — `node bin/ui-preview-mappings.cjs`
- `pact-tooling`: exit **0**, 4.056s — `env -u LOG_LEVEL node --no-sparkplug node_modules/jest/bin/jest.js -c jest.pact-tooling.config.js --runInBand`
- `pact-consumers`: exit **0**, 6.821s — `env -u LOG_LEVEL node --no-sparkplug node_modules/jest/bin/jest.js -c jest.pact.config.js --runInBand`
- `pact-artifacts`: exit **0**, 0.035s — `env -u LOG_LEVEL node src/test/contract/check-artifacts.js`

Final preservation checks cover all original source fingerprints outside the 7 intended tracked modifications, every source-fork fingerprint, excluded context, pre-existing untracked PR10 notes, manifest, lockfile, refs, HEAD and raw index. The 49 new tests are the only new implementation files. All implementation changes are unstaged.

The archive bootstrap additionally exited zero after 116 localhost archive requests, then shut down. Execution-only diagnostics, downloads, copies, caches, builds, profiles/logs/reports are removed at handover. Original tools/caches are preserved.

</details>


### PR11 review corrections — 21 October 2026

The working tree found at the start of this correction had 49 empty staged test files, two empty preview integration files, and the five previously reviewed test corrections absent. The complete reviewed tests were recovered from the byte-identical local saved copies `c27f2978091a82789cdf021af91ee417c28c94b3` and `4fcdecf42aa6ddde93c053654727b1e487e714a5`. The saved copies and branch history were preserved. The pre-existing PR10 review notes were unstaged and remain outside the intended deliverables.

Changes following independent review:

- Employer and all six partner-service persistence tests snapshot the complete claim inside the save mock. Expected updated values and survivor fields are independent of later mutations; exact keys and call counts are checked.
- The unit Jest configuration explicitly selects UTC before loading test environments. Existing CitizenDate/DOB assertions retain their expected contract regardless of the launching host's timezone. Fixed clocks are still restored per test. Production date parsing and runtime timezone are unchanged.
- Four preview integration/probe files carry the existing local PR10 correction from `86ff9fcebb4844df71af8d3d3699d52b58fe2ce4`. Each test owns a temporary directory, deliberately clears TMPDIR in the child, supplies portable TMP/TEMP fallbacks and cleans up in finally. Application-probe failures expose stderr. This is inherited PR10 test infrastructure; rebasing onto that corrected base should remove these four paths from PR11's eventual incremental diff.
- The submit-button and simple-form-validation exclusions were reassessed against the exact fork. Both suites are retained; R027 and R084 now describe their actual assertions. The eight separately named deferrals are unchanged. The 719-path ledger now contains 50 Import/adapt, 252 Exclude, 222 Adapted, 105 Already integrated, 82 Covered differently and eight Defer dispositions.
- The existing test-pyramid document explains the unit-test timezone. Retry count, test discovery, assertions in earlier-stage protections, coverage policy and package scripts remain unchanged.

The historical defendant claim-summary retry report (three cases retried during one independent full run) remains unresolved initiating-failure evidence. Another independent full run had no retries. Isolated passes do not explain that difference. No speculative production or fixture change is attributed to that history. GA missing-parameter recovery remains the separately owned production follow-up described above.

Additional paths beyond the original 56-path inventory: `jest.config.js`; `src/test/unit/assets/js/disable-submit.test.ts`; `src/test/unit/common/form/models/simpleFormModelsCoverage.test.ts`; `src/integration-test/routes/uiPreview.test.ts`; `src/integration-test/routes/uiPreviewCatalogue.test.ts`; `src/test/utils/uiPreviewApplicationProbe.cjs`; `src/test/utils/uiPreviewRouteProbe.cjs`. Thus the current diff against the recorded old base contains 63 intended paths; four belong to the inherited PR10 correction. The pre-existing PR10 review document is excluded.

#### Fresh correction verification

Verification used Node 24.21.0, tracked Yarn 4.18.1 and a fresh physical candidate copy, with no linked checkout dependencies or Git directory. A macOS sandbox restricted writes to disposable storage and network connections to localhost. The independent Node network preloader had a different module path from the guard exercised by preview tests. Installation scripts, browser downloads, telemetry and hardened registry access were disabled. No browser, remote Git, live audit or hosted checks ran.

The first immutable offline installation exited 1 for missing archives. The permitted exact-archive bootstrap downloaded **109 archives / 59,547,909 bytes**; exact URLs, sizes and SHA-256 values match the PR11 archive table above, excluding the seven already-cached entries `browser-process-hrtime@1.0.0`, `ci-info@2.0.0`, `multipipe@4.0.0`, `postcss-safe-parser@7.0.1`, `serialize-error@2.1.0`, `stacktrace-parser@0.1.11` and `utf8-byte-length@1.0.5`. Redirects and proxies were disabled, package identities checked, and all generated Yarn ZIPs matched the full locked SHA-512 checksums. The localhost archive server then closed; final immutable skip-build installation passed offline. Manifests and lockfile were unchanged.

All commands below ran in the disposable copy. `J` denotes `node --no-sparkplug node_modules/jest/bin/jest.js`. Existing discovery, coverage and retry settings were retained. A disposable Jest environment logged initial failures and retries without changing assertions or retry counts; it was used for affected tests, full coverage, routes and the CCJ diagnostic. No `--forceExit` was used.

| Command/check | Fresh result |
| --- | --- |
| `node .yarn/releases/yarn-4.18.1.cjs install --immutable --mode=skip-build` | Final offline exit 0 |
| `node node_modules/typescript/bin/tsc --noEmit --incremental false` | Exit 0 |
| `node .yarn/releases/yarn-4.18.1.cjs build` | Exit 0; seven warnings |
| Six corrected/new pure suites, `J --runInBand --silent --runTestsByPath …`, launched with `TZ=America/Los_Angeles` | 73 tests; exit 0 with the unit configuration selecting UTC |
| All 56 affected unit suites, `J --runInBand --silent --runTestsByPath …` | **457 tests; exit 0; no recorded initial failures or retries** |
| `LOG_LEVEL=ERROR node --disable-warning=DEP0060 --no-sparkplug node_modules/jest/bin/jest.js --coverage --maxWorkers=4 --silent` with the logging-only environment and JSON results | **975 suites / 8,936 tests; exit 0; one initial failure and one retry**, 169.509 seconds |
| `J -c jest.functionaltest.config.js --runInBand --silent`, with `TMPDIR` absent, private `TMP`/`TEMP` and explicit disposable Jest cache | **24 suites / 270 tests; exit 0; no recorded initial failures or retries**, 63.614 seconds |
| Isolated CCJ suite, `J --coverage --runInBand --silent --runTestsByPath src/test/unit/routes/features/claimantResponse/ccj/ccjCheckAnswersController.test.ts` | Seven tests; exit 0; no recorded initial failures or retries |
| `node .yarn/releases/yarn-4.18.1.cjs lint` | Exit 0; zero errors / 454 warnings |
| `node .yarn/releases/yarn-4.18.1.cjs build:prod` | Exit 0; seven warnings |
| `node bin/check-dependency-pins.mjs` | Exit 0; 61 production / 63 development dependencies, 58 resolutions, 1,517 required checksums |
| `node bin/functional-baseline.js check`; `bash bin/test-civil-shared-import-consumers.sh` | Both exit 0 |
| `node bin/validate-wiremock-mappings.js`; `node bin/ui-preview-mappings.cjs` | 41 chart / 36 preview mappings; both exit 0 |
| `J -c jest.pact-tooling.config.js --runInBand` | One suite / 14 tests; exit 0 |
| `J -c jest.pact.config.js --runInBand` | 15 suites / 127 tests; exit 0 |
| `node src/test/contract/check-artifacts.js` | Three complete artifacts; exit 0 |

Pact ran with `LOG_LEVEL` unset and without publishing. Route probes removed their private directories. This verifies the previously failing no-`TMPDIR` condition, not a hosted Jenkins result. The two additional suites contribute 20 cases, bringing the candidate to **51 new suites / 386 added cases** relative to the recorded PR10 base.

The full unit run was executed once. Its first CCJ failure was `should return 500 when error in service` at `ccjCheckAnswersController.test.ts:104`: **expected 500, received 404**; the subsequent error-page text assertion also failed. One retry passed. Inspection confirmed that the case explicitly installs failing storage and submits an invalid form, whose controller path should read the draft and forward the storage error. The isolated coverage diagnostic passed all seven cases without a retry; that does not establish the cause of the original 404. No speculative CCJ correction was made. This new unresolved event is retained alongside, rather than substituted for, the earlier defendant-summary, phone and PR9/PR10 histories. The current full run must not be described as having zero retries.

Disposable negative controls were separate from ordinary gates:

- Moving employer and cohabiting persistence before updating the answers produced five failed assertions, exit 1. The call-time snapshots detect the demonstrated stale-write regression.
- Leaving the payment submit button enabled produced five failed assertions, exit 1.
- Removing the UTC setting and running the CitizenDate/DOB suites with `TZ=America/Los_Angeles` produced two failures, exit 1.

All mutations were restored before the ordinary affected/full checks. These results establish assertion sensitivity, not production failures. GA missing-parameter recovery, applicable WireMock/container execution, hosted review, authenticated/operational acceptance and separate QA remain outside these fixes. The optional query-suite consolidation was not required for correctness and was not applied.

The recovered/corrected working-tree contents require staging before commit: the 49 pre-existing staged additions were empty at the start and their index entries were deliberately preserved. Only the pre-existing PR10 notes were unstaged. No commit, push, branch change or ref update was performed.

Final comparison found only the 63 intended implementation paths changed or added. The tested implementation bytes match the checkout. Branch, HEAD and refs are unchanged; production files, manifest, lockfile, excluded context and PR10-note contents are preserved. The raw index is now `acc910e030af6403f56267d3eb197e86c9adfccc322a8c89c313541dcceabac5`; its only entry change is removal of the PR10 notes. Earlier PR9 text is intact. The source fork remains clean at the exact reference. Owned verification processes exited, and disposable copies, dependencies, archives, caches, reports and probes were removed.

### COSC fixture isolation and local ledger correction — 22 October 2026

This section records a later correction; the preceding verification and staging accounts remain historical. The PR9 and PR10 review notes are local context excluded from the intended commit, as requested. Neither document is staged.

The existing COSC check-answers POST error test leaves `saveDraftClaim` rejecting. A later success case, including a deferred Jest retry, can therefore receive HTTP 500 instead of 302. The POST group now resets that mock to successful persistence before each test. The intentional storage-error case still installs its rejection and checks the error response. No production code, assertion, timeout, discovery or retry policy changed.

This establishes the cause of the reproduced save-mock contamination and subsequent 500 responses. It does not explain the initial 401 in the earlier COSC full-run failure, or the other historical timeout, socket, CCJ, phone and dashboard failures. The independent review immediately before this correction recorded 975 suites / 8,937 tests passing without retries; that full run predates this reset and is not a post-change full-suite result.

The ledger summary now agrees with its 719 unique path rows: 252 Exclude, 222 Adapted, 105 Already integrated, 82 Covered differently, 50 Import/adapt and eight Defer. The R084 definition has moved into the evidence-code table. No path disposition changed in this correction.

Fresh verification used Node 24.21.0 and tracked Yarn 4.18.1 in a disposable physical candidate copy. Checkout dependencies were not reused. The explicit macOS sandbox restricted writes to that temporary directory and connections to localhost; a direct check confirmed localhost access and external-connect denial with EPERM. A separate Node preloader avoided the preview guard's module-cache collision.

The first nested-sandbox launch was denied before installation; the explicit sandbox invocation succeeded. Offline installation then identified missing archives. The permitted bootstrap downloaded the same 109 exact locked archives / 59,547,909 bytes recorded above, with redirects and proxies rejected and package identities checked. Two optional platform archives came from local cache. All 1,518 locked cache checksums matched. The localhost archive server closed before the final immutable skip-build installation passed offline. No manifest or lockfile changed.

| Post-change check | Result |
| --- | --- |
| `node .yarn/releases/yarn-4.18.1.cjs install --immutable --mode=skip-build` | Final offline exit 0 |
| `node .yarn/releases/yarn-4.18.1.cjs build` | Exit 0; seven existing warnings |
| `node node_modules/typescript/bin/tsc --noEmit --incremental false` | Exit 0 |
| ESLint on the changed COSC test | Exit 0; no warnings |
| Old COSC test, with the existing error case moved before the success case in disposable storage | One passed / one failed / four skipped; expected exit 1; success case received 500 instead of 302 |
| Corrected COSC test with the same disposable ordering | Two passed / four skipped; exit 0; no initial failures or retries |
| Corrected COSC suite in its normal order | Six passed; exit 0; no initial failures or retries |

Jest used `node --no-sparkplug node_modules/jest/bin/jest.js --runInBand --silent --runTestsByPath` with the existing COSC suite. A disposable logging-only environment recorded initial failures and retries. The ordering checks selected the two existing POST cases; the old implementation was a negative control, not an ordinary gate. The candidate copy was restored before the final six-test run. No `--forceExit` was used. Full coverage, hosted CI, browser checks and WireMock server contracts were not rerun for this narrow fixture correction.

This correction adds one existing unit-suite modification to the previous candidate: 51 new unit suites, six existing unit-suite changes, the Jest configuration and `docs/test-pyramid.md` make 59 PR11 deliverable paths. Four inherited PR10 harness paths remain pending base alignment. These two local review documents are excluded context, giving 65 distinct working-tree paths in total. The new-suite and added-case counts remain unchanged by this correction.

GA missing-parameter recovery remains the separately owned production follow-up described above. No staging, commit, push, branch or ref change was made for this correction; the existing index is preserved.

### Hearing-payment persistence assertion and case-count correction — 22 October 2026

The hearing-payment synchronization-failure test now snapshots the complete claim inside the persistence mock. Its expected payload is cloned before invoking production logic, with only `paymentSyncError` changed to true. The assertion checks the exact draft key, owner, error-handling argument, preserved claim fields and one persistence call. A later mutation of the same claim can no longer make an incorrect earlier write pass. No production implementation or additional test case changed.

Fresh execution confirms **387 added cases**: 381 in the 51 new suites, plus six additions to the existing encryption suite (nine current cases minus three at the exact PR11 base). The earlier 386-case summary is superseded by this current count; historical run results are unchanged.

Verification used Node 24.21.0, tracked Yarn 4.18.1 and a fresh physical disposable source copy with no checkout dependencies. A macOS sandbox blocked external connections and writes outside disposable storage; a direct probe confirmed localhost access and external-connect denial with EPERM. The separate Node network preloader did not share the preview guard's module path.

| Check | Result |
| --- | --- |
| Corrected hearing-payment suite, serial, `--no-sparkplug` | 12 passed; exit 0; no initial failures or retries |
| Disposable save-before-update negative control | 11 passed / one failed; expected exit 1; the saved flag was false instead of true, including both existing retries |
| All 51 new suites plus the encryption suite after restoring the mutation, serial, `--no-sparkplug` | 52 suites / 390 tests passed; exit 0; no initial failures or retries |
| Exact-base encryption suite, using current unchanged encryption implementation | Three passed; exit 0; no initial failures or retries |
| TypeScript `--noEmit --incremental false` | Exit 0 |
| ESLint on the changed hearing-payment test | Exit 0; no warnings |

The negative control changed production code only in disposable storage and was restored before the combined positive run. A disposable result parser initially used the wrong JSON field after the expected negative-control failure; the parser was corrected and the remaining checks continued. Assertions, discovery and the existing retry policy were preserved; no `--forceExit` was used. Full coverage, route integration, builds, Pact, browsers, hosted checks and WireMock server execution were not rerun for this assertion-only correction. Earlier unexplained full-run failures remain unresolved.

The initial offline immutable installation identified missing archives. The permitted exact-archive bootstrap downloaded 109 locked archives / 59,547,909 bytes, with redirects and proxies refused and package identities checked; the URL set matches the earlier archive inventory excluding the same seven already-cached packages. Two optional platform archives came from copied cache. All 1,518 locked npm archive checksums matched; the localhost archive server then closed and the final immutable skip-build installation passed offline. Manifests, lockfile, runtime and production files remain unchanged.

Both review-note documents remain local, unstaged context as requested. This correction changes only the existing hearing-payment test and this local record; it adds no deliverable path. GA confirmation recovery remains separately owned. No staging, commit, push, branch or ref change was performed. Disposable dependencies, caches, downloads, reports and probes are removed at handover.


### PR11 closing integration corrections — 22 October 2026

This addendum supersedes the earlier test-only PR11 boundary and historical GA/timeline exclusions. The user authorised finishing the remaining bounded integration corrections in the existing PR11. No further production port is identified by the completed source audit; deliberate exclusions and acceptance gaps below are not automatically additional PRs. This implementation does not establish whole-ticket acceptance.

**Proposed PR title:** DTSCCI-6593 Complete fork integration fixes, regression coverage and reconciliation.

**Proposed PR summary:** complete the selective fork test integration and repair the remaining bounded upload, response, GA confirmation and presentation omissions. Sparse saved upload forms safely render newly selected categories; unanswered partial-admission questions recover through the task list; translated comment-only timelines retain their comment. Both GA confirmations accept an explicit scalar collection-item ID/fee pair, preserve zero and use a non-destructive party-dashboard recovery for unavailable pairs. Numeric missing values, query date errors, respondent titles, task headings and opponent timeline composition are corrected without changing calculations, authentication, dependencies or deployment choices.

#### Actual starting point and final scope

Work started on `DTSCCI-6593-fork-tests-reconciliation` at `6c69851c67d6fd614d34573f5d93b04840db6a8b`. This pre-existing merge already includes PR10 `1ab4da41975fe91e93ef089d0f52393a93d0e751`, including its accessibility-capture selection fix. No checkout, merge, rebase, branch/ref update, staging, commit, push or remote access was performed by this closing implementation. Local master is `eb4ae9ca292aa5e4f9a0ef2d44296c146ec5a3af`; the exact fork remains `486994338cd584ac728dc0dedacbc31cc0b11406`.

The closing diff, including the assertion refinement recorded below, comprises **52 existing paths: 23 production files, 15 unit-test suites, five integration suites, seven captures and two documents**. The original closing batch modified 50 paths; the refinement strengthens two additional existing PR11 suites without adding production changes or test cases. The complete prospective PR11 diff against current PR10 contains 107 paths, including the already committed selective test integration. There are no new files in this closing batch. The pre-existing untracked `docs/pr10-ui-preview-review-notes.md`, excluded historical log and Yarn 3 binary remain untouched and outside delivery. Historical statements excluding this tracked PR9/PR11 reconciliation record are superseded: this record is an intended PR11 deliverable, left unstaged with the rest of the changes for review.

The agreed 22 production corrections required one additional supporting edit to the existing dashboard shell. Its default summary output is unchanged; the new block lets only the query template override date-summary destinations so a model-level date error focuses the actual day input. No new shared helper file was introduced. Fee-change form-wrapper cleanup remains excluded.

| Closing path | Purpose and provenance |
| --- | --- |
| `docs/pr9-presentation-review-notes.md` | Current scope, complete path reconciliation, provenance, verification limits and proposed PR description; preserve earlier historical results. |
| `docs/test-pyramid.md` | Correct alias direction: test:integration invokes test:routes. |
| `src/integration-test/routes/generalApplication/generalApplication.integration.test.ts` | HTTP parsing of both confirmation routes, repeated query parameters, both party dashboards and zero-fee collection identity. |
| `src/integration-test/routes/queryManagement/qm.integration.test.ts` | Real consent/session prerequisite and invalid query POST with one date error, preserved fields and a focusable day summary target in English/Welsh. |
| `src/integration-test/routes/response/rejectAll.integration.test.ts` | Actual guarded-route/task-list/response-choice recovery plus translated comment-only timelines and invalid POST redisplay. |
| `src/integration-test/routes/uploads/repeatedUploads.integration.test.ts` | Real selection/save/delete/render/upload/redisplay across all 15 categories and both roles from a sparse saved form; retain documents, metadata, order and the other role. |
| `src/integration-test/services/generalApplication/helpWithFeeService.integration.test.ts` | Preserved exact collection-ID-to-GA-case mapping for card/HWF paths, zero fees and independent call-time HWF payload snapshots. |
| `src/main/routes/features/generalApplication/certOfSorC/submitCoScApplicationConfirmationController.ts` | Apply the same non-destructive boundary to COSC confirmation. |
| `src/main/routes/features/generalApplication/submitGeneralApplicationConfirmationController.ts` | Validate the query pair and recover to the party dashboard without cancelling a draft. |
| `src/main/routes/guards/partAdmitHowMuchHaveYouPaidGuard.ts` | Adapt fork missing-answer guard to the existing task-list recovery. |
| `src/main/services/features/caseProgression/disclosureService.ts` | Adapt only the fork optional-array guards; keep actual section builders, ordering, validation data and persisted collections. |
| `src/main/services/features/caseProgression/expertService.ts` | Adapt only the fork optional-array guards; keep actual section builders, ordering, validation data and persisted collections. |
| `src/main/services/features/caseProgression/trialService.ts` | Adapt only the fork optional-array guards; keep actual section builders, ordering, validation data and persisted collections. |
| `src/main/services/features/caseProgression/witnessService.ts` | Adapt only the fork optional-array guards; keep actual section builders, ordering, validation data and persisted collections. |
| `src/main/services/features/generalApplication/submitGeneralApplicationConfirmationContent.ts` | Shared strict scalar query parsing and safe fee-link construction; preserve explicit collection-item identity and zero fees. |
| `src/main/services/features/response/timelineOfEvents/defendantTimelineService.ts` | Recover absent timeline rows while preserving comments; exclude the fork comment-dropping fallback. |
| `src/main/views/claim-details-tpl-dashboard.njk` | Default-preserving error-summary block, allowing the query page to point model-level date errors to the day input. |
| `src/main/views/features/claim/interest/how-much-continue-claiming.njk` | Bounded numeric default: blank for absent values while preserving zero, saved values and invalid submitted text; no calculation/validation change. |
| `src/main/views/features/claim/task-list.njk` | Ordinary heading composition while preserving copy, IDs, task numbering and destinations. |
| `src/main/views/features/claimantResponse/ccj/repayment-plan-instalments.njk` | Bounded numeric default: blank for absent values while preserving zero, saved values and invalid submitted text; no calculation/validation change. |
| `src/main/views/features/claimantResponse/claimant-response-task-list.njk` | Ordinary heading composition while preserving copy, IDs, task numbering and destinations. |
| `src/main/views/features/generalApplication/respondent-agreement.njk` | Use the existing translated page-specific browser title. |
| `src/main/views/features/generalApplication/response/accept-defendant-offer.njk` | Bounded numeric default: blank for absent values while preserving zero, saved values and invalid submitted text; no calculation/validation change. |
| `src/main/views/features/queryManagement/createQuery.njk` | Compose only present escaped date messages and map model-level date summaries to the existing day input. |
| `src/main/views/features/response/admission/how-much-have-you-paid.njk` | Bounded numeric default: blank for absent values while preserving zero, saved values and invalid submitted text; no calculation/validation change. |
| `src/main/views/features/response/admission/partialAdmission/how-much-do-you-owe.njk` | Bounded numeric default: blank for absent values while preserving zero, saved values and invalid submitted text; no calculation/validation change. |
| `src/main/views/features/response/statementOfMeans/dependants/dependants.njk` | Bounded numeric default: blank for absent values while preserving zero, saved values and invalid submitted text; no calculation/validation change. |
| `src/main/views/features/response/statementOfMeans/unemployment.njk` | Bounded numeric default: blank for absent values while preserving zero, saved values and invalid submitted text; no calculation/validation change. |
| `src/main/views/features/response/task-list.njk` | Ordinary heading composition while preserving copy, IDs, task numbering and destinations. |
| `src/main/views/features/response/timelineOfEvents/defendant-timeline.njk` | Official ordered table composition, a separate PDF fallback and no empty table. |
| `src/test/unit/modules/nunjucks/presentationCaptures.test.ts` | Check the seven narrowly refreshed capture regions without claiming browser or authenticated acceptance. |
| `src/test/unit/modules/nunjucks/presentationDateErrors.test.ts` | Real query validation, escaped inline messages and actual GOV.UK error-summary activation of the day input. |
| `src/test/unit/modules/nunjucks/presentationTemplates.test.ts` | 120 raw numeric attribute cases, page titles, escaped ordered timelines and PDF/empty states; real models and templates. |
| `src/test/unit/modules/nunjucks/taskListTemplates.test.ts` | Retain task ordering/destinations while rejecting orphan legends or heading-only fieldsets. |
| `src/test/unit/routes/features/claim/generalApplication/certOfSorC/submitCoScApplicationConfirmationController.test.ts` | Direct handlers, 24 invalid query cases per route, valid zero/decimal fees, role-specific recovery and read failures; stub the indirect app collaborator instead of booting Express. |
| `src/test/unit/routes/features/claim/generalApplication/submitGeneralApplicationConfirmationController.test.ts` | Direct handlers, 24 invalid query cases per route, valid zero/decimal fees, role-specific recovery and read failures; stub the indirect app collaborator instead of booting Express. |
| `src/test/unit/routes/guards/partAdmitHowMuchHaveYouPaidGuard.test.ts` | Missing intermediate answer states redirect without next(error); existing YES/NO cases remain. |
| `src/test/unit/services/features/caseProgression/disclosureService.test.ts` | Both roles and selected missing/empty collections using real Claim/form models and section builders; preserve the submitted model. |
| `src/test/unit/services/features/caseProgression/expertService.test.ts` | Both roles and selected missing/empty collections using real Claim/form models and section builders; preserve the submitted model. |
| `src/test/unit/services/features/caseProgression/trialService.test.ts` | Both roles and selected missing/empty collections using real Claim/form models and section builders; preserve the submitted model. |
| `src/test/unit/services/features/caseProgression/witnessService.test.ts` | Both roles and selected missing/empty collections using real Claim/form models and section builders; preserve the submitted model. |
| `src/test/unit/services/features/generalApplication/submitGeneralApplicationConfirmationContent.test.ts` | Distinct collection IDs and GA case references, exact explicit fee links including zero, invalid direct inputs and honest existing return-route semantics. |
| `src/test/unit/services/features/queryManagement/viewQueriesService.test.ts` | Strengthen the adapted fork suite's closure assertion to the exact date of the closed message, independently of the parent message's date. |
| `src/test/unit/services/features/response/timelineOfEvents/defendantTimelineService.test.ts` | Use actual CCD translators and models for both response branches; retain comments and fresh rows without mutating saved data. |
| `src/test/unit/services/translation/claimantResponse/convertToCCDClaimantLiPResponse.test.ts` | Strengthen the adapted fork suite with populated real questionnaire models and the complete expected CCD payload, including claimant expert ownership and omitted respondent fields. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-ccj-repayment-plan.html` | Refresh only the affected captured title, task heading or missing numeric attribute; retain historical data, links, forms and unrelated DOM. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-claimant-response-task-list.html` | Refresh only the affected captured title, task heading or missing numeric attribute; retain historical data, links, forms and unrelated DOM. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-response-general-application-1720536653906339-accept-defendant-offer.html` | Refresh only the affected captured title, task heading or missing numeric attribute; retain historical data, links, forms and unrelated DOM. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-response-general-application-1720536653906339-respondent-agreement.html` | Refresh only the affected captured title, task heading or missing numeric attribute; retain historical data, links, forms and unrelated DOM. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-response-statement-of-means-dependants.html` | Refresh only the affected captured title, task heading or missing numeric attribute; retain historical data, links, forms and unrelated DOM. |
| `src/test/utils/mocks/a11y/mock-case-1645882162449409-response-task-list.html` | Refresh only the affected captured title, task heading or missing numeric attribute; retain historical data, links, forms and unrelated DOM. |
| `src/test/utils/mocks/a11y/mock-claim-task-list.html` | Refresh only the affected captured title, task heading or missing numeric attribute; retain historical data, links, forms and unrelated DOM. |

#### Behavior boundaries and final exclusions

- Upload recovery is specifically for a stored form with a missing optional category collection. Current multipart parsing builds empty arrays. The integration regression resumes a sparse saved draft, selects an additional category through the real controller, saves its file and redisplays the complete result. It does not claim that an ordinary current first upload necessarily creates sparse arrays. Store/document-client/authentication boundaries remain substituted; no authenticated persistence acceptance is claimed.
- The timeline change supplies only absent rows; it preserves the stored comment and does not replace malformed non-array data with an invented valid model. Missing partial-admission answers retain the existing recovery and submission requirements.
- A GA query `id` is `generalApplications[].id`. The downstream fee service resolves that exact collection entry to `value.caseLink.CaseReference`; these are distinct identifiers in the new tests. The content builder preserves the supplied valid pair and never borrows a draft fee. Controllers recover invalid pairs using `getDashboardUrlForParty`. `getCancelUrl` remains the existing normal-page return-link behavior, not the automatic recovery destination: its route deletes the selected draft field. No Cancel-controller or downstream payment implementation was changed.
- Numeric defaults preserve raw zero, saved numbers, invalid strings and NaN; validation and calculations are unchanged. Query date messages are escaped individually, official components own the error wrapper, and existing day/month/year identifiers and form contracts remain.
- The seven capture edits are limited source-aligned updates to affected headings, missing numeric attributes and the respondent title. They do not regenerate historical scenarios or constitute a browser/accessibility pass. Unrelated captured values, monetary data, navigation, metadata and form contracts remain.
- Preserve master encryption, security/dependency/deployment choices, strict preview/OIDC boundaries, GA draft/type/fee guards and substantive monetary behavior. Blanket invalid-date blanking, malformed-document-ID fallbacks, silent missing-document defaults and repayment resets remain excluded. Mediation's actual form callers already normalize their collections; no additional provider guard was established as necessary. Dormant editor activation, equivalent markup, unused imports/comments and cosmetic cleanup remain excluded.
- Case-progression check answers with an absent entire upload draft remains an inherited recovery edge. The fork's empty-summary fallback does not make its submission path safe and is not imported. This is explicitly outside the closing batch rather than silently treated as fixed.
- The eight Defer entries remain explicit residual coverage/owner-acceptance boundaries, not promises of PR12 or eight further PRs: PCQ needs an independent compatibility oracle; cookie/language DOM edge coverage is not exhausted by bilingual rendering; the repeated expert-report editor is dormant although related models retain translation consumers; the fork's standalone step-free-access Support assertion is not the real nested validation contract; secret-volume isolation and exhaustive GA CYA producer checks are not established. Current behavior and existing protections remain. Accepted delivery/exclusion attribution for DTSCCI-5145 and DTSCCI-4187, operational evidence and separate QA remain owner acceptance work, not invented completed requirements.

The current 719-path ledger retains every ancestor-to-exact-fork path exactly once. R085–R089 record these closing adaptations and mixed-hunk limits; primary disposition counts reflect the current rows. A path disposition does not claim whole-file or assertion-for-assertion parity.

#### Verification actually executed for this batch

The results in this subsection describe the original 50-path closing batch, before the two-suite assertion refinement below. They remain historical evidence for that candidate.

**Fresh locked verification is blocked.** An immutable skip-build installation in a physical disposable candidate copy, with network/scripts/telemetry/hardened online checks disabled, exited 1. Copied local caches supplied 1,409 checksum-matching entries; 116 locked entries remained unavailable, including GOV.UK Frontend 6.5.1 and class-validator 0.15.1. No downloads, live audit, installation hooks, browser/runtime downloads, container pulls or remote operations occurred. The earlier permission for registry access was not treated as overriding the later offline instruction.

Available-dependency checks below are explicitly **diagnostics, not a current locked-install pass**. They used Node 24.21.0, TypeScript 5.9.3 and the existing local dependency tree, whose GOV.UK Frontend is 6.4.0 and class-validator is 0.14.4. Nothing copied or linked that checkout node_modules into the disposable candidate. Ordinary diagnostics read the candidate checkout under an OS write-denial sandbox; caches/reports/temp directories stayed disposable. Negative controls used a separate physical source copy with read-only dependency lookup. No result below is presented as a fresh locked-build, pinned-component browser or authenticated acceptance result.

The macOS sandbox denied checkout writes and external network connections while permitting localhost. A direct check connected to a private localhost server, then observed immediate external socket denial with EPERM, exit 0. No browser was launched. No preview module was preloaded, avoiding the known same-path CommonJS-cache collision.

`J` below is `node --no-sparkplug node_modules/jest/bin/jest.js`. Unit/integration diagnostics used one worker. A disposable Node-environment wrapper logged test failures and retries without changing assertions, discovery, coverage thresholds or existing retry counts. All reports and Jest caches were placed in disposable storage; the integration JUnit file reporter was replaced with the ordinary console reporter to prevent checkout output. No `--forceExit` was used.

| Current closing-batch check | Actual result |
| --- | --- |
| `node .yarn/releases/yarn-4.18.1.cjs install --immutable --mode=skip-build` with the required offline/no-hook environment in a physical copy | Exit 1; 116 locked cache entries unavailable; zero downloads |
| `node node_modules/typescript/bin/tsc --noEmit --incremental false` against available declarations | Exit 0 |
| ESLint on all 27 changed TypeScript paths | Exit 0; zero errors, four existing no-explicit-any warnings |
| `J --runInBand --silent --runTestsByPath` with all 13 changed unit suites, private cache/JSON output and logging-only environment | 13 suites / 453 tests passed; ordinary exit 0; no initial failures or retries recorded |
| `J -c jest.functionaltest.config.js --runInBand --silent --reporters=default --runTestsByPath` with the five changed integration suites plus existing confirmation-content integration | Six suites / 144 tests passed; ordinary exit 0; no initial failures or retries recorded |
| Nine-production-file negative control: former implementations restored only in disposable source; existing new regression names selected with `--testNamePattern` | Nine suites: 88 expected failures / 32 passes / 82 skipped; ordinary exit 1 |
| Same selected controls after restoring the disposable current implementations | Nine suites / 120 passed / 82 skipped; ordinary exit 0 |
| `node bin/check-dependency-pins.mjs` | Exit 0; 61 production / 63 development pins / 58 resolutions; 1,522 npm packages with locked SHA checksums |
| `node bin/functional-baseline.js check` | Exit 0 |
| `bash bin/test-civil-shared-import-consumers.sh` | Exit 0 |
| `node bin/validate-wiremock-mappings.js`; `node bin/ui-preview-mappings.cjs` | 41 chart / 36 preview mappings; both exit 0; server execution not claimed |
| `git --no-optional-locks diff --check` | Exit 0 |

The immutable install, complete builds, full unit coverage, complete route discovery, Pact/server contracts and pinned-component browser/accessibility checks still need execution with the current locked dependencies. Hosted final-commit checks, applicable authenticated/AAT and operational verification, and separate QA remain acceptance gates. Prior full-suite, Pact and browser results are dated evidence and were not substituted for these blocked checks.

Initial diagnostic failures were retained rather than relabelled as inherited passes:

- The first TypeScript diagnostic found eight new fixture enum/type errors. Fixtures now use the real PartyType enum; later type checking passed.
- The first unit diagnostic passed 385 cases in ten suites but two new handler suites failed during setup: the real GA service's response-store import attempted to construct the app while the utility boundary was mocked. An explicit app collaborator stand-in prevents application construction; both suites then passed 58 cases. The final 13-suite diagnostic passed 453 cases.
- The first six-suite integration diagnostic ended with 132 passes and eight failures. Six GA cases lacked req.cookies in the lightweight HTTP fixture; two query cases had not completed the real sharing-consent/session prerequisite. The fixture now supplies cookies and the query test follows consent using an agent; the final 144 cases passed.
- That first integration run also recorded one retry in an existing defendant disclosure-document removal case. Its initiating error was not captured before logging was enabled, so its cause remains unestablished. The later clean run is not an explanation for this or the earlier timeout/socket/CCJ/COSC/phone/dashboard histories.
- Initial changed-file lint found five extra-blank-line errors, which were corrected. The four remaining no-explicit-any warnings predate this batch.

The negative control restores complete related former implementations, including all three GA files together, so its failures are behavioral assertions rather than missing-export/setup errors. It demonstrates that the guards, comment preservation and GA query boundary assertions detect the original behavior. All disposable mutations were restored before the positive control.

All closing changes remain unstaged for review. No commit or push was made. Manifest/lockfile, runtime, dependency, deployment and pipeline files, excluded context and pre-existing PR10-note contents are unchanged. The branch, HEAD, refs and raw index are preserved from the actual starting snapshot; the source fork remains unchanged. Disposable copies, caches, reports and probes are removed at handover.

### PR11 assertion refinement — 22 October 2026

The user authorised strengthening two retained assertions and correcting R003 after independent review. The claimant-response test now supplies real questionnaire, hearing and expert models and asserts the complete expected CCD payload, including claimant expert ownership, absent respondent expert data and omitted values. The query test requires `2 January 2024`, the closed reply's date, rather than accepting any truthy closure date. R003 now acknowledges PR11's test-only UTC baseline. No production behavior or test case was added.

Fresh checks used Node 24.21.0 and the available dependency tree under an OS sandbox denying checkout writes and external network connections. Reports, caches and physical source copies stayed disposable. These are available-dependency diagnostics; no installation or download was attempted, and the recorded locked-install and broader acceptance gaps remain.

| Assertion-refinement check | Actual result |
| --- | --- |
| Both affected suites, `node --no-sparkplug node_modules/jest/bin/jest.js --runInBand --silent --runTestsByPath …`, private cache/report and logging-only environment | Two suites / nine tests passed; ordinary exit 0; no initial failures or retries |
| TypeScript `--noEmit --incremental false` | Exit 0 |
| ESLint on both changed test suites | Exit 0; no warnings |
| Disposable negative control: translate expert data under respondent ownership and use the parent message's date as the closure date | Two expected failures / seven passes; ordinary exit 1; existing retries retained |
| Same incorrect production code with only the previous existence/truthiness assertions restored in disposable tests | Nine passed; ordinary exit 0, demonstrating the former assertion weakness |
| Restore current production and strengthened assertions in the disposable copy | Nine passed; ordinary exit 0; no initial failures or retries |

The original closing batch's recorded results above were not rerun or presented as fresh results for this refinement. The latest changes affect only these two test suites and this document; the complete PR11 path count remains 107. No staging, commit, push, branch/ref change or production edit occurred. Excluded context and pre-existing work remain preserved; disposable resources are removed at handover.
