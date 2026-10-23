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
