// DTSCCI-6088 - duplicate payment callbacks on a General Application.
//
// PaymentRequestUpdateCallbackService dispatches on case type: when the case is a
// GENERALAPPLICATION and the status is Paid it hands off to
// GaPaymentRequestUpdateCallbackService, which is the service most changed by
// civil-service PR #8222 (+122/-79) and the one that gained @Retryable / @Recover.
//
// So GA duplicates go through the SAME unauthenticated endpoint as civil ones, just with a
// GA case number. This raises and pays a real GA, then hammers it with duplicates.
const stamp = Math.random().toString(36).substring(2, 8);
process.env.CLAIMANT_CITIZEN_EMAIL = `claimant6088-${stamp}@gmail.com`;
process.env.DEFENDANT_CITIZEN_EMAIL = `defendant6088-${stamp}@gmail.com`;

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
const PaymentGAConfirmation = require('../../../citizenFeatures/GA/pages/paymentGAConfirmation');
const GovPay = require('../../../citizenFeatures/common/govPay');

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
const paymentConfirmationPage = new PaymentGAConfirmation();
const govPay = new GovPay();

const FEE = '126';
const CLAIM_ISSUED_ENDPOINT = '/service-request-update-claim-issued';

const results = [];
function ev(step, expected, actual, pass) {
  results.push({step, expected, actual, pass});
  console.log(`6088-GA|${pass ? 'PASS' : 'FAIL'}|${step}|expected=${expected}|actual=${actual}`);
}

const serviceUpdateDto = (caseId, paymentReference, status = 'Paid', serviceRequestReference = '1324646546456') => ({
  service_request_reference: serviceRequestReference,
  ccd_case_number: String(caseId),
  service_request_amount: FEE + '.00',
  service_request_status: status,
  payment: {
    payment_amount: Number(FEE),
    payment_reference: paymentReference,
    payment_method: 'by account',
    case_reference: 'DTSCCI-6088 GA duplicate payment test',
  },
});

async function fireCallback(caseId, paymentReference, status = 'Paid', serviceRequestReference) {
  const auth = await idamHelper.accessToken(config.applicantSolicitorUser);
  const {s2sAuth} = apiRequest.getTokens();
  const res = await restHelper.request(`${config.url.civilService}${CLAIM_ISSUED_ENDPOINT}`, {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${auth}`,
    'ServiceAuthorization': s2sAuth && s2sAuth.startsWith('Bearer') ? s2sAuth : `Bearer ${s2sAuth}`,
  }, serviceUpdateDto(caseId, paymentReference, status, serviceRequestReference), 'PUT');
  return res.status;
}

// Reads the GA case, which lives under the GENERALAPPLICATION case type.
async function fetchGaCase(gaId) {
  // Use ctscAdmin, not adminUser. The adminUser view of a GA is permission filtered down to
  // three fields with no payment data, which would make a before/after comparison meaningless.
  const auth = await idamHelper.accessToken(config.ctscAdmin);
  const userId = await idamHelper.userId(auth);
  const {s2sAuth} = apiRequest.getTokens();
  const url = `${config.url.ccdDataStore}/caseworkers/${userId}/jurisdictions/${config.definition.jurisdiction}`
    + `/case-types/GENERALAPPLICATION/cases/${gaId}`;
  const res = await restHelper.request(url, {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${auth}`,
    'ServiceAuthorization': s2sAuth && s2sAuth.startsWith('Bearer') ? s2sAuth : `Bearer ${s2sAuth}`,
  }, null, 'GET');
  return res.json();
}

// The fields a duplicate callback must leave alone.
function gaSnapshot(ga) {
  const d = ga.case_data || {};
  const pba = d.generalAppPBADetails || {};
  return {
    state: ga.state,
    paymentStatus: pba.paymentDetails?.status,
    paymentReference: pba.paymentDetails?.reference,
    serviceRequestReference: pba.serviceRequestReference,
    paymentSuccessfulDate: pba.paymentSuccessfulDate,
    businessProcessStatus: d.businessProcess?.status,
  };
}

async function at(I, fragment) {
  return (await I.grabCurrentUrl()).includes(fragment);
}

Feature('DTSCCI-6088 - duplicate payment callbacks on a General Application').tag('@dtscci-6088-ga');

