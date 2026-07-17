const I = actor();
const config = require('../../../../config');
const cuiCookies = require('../../../specClaimHelpers/fixtures/cookies/cuiCookies');
const cmcCookies = require('../../../specClaimHelpers/fixtures/cookies/cmcCookies');
const idamCookies = require('../../../specClaimHelpers/fixtures/cookies/idamCookies');
const generateExuiCookies = require('../../../specClaimHelpers/fixtures/cookies/exuiCookies');

// Selectors are kept dual-UI safe for the HMCTS Access migration: the legacy IDAM Web
// Public UI and the new HMCTS Access UI use the same username/password field ids, but the
// email field id can differ, so a fallback is included.
const fields = {
  username: 'input[id="username"], input[id="email"]',
  password: 'input[id="password"], input[id="password-input"]',
};

const buttons = {
  submit: '#login-submit-btn, button[type="submit"], input[type="submit"], input.button',
  hmctsSignIn: 'Sign in',
  acceptCookies: 'button[id="cookie-accept-submit"]',
  hideMessage: 'button[name="hide-accepted"]',
};

class LoginPage {
  async #signOutIfNeeded() {
    const isSignedIn = await I.grabNumberOfVisibleElements('a[href="/logout"]');

    if (isSignedIn) {
      await I.amOnPage('/logout');
      await I.wait(2);
    }
  }

  async openCitizenLogin() {
    const isPlaywrightActive = await I.isPlaywright();
    console.log('Is Playwright active?', isPlaywrightActive);

    if (isPlaywrightActive) {
      await this.#signOutIfNeeded();
      await I.clearCookie();
      await I.setCookie([...idamCookies, ...cuiCookies]);
    }
    await I.amOnPage('/');
  }

  async openOCMC() {
    await I.clearCookie();
    await I.setCookie([...idamCookies, ...cmcCookies]);
    await I.amOnPage('https://moneyclaims.aat.platform.hmcts.net');
  }

  async openManageCase() {
    await I.clearCookie();
    await I.setCookie(idamCookies);
    await I.amOnPage(config.url.manageCase);
  }

  async acceptCookies() {
    await I.click(buttons.acceptCookies);
    await I.click(buttons.hideMessage);
  }

  // Decides which IDAM sign-in flow to drive during the HMCTS Access migration:
  //  - config.hmctsAccessMigration === true  -> force HMCTS Access modern two-step
  //  - config.hmctsAccessMigration === false -> force legacy IDAM Web Public single-page
  //  - unset -> auto-detect from the page (two-step when no password field is on the email
  //    page). This makes the flow driveable by the hmcts-access-migration toggle
  //    (via the HMCTS_ACCESS_MIGRATION env) while staying safe by default.
  async #useTwoStepFlow() {
    if (config.hmctsAccessMigration === true) {
      return true;
    }
    if (config.hmctsAccessMigration === false) {
      return false;
    }
    const passwordOnSamePage = await I.grabNumberOfVisibleElements(fields.password);
    return !passwordOnSamePage;
  }

  // Enters credentials against whichever IDAM sign-in UI is being served during the HMCTS
  // Access migration:
  //  - HMCTS Access (modern): two-step - email first, then password on a separate page.
  //  - IDAM Web Public (legacy/classic): both fields on a single page.
  async #enterCredentials(email, password) {
    await I.waitForContent('Email address', config.WaitForText);
    await I.waitForVisible(fields.username);
    await I.fillField(fields.username, email);

    if (await this.#useTwoStepFlow()) {
      // Modern two-step flow: submit the email step and wait for the password page.
      await I.clickWithRetry(buttons.submit, 2);
      await I.waitForVisible(fields.password);
    }

    await I.fillField(fields.password, password);
    await I.waitForVisible(buttons.submit);
    await I.clickWithRetry(buttons.submit, 2);
  }

  async #login(email, password, endpoint, attempts = 0) {
    const MAX_ATTEMPTS = 2;
    await this.#enterCredentials(email, password);
    await I.wait(3);

    const url = await I.grabCurrentUrl();

    if(!url.includes(endpoint)) {
      if (attempts >= MAX_ATTEMPTS) {
        throw new Error(`Login failed after ${MAX_ATTEMPTS} attempts`);
      }
      if (!await I.handleKnownErrorsAndGoBack()) {
        return;
      }
      await this.#login(email, password, endpoint, attempts + 1);
    }
    await I.seeInCurrentUrl(endpoint);
  }

  async citizenLogin(email, password) {
    await this.#login(email, password, '/dashboard');
  }

  // Negative path: enters credentials (via the same dual-UI flow) that are expected to
  // fail. Asserts the user is NOT redirected back to the service and remains on the IDAM
  // sign-in screen. The password field stays visible on the error page for both the HMCTS
  // Access (password step) and legacy (single page) UIs.
  async citizenLoginExpectingFailure(email, password) {
    await this.openCitizenLogin();
    await this.#enterCredentials(email, password);
    await I.wait(2);
    await I.dontSeeInCurrentUrl('/dashboard');
    await I.waitForVisible(fields.password);
  }

  async ocmcLogin(email, password) {
    await this.#login(email, password, '/eligibility');
  }

  async caseworkerLogin(email, password) {
    const exuiCookies = await generateExuiCookies({email, password});
    await I.setCookie(exuiCookies);
    await this.#login(email, password, '/work/my-work/list');
  }
}

module.exports = new LoginPage();
