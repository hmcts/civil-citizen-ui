# Civil Citizen UI Test Migration Investigation

## Executive Summary

This investigation analyzed the Civil Citizen UI test suite to identify opportunities for migrating browser E2E tests to faster, more maintainable Jest/Supertest integration tests. The goal is to reduce the E2E footprint while maintaining comprehensive coverage.

## Current Test Landscape

### Test Suite Breakdown

**Codecept Browser Tests:**
- **Functional Tests**: 102 test files in `src/test/functionalTests/tests/`
- **E2E Tests**: 22 test files in `src/test/e2eTests/tests/`
- **Total Browser Tests**: ~124 files

**Jest Unit Tests:**
- **Unit Tests**: 822 test files in `src/test/unit/`
- Strong coverage of services, routes, guards, and utilities

### Test Organization

```
src/test/
├── functionalTests/
│   ├── tests/
│   │   ├── api_tests/          # API-only tests (no UI)
│   │   └── ui_tests/           # Browser tests with API setup
│   │       ├── bundles/
│   │       ├── case-offline/
│   │       ├── case-progression/
│   │       ├── case-struck-out/
│   │       ├── create-claim/
│   │       ├── deadline-extension/
│   │       ├── dj/
│   │       ├── full-admit/
│   │       ├── ga/
│   │       ├── hearings/
│   │       ├── intermediate-track/
│   │       ├── jba/
│   │       ├── mediation/
│   │       ├── multi-track/
│   │       ├── noc/
│   │       ├── part-admit/
│   │       ├── payments/
│   │       ├── qm/
│   │       ├── reject-all/
│   │       ├── rfr/
│   │       ├── upload-evidence/
│   │       └── welsh/
│   └── specClaimHelpers/
│       └── api/                # API helper methods
├── e2eTests/                   # Legacy E2E tests
└── unit/                       # Jest unit tests
```

## Key Findings

### 1. Heavy Reliance on API Setup Pattern

**Pattern Identified:**
Most functional tests follow this structure:
```javascript
Before(async ({api}) => {
  // Create claim via API
  claimRef = await api.createSpecifiedClaim(...);
  
  // Perform defendant response via API
  await api.performCitizenResponse(...);
  
  // Progress case via API
  await api.viewAndRespondToDefence(...);
  await api.performCaseProgressedToSDO(...);
  await api.performBundleGeneration(...);
  
  // Login to UI
  await LoginSteps.EnterCitizenCredentials(...);
});

Scenario('Verify UI state', async ({I}) => {
  // Assert rendered UI state
  await verifyNotificationTitleAndContent(...);
  await verifyTasklistLinkAndState(...);
  I.click(taskListItem.title);
  viewBundlePage.verifyPageContent(...);
});
```

**Problem:** This pattern uses expensive browser automation to verify what could be tested at the integration level.

### 2. Test Categories by Migration Suitability

#### High Priority for Migration (API Setup + UI Assertion)
These tests use API to set up state, then verify rendered HTML:

- **Dashboard/Notification Tests**: Verify notifications and task list items appear
  - `bundles/` - 4 tests
  - `case-offline/` - 6 tests  
  - `case-progression/` - 4 tests
  - `case-struck-out/` - 4 tests
  - `upload-evidence/` - tests

- **Response State Tests**: Verify correct pages/content after API state changes
  - `full-admit/` tests
  - `part-admit/` tests
  - `reject-all/` tests
  - `mediation/` tests

**Estimated**: ~40-50 tests suitable for migration

#### Medium Priority (Routing/Navigation)
Tests that verify routing logic and page transitions:
- `deadline-extension/` tests
- `dj/` (Default Judgment) tests
- Navigation between pages

**Estimated**: ~20-30 tests

#### Keep as E2E (Distinct Browser Value)
Tests that require real browser behavior:
- **Authentication flows**: Login, session management, OIDC
- **Payment journeys**: `payments/` - Real payment provider integration
- **File uploads**: Document upload with real file handling
- **Form journeys**: Multi-step form validation with browser state
- **Cross-service smoke tests**: End-to-end critical paths
- **Welsh language**: `welsh/`, `ga-welsh/` - Full localization testing

