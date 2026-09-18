const stamp = Math.random().toString(36).substring(2, 6);
process.env.CLAIMANT_CITIZEN_EMAIL = `hwf6088-claimant-${stamp}@gmail.com`;
process.env.DEFENDANT_CITIZEN_EMAIL = `hwf6088-defendant-${stamp}@gmail.com`;

const config = require('../../../../config');
const {createAccount} = require('../../../specClaimHelpers/api/idamHelper');
const LoginSteps = require('../../../commonFeatures/home/steps/login');
const apiRequest = require('../../../specClaimHelpers/api/apiRequest');
const restHelper = require('../../../specClaimHelpers/api/restHelper');
const idamHelper = require('../../../specClaimHelpers/api/idamHelper');
const {assert} = require('chai');

const ApplicationType = require('../../../citizenFeatures/GA/pages/applicationType');
const AgreementFromOtherParty = require('../../../citizenFeatures/GA/pages/agreementFromOtherParty');
const InformOtherParties = require('../../../citizenFeatures/GA/pages/informOtherParties');
const ApplicationCosts = require('../../../citizenFeatures/GA/pages/applicationCosts');
const ClaimApplicationCost = require('../../../citizenFeatures/GA/pages/claimApplicationCost');
const OrderJudge = require('../../../citizenFeatures/GA/pages/orderJudge');
const RequestingReason = require('../../../citizenFeatures/GA/pages/requestingReason');
const AddAnotherApplication = require('../../../citizenFeatures/GA/pages/addAnotherApplication');
const WantToUploadDocuments = require('../../../citizenFeatures/GA/pages/wantToUploadDocuments');
const HearingArrangementsGuidance = require('../../../citizenFeatures/GA/pages/hearingArrangementsGuidance');
const HearingArrangement = require('../../../citizenFeatures/GA/pages/hearingArrangement');
const HearingContactDetails = require('../../../citizenFeatures/GA/pages/hearingContactDetails');
const UnavailableDatesConfirmation = require('../../../citizenFeatures/GA/pages/unavailableDatesConfirmation');
const UnavailableDates = require('../../../citizenFeatures/GA/pages/unavailableDates');
const HearingSupport = require('../../../citizenFeatures/GA/pages/hearingSupport');
const PayingForApplication = require('../../../citizenFeatures/GA/pages/payingForApplication');
const CheckAndSend = require('../../../citizenFeatures/GA/pages/checkAndSend');
const SubmitGAConfirmation = require('../../../citizenFeatures/GA/pages/submitGAConfirmation');

const applicationTypePage = new ApplicationType();
const agreementFromOtherPartyPage = new AgreementFromOtherParty();
const informOtherPartiesPage = new InformOtherParties();
const applicationCostsPage = new ApplicationCosts();
const claimApplicationCostPage = new ClaimApplicationCost();
const orderJudgePage = new OrderJudge();
const requestingReasonPage = new RequestingReason();
const addAnotherApplicationPage = new AddAnotherApplication();
const wantToUploadDocumentsPage = new WantToUploadDocuments();
const hearingArrangementsGuidancePage = new HearingArrangementsGuidance();
const hearingArrangementPage = new HearingArrangement();
const hearingContactDetailsPage = new HearingContactDetails();
const unavailableDatesConfirmationPage = new UnavailableDatesConfirmation();
const unavailableDatesPage = new UnavailableDates();
const hearingSupportPage = new HearingSupport();
const payingForApplicationPage = new PayingForApplication();
const checkAndSendPage = new CheckAndSend();
const submitGAConfirmationPage = new SubmitGAConfirmation();

const FEE = '126';
const HWF_REF = 'HWF-A1B-23C';
const ENDPOINT = '/service-request-update-claim-issued';

let results = [];
function ev(step, expected, actual, pass) {
  results.push({step, expected, actual, pass});
  console.log(`6088-HWF|${pass ? 'PASS' : 'FAIL'}|${step}|expected=${expected}|actual=${actual}`);
}
const short = (x) => x.replace(/^https?:\/\/[^/]+/, '');

async function at(I, fragment) {
  return (await I.grabCurrentUrl()).includes(fragment);
}

