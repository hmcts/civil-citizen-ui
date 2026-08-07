// ============================================================================
// DEMO SEED — Default Judgment shows calculated 8% interest  (PR #7864 / DTSCCI-4079)
//   Run:  ./run-seed.sh 7864 @interest-demo
//
// Seeds ONE spec LiP small claim (£1,500) WITH 8% statutory interest, then leaves
// it "ready to request" a default CCJ. When the claimant requests the CCJ live,
// the DJ "Judgment amount" breakdown INCLUDES the interest line
// (claim £1,500 + ~£93 interest + £115 claim fee).
//
// Interest is set at CLAIM CREATE time via the env-gated block in createLiPClaim.js
// (JB_CLAIM_INTEREST=8pc, set below before config loads) so civil-service computes
// the interest total the same way a real claim does. #7864's civil-service is a
// pinned image and can lag before a freshly-created case is reachable via
// /testing-support/case, so the response-deadline write is retried.
//
// Users are PRESERVED: CLAIMANT_CITIZEN_EMAIL / DEFENDANT_CITIZEN_EMAIL trip the
// deletion gate (idamHelper.js:37) and pin the logins. MUST be set before config.
// ============================================================================

// --- env set before requiring config / the claim fixture -------------------
const stamp = process.env.SEED_STAMP || `${Date.now()}`;
process.env.CLAIMANT_CITIZEN_EMAIL = process.env.CLAIMANT_CITIZEN_EMAIL || `int-claimant-${stamp}@gmail.com`;
process.env.DEFENDANT_CITIZEN_EMAIL = process.env.DEFENDANT_CITIZEN_EMAIL || `int-defendant-${stamp}@gmail.com`;
process.env.JB_CLAIM_INTEREST = process.env.JB_CLAIM_INTEREST || '8pc';  // createLiPClaim fixture -> 8% interest at create

const config = require('../../../../config');
const {createAccount} = require('../../../specClaimHelpers/api/idamHelper');
const {checkToggleEnabled, updateCaseData} = require('../../../specClaimHelpers/api/testingSupport');

const claimType = 'SmallClaims';

// Europe/London wall-clock 'YYYY-MM-DDTHH:MM:SS' N hours before now (for the response deadline).
function londonBackdate(hoursAgo) {
  const d = new Date(Date.now() - hoursAgo * 3600 * 1000);
  const parts = new Intl.DateTimeFormat('en-GB', {timeZone: 'Europe/London', year: 'numeric',
    month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false}).formatToParts(d);
  const p = {}; parts.forEach(x => { p[x.type] = x.value; });
  const hour = p.hour === '24' ? '00' : p.hour;
  return `${p.year}-${p.month}-${p.day}T${hour}:${p.minute}:${p.second}`;
}

// #7864's pinned civil-service can 404 on /testing-support/case just after create; retry through the lag.
async function updateWithRetry(caseId, data, tries = 24) {
  for (let i = 1; i <= tries; i++) {
    try {
      await updateCaseData(caseId, data, config.systemUpdate2);
      return;
    } catch (e) {
      if (i === tries) throw e;
      console.log(`  case not reachable yet (try ${i}/${tries}) - waiting for the pinned preview...`);
      await new Promise(r => setTimeout(r, 5000));
    }
  }
}

Feature('DEMO SEED - Default Judgment includes 8% interest (#7864)').tag('@interest-demo');

Scenario('Seed one ready-to-request LiP small claim WITH 8% interest', async ({api}) => {
  const toggle = await checkToggleEnabled('judgment-buffer');
  console.log(`judgment-buffer toggle on this preview: ${toggle} (interest is shown regardless of the buffer path).`);

  const claimant = config.claimantCitizenUser;
  const defendant = config.defendantCitizenUser;
  await createAccount(claimant.email, claimant.password);   // preserve gate -> NOT registered for deletion
  await createAccount(defendant.email, defendant.password);

  // Create the spec LiP small claim (£1,500) WITH 8% interest (fixture, via JB_CLAIM_INTEREST=8pc).
  const claimRef = await api.createLiPClaim(claimant, claimType);
  const caseData = await api.retrieveCaseData(config.adminUser, claimRef);
  const legacyRef = caseData.legacyCaseReference;

  // Push the defendant response deadline into the past so the claimant can request a default CCJ (retried for lag).
  await updateWithRetry(claimRef, {respondent1ResponseDeadline: londonBackdate(24 * 40)});
  await api.amendRespondent1PartyEmail(claimRef, config.systemUpdate2, defendant.email);
  await api.waitForFinishedBusinessProcess();

  const base = process.env.TEST_URL;
  console.log(
    `SEEDED|demo=interest|caseId=${claimRef}|legacyCaseReference=${legacyRef}` +
    `|claimantEmail=${claimant.email}|password=${claimant.password}` +
    `|defendantEmail=${defendant.email}|password=${defendant.password}` +
    `|claimantDashboard=${base}/dashboard/${claimRef}/claimant` +
    `|defendantDashboard=${base}/dashboard/${claimRef}/defendant`,
  );
  console.log(`
================================================================================
  DEFAULT JUDGMENT WITH 8% INTEREST  (PR #7864)
--------------------------------------------------------------------------------
  16-digit case reference : ${claimRef}
  Claim number (legacy)   : ${legacyRef}

  CLAIMANT login          : ${claimant.email}  /  ${claimant.password}
  DEFENDANT login         : ${defendant.email}  /  ${defendant.password}

  Claimant dashboard      : ${base}/dashboard/${claimRef}/claimant
  Defendant dashboard     : ${base}/dashboard/${claimRef}/defendant

  CURRENT STATE           : Claim ISSUED (£1,500 + 8% interest elected), defendant
                            response deadline in the past. Ready to request a CCJ.

  DEMO (interest calculation):
   1. Log in as the CLAIMANT and open the claim.
   2. Follow "Request a County Court Judgment (CCJ)".
   3. On the "Judgment amount" breakdown, the ordered amount INCLUDES interest:
        Claim amount   ~ £1,500
        Interest       ~ £93   (8% statutory)
        Claim fee      ~ £115
        ------------------------------------
        Total          ~ £1,708  (minus any amount already paid)
   NOTE: #7864 uses LIVE gov-notify, so requesting the CCJ sends REAL emails.
================================================================================
`);
});

AfterSuite(async () => {
  console.log('AfterSuite (interest): seed complete - demo users preserved, no deletion performed.');
});