**Estimated**: ~20-30 tests

### 3. Existing Integration Test Infrastructure

**Current State:**
- `jest.functionaltest.config.js` exists but points to non-existent `src/integration-test/` directory
- No established integration test harness
- Strong unit test foundation with mocking patterns

**Available Tools:**
- `supertest` already in dependencies
- `supertest-session` for session testing
- `nock` for HTTP mocking
- Extensive mock fixtures in `src/test/utils/mocks/`

### 4. API Helper Analysis

The `src/test/functionalTests/specClaimHelpers/api/steps.js` file provides comprehensive API operations:

**Key Methods:**
- `createSpecifiedClaim()` - Create LR vs LiP claims
- `createLiPClaim()` - Create LiP vs LiP claims
- `performCitizenResponse()` - Defendant responses
- `viewAndRespondToDefence()` - Claimant responses
- `performCaseProgressedToSDO()` - Case progression
- `performEvidenceUpload()` - Evidence upload
- `performBundleGeneration()` - Bundle generation
- `retrieveCaseData()` - Fetch case state

**Opportunity:** These helpers can be reused in integration tests to set up state, then use Supertest to verify rendered HTML.

### 5. Duplicate Coverage Concerns

**Observation:** Many tests verify workflow/API behavior that should be covered in `civil-ccd-definition`:
- Case state transitions
- Business process completion
- CCD event handling
- Workflow orchestration

**Recommendation:** Clarify ownership - citizen UI tests should focus on:
- Rendering correct content for given state
- Routing logic
- Form validation
- User-facing behavior

## Migration Strategy Recommendations

### Phase 1: Establish Integration Test Harness
1. Create `src/test/integration/` directory structure
2. Set up Supertest test harness with:
   - Express app initialization
   - Session management
   - Mock downstream services (CCD, idam, etc.)
   - Representative claim fixtures
3. Create example integration tests for 2-3 scenarios
4. Update `jest.functionaltest.config.js` to point to new directory

### Phase 2: Migrate Dashboard/Notification Tests
**Target**: ~40-50 tests
- Tests that verify dashboard notifications
- Tests that verify task list states
- Tests that verify "latest updates" content

**Approach:**
- Use API helpers to create case state
- Use Supertest to GET dashboard page
- Assert HTML contains expected notifications/tasks
- Much faster than browser automation

### Phase 3: Migrate Response State Tests
**Target**: ~20-30 tests
- Tests that verify correct pages shown based on response type
- Tests that verify content rendering for different states

### Phase 4: Clean Up Legacy Tests
- Remove tests with duplicate coverage in civil-ccd-definition
- Remove tests gated by environment variables
- Remove tests with hardcoded case IDs (e.g., `0000000000000001`)

### Phase 5: Retain Focused E2E Suite
Keep ~20-30 browser tests for:
- Authentication flows
- Payment journeys
- File uploads
- Critical smoke paths
- Full form journeys

## Test Ownership Clarification

### Civil Citizen UI Should Own:
- ✅ Rendering logic (correct content for given state)
- ✅ Routing logic (correct pages shown)
- ✅ Form validation (client-side validation)
- ✅ User interactions (button clicks, form submissions)
- ✅ Session management
- ✅ Localization (Welsh content)

### Civil CCD Definition Should Own:
- ❌ Case state transitions
- ❌ Business process orchestration
- ❌ CCD event handling
- ❌ Workflow logic
- ❌ API contract validation

## Expected Outcomes

### Quantitative Benefits:
- **Reduce browser tests**: From ~124 to ~30-40 tests (~70% reduction)
- **Increase integration tests**: From 0 to ~60-80 tests
- **Faster feedback**: Integration tests run in seconds vs minutes
- **Reduced flakiness**: No browser timing issues

### Qualitative Benefits:
- **Clearer ownership**: UI tests focus on UI concerns
- **Easier maintenance**: Integration tests easier to debug
- **Better confidence**: Tests verify actual rendering logic
- **Faster PR feedback**: Quicker test execution

## Technical Considerations

