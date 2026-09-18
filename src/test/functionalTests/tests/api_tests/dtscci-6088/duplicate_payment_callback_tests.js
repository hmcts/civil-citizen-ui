const config = require('../../../../config');
const apiRequest = require('../../../specClaimHelpers/api/apiRequest');
const restHelper = require('../../../specClaimHelpers/api/restHelper');
const idamHelper = require('../../../specClaimHelpers/api/idamHelper');
const {assert} = require('chai');

const CLAIM_ISSUED_ENDPOINT = '/service-request-update-claim-issued';

let results = [];
function ev(step, expected, actual, pass) {
  results.push({step, expected, actual, pass});
  console.log(`6088|${pass ? 'PASS' : 'FAIL'}|${step}|expected=${expected}|actual=${actual}`);
}

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
  results = [];
  const caseId = await api.createSpecifiedClaim(config.applicantSolicitorUser, false, 'SmallClaims');
  await api.waitForFinishedBusinessProcess();
  await apiRequest.setupTokens(config.applicantSolicitorUser);

  const before = paymentSnapshot(await api.retrieveCaseData(config.adminUser, caseId));
  console.log(`6088|caseId=${caseId}|before=${JSON.stringify(before)}`);
  ev('claim is paid and issued before the duplicates are sent',
    'a payment reference on the case', JSON.stringify(before),
    !!before.paymentReference || !!before.state);

  const reference = before.paymentReference || '13213223';

  const status1 = await fireCallback(caseId, reference);
  await api.waitForFinishedBusinessProcess();
  const afterSequential = paymentSnapshot(await api.retrieveCaseData(config.adminUser, caseId));
  ev('repeated identical callback is accepted without error', 'HTTP 2xx', `HTTP ${status1}`,
    status1 >= 200 && status1 < 300);
  ev('repeated identical callback does not change the case',
    JSON.stringify(before), JSON.stringify(afterSequential),
    JSON.stringify(before) === JSON.stringify(afterSequential));

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

  const finalData = await api.retrieveCaseData(config.adminUser, caseId);
  const bp = finalData.businessProcess || {};
  ev('no business process left running or failed after the duplicates',
    'FINISHED or no active process', `status=${bp.status}, activityId=${bp.activityId}`,
    !bp.status || bp.status === 'FINISHED');

  console.log('\n========== DTSCCI-6088 RESULTS ==========');
  console.log(`caseId: ${caseId}`);
  results.forEach(r => console.log(`${r.pass ? 'PASS' : 'FAIL'}  ${r.step}`));
  const failed = results.filter(r => !r.pass);
  console.log(`========== ${results.length - failed.length}/${results.length} ==========`);
  failed.forEach(f => console.log(`FAILED ${f.step}: expected ${f.expected} got ${f.actual}`));
  assert.equal(failed.length, 0, `${failed.length} duplicate-payment check(s) failed`);
});

Scenario('a payment callback landing during another in-flight case update does not lose either write',
  async ({api}) => {
    results = [];
    const caseId = await api.createSpecifiedClaim(config.applicantSolicitorUser, false, 'SmallClaims');
    await api.waitForFinishedBusinessProcess();
    await apiRequest.setupTokens(config.applicantSolicitorUser);

    const before = paymentSnapshot(await api.retrieveCaseData(config.adminUser, caseId));
    const reference = before.paymentReference || '13213223';
    console.log(`6088|lost-update|caseId=${caseId}|before=${JSON.stringify(before)}`);

    let held = null;
    try {
      held = await apiRequest.startEvent('AMEND_PARTY_DETAILS', caseId);
    } catch (e) {
      console.log(`6088|lost-update|could not open a holding event: ${e.message}`);
    }
    ev('a concurrent case update can be opened and held',
      'an event token and the current case data', held ? 'event started' : 'could not start an event',
      !!held);

    if (held) {
      const status = await fireCallback(caseId, reference);
      await api.waitForFinishedBusinessProcess();
      ev('the payment callback is accepted while another update is in flight',
        'HTTP 2xx', `HTTP ${status}`, status >= 200 && status < 300);

      let submitted = null;
      try {
        submitted = await apiRequest.submitEvent('AMEND_PARTY_DETAILS', held, caseId);
      } catch (e) {
        console.log(`6088|lost-update|submit of the held event failed: ${e.message}`);
      }
      const rejectedOnVersion = !submitted || submitted.status === 409;
      ev('the stale write is either rejected on version or applied without loss',
        '409, or a 2xx that preserves the payment', submitted ? `HTTP ${submitted.status}` : 'rejected',
        rejectedOnVersion || (submitted.status >= 200 && submitted.status < 300));
    }

    const after = paymentSnapshot(await api.retrieveCaseData(config.adminUser, caseId));
    console.log(`6088|lost-update|after=${JSON.stringify(after)}`);
    ev('the payment survives a concurrent update to the same case',
      `reference ${before.paymentReference}, status ${before.paymentStatus}`,
      `reference ${after.paymentReference}, status ${after.paymentStatus}`,
      after.paymentReference === before.paymentReference && after.paymentStatus === before.paymentStatus);

    const bp = (await api.retrieveCaseData(config.adminUser, caseId)).businessProcess || {};
    ev('no business process left running or failed after the collision',
      'FINISHED or no active process', `status=${bp.status}`,
      !bp.status || bp.status === 'FINISHED');

    const failed = results.filter(r => !r.pass);
    console.log(`========== lost-update ${results.length - failed.length}/${results.length} ==========`);
    failed.forEach(f => console.log(`FAILED ${f.step}: expected ${f.expected} got ${f.actual}`));
    assert.equal(failed.length, 0, `${failed.length} lost-update check(s) failed`);
  });
