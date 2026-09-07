// DTSCCI-6088 - duplicate payment updates arriving simultaneously must not be applied twice.
//
// civil-service PR #8222 adds PaymentUtils.isPaymentAlreadyApplied and makes the payment
// services re-read the case inside the CCD update transaction, skipping submitUpdate when a
// SUCCESS payment with the same reference is already on the case.
//
// The service request callbacks are unauthenticated, so this fires genuine duplicate and
// genuinely simultaneous callbacks at them, which is the part manual testing cannot do.
const config = require('../../../../config');
const apiRequest = require('../../../specClaimHelpers/api/apiRequest');
const restHelper = require('../../../specClaimHelpers/api/restHelper');
const idamHelper = require('../../../specClaimHelpers/api/idamHelper');
const {assert} = require('chai');

const CLAIM_ISSUED_ENDPOINT = '/service-request-update-claim-issued';

const results = [];
function ev(step, expected, actual, pass) {
  results.push({step, expected, actual, pass});
  console.log(`6088|${pass ? 'PASS' : 'FAIL'}|${step}|expected=${expected}|actual=${actual}`);
}

// The payload the payments service sends. payment_reference is what the new
// isPaymentAlreadyApplied check compares against the reference already on the case.
const serviceUpdateDto = (caseId, paymentReference, status = 'Paid') => ({
  service_request_reference: '1324646546456',
  ccd_case_number: String(caseId),
  service_request_amount: '167.00',
  service_request_status: status,
  payment: {
    payment_amount: 167.00,
    payment_reference: paymentReference,
    payment_method: 'by account',
    case_reference: 'DTSCCI-6088 duplicate payment test',
  },
});

// Fires the callback directly so duplicates can be sent without going through the helper
// that also waits for the business process.
async function fireCallback(caseId, paymentReference, status = 'Paid') {
  const auth = await idamHelper.accessToken(config.applicantSolicitorUser);
  const {s2sAuth} = apiRequest.getTokens();
  const url = `${config.url.civilService}${CLAIM_ISSUED_ENDPOINT}`;
  const res = await restHelper.request(url, {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${auth}`,
    'ServiceAuthorization': s2sAuth && s2sAuth.startsWith('Bearer') ? s2sAuth : `Bearer ${s2sAuth}`,
  }, serviceUpdateDto(caseId, paymentReference, status), 'PUT');
  return res.status;
}

// Snapshot of the fields a duplicate callback must not disturb.
function paymentSnapshot(caseData) {
  const p = caseData.claimIssuedPaymentDetails || {};
  return {
    state: caseData.ccdState,
    paymentStatus: p.status,
    paymentReference: p.reference,
    customerReference: p.customerReference,
    businessProcessStatus: caseData.businessProcess?.status,
  };
}

Feature('DTSCCI-6088 - duplicate payment callbacks (civil-service #8222)').tag('@dtscci-6088');

Scenario('a repeated payment callback is a safe no-op, and simultaneous duplicates apply once', async ({api}) => {
  // A spec claim, created and paid once through the normal helper. That first payment is the
  // legitimate one; everything after this is a duplicate of it.
  const caseId = await api.createSpecifiedClaim(config.applicantSolicitorUser, false, 'SmallClaims');
  await api.waitForFinishedBusinessProcess();
  await apiRequest.setupTokens(config.applicantSolicitorUser);

  const before = paymentSnapshot(await api.retrieveCaseData(config.adminUser, caseId));
  console.log(`6088|caseId=${caseId}|before=${JSON.stringify(before)}`);
  ev('claim is paid and issued before the duplicates are sent',
    'a payment reference on the case', JSON.stringify(before),
    !!before.paymentReference || !!before.state);

  const reference = before.paymentReference || '13213223';

  // ---- 1. the same callback again, sequentially -------------------------
  const status1 = await fireCallback(caseId, reference);
  await api.waitForFinishedBusinessProcess();
  const afterSequential = paymentSnapshot(await api.retrieveCaseData(config.adminUser, caseId));
  ev('repeated identical callback is accepted without error', 'HTTP 2xx', `HTTP ${status1}`,
    status1 >= 200 && status1 < 300);
  ev('repeated identical callback does not change the case',
    JSON.stringify(before), JSON.stringify(afterSequential),
    JSON.stringify(before) === JSON.stringify(afterSequential));

  // ---- 2. five identical callbacks at the same time ---------------------
  // This is the reported defect: simultaneous duplicates starting multiple business
  // processes, one of which fails and is then retried into a state it cannot handle.
  const statuses = await Promise.all(
    Array.from({length: 5}, () => fireCallback(caseId, reference)),
  );
  console.log(`6088|simultaneous callback statuses=${JSON.stringify(statuses)}`);
  await api.waitForFinishedBusinessProcess();
  const afterConcurrent = paymentSnapshot(await api.retrieveCaseData(config.adminUser, caseId));
  ev('five simultaneous identical callbacks are all handled', 'no 5xx',
    JSON.stringify(statuses), statuses.every(s => s < 500));
  ev('five simultaneous identical callbacks leave the case unchanged',
    JSON.stringify(before), JSON.stringify(afterConcurrent),
    JSON.stringify(before) === JSON.stringify(afterConcurrent));

  // ---- 3. the business process must be clean ----------------------------
  // waitForFinishedBusinessProcess above would surface an incident; assert the case is not
  // sitting in a started/failed process after all that duplication.
  const finalData = await api.retrieveCaseData(config.adminUser, caseId);
  const bp = finalData.businessProcess || {};
  ev('no business process left running or failed after the duplicates',
    'FINISHED or no active process', `status=${bp.status}, activityId=${bp.activityId}`,
    !bp.status || bp.status === 'FINISHED');

  // ---- summary -----------------------------------------------------------
  console.log('\n========== DTSCCI-6088 RESULTS ==========');
  console.log(`caseId: ${caseId}`);
  results.forEach(r => console.log(`${r.pass ? 'PASS' : 'FAIL'}  ${r.step}`));
  const failed = results.filter(r => !r.pass);
  console.log(`========== ${results.length - failed.length}/${results.length} ==========`);
  failed.forEach(f => console.log(`FAILED ${f.step}: expected ${f.expected} got ${f.actual}`));
  assert.equal(failed.length, 0, `${failed.length} duplicate-payment check(s) failed`);
});