### Integration Test Pattern Example:
```javascript
describe('Dashboard notifications', () => {
  let app, agent;
  
  beforeAll(async () => {
    // Initialize app with mocked services
    app = await initializeApp();
    agent = request.agent(app);
  });
  
  it('should show bundle ready notification', async () => {
    // Arrange: Set up case state with bundle ready
    const claim = createClaimFixture({
      state: 'HEARING_READINESS',
      bundleGenerated: true
    });
    mockCcdService.getClaim.mockResolvedValue(claim);
    
    // Act: Request dashboard page
    const response = await agent
      .get('/dashboard')
      .set('Cookie', authenticatedSession);
    
    // Assert: Verify notification in HTML
    expect(response.status).toBe(200);
    expect(response.text).toContain('The bundle is ready to view');
    expect(response.text).toContain('View the bundle');
  });
});
```

### Challenges to Address:
1. **Session Management**: Need to mock OIDC/idam authentication
2. **Downstream Services**: Mock CCD, document store, payment services
3. **Fixtures**: Create representative claim data fixtures
4. **Nunjucks Rendering**: Ensure templates render correctly in test environment

## Next Steps

1. **Validate Approach**: Review this investigation with team
2. **Spike**: Create 2-3 example integration tests to validate approach
3. **Plan**: Break work into manageable stories/tasks
4. **Execute**: Migrate tests in phases
5. **Monitor**: Track test execution time and flakiness improvements

## Pilot Migration Candidate List (Ranked)

This is a concrete first-wave list to prove speed/reliability gains with low migration risk.

### Selection Criteria

- API-heavy setup + UI assertion only
- Minimal unique browser behavior
- High business value areas (dashboard, QM, case progression)
- Existing unit/route patterns available for Supertest reuse

### Wave 1 (High confidence, low browser dependence)

1. `src/test/functionalTests/tests/ui_tests/case-progression/cp_LiPvLiP_orders_small_claims_tests.js`
   - **Move to**: `src/test/integration/routes/dashboard/orders-small-claims.integration.test.ts`
   - **Why**: Primarily dashboard notification/task state assertions after API setup
   - **Keep browser?** No

2. `src/test/functionalTests/tests/ui_tests/case-progression/cp_latest_update_orders_small_claims_tests.js`
   - **Move to**: `src/test/integration/routes/dashboard/latest-update-orders-small-claims.integration.test.ts`
   - **Why**: Latest update content rendering can be asserted directly via HTML response
   - **Keep browser?** No

3. `src/test/functionalTests/tests/ui_tests/case-progression/cp_LiPvLiP_orders_fast_track_tests.js`
   - **Move to**: `src/test/integration/routes/dashboard/orders-fast-track.integration.test.ts`
   - **Why**: Same pattern as small claims variant; good duplication reduction candidate
   - **Keep browser?** No

4. `src/test/functionalTests/tests/ui_tests/bundles/cp_LiPvLiP_bundles_small_claims_tests.js`
   - **Move to**: `src/test/integration/routes/dashboard/bundles-small-claims.integration.test.ts`
   - **Why**: Task/notification visibility and link routing checks
   - **Keep browser?** No

5. `src/test/functionalTests/tests/ui_tests/bundles/cp_LiPvLiP_bundles_fast_track_tests.js`
   - **Move to**: `src/test/integration/routes/dashboard/bundles-fast-track.integration.test.ts`
   - **Why**: Similar assertions; high chance of quick migration with shared fixtures
   - **Keep browser?** No

6. `src/test/functionalTests/tests/ui_tests/case-struck-out/cp_latest_update_case_struck_out_small_claims_tests.js`
   - **Move to**: `src/test/integration/routes/dashboard/latest-update-case-struck-out-small-claims.integration.test.ts`
   - **Why**: Render-only assertions on latest update and status text
   - **Keep browser?** No

7. `src/test/functionalTests/tests/ui_tests/case-struck-out/cp_latest_update_case_struck_out_fast_track_tests.js`
   - **Move to**: `src/test/integration/routes/dashboard/latest-update-case-struck-out-fast-track.integration.test.ts`
   - **Why**: Mirrors small-claims path, likely reusable fixture/model setup
   - **Keep browser?** No

