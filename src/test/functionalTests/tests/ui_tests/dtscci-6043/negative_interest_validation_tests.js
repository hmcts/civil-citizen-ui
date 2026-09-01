// DTSCCI-6043 - Negative interest rates/amounts must be rejected in CUI and EXUI.
// AC1/AC2: CUI "What annual rate of interest do you want to claim?" (EN + Welsh)
// AC3/AC4: CUI "What is the total interest for your claim?"        (EN + Welsh)
// AC5/AC6: EXUI LR-spec create claim - the ValidateClaimInterestDate mid-event callback
//          that civil-ccd-definition #6775 wires onto the SameRateInterestSelection and
//          BreakDownInterest pages, returning civil-service #8198's validation errors.
const config = require('../../../../config');
const {createAccount} = require('../../../specClaimHelpers/api/idamHelper');
const LoginSteps = require('../../../commonFeatures/home/steps/login');
const apiRequest = require('../../../specClaimHelpers/api/apiRequest');
const restHelper = require('../../../specClaimHelpers/api/restHelper');

const EN = {
  rate: 'Enter a positive interest rate',
  amount: 'Enter a positive interest amount',
};
const CY = {
  rate: 'Nodwch gyfradd llog positif',
  amount: 'Nodwch swm llog positif',
};

const RATE_URL = '/claim/interest-rate';
const TOTAL_URL = '/claim/interest-total';
const results = [];

function record(ac, description, expected, actual, pass) {
  results.push({ac, description, expected, actual, pass});
  console.log(`6043|${pass ? 'PASS' : 'FAIL'}|${ac}|${description}|expected="${expected}"|actual="${actual}"`);
}

async function summary(I) {
  const n = await I.grabNumberOfVisibleElements('.govuk-error-summary');
  if (n === 0) {
    return {title: '(none)', body: '(no error summary)'};
  }
  const title = (await I.grabTextFrom('.govuk-error-summary__title')).replace(/\s+/g, ' ').trim();
  const body = (await I.grabTextFrom('.govuk-error-summary__body')).replace(/\s+/g, ' ').trim();
  return {title, body};
}

async function insetError(I, field) {
  const n = await I.grabNumberOfVisibleElements(`#${field}-error`);
  if (n === 0) {
    return '(no inset error)';
  }
  return (await I.grabTextFrom(`#${field}-error`)).replace(/\s+/g, ' ').replace(/^Error:\s*/i, '').trim();
}

async function submitRate(I, rate) {
  await I.amOnPage(RATE_URL);
  await I.waitForElement('#sameRateInterestType', 30);
  await I.checkOption('#sameRateInterestType-2');
  await I.clearField('#differentRate');
  await I.fillField('#differentRate', rate);
  await I.clearField('#reason');
  await I.fillField('#reason', 'Entitled because of the contract terms');
  await I.click('button[type="submit"], .govuk-button');
  await I.wait(1);
}

async function submitTotal(I, amount) {
  await I.amOnPage(TOTAL_URL);
  await I.waitForElement('#amount', 30);
  await I.clearField('#amount');
  await I.fillField('#amount', amount);
  await I.clearField('#reason');
  await I.fillField('#reason', 'bla bla bla');
  await I.click('button[type="submit"], .govuk-button');
  await I.wait(1);
}

Feature('DTSCCI-6043 - negative interest rejected in CUI and EXUI').tag('@dtscci-6043');

Scenario('AC1-AC4: CUI rejects negative interest rate and amount in English and Welsh', async ({I}) => {
  const stamp = Math.random().toString(36).substring(2, 9);
  const claimant = {email: `claimantcitizen-6043-${stamp}@gmail.com`, password: config.claimantCitizenUser.password};
  await createAccount(claimant.email, claimant.password);
  await LoginSteps.EnterCitizenCredentials(claimant.email, claimant.password);

  await I.amOnPage('/testing-support/create-draft-claim');
  await I.click('Create Draft Claim');
  await I.amOnPage('/claim/task-list');
  await I.waitForContent('Prepare your claim', 60);

  // ---- AC1: CUI interest rate, English --------------------------------
  await submitRate(I, '-5');
  let s = await summary(I);
  let inset = await insetError(I, 'differentRate');
  record('AC1', 'banner reasoning for negative rate -5', EN.rate, s.body, s.body.includes(EN.rate));
  record('AC1', 'inset error above "Rate you\'re claiming" textbox', EN.rate, inset, inset.includes(EN.rate));
  record('AC1', 'banner h2 header text', 'There is a problem (per AC)', s.title, s.title === 'There is a problem');

  // ---- AC3: CUI breakdown interest, English ---------------------------
  await submitTotal(I, '-500');
  s = await summary(I);
  inset = await insetError(I, 'amount');
  record('AC3', 'banner reasoning for negative amount -500', EN.amount, s.body, s.body.includes(EN.amount));
  record('AC3', 'inset error above "Total interest amount" textbox', EN.amount, inset, inset.includes(EN.amount));
  record('AC3', 'banner h2 header text', 'There is a problem (per AC)', s.title, s.title === 'There is a problem');

  // ---- AC2: CUI interest rate, Welsh ----------------------------------
  await I.amOnPage(RATE_URL);
  await I.waitForElement('#sameRateInterestType', 30);
  await I.click('Cymraeg');
  await I.wait(1);
  await I.checkOption('#sameRateInterestType-2');
  await I.clearField('#differentRate');
  await I.fillField('#differentRate', '-5');
  await I.clearField('#reason');
  await I.fillField('#reason', 'Rheswm prawf');
  await I.click('button[type="submit"], .govuk-button');
  await I.wait(1);
  s = await summary(I);
  inset = await insetError(I, 'differentRate');
  record('AC2', 'Welsh banner reasoning for negative rate', CY.rate, s.body, s.body.includes(CY.rate));
  record('AC2', 'Welsh inset error', CY.rate, inset, inset.includes(CY.rate));
  record('AC2', 'Welsh banner h2 header', 'Roedd problem', s.title, s.title === 'Roedd problem');

  // ---- AC4: CUI breakdown interest, Welsh -----------------------------
  await submitTotal(I, '-500');
  s = await summary(I);
  inset = await insetError(I, 'amount');
  record('AC4', 'Welsh banner reasoning for negative amount', CY.amount, s.body, s.body.includes(CY.amount));
  record('AC4', 'Welsh inset error', CY.amount, inset, inset.includes(CY.amount));
  record('AC4', 'Welsh banner h2 header', 'Roedd problem', s.title, s.title === 'Roedd problem');

  console.log('\n===== DTSCCI-6043 CUI (AC1-AC4) =====');
  results.forEach(r => console.log(`${r.pass ? 'PASS' : 'FAIL'}  ${r.ac}  ${r.description}  -> "${r.actual}"`));
});

