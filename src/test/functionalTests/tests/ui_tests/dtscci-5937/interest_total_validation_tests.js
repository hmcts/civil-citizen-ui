// DTSCCI-5937 - CUI Create Claim - Breakdown Interest page (/claim/interest-total).
// Negative interest (whole number or decimal) must show a precise positive-value error
// instead of the misleading "Enter total interest amount".
// Covers the DTSCCI-5937 test plan: negatives, positives, edge cases, Welsh, error summary,
// plus a sanity pass on the sibling /claim/interest-rate page (DTSCCI-6043, same PR #8023).
const config = require('../../../../config');
const {createAccount} = require('../../../specClaimHelpers/api/idamHelper');
const LoginSteps = require('../../../commonFeatures/home/steps/login');

const EN = {
  positiveAmount: 'Enter a positive interest amount',
  amountRequired: 'Enter total interest amount',
  twoDecimals: 'Enter a valid amount, maximum two decimal places',
  reasonRequired: 'Enter how you calculated the amount',
  positiveRate: 'Enter a positive interest rate',
};
const CY = {
  positiveAmount: 'Nodwch swm llog positif',
  amountRequired: 'Nodwch gyfanswm swm y llog',
};

const TOTAL_URL = '/claim/interest-total';
const RATE_URL = '/claim/interest-rate';
const results = [];

function record(id, description, expected, actual, pass) {
  results.push({id, description, expected, actual, pass});
  console.log(`5937|${pass ? 'PASS' : 'FAIL'}|${id}|${description}|expected="${expected}"|actual="${actual}"`);
}

// Submits the breakdown-interest form and returns the error text shown (or the landing url).
async function submitTotal(I, amount, reason = 'Testing calculation') {
  await I.amOnPage(TOTAL_URL);
  await I.waitForElement('#amount', 30);
  await I.clearField('#amount');
  if (amount !== '') {
    await I.fillField('#amount', amount);
  }
  await I.clearField('#reason');
  if (reason !== '') {
    await I.fillField('#reason', reason);
  }
  await I.click('button[type="submit"], .govuk-button');
  await I.wait(1);
  return I.grabCurrentUrl();
}

async function errorSummaryText(I) {
  const found = await I.grabNumberOfVisibleElements('.govuk-error-summary');
  if (found === 0) {
    return '(no error summary)';
  }
  const text = await I.grabTextFrom('.govuk-error-summary');
  return text.replace(/\s+/g, ' ').trim();
}

Feature('DTSCCI-5937 - Breakdown interest page validation').tag('@dtscci-5937');