8. `src/test/functionalTests/tests/ui_tests/qm/qm_nonHearing_LiPvLiP_tests.js`
   - **Move to**: `src/test/integration/routes/query-management/non-hearing-messages.integration.test.ts`
   - **Why**: Message visibility/routing checks can be verified via mocked service + rendered page
   - **Keep browser?** No

9. `src/test/functionalTests/tests/ui_tests/qm/qm_Hearing_LiPvLiP_tests.js`
   - **Move to**: `src/test/integration/routes/query-management/hearing-messages.integration.test.ts`
   - **Why**: Similar to non-hearing flow; mostly UI state based on case/query fixtures
   - **Keep browser?** No

10. `src/test/functionalTests/tests/ui_tests/qm/qm_Hearing_LiPvLiP_followUp_tests.js`
    - **Move to**: `src/test/integration/routes/query-management/hearing-follow-up.integration.test.ts`
    - **Why**: Follow-up rendering/state transitions are suitable for integration assertions
    - **Keep browser?** No

### Wave 1.5 (Still likely to move, validate with spike first)

11. `src/test/functionalTests/tests/ui_tests/welsh/LipVsLip_claimant_as_welsh_tests.js`
    - **Move to**: `src/test/integration/routes/localisation/welsh-claimant-dashboard.integration.test.ts`
    - **Why**: Language banners/content routing can be asserted by lang/case fixtures
    - **Keep browser?** Keep 1 smoke Welsh browser journey only

12. `src/test/functionalTests/tests/ui_tests/ga/LipvLip_GA_creation_tests.js`
    - **Move to**: `src/test/integration/routes/general-application/ga-creation-summary.integration.test.ts`
    - **Why**: If this test is mostly post-API rendering checks, it is a strong integration candidate
    - **Keep browser?** Keep one end-to-end GA form journey

### Should Stay Browser (for now)

- `src/test/functionalTests/tests/ui_tests/payments/payment_session_isolation_tests.js`
- `src/test/functionalTests/tests/ui_tests/payments/payment_hearing_fee_edge_cases_tests.js`
- `src/test/functionalTests/tests/ui_tests/payments/payment_auth_guard_tests.js`
- `src/test/functionalTests/tests/ui_tests/payments/payment_ga_multi_tests.js`

Reason: these verify real payment/session/auth behavior where browser/system boundaries are part of the value.

## Pilot Success Metrics

Track these for the first 10 migrated tests:

- Median execution time per scenario (before vs after)
- Flake rate over 10+ CI runs
- Mean-time-to-diagnose failing test
- Number of fixture/setup lines per scenario
- Number of duplicated checks removed from browser suite

Suggested exit criteria for phase expansion:

- >=40% runtime reduction for migrated scenarios
- <2% flake rate in migrated integration tests
- No loss of defect detection in migrated areas for 2 sprints

## Appendix: Test File Counts

```
Functional UI Tests by Category:
- bundles: 4 files
- case-offline: 2 files
- case-progression: 4 files
- case-struck-out: 4 files
- create-claim: 6 files
- deadline-extension: 1 file
- dj: 2 files
- full-admit: 2 files
- ga: ~15 files
- hearings: ~5 files
- intermediate-track: ~3 files
- jba: ~2 files
- mediation: ~5 files
- multi-track: ~3 files
- noc: ~3 files
- part-admit: ~5 files
- payments: ~5 files
- qm: ~3 files
- reject-all: ~5 files
- rfr: ~2 files
- upload-evidence: ~4 files
- welsh: ~5 files

Total: ~102 functional test files
```

## Configuration Files

**Jest Configs:**
- `jest.config.js` - Unit tests (src/test/unit)
- `jest.functionaltest.config.js` - Integration tests (needs setup)
- `jest.routes.config.js` - Route tests
- `jest.a11y.config.js` - Accessibility tests
- `jest.pact.config.js` - Contract tests

**Codecept Config:**
- `codecept.conf.js` - Browser tests configuration
- Uses Playwright helper
- Configured for parallel execution with workers