async function fetchGa(gaId) {
  const auth = await idamHelper.accessToken(config.ctscAdmin);
  const uid = await idamHelper.userId(auth);
  const {s2sAuth} = apiRequest.getTokens();
  const url = `${config.url.ccdDataStore}/caseworkers/${uid}/jurisdictions/${config.definition.jurisdiction}`
    + `/case-types/GENERALAPPLICATION/cases/${gaId}`;
  const res = await restHelper.request(url, {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${auth}`,
    'ServiceAuthorization': s2sAuth && s2sAuth.startsWith('Bearer') ? s2sAuth : `Bearer ${s2sAuth}`,
  }, null, 'GET');
  return res.json();
}

function snapshot(ga) {
  const d = ga.case_data || {};
  const pba = d.generalAppPBADetails || {};
  const hwf = d.gaHwfDetails || {};
  return {
    state: ga.state,
    paymentStatus: pba.paymentDetails?.status,
    paymentReference: pba.paymentDetails?.reference,
    serviceRequestReference: pba.serviceRequestReference,
    hwfEvent: hwf.hwfCaseEvent,
    remissionAmount: hwf.remissionAmount,
    businessProcessStatus: d.businessProcess?.status,
  };
}

async function submitGaEvent(eventName, gaId, patch = {}) {
  await apiRequest.setupTokens(config.ctscAdmin);
  const existing = await apiRequest.startEvent(eventName, gaId, 'GENERALAPPLICATION');
  const merged = {...existing, ...patch};
  if (patch.gaHwfDetails) {
    merged.gaHwfDetails = {...(existing.gaHwfDetails || {}), ...patch.gaHwfDetails};
  }
  const res = await apiRequest.submitEvent(eventName, merged, gaId, 'GENERALAPPLICATION');
  return res.status;
}

async function fireCallback(caseId, paymentReference, serviceRequestReference) {
  const auth = await idamHelper.accessToken(config.applicantSolicitorUser);
  const {s2sAuth} = apiRequest.getTokens();
  const res = await restHelper.request(`${config.url.civilService}${ENDPOINT}`, {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${auth}`,
    'ServiceAuthorization': s2sAuth && s2sAuth.startsWith('Bearer') ? s2sAuth : `Bearer ${s2sAuth}`,
  }, {
    service_request_reference: serviceRequestReference || '1324646546456',
    ccd_case_number: String(caseId),
    service_request_amount: `${FEE}.00`,
    service_request_status: 'Paid',
    payment: {
      payment_amount: Number(FEE),
      payment_reference: paymentReference,
      payment_method: 'by account',
      case_reference: 'DTSCCI-6088 HWF duplicate payment test',
    },
  }, 'PUT');
  return res.status;
}

Feature('GA - Help With Fees remission, and duplicate payment callbacks on it (DTSCCI-6088)')
  .tag('@ui-ga').tag('@dtscci-6088');

