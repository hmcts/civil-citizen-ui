// ============================================================================
// DEMO SEED — Judgment Buffer TOGGLE OFF   (civil-citizen-ui PR #7979)
//   Run:  ./bin/run-seed.sh 7979 @jb-demo-off
//
// Identical seed to the buffer-ON demo: one spec LiP-defendant small claim left
// "ready to request" a default CCJ (claim issued, defendant deadline in the
// past, defendant linked). The seed STOPS here — the claimant requesting the CCJ
// is performed LIVE. With the buffer toggle OFF there is NO 48-hour park and NO
// scheduler: judgment is entered immediately, so no grant helper is needed.
//
// Users are PRESERVED: CLAIMANT_CITIZEN_EMAIL / DEFENDANT_CITIZEN_EMAIL trip the
// deletion gate (idamHelper.js:37) and pin the logins (config.js:68/73). They
// MUST be set BEFORE config is required.
// ============================================================================

// --- user-preserve env vars (set before requiring config) -------------------
const stamp = process.env.SEED_STAMP || `${Date.now()}`;
process.env.CLAIMANT_CITIZEN_EMAIL =
  process.env.CLAIMANT_CITIZEN_EMAIL || `jboff-claimant-${stamp}@gmail.com`;
process.env.DEFENDANT_CITIZEN_EMAIL =
  process.env.DEFENDANT_CITIZEN_EMAIL || `jboff-defendant-${stamp}@gmail.com`;

const config = require('../../../../config');
const {createAccount} = require('../../../specClaimHelpers/api/idamHelper');
const {checkToggleEnabled, updateCaseData} = require('../../../specClaimHelpers/api/testingSupport');

const claimType = 'SmallClaims';

// Europe/London wall-clock 'YYYY-MM-DDTHH:MM:SS' N hours before now.
function londonBackdate(hoursAgo) {
  const d = new Date(Date.now() - hoursAgo * 3600 * 1000);
  const parts = new Intl.DateTimeFormat('en-GB', {timeZone: 'Europe/London', year: 'numeric',
    month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false}).formatToParts(d);
  const p = {}; parts.forEach(x => { p[x.type] = x.value; });
  const hour = p.hour === '24' ? '00' : p.hour;
  return `${p.year}-${p.month}-${p.day}T${hour}:${p.minute}:${p.second}`;
}

Feature('DEMO SEED - Judgment Buffer OFF (#7979)').tag('@jb-demo-off');

Scenario('Seed one ready-to-request LiP small claim (buffer OFF)', async ({api}) => {
  // Do NOT early-return on the toggle — for the OFF demo we WANT the toggle off,
  // and the seed itself (ready-to-request) is toggle-agnostic. Just report it.
  const toggle = await checkToggleEnabled('judgment-buffer');
  if (toggle) {
    console.warn('WARNING: judgment-buffer toggle is ON on this preview — expected OFF for #7979. Seeding anyway.');
  }

  const claimant = config.claimantCitizenUser;
  const defendant = config.defendantCitizenUser;
  await createAccount(claimant.email, claimant.password);   // preserve gate -> NOT registered for deletion
  await createAccount(defendant.email, defendant.password);

  // Create the spec LiP small claim (£1,500). Returns the 16-digit CCD caseId.
  const claimRef = await api.createLiPClaim(claimant, claimType);
  const caseData = await api.retrieveCaseData(config.adminUser, claimRef);
  const legacyRef = caseData.legacyCaseReference;

  // Push the defendant response deadline into the past so the claimant can
  // request a default CCJ. Explicit caseId (NOT the module-global helper).
  await updateCaseData(claimRef, {respondent1ResponseDeadline: londonBackdate(24 * 40)}, config.systemUpdate2);
  await api.amendRespondent1PartyEmail(claimRef, config.systemUpdate2, defendant.email);
  await api.waitForFinishedBusinessProcess();

  const base = process.env.TEST_URL;
  console.log(
    `SEEDED|demo=jb-off|caseId=${claimRef}|legacyCaseReference=${legacyRef}` +
    `|claimantEmail=${claimant.email}|password=${claimant.password}` +
    `|defendantEmail=${defendant.email}|password=${defendant.password}` +
    `|claimantDashboard=${base}/dashboard/${claimRef}/claimant` +
    `|defendantDashboard=${base}/dashboard/${claimRef}/defendant`,
  );
  console.log(`
================================================================================
  JUDGMENT BUFFER — TOGGLE OFF  (PR #7979)
--------------------------------------------------------------------------------
  16-digit case reference : ${claimRef}
  Claim number (legacy)   : ${legacyRef}

  CLAIMANT login          : ${claimant.email}  /  ${claimant.password}
  DEFENDANT login         : ${defendant.email}  /  ${defendant.password}

  Claimant dashboard      : ${base}/dashboard/${claimRef}/claimant
  Defendant dashboard     : ${base}/dashboard/${claimRef}/defendant

  CURRENT STATE           : Claim ISSUED, defendant response deadline is in the
                            past. Claimant can now request a default CCJ.

  LIVE DEMO STEPS TO REACH THE FINAL ORDER STATE:
   1. Log in as the CLAIMANT and open the claim from the dashboard.
   2. Follow "Request a County Court Judgment (CCJ)" (defendant did not respond)
      and complete the request.
   3. Buffer OFF -> judgment is ENTERED IMMEDIATELY. There is no 48-hour park and
      no scheduler step: the judgment against the defendant is made straight away,
      recorded on the public Register of Judgments, and enforceable at once.
   4. The dashboard shows "A judgment against the defendant has been made"
      immediately after the request completes.

  CONTRAST WITH #7978 (buffer ON): there the same request would instead park in
  JUDGMENT_REQUESTED ("The CCJ has been requested") for 48h before being granted.
================================================================================
`);
});

// AfterSuite cleanup that does NOT delete users. Seeded IDAM accounts survive for
// the demo; the global teardown's deleteAllIdamTestUsers() is neutralised by the
// preserve gate (idamHelper.js:37). Nothing destructive here.
AfterSuite(async () => {
  console.log('AfterSuite (jb-off): seed complete — demo users preserved, no deletion performed.');
});