Scenario('duplicate and simultaneous callbacks on a paid GA are safe no-ops', async ({I, api}) => {
  await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  const claimRef = await api.createLiPClaim(config.claimantCitizenUser, 'FastTrack');
  const caseData = await api.retrieveCaseData(config.adminUser, claimRef);
  const claimNumber = caseData.legacyCaseReference;
  await api.assignToLipDefendant(claimRef);
  await api.waitForFinishedBusinessProcess();
  await apiRequest.setupTokens(config.adminUser);

  const u = (p) => `case/${claimRef}/general-application/${p}`;

  // ---- raise and pay a real GA ------------------------------------------
  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await I.amOnPage(u('application-type'));
  await I.waitForContent('Select application', 60);
  await applicationTypePage.nextAction('Ask to change a hearing date');
  await applicationTypePage.nextAction('Continue');
  await agreementFromOtherPartyPage.nextAction('No');
  await agreementFromOtherPartyPage.nextAction('Continue');
  if (await at(I, 'inform-other-parties')) {
    await informOtherPartiesPage.selectAndVerifyDontInformOption();
  }
  await applicationCostsPage.nextAction('Start now');
  await claimApplicationCostPage.selectAndVerifyYesOption();
  await claimApplicationCostPage.nextAction('Continue');
  await orderJudgePage.fillTextBox('Test order');
  await orderJudgePage.nextAction('Continue');
  await requestingReasonPage.fillTextBox('Test reason');
  await requestingReasonPage.nextAction('Continue');
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
  await payingForApplicationPage.nextAction('Continue');

  await checkAndSendPage.checkAndSign();
  await checkAndSendPage.nextAction('Submit');
  await I.waitForContent('Application created', 60);
  await submitGAConfirmationPage.nextAction('Pay application fee');
  await I.wait(5);
  await I.waitForContent('help with fees', 60);
  await I.click('No');
  await I.click('Continue');
  await I.wait(3);
  await govPay.addValidCardDetails(FEE);
  await govPay.confirmPayment();
  await I.wait(3);
  await paymentConfirmationPage.verifyPageContent();

  const gaId = ((await I.grabCurrentUrl()).match(/\/general-application\/(\d+)\//) || [])[1];
  ev('raised and paid a General Application', 'a GA case id', String(gaId), !!gaId);
  assert.isOk(gaId, 'could not determine the GA case id');
  await api.waitForFinishedBusinessProcess();
  await I.wait(10);

  const beforeCase = await fetchGaCase(gaId);
  const before = gaSnapshot(beforeCase);
  console.log(`6088-GA|claimRef=${claimRef}|claimNumber=${claimNumber}|gaId=${gaId}|before=${JSON.stringify(before)}`);
  console.log(`6088-GA|visible case_data keys=${JSON.stringify(Object.keys(beforeCase.case_data || {}))}`);

  // Guard against a false pass. The caseworker view of a GA case can be permission filtered,
  // in which case the payment fields come back undefined and a before/after comparison would
  // trivially match. Fail loudly here rather than reporting a green run built on empty data.
  const observable = Object.entries(before).filter(([, v]) => v !== undefined && v !== null);
  ev('the GA payment fields are actually visible to assert on',
    'at least the state and one payment field readable',
    `${observable.length} observable field(s): ${JSON.stringify(Object.fromEntries(observable))}`,
    !!before.state && !!before.paymentReference && observable.length >= 3);
  assert.isOk(before.state, 'GA state not readable, cannot assert on duplicates');

  ev('GA is paid before the duplicates are sent', 'a payment on the GA', JSON.stringify(before),
    !!before.state);

  // isPaymentAlreadyApplied compares the incoming payment reference against the one already
  // on the case, so a duplicate is only a real duplicate if it reuses the actual reference.
  const reference = before.paymentReference;
  const srReference = before.serviceRequestReference;
  ev('captured the real payment reference to build a genuine duplicate',
    'a payment reference read from the case', `${reference} / serviceRequest ${srReference}`,
    !!reference);
  assert.isOk(reference, 'no payment reference readable, the duplicate would not be a duplicate');

  // ---- 1. the same callback again, sequentially -------------------------
  const status1 = await fireCallback(gaId, reference, 'Paid', srReference);
  await I.wait(8);
  const afterSequential = gaSnapshot(await fetchGaCase(gaId));
  ev('repeated identical GA callback accepted without error', 'HTTP 2xx', `HTTP ${status1}`,
    status1 >= 200 && status1 < 300);
  ev('repeated identical GA callback does not change the GA',
    JSON.stringify(before), JSON.stringify(afterSequential),
    JSON.stringify(before) === JSON.stringify(afterSequential));

  // ---- 2. five identical callbacks at once -------------------------------
  const statuses = await Promise.all(
    Array.from({length: 5}, () => fireCallback(gaId, reference, 'Paid', srReference)));
  console.log(`6088-GA|simultaneous statuses=${JSON.stringify(statuses)}`);
  await I.wait(12);
  const afterConcurrent = gaSnapshot(await fetchGaCase(gaId));
  ev('five simultaneous identical GA callbacks handled', 'no 5xx', JSON.stringify(statuses),
    statuses.every(s => s < 500));
  ev('five simultaneous identical GA callbacks leave the GA unchanged',
    JSON.stringify(before), JSON.stringify(afterConcurrent),
    JSON.stringify(before) === JSON.stringify(afterConcurrent));

  // ---- 3. the GA must not be left mid-process ---------------------------
  const finalGa = await fetchGaCase(gaId);
  const bp = (finalGa.case_data || {}).businessProcess || {};
  ev('no GA business process left running or failed',
    'FINISHED or no active process', `status=${bp.status}, activityId=${bp.activityId}`,
    !bp.status || bp.status === 'FINISHED');

  // ---- 4. the application must still be progressing normally ------------
  ev('GA not left in Awaiting Application Payment',
    'any state other than AWAITING_APPLICATION_PAYMENT', finalGa.state,
    finalGa.state && finalGa.state !== 'AWAITING_APPLICATION_PAYMENT');

  console.log('\n========== DTSCCI-6088 GA RESULTS ==========');
  console.log(`Claim number : ${claimNumber}`);
  console.log(`Case id      : ${claimRef}`);
  console.log(`GA id        : ${gaId}`);
  console.log(`Claimant     : ${config.claimantCitizenUser.email} / ${config.claimantCitizenUser.password}`);
  results.forEach(r => console.log(`${r.pass ? 'PASS' : 'FAIL'}  ${r.step}`));
  const failed = results.filter(r => !r.pass);
  console.log(`========== ${results.length - failed.length}/${results.length} ==========`);
  failed.forEach(f => console.log(`FAILED ${f.step}: expected ${f.expected} got ${f.actual}`));
  assert.equal(failed.length, 0, `${failed.length} GA duplicate-payment check(s) failed`);
});
