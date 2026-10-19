const I = actor();
const config = require('../../../../config');
const CreateClaim = require('../pages/createClaim');
const createClaim = new CreateClaim();
const LoginSteps = require('../../../commonFeatures/home/steps/login');
const {createCitizen} = require('../../../specClaimHelpers/api/draftClaimStoreHelper');

const tryTo = require('codeceptjs/lib/plugin/tryTo')({registerGlobal: false});

const cya = 'a false statement in a document verified by a statement of truth';
const claimNumberLocator = '//div[contains(text(),\'Claim number\')]/strong';
const freshPageNavigation = '//html[not(@data-draft-store-leaving)]//*[@id="navigation"]';
const serviceReturnLink = '//*[self::a or self::button][normalize-space(.)="Start again" or normalize-space(.)="Continue"]';

const knownTaskStatuses = ['Cannot start yet', 'Not started', 'In progress', 'Incomplete', 'Complete'];

const taskListLoaded = async () => {
  await I.waitForText('Prepare your claim', 60);
  await I.seeInCurrentUrl('/claim/task-list');
};

const quickEligibility = async () => {
  await I.amOnPage('/eligibility');
  if (!(await I.grabCurrentUrl()).includes('/claim/bilingual-language-preference')) {
    await I.click('Continue');
    const answer = async (path, choice) => {
      await I.waitInUrl(`/eligibility/${path}`, 60);
      if (choice) {
        await I.click(choice);
      }
      await I.click('//main//form//button[normalize-space(.)="Save and continue" or normalize-space(.)="Continue"]');
    };
    await answer('known-claim-amount', 'Yes');
    await answer('single-defendant', '#option-2');
    await answer('defendant-address', '#option');
    await answer('claim-type', '#claimType');
    await answer('claimant-address', '#option');
    await answer('claim-is-for-tenancy-deposit', '#option-2');
    await answer('government-department', '#option-2');
    await answer('defendant-age', '#defendant-age-eligibility');
    await answer('over-18', '#option');
    await answer('help-with-fees', '#option');
    await answer('information-about-help-with-fees', '#option');
    await answer('apply-for-help-with-fees');
    await answer('help-with-fees-reference', '#option-2');
    await I.waitInUrl('/eligibility/hwf-eligible', 60);
    await I.click('Continue');
  }
};

const enterCard = async (cardNumber) => {
  await I.fillField('#card-no', cardNumber);
  await I.fillField('#expiry-month', String(new Date().getMonth() + 1));
  await I.fillField('#expiry-year', String(new Date().getFullYear() + 1));
  await I.fillField('#cardholder-name', 'Test Name');
  await I.fillField('#cvc', '444');
  await I.fillField('[autocomplete=\'billing address-line1\']', '220 Helena House');
  await I.fillField('#address-city', 'Swansea');
  await I.fillField('#address-postcode', 'SA1 1XW');
  await I.fillField('#email', 'testxxx@hmcts.net');
  await I.click('Continue');
};

const backToService = async () => {
  await I.wait(4);
  for (let second = 0; second < 60; second += 2) {
    if (!(await I.grabCurrentUrl()).includes('payments.service.gov.uk')) {
      return;
    }
    if (!(await tryTo(() => I.seeElement('#card-no'))) && await tryTo(() => I.seeElement(serviceReturnLink))) {
      const links = (await I.grabTextFromAll('a')).map(t => t.trim());
      await I.click(links.includes('Start again') ? 'Start again' : 'Continue');
      await I.wait(5);
      return;
    }
    await I.wait(2);
  }
  throw new Error('GOV.UK Pay did not offer a way back to the service within 60 seconds');
};

class DraftClaimStoreSteps {

  async signInAsNewClaimant() {
    const user = await createCitizen();
    await LoginSteps.EnterCitizenCredentials(user.email, user.password);
    await this.openPage('/dashboard');
    return user;
  }

  async signInAgain(user) {
    await LoginSteps.EnterCitizenCredentials(user.email, user.password);
    await this.openPage('/dashboard');
  }