Scenario('AC5-AC6: EXUI LR-spec create claim rejects negative interest via ValidateClaimInterestDate', async () => {
  await apiRequest.setupTokens(config.applicantSolicitorUser);
  const {userAuth, s2sAuth} = apiRequest.getTokens();
  const url = `${config.url.civilService}/cases/callbacks/mid/ValidateClaimInterestDate`;
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${userAuth}`,
    'ServiceAuthorization': s2sAuth.startsWith('Bearer') ? s2sAuth : `Bearer ${s2sAuth}`,
  };

  const callback = async (data) => {
    // CCD's CallbackRequest binds snake_case (case_details / event_id), not camelCase.
    const response = await restHelper.request(url, headers, {
      event_id: 'CREATE_CLAIM_SPEC',
      case_details: {id: 1, state: 'PENDING_CASE_ISSUED', case_data: data},
    }, 'POST');
    const raw = await response.text();
    let body;
    try {
      body = JSON.parse(raw);
    } catch (e) {
      console.log(`6043|CALLBACK-RAW|status=${response.status}|body=${raw.substring(0, 400)}`);
      return {status: response.status, errors: [], raw: raw.substring(0, 200)};
    }
    if (response.status !== 200) {
      console.log(`6043|CALLBACK-NON200|status=${response.status}|body=${raw.substring(0, 400)}`);
    }
    return {status: response.status, errors: body.errors || [], raw: ''};
  };

  const rateData = (rate) => ({
    claimInterest: 'Yes',
    interestClaimOptions: 'SAME_RATE_INTEREST',
    sameRateInterestSelection: {
      sameRateInterestType: 'SAME_RATE_INTEREST_DIFFERENT_RATE',
      differentRate: rate,
      reason: 'Contract terms',
    },
    interestClaimFrom: 'FROM_CLAIM_SUBMIT_DATE',
    interestClaimUntil: 'UNTIL_CLAIM_SUBMIT_DATE',
  });

  const breakdownData = (amount) => ({
    claimInterest: 'Yes',
    interestClaimOptions: 'BREAK_DOWN_INTEREST',
    breakDownInterestTotal: amount,
    breakDownInterestDescription: 'bla bla bla',
  });

  // AC5 - negative rate rejected
  let r = await callback(rateData(-5));
  record('AC5', 'EXUI mid-event, negative rate -5', EN.rate, `HTTP ${r.status} ${JSON.stringify(r.errors)}${r.raw}`, r.errors.includes(EN.rate));

  // AC5 control - valid rate accepted
  r = await callback(rateData(8));
  record('AC5', 'EXUI mid-event control, rate 8 accepted', 'HTTP 200, no errors', `HTTP ${r.status} ${JSON.stringify(r.errors)}`, r.status === 200 && r.errors.length === 0);

  // AC6 - negative breakdown amount rejected
  r = await callback(breakdownData(-500));
  record('AC6', 'EXUI mid-event, negative amount -500', EN.amount, `HTTP ${r.status} ${JSON.stringify(r.errors)}${r.raw}`, r.errors.includes(EN.amount));

  // AC6 control - valid amount accepted
  r = await callback(breakdownData(500));
  record('AC6', 'EXUI mid-event control, amount 500 accepted', 'HTTP 200, no errors', `HTTP ${r.status} ${JSON.stringify(r.errors)}`, r.status === 200 && r.errors.length === 0);

  // Guard - interest not claimed at all must never error
  r = await callback({claimInterest: 'No'});
  record('AC6', 'guard: claimInterest=No produces no interest errors', 'HTTP 200, no errors', `HTTP ${r.status} ${JSON.stringify(r.errors)}`, r.status === 200 && r.errors.length === 0);

  console.log('\n========== DTSCCI-6043 FULL RESULTS ==========');
  results.forEach(r2 => console.log(`${r2.pass ? 'PASS' : 'FAIL'}  ${r2.ac}  ${r2.description}`));
  const failed = results.filter(r2 => !r2.pass);
  console.log(`========== ${results.length - failed.length}/${results.length} passed ==========`);
  failed.forEach(f => console.log(`FAILED ${f.ac}: expected "${f.expected}" but got "${f.actual}"`));
});