async function hwfRemissionJourney(I, api, REMISSION) {
  results = [];
  await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  const claimRef = await api.createLiPClaim(config.claimantCitizenUser, 'FastTrack');
  const cd = await api.retrieveCaseData(config.adminUser, claimRef);
  const claimNumber = cd.legacyCaseReference;
  await api.assignToLipDefendant(claimRef);
  await api.waitForFinishedBusinessProcess();
  await apiRequest.setupTokens(config.ctscAdmin);

  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);

  const applyLink = '//a[contains(.,"Contact or apply to the court")]';
  let opened = false;
  for (let attempt = 0; attempt < 3 && !opened; attempt++) {
    await I.amOnPage(`dashboard/${claimRef}/claimant`);
    await I.wait(3);
    if ((await I.grabNumberOfVisibleElements(applyLink)) > 0) {
      await I.click(applyLink);
      await I.wait(3);
      opened = true;
    }
  }
  ev('opened the claim and clicked Contact or apply to the court',
    'the "what do you want to do" page', short(await I.grabCurrentUrl()), opened);
  assert.isTrue(opened, 'could not start the application from the claim');

  await I.waitForContent('What do you want to do?', 60);
  await I.checkOption('#option');
  await I.click('Continue');
  await I.wait(3);
  for (let i = 0; i < 3; i++) {
    if (await at(I, 'application-type')) break;
    if ((await I.grabNumberOfVisibleElements('//button[contains(.,"Continue")] | //a[contains(.,"Continue")]')) === 0) break;
    await I.click('Continue');
    await I.wait(3);
  }
  await I.waitForContent('Select application', 60);

  await applicationTypePage.nextAction('Ask to change a hearing date');
  await applicationTypePage.nextAction('Continue');
  await agreementFromOtherPartyPage.nextAction('No');
  await agreementFromOtherPartyPage.nextAction('Continue');
  if (await at(I, 'inform-other-parties')) {
    await informOtherPartiesPage.selectAndVerifyDontInformOption();
  }
  await I.waitForContent('Application costs', 60);
  const costsBody = await I.grabTextFrom('body');
  ev('fee shown on Application costs', `£${FEE}`,
    costsBody.includes(`£${FEE}`) ? `£${FEE}` : 'not found', costsBody.includes(`£${FEE}`));
  await applicationCostsPage.nextAction('Start now');
  if (await at(I, 'claim-application-cost')) {
    await claimApplicationCostPage.selectAndVerifyYesOption();
    await claimApplicationCostPage.nextAction('Continue');
  }
  if (await at(I, 'order-judge')) {
    await orderJudgePage.fillTextBox('Manual test order');
    await orderJudgePage.nextAction('Continue');
    await requestingReasonPage.fillTextBox('Manual test reason');
    await requestingReasonPage.nextAction('Continue');
  }
  if (await at(I, 'add-another-application')) {
    await addAnotherApplicationPage.nextAction('No');
    await addAnotherApplicationPage.nextAction('Continue');
  }
  await wantToUploadDocumentsPage.nextAction('No');
  await wantToUploadDocumentsPage.nextAction('Continue');
  await hearingArrangementsGuidancePage.nextAction('Continue');
  await hearingArrangementPage.nextAction('In person at the court');
  await hearingArrangementPage.fillTextAndSelectLocation('In person', config.gaCourtToBeSelected);
  await hearingArrangementPage.nextAction('Continue');
  await hearingContactDetailsPage.fillContactDetails('07555655326', 'test@gmail.com');
  await hearingContactDetailsPage.nextAction('Continue');
  await unavailableDatesConfirmationPage.nextAction('Yes');
  await unavailableDatesConfirmationPage.nextAction('Continue');
  await unavailableDatesPage.fillFields();
  await unavailableDatesPage.nextAction('Continue');
  await hearingSupportPage.nextAction('Continue');
  await I.waitForContent('Paying for your application', 60);
  await payingForApplicationPage.nextAction('Continue');

  await checkAndSendPage.checkAndSign();
  await checkAndSendPage.nextAction('Submit');
  await I.waitForContent('Application created', 60);
  await submitGAConfirmationPage.nextAction('Pay application fee');
  await I.wait(5);

  await I.waitForContent('help with fees', 60);
  await I.click('Yes');
  await I.click('Continue');
  await I.wait(3);
  for (let i = 0; i < 5; i++) {
    const cur = await I.grabCurrentUrl();
    if (cur.includes('reference-number')) {
      if ((await I.grabNumberOfVisibleElements('input[name="option"]')) > 0) {
        await I.checkOption('#option');
      }
      await I.fillField('#referenceNumber', HWF_REF);
      await I.click('Continue');
      await I.wait(4);
      if ((await I.grabCurrentUrl()).includes('reference-number')) break;
      continue;
    }
    if ((await I.grabNumberOfVisibleElements('input[name="option"]')) > 0) {
      await I.checkOption('#option');
      await I.click('Continue');
      await I.wait(4);
      continue;
    }
    if ((await I.grabNumberOfVisibleElements('//button[contains(.,"Continue")] | //a[contains(.,"Continue")]')) > 0) {
      await I.click('Continue');
      await I.wait(4);
      continue;
    }
    break;
  }
  const gaId = ((await I.grabCurrentUrl()).match(/\/general-application\/(\d+)\//) || [])[1];
  ev('applied for Help With Fees instead of paying', 'a GA case id and the HWF journey completed',
    `GA ${gaId} at ${short(await I.grabCurrentUrl())}`, !!gaId);
  assert.isOk(gaId, 'no GA id, cannot continue');
  await api.waitForFinishedBusinessProcess();
  await I.wait(8);

  const event = REMISSION === 'PARTIAL' ? 'PARTIAL_REMISSION_HWF_GA' : 'FULL_REMISSION_HWF_GA';
  const patch = REMISSION === 'PARTIAL' ? {gaHwfDetails: {remissionAmount: '5000'}} : {};
  let status = await submitGaEvent(event, gaId, patch);
  ev(`caseworker granted remission (${event})`, 'HTTP 201', `HTTP ${status}`, status === 201);
  await I.wait(8);

  status = await submitGaEvent('FEE_PAYMENT_OUTCOME_GA', gaId, {});
  ev('caseworker completed the Fee Payment Outcome', 'HTTP 201', `HTTP ${status}`, status === 201);
  await I.wait(12);

  let state = (await fetchGa(gaId)).state;
  for (let i = 0; i < 10 && state === 'AWAITING_APPLICATION_PAYMENT'; i++) {
    await I.wait(6);
    state = (await fetchGa(gaId)).state;
  }
  ev('after remission the application is NOT awaiting payment',
    'any state other than AWAITING_APPLICATION_PAYMENT', state,
    !!state && state !== 'AWAITING_APPLICATION_PAYMENT');

  const before = snapshot(await fetchGa(gaId));
  console.log(`6088-MANUAL|before duplicates=${JSON.stringify(before)}`);
  const ref = before.paymentReference || HWF_REF;
  const srRef = before.serviceRequestReference;

  status = await fireCallback(gaId, ref, srRef);
  await I.wait(8);
  const afterOne = snapshot(await fetchGa(gaId));
  ev('a payment callback after remission is accepted without error', 'HTTP 2xx', `HTTP ${status}`,
    status >= 200 && status < 300);
  ev('a payment callback after remission does not disturb the remitted application',
    JSON.stringify(before), JSON.stringify(afterOne),
    JSON.stringify(before) === JSON.stringify(afterOne));

  const statuses = await Promise.all(Array.from({length: 5}, () => fireCallback(gaId, ref, srRef)));
  await I.wait(12);
  const afterMany = snapshot(await fetchGa(gaId));
  ev('five simultaneous callbacks after remission are handled', 'no 5xx', JSON.stringify(statuses),
    statuses.every(s => s < 500));
  ev('five simultaneous callbacks after remission leave the application unchanged',
    JSON.stringify(before), JSON.stringify(afterMany),
    JSON.stringify(before) === JSON.stringify(afterMany));

  const bp = ((await fetchGa(gaId)).case_data || {}).businessProcess || {};
  ev('no business process left running or failed', 'FINISHED or none',
    `status=${bp.status}`, !bp.status || bp.status === 'FINISHED');

  const parent = await api.retrieveCaseData(config.adminUser, claimRef);
  const drafts = (parent.gaDraftDocStaff || []).map(d => d.value || d)
    .filter(d => d?.documentType === 'GENERAL_APPLICATION_DRAFT');
  ev('draft application document generated', 'a GENERAL_APPLICATION_DRAFT document',
    drafts.map(d => d.documentName).join(', ') || 'none', drafts.length > 0);
  const coll = parent.gaDetailsMasterCollection || [];
  ev('application visible on the main claim', `lists GA ${gaId}`,
    `${coll.length} entry/entries, linked: ${JSON.stringify(coll).includes(gaId)}`,
    JSON.stringify(coll).includes(gaId));

  console.log('\n========== DTSCCI-6088 HWF DUPLICATE CALLBACKS ==========');
  console.log(`Remission    : ${REMISSION}`);
  console.log(`Claim number : ${claimNumber}`);
  console.log(`Case id      : ${claimRef}`);
  console.log(`GA id        : ${gaId}`);
  console.log(`Claimant     : ${config.claimantCitizenUser.email} / ${config.claimantCitizenUser.password}`);
  results.forEach(r => console.log(`${r.pass ? 'PASS' : 'FAIL'}  ${r.step}`));
  const failed = results.filter(r => !r.pass);
  console.log(`========== ${results.length - failed.length}/${results.length} ==========`);
  failed.forEach(f => console.log(`FAILED ${f.step}: expected ${f.expected} got ${f.actual}`));
  assert.equal(failed.length, 0, `${failed.length} check(s) failed`);
}

Scenario(
  'full remission: HWF granted, then duplicate and simultaneous callbacks must not disturb it',
  async ({I, api}) => { await hwfRemissionJourney(I, api, 'FULL'); },
);

Scenario(
  'part remission: HWF granted, then duplicate and simultaneous callbacks must not disturb it',
  async ({I, api}) => { await hwfRemissionJourney(I, api, 'PARTIAL'); },
);