  async openPage(path) {
    const maxAttempts = 3;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const navigated = await tryTo(() => I.executeScript((target) => {
        document.documentElement.setAttribute('data-draft-store-leaving', 'true');
        window.location.href = target;
      }, `${config.TestUrl}${path}`));
      if (!navigated) {
        await tryTo(() => I.amOnPage(path));
      }
      if (await tryTo(() => I.waitForElement(freshPageNavigation, 60))) {
        return;
      }
    }
    throw new Error(`The page ${path} did not load after ${maxAttempts} attempts`);
  }

  async createCompleteDraft() {
    await this.startClaimThroughEligibility();
    await this.completeClaimTasks();
  }

  async startClaimThroughEligibility() {
    await quickEligibility();
    await I.waitForText('In what language do you want to make your claim?', 60);
    await I.click('#option');
    await I.click('Save and continue');
    await taskListLoaded();
    return this.taskStatuses();
  }

  async completeClaimTasks() {
    await taskListLoaded();
    await I.click('Resolving this dispute');
    await createClaim.verifyTryToResolveTheDispute();
    await taskListLoaded();
    await I.click('Completing your claim');
    await createClaim.verifyCompletingYourClaim();
    await taskListLoaded();
    await I.click('Your details');
    await createClaim.verifyAboutYouAndThisClaimForClaimant();
    await I.waitForText('Yes, add a correspondence address', 60);
    await createClaim.inputEnterYourDetails(true);
    await createClaim.verifyDateOfBirth();
    await createClaim.inputDateOfBirth();
    await createClaim.verifyAndInputPhoneNumber();
    await taskListLoaded();
    await I.click('Claim amount');
    await createClaim.verifyClaimAmount();
    await createClaim.inputClaimAmount();
    await createClaim.verifyAndInputDoYouWantToClaimInterest(true);
    await createClaim.verifyAndInputHowDoYouWantToClaimInterest();
    await createClaim.verifyAndInputWhatAnnualRateOfInterestDoYouWantToClaim();
    await createClaim.verifyAndInputWhenWillYouClaimInterestFrom();
    await createClaim.verifyAndInputHelpWithFees();
    await createClaim.verifyClaimAmountSummary(true);
    await taskListLoaded();
    await I.click('Claim details');
    await createClaim.verifyAndInputClaimDetails();
    await createClaim.inputClaimDetailsTimeline();
    await createClaim.inputEvidenceList();
    await taskListLoaded();
    await I.click('Their details');
    await createClaim.verifyAboutYouAndThisClaimForDefendant();
    await createClaim.verifyEnterDefendantsDetails();
    await createClaim.inputEnterYourDetails(false);
    await createClaim.verifyTheirEmailAddress();
    await createClaim.verifyTheirPhoneNumber();
    await taskListLoaded();
  }

  async taskStatuses() {
    const items = (await I.grabTextFromAll('.app-task-list__item')).map(t => t.replace(/\s+/g, ' ').trim());
    const statuses = {};
    for (const item of items) {
      const status = knownTaskStatuses.find(candidate => item.endsWith(candidate));
      if (status) {
        statuses[item.slice(0, item.length - status.length).trim()] = status;
      }
    }
    return statuses;
  }

  async openDashboard() {
    const maxAttempts = 5;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      await this.openPage('/dashboard');
      if (await I.grabNumberOfVisibleElements('//h1[normalize-space(.)="Your money claims account"]') > 0) {
        return;
      }
      if (attempt < maxAttempts) {
        await I.wait(10);
      }
    }
    throw new Error('The dashboard did not load: the "Your money claims account" heading never appeared');
  }

  async draftClaimStatusOnDashboard() {
    await this.openDashboard();
    const row = '//table[contains(@class, "govuk-table")]//tr[td[1][normalize-space(.)="Draft claim"]]';
    const rowCount = await I.grabNumberOfVisibleElements(row);
    if (rowCount === 0) {
      return null;
    }
    const status = await I.grabTextFrom(`${row}/td[last()]`);
    return status.trim();
  }

  async openDraftClaimFromDashboard() {
    await I.click('Draft claim', 'table.govuk-table');
    await I.waitForText('Continue with claim', 60);
    const banner = await I.grabTextFrom('.govuk-notification-banner');
    return banner.replace(/\s+/g, ' ').trim();
  }

  async continueWithClaim() {
    await I.click('Continue with claim');
    await taskListLoaded();
  }

  async addHelpWithFeesReference() {
    await I.amOnPage('/claim/help-with-fees');
    await I.waitForElement('#referenceNumber, #option', 60);
    await I.click('#option');
    await I.fillField('#referenceNumber', 'HWF-123-466');
    await I.click('Save and continue');
    await I.wait(3);
  }

  async openCheckYourAnswers() {
    await I.amOnPage('/claim/task-list');
    await I.waitForText('Prepare your claim', 60);
    await I.click('Check and submit your claim');
    await I.wait(3);
    await createClaim.rerouteFromEqualityAndDiversity('Check and submit your claim');
    await I.waitForText(cya, 60);
  }

  async submitClaim(withHelpWithFees = false) {
    await this.openCheckYourAnswers();
    if (!withHelpWithFees) {
      await I.uncheckOption('#acceptNoChangesAllowed');
      await I.checkOption('#acceptNoChangesAllowed');
    }
    await I.uncheckOption('#signed');
    await I.checkOption('#signed');
    await I.click('Submit claim');
    await I.waitForElement(claimNumberLocator, 90);
    const claimNumber = await I.grabTextFrom(claimNumberLocator);
    return claimNumber.trim().replace(/-/g, '');
  }

  async submitClaimWithLostResponse() {
    await this.openCheckYourAnswers();
    await I.uncheckOption('#acceptNoChangesAllowed');
    await I.checkOption('#acceptNoChangesAllowed');
    await I.uncheckOption('#signed');
    await I.checkOption('#signed');
    await I.usePlaywrightTo('lose the response to the first submission', async ({page}) => {
      let dropped = false;
      await page.route('**/claim/check-and-send', async (route) => {
        if (!dropped && route.request().method() === 'POST') {
          dropped = true;
          await route.fetch();
          await route.abort('timedout');
          return;
        }
        await route.continue();
      });
    });
    await tryTo(() => I.click('Submit claim'));
    await I.wait(10);
    await I.usePlaywrightTo('stop intercepting the submission', async ({page}) => {
      await page.unroute('**/claim/check-and-send');
    });
  }

  async openClaimFeePage(caseRef) {
    const payLink = '//a[contains(normalize-space(.), "Pay the claim fee")]';
    const maxAttempts = 20;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      await this.openPage(`/dashboard/${caseRef}/claimant`);
      if (await I.grabNumberOfVisibleElements(payLink) > 0) {
        await I.click(payLink);
        await I.waitForElement('//h1[normalize-space(.)="Pay your claim fee" or normalize-space(.)="Something went wrong"]', 60);
        const heading = (await I.grabTextFrom('h1')).trim();
        if (heading !== 'Pay your claim fee') {
          throw new Error(`Expected the claim fee page for case ${caseRef} but got "${heading}"`);
        }
        return;
      }
      if (attempt < maxAttempts) {
        await I.wait(15);
      }
    }
    throw new Error(`Pay the claim fee link never appeared on the claimant dashboard for case ${caseRef}`);
  }

  async continueToCardPayment() {
    await I.click('continue to payment');
    await I.waitForElement('#card-no', 60);
  }

  async payByCard() {
    await enterCard('4444333322221111');
    await I.waitForText('Confirm your payment', 60);
    await I.click('Confirm payment');
    await I.waitForText('successful', 60);
    return I.grabCurrentUrl();
  }

  async declineCard() {
    await enterCard('4000000000000002');
    await backToService();
    return I.grabCurrentUrl();
  }

  async cancelPayment() {
    await I.click('Cancel payment');
    await backToService();
    return I.grabCurrentUrl();
  }

  async retryPayment() {
    await I.click({css: 'a[href*="make-payment-again"]'});
    await I.waitForElement('#card-no', 60);
  }

  async checkYourAnswersUrl() {
    await I.amOnPage('/claim/check-and-send');
    await I.wait(3);
    return I.grabCurrentUrl();
  }

  async languagePageHeading() {
    await I.amOnPage('/claim/bilingual-language-preference');
    await I.wait(4);
    const url = await I.grabCurrentUrl();
    const text = (await I.grabTextFrom('#main-content')).replace(/\s+/g, ' ').trim();
    return {url, text};
  }
}

module.exports = new DraftClaimStoreSteps();