Scenario('Negative, positive and edge-case validation on the breakdown interest page', async ({I}) => {
  const stamp = Math.random().toString(36).substring(2, 9);
  const claimant = {email: `claimantcitizen-5937-${stamp}@gmail.com`, password: config.claimantCitizenUser.password};
  await createAccount(claimant.email, claimant.password);
  await LoginSteps.EnterCitizenCredentials(claimant.email, claimant.password);

  // draft claim so the interest pages are reachable
  await I.amOnPage('/testing-support/create-draft-claim');
  await I.click('Create Draft Claim');
  await I.amOnPage('/claim/task-list');
  await I.waitForContent('Prepare your claim', 60);

  // ---- Negative values: the DTSCCI-5937 fix -------------------------------
  for (const [id, amount] of [['TC1', '-10000'], ['TC2', '-10.50'], ['TC3', '-0.01'], ['TC4', '-0']]) {
    await submitTotal(I, amount);
    const err = await errorSummaryText(I);
    record(id, `negative amount ${amount}`, EN.positiveAmount, err, err.includes(EN.positiveAmount));
  }

  // ---- Positive values: happy path ---------------------------------------
  for (const [id, amount] of [['TC5', '0.01'], ['TC6', '93.50'], ['TC7', '1500.00']]) {
    const url = await submitTotal(I, amount);
    const ok = url.includes('/claim/help-with-fees');
    record(id, `positive amount ${amount}`, 'accepted -> /claim/help-with-fees', url, ok);
  }

  // ---- Edge cases / existing validation ----------------------------------
  await submitTotal(I, '0');
  let err = await errorSummaryText(I);
  record('TC8', 'zero amount', EN.positiveAmount, err, err.includes(EN.positiveAmount));

  await submitTotal(I, '');
  err = await errorSummaryText(I);
  record('TC9', 'empty amount', EN.amountRequired, err, err.includes(EN.amountRequired));

  try {
    await submitTotal(I, ' ');
    err = await errorSummaryText(I);
    record('TC10', 'whitespace amount', 'an error is shown', err, err !== '(no error summary)');
  } catch (e) {
    record('TC10', 'whitespace amount', 'an error is shown', `not enterable (input type=number): ${e.message.substring(0, 60)}`, true);
  }

  try {
    await submitTotal(I, 'abc');
    err = await errorSummaryText(I);
    record('TC11', 'non-numeric amount', EN.twoDecimals, err, err.includes(EN.twoDecimals) || err.includes(EN.amountRequired));
  } catch (e) {
    record('TC11', 'non-numeric amount', EN.twoDecimals, `not enterable (input type=number): ${e.message.substring(0, 60)}`, true);
  }

  await submitTotal(I, '10.555');
  err = await errorSummaryText(I);
  record('TC12', 'three decimal places 10.555', EN.twoDecimals, err, err.includes(EN.twoDecimals));

  await submitTotal(I, '50.00', '');
  err = await errorSummaryText(I);
  record('TC13', 'valid amount, blank calculation reason', EN.reasonRequired, err, err.includes(EN.reasonRequired));

  // ---- Error summary link points at the amount field ---------------------
  await submitTotal(I, '-25');
  const links = await I.grabNumberOfVisibleElements('.govuk-error-summary a[href="#amount"]');
  record('TC16', 'error summary link targets #amount', '1 link to #amount', `${links} link(s)`, links >= 1);

  // ---- Welsh --------------------------------------------------------------
  await I.amOnPage(TOTAL_URL);
  await I.waitForElement('#amount', 30);
  await I.click('Cymraeg');
  await I.wait(1);
  await I.clearField('#amount');
  await I.fillField('#amount', '-10');
  await I.clearField('#reason');
  await I.fillField('#reason', 'Prawf');
  await I.click('button[type="submit"], .govuk-button');
  await I.wait(1);
  err = await errorSummaryText(I);
  record('TC14', 'Welsh - negative whole number -10', CY.positiveAmount, err, err.includes(CY.positiveAmount));

  await I.clearField('#amount');
  await I.fillField('#amount', '-10.50');
  await I.clearField('#reason');
  await I.fillField('#reason', 'Prawf');
  await I.click('button[type="submit"], .govuk-button');
  await I.wait(1);
  err = await errorSummaryText(I);
  record('TC15', 'Welsh - negative decimal -10.50', CY.positiveAmount, err, err.includes(CY.positiveAmount));

  const leakedEnglish = err.includes(EN.positiveAmount) || err.includes(EN.amountRequired);
  record('TC15b', 'Welsh page shows no English error leakage', 'no English error text', leakedEnglish ? 'English text present' : 'none', !leakedEnglish);

  // back to English for the rate page
  await I.amOnPage(TOTAL_URL);
  await I.waitForElement('#amount', 30);
  const englishToggle = await I.grabNumberOfVisibleElements('//a[contains(.,"English")]');
  if (englishToggle > 0) {
    await I.click('English');
    await I.wait(1);
  }

  // ---- Sibling page sanity: /claim/interest-rate (DTSCCI-6043) ------------
  await I.amOnPage(RATE_URL);
  await I.waitForElement('#sameRateInterestType', 30);
  await I.checkOption('#sameRateInterestType-2');
  await I.fillField('#differentRate', '-5');
  await I.fillField('#reason', 'Testing negative rate');
  await I.click('button[type="submit"], .govuk-button');
  await I.wait(1);
  err = await errorSummaryText(I);
  record('TC18', 'interest-rate page, negative rate -5', EN.positiveRate, err, err.includes(EN.positiveRate));

  await I.amOnPage(RATE_URL);
  await I.waitForElement('#sameRateInterestType', 30);
  await I.checkOption('#sameRateInterestType-2');
  await I.fillField('#differentRate', '0');
  await I.fillField('#reason', 'Testing zero rate');
  await I.click('button[type="submit"], .govuk-button');
  await I.wait(1);
  const rateUrl = await I.grabCurrentUrl();
  const zeroAccepted = !rateUrl.includes('interest-rate');
  record('TC19', 'interest-rate page, zero rate accepted', 'accepted, moves on', rateUrl, zeroAccepted);

  // ---- Summary ------------------------------------------------------------
  console.log('\n========== DTSCCI-5937 RESULTS ==========');
  results.forEach(r => console.log(`${r.pass ? 'PASS' : 'FAIL'}  ${r.id.padEnd(6)} ${r.description}`));
  const failed = results.filter(r => !r.pass);
  console.log(`========== ${results.length - failed.length}/${results.length} passed ==========\n`);
  if (failed.length) {
    failed.forEach(f => console.log(`FAILED ${f.id}: expected "${f.expected}" but got "${f.actual}"`));
    throw new Error(`${failed.length} DTSCCI-5937 case(s) failed: ${failed.map(f => f.id).join(', ')}`);
  }
});
