// ============================================================================
// DEMO GRANT — force a buffered CCJ to the ISSUED (final order) state on demand,
// skipping the real 48-hour wait. Run this AFTER the claimant has requested the
// CCJ live (case is in JUDGMENT_REQUESTED). It backdates joDJCreatedDate 144h and
// polls the JudgementBuffer scheduler until the judgment is live.
//
//   GRANT_CASE_ID=<16-digit caseId> ./run-seed.sh 7978 @jb-demo-grant
//
// Needs the judgment-buffer toggle ON + scheduler registered (true on #7978/#7864).
// ============================================================================
const config = require('../../../../config');
const {updateCaseData, triggerJudgmentBufferScheduler} = require('../../../specClaimHelpers/api/testingSupport');
const {assert} = require('chai');

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

Feature('DEMO - grant a buffered CCJ on demand').tag('@jb-demo-grant');

Scenario('Backdate + run the JudgementBuffer scheduler to grant a buffered case', async ({api}) => {
  const caseId = process.env.GRANT_CASE_ID;
  assert.ok(caseId, 'set GRANT_CASE_ID to the case you requested the CCJ on (it must be in JUDGMENT_REQUESTED)');

  // Backdate the request date past the 48h buffer so the scheduler picks it up.
  await updateCaseData(caseId, {joDJCreatedDate: londonBackdate(144)}, config.systemUpdate2);

  let issued = false;
  for (let i = 0; i < 30; i++) {
    await triggerJudgmentBufferScheduler();                       // GET /testing-support/run-scheduler/JudgementBuffer
    const d = await api.retrieveCaseData(config.adminUser, caseId);
    if (d.joIsLiveJudgmentExists === 'Yes') { issued = true; break; }   // judgment now live -> ISSUED
    await new Promise(r => setTimeout(r, 10000));                 // ES lag: give the scheduler search time
  }
  await api.waitForFinishedBusinessProcess();

  const base = process.env.TEST_URL;
  console.log(`GRANTED|caseId=${caseId}|issued=${issued}|claimantDashboard=${base}/dashboard/${caseId}/claimant`);
  console.log(issued
    ? '\nISSUED - the claimant dashboard now shows "A judgment against the defendant has been made" (registered on RTL).'
    : '\nNOT issued after polling (likely ES lag or the case was not in JUDGMENT_REQUESTED) - re-run @jb-demo-grant.');
});
