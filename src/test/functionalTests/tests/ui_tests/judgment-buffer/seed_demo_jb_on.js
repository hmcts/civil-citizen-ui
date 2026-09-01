// ============================================================================
// DEMO SEED — Judgment Buffer TOGGLE ON   (civil-citizen-ui PR #7978)
//   Run:  ./bin/run-seed.sh 7978 @jb-demo-on
//
// Seeds exactly ONE spec LiP-defendant small claim and leaves it "ready to
// request" a default CCJ: claim issued, defendant response deadline pushed into
// the past, defendant linked. The seed STOPS here — the claimant requesting the
// CCJ is performed LIVE in the demo. The buffer-grant helper calls are provided
// (commented, "RUN TO GRANT") so you can force the ISSUED state on demand
// instead of waiting the real 48 hours.
//
// Users are PRESERVED: setting CLAIMANT_CITIZEN_EMAIL / DEFENDANT_CITIZEN_EMAIL
// (a) trips the deletion gate at idamHelper.js:37 -> teardown deletes nobody,
// (b) pins the login emails at config.js:68/73. These MUST be set BEFORE config
// is required, so they are set at the very top of this file.
// ============================================================================

// --- user-preserve env vars (set before requiring config) -------------------
const stamp = process.env.SEED_STAMP || `${Date.now()}`;
process.env.CLAIMANT_CITIZEN_EMAIL =
  process.env.CLAIMANT_CITIZEN_EMAIL || `jbon-claimant-${stamp}@gmail.com`;
process.env.DEFENDANT_CITIZEN_EMAIL =
  process.env.DEFENDANT_CITIZEN_EMAIL || `jbon-defendant-${stamp}@gmail.com`;

const config = require('../../../../config');
const {createAccount} = require('../../../specClaimHelpers/api/idamHelper');
const {checkToggleEnabled, updateCaseData} = require('../../../specClaimHelpers/api/testingSupport');

const claimType = 'SmallClaims';

// Europe/London wall-clock 'YYYY-MM-DDTHH:MM:SS' N hours before now (matches the
// verified buffer-grant tests). Used for the response deadline, and for the
// commented joDJCreatedDate backdate in the RUN TO GRANT block below.
function londonBackdate(hoursAgo) {
  const d = new Date(Date.now() - hoursAgo * 3600 * 1000);
  const parts = new Intl.DateTimeFormat('en-GB', {timeZone: 'Europe/London', year: 'numeric',
    month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false}).formatToParts(d);
  const p = {}; parts.forEach(x => { p[x.type] = x.value; });
  const hour = p.hour === '24' ? '00' : p.hour;
  return `${p.year}-${p.month}-${p.day}T${hour}:${p.minute}:${p.second}`;
}

Feature('DEMO SEED - Judgment Buffer ON (#7978)').tag('@jb-demo-on');

Scenario('Seed one ready-to-request LiP small claim (buffer ON)', async ({api}) => {
  const toggle = await checkToggleEnabled('judgment-buffer');
  if (!toggle) {
    console.warn('WARNING: judgment-buffer toggle is OFF on this preview — expected ON for #7978. Seeding anyway.');
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
  // Link the defendant to the case so they receive the grant notification / can view it.
  await api.amendRespondent1PartyEmail(claimRef, config.systemUpdate2, defendant.email);
  await api.waitForFinishedBusinessProcess();

  /* ── RUN TO GRANT (only AFTER the claimant has requested the CCJ live) ──────
     The case parks in JUDGMENT_REQUESTED for 48h. To grant on demand instead of
     waiting, backdate joDJCreatedDate 144h and poll the JudgementBuffer scheduler
     until the judgment is live (joIsLiveJudgmentExists === 'Yes') -> ISSUED.

       const {triggerJudgmentBufferScheduler} =
         require('../../../specClaimHelpers/api/testingSupport');
       await updateCaseData(claimRef, {joDJCreatedDate: londonBackdate(144)}, config.systemUpdate2);
       for (let i = 0; i < 30; i++) {
         await triggerJudgmentBufferScheduler();                 // /run-scheduler/JudgementBuffer
         const d = await api.retrieveCaseData(config.adminUser, claimRef);
         if (d.joIsLiveJudgmentExists === 'Yes') break;          // ISSUED — judgment made
         await new Promise(r => setTimeout(r, 10000));
       }
       await api.waitForFinishedBusinessProcess();
     ────────────────────────────────────────────────────────────────────────── */

  const base = process.env.TEST_URL;
  console.log(
    `SEEDED|demo=jb-on|caseId=${claimRef}|legacyCaseReference=${legacyRef}` +
    `|claimantEmail=${claimant.email}|password=${claimant.password}` +
    `|defendantEmail=${defendant.email}|password=${defendant.password}` +
    `|claimantDashboard=${base}/dashboard/${claimRef}/claimant` +
    `|defendantDashboard=${base}/dashboard/${claimRef}/defendant`,
  );
  console.log(`
================================================================================
  JUDGMENT BUFFER — TOGGLE ON  (PR #7978)
--------------------------------------------------------------------------------
  16-digit case reference : ${claimRef}
  Claim number (legacy)   : ${legacyRef}

  CLAIMANT login          : ${claimant.email}  /  ${claimant.password}
  DEFENDANT login         : ${defendant.email}  /  ${defendant.password}

  Claimant dashboard      : ${base}/dashboard/${claimRef}/claimant
  Defendant dashboard     : ${base}/dashboard/${claimRef}/defendant

  CURRENT STATE           : Claim ISSUED, defendant response deadline is in the
                            past. Claimant can now request a default CCJ.
                            (NOT yet in JUDGMENT_REQUESTED.)

  LIVE DEMO STEPS TO REACH THE FINAL ORDER STATE:
   1. Log in as the CLAIMANT and open the claim from the dashboard.
   2. Follow "Request a County Court Judgment (CCJ)" (defendant did not respond)
      and complete the request.
   3. Buffer ON -> the case PARKS in JUDGMENT_REQUESTED. The claimant dashboard
      shows "The CCJ has been requested"
      ("A judgment against the defendant has been requested.
        You will be notified when this judgment is granted.").
   4. To GRANT on demand (skip the 48h wait): un-comment the "RUN TO GRANT" block
      above and re-run — it backdates joDJCreatedDate 144h and runs the
      JudgementBuffer scheduler until joIsLiveJudgmentExists === 'Yes'.
   5. The case moves to ISSUED. The dashboard then shows
      "A judgment against the defendant has been made."
================================================================================
`);
});

// AfterSuite cleanup that does NOT delete users. The seeded IDAM accounts must
// survive for the live demo; the global teardown's deleteAllIdamTestUsers() is
// already neutralised because CLAIMANT/DEFENDANT_CITIZEN_EMAIL are set
// (idamHelper.js:37 gate). Nothing destructive here.
AfterSuite(async () => {
  console.log('AfterSuite (jb-on): seed complete — demo users preserved, no deletion performed.');
});
