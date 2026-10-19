# PR8 upload review notes

PR8 adapts the fork's upload presentation while retaining server-managed uploads and master's document, metadata and HTML-safety contracts. The focused follow-up adds regression coverage and records the interaction and fixture limitations below.

## Pending file selections

With JavaScript enabled, Add, Remove and Continue are blocked when a repeated-upload form contains a selected, unsaved file. Focus moves to the first pending row's existing Save file button. This also blocks removal of a row whose pending file the user intended to discard.

Every Save file action remains native, including Save on another row or category. The server processes only the file targeted by that action. If several rows contain pending files, saving one navigates away and the other browser selections cannot survive redisplay. Saving a row without a selection can likewise navigate away from other pending files. The guard therefore provides partial protection and retains the existing one-file-at-a-time saving contract. JavaScript-disabled submissions retain their existing server behaviour.

The component tests cover blocked Add/Remove/Continue actions with pending files in two categories, preserved selections before navigation, focus, repeated initialisation and native Save actions. Their submit listener cancels navigation to observe the event. These tests do not claim that files survive an actual redisplay. A broader discard or multi-file saving interaction requires a separate behaviour decision.

## Representative multipart coverage

The repeated-upload route suite starts with actual controller GET responses, then submits their rendered controls through multipart parsing and the real route handlers. Document-client and draft-store boundaries are mocked; authenticated storage is outside these tests.

The case-progression cases cover disclosure descriptions and dates, file-only lists, witness names and descriptions, expert names and expertise, and expert question/answer documents with the actual opposing-party options. Both roles exercise first, middle and last removal, addition, metadata entry, upload, GET redisplay and an action in an independent category. Assertions compare complete converted models and preserve the other role's stored documents.

Both mediation collections exercise the same removal/addition/upload sequence and preserve the other collection. Claimant cases use English and defendant cases use Welsh. This is representative coverage of distinct metadata shapes, not every category, role and language combination. The shared rendering helper still substitutes the outer page shell.

Three further multipart cases attach two pending files and submit Save on either pending row or an empty third row. They assert exactly which file reaches the document client and compare every saved document and metadata value after redisplay. These cases document the existing limitation described above.

## Historical mediation capture

The mediation accessibility capture preserves historical data, including `documentsForYourStatement[0][typeOfDocument]`, whereas the current statement builder renders `yourName`. Its upload grouping and date legends were corrected separately. The capture is useful bounded presentation evidence, not an exact rendering of today's complete form. Current template and route tests carry the production field-contract assertions.

## Merge evidence

Required hosted checks and applicable contract-server checks remain outstanding. Authenticated journeys and separate QA also remain acceptance work for the wider integration. These tests and capture qualifications do not establish whole-ticket DTSCCI-4185 acceptance.

## Follow-up verification on 19 October 2026

Verification used Node 24.21.0 and Yarn 4.18.1 in a disposable installation. After local cache checks, the user authorised downloading the missing locked packages. Only 110 exact `registry.yarnpkg.com` archive URLs were downloaded, with an independent URL/redirect allowlist. Yarn fetched them from a restricted localhost server, verified the locked checksums and completed `install --immutable --mode=skip-build`. The manifest and lockfile remained unchanged. A subsequent fully offline immutable installation passed; all test execution blocked external connections.

| Check | Result |
| --- | --- |
| Upload component, template and summary suites | 3 suites, 77 tests passed |
| Repeated-upload and query multipart suites | 2 suites, 53 tests passed |
| TypeScript `--noEmit --incremental false` | Passed |
| ESLint on the two changed test files | Passed, no errors or warnings |
| Development build | Passed, seven warnings |
| Whitespace validation | Passed |

Both Jest commands used `--no-sparkplug --runInBand --detectOpenHandles --silent --runTestsByPath`; the multipart command also used `-c jest.functionaltest.config.js`. All final commands exited zero without forced shutdown. These are focused results for this follow-up, not a new full-coverage, browser or authenticated-journey run.

Initial offline installation attempts failed on missing archives, including an attempt before normalising filenames of checksum-matching copied cache entries. A later TypeScript run caught an incomplete document assignment in a newly added test; the expected model was corrected to use the production conversion function. The final type check and affected route suites passed after that correction. Existing peer-dependency and build warnings remain.
