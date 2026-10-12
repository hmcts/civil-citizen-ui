# Add another

Court orders, claim evidence and response evidence use the app component adapted
from the improvements fork. Each client-managed section has
`data-module="cui-add-another"`, a `.cui-add-another__items` container, explicit
row Remove buttons and an Add button. MOJ Frontend and jQuery remain available
for their other consumers. The separate `append-row.js` initialisation remains.

## Row ownership

Only explicitly marked roots with the complete row contract are enhanced.
Initialising a root twice does not attach another listener. Fields supply
`data-name` and `data-id` patterns with `%index%`; related label, hint, error and
ARIA identifiers use the same row prefix. Surviving rows are reindexed after
both addition and removal, including error-summary links. User values are never
used as indexing templates.

New rows clear user values, validation state and row-specific hidden references.
Existing rows keep their values and errors. Evidence change handlers are
delegated and use the select's own row, so cloned binding attributes cannot
prevent later edits. Initialisation does not clear saved descriptions. Changing
an evidence type continues to clear the description within that same row.

Each component retains at least one row. Court orders have a component-local
maximum of ten; excess saved rows remain visible for correction. Submission
also validates the maximum after the existing empty-row filtering. English and
Welsh errors use `ERRORS.MAXIMUM_TEN_COURT_ORDERS`.

Add and Remove controls are hidden until successful enhancement. Without
JavaScript, rendered fields can still be edited and submitted. This change does
not add a server fallback for adding client-managed rows. After adding, focus
moves to the new row; after removal it moves to an editable surviving row.

## Server-managed uploads

Case-progression and mediation uploads retain their templates, controller
actions and document references. Their `add_another-*`, `[uploadButton]` and
`[removeButton]` controls remain submit controls. They do not use the new
client-managed items container. The shared Remove macro remains `type="submit"`.
The legacy error-cleanup observer now acts only on newly inserted MOJ rows;
updates to existing rows and app-component rows are outside its scope.

## Checks

Component tests in `src/test/unit/assets/js/add-another.test.ts` render the actual
journey templates, evidence/court-order macros and the installed GOV.UK
components. They cover controls, cloning, removal, limits, associations, focus,
evidence panels, languages and legacy/upload coexistence. The rendering helper
omits only the application shell. Court-order model tests and the route
integration test cover ten/eleven-order submissions without truncating values.

On the supported runtime and exact locked dependency tree, run the focused
unit tests and route test first, then TypeScript, lint, build, coverage and the
existing route/contract/baseline checks. Run installs and generated output in a
disposable copy. Offline installation must disable network and installation
scripts; missing archives are a blocked check, not a passing installation.

Browser and accessibility checks must use local assets and mocks. Check the
three migrated journeys in English and Welsh, including repeated initialisation,
first/middle/last removal, the court-order limit, retained errors, keyboard focus
and JavaScript-disabled submission. DOM tests do not replace those journey
checks or separate QA-person verification.

## Remaining integration

This stage does not remove MOJ/jQuery or migrate upload persistence, task lists,
postcode lookup, other templates or local preview. Combined-tree regression,
integrated browser/accessibility checks, hosted CI and QA evidence remain
required for the integration ticket.
