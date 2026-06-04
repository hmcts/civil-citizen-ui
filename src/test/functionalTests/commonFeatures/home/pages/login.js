const I = actor();
const config = require('../../../../config');
const cuiCookies = require('../../../specClaimHelpers/fixtures/cookies/cuiCookies');
const cmcCookies = require('../../../specClaimHelpers/fixtures/cookies/cmcCookies');
const idamCookies = require('../../../specClaimHelpers/fixtures/cookies/idamCookies');
const generateExuiCookies = require('../../../specClaimHelpers/fixtures/cookies/exuiCookies');

// Dual-UI-safe IDAM selectors. During the IDAM Web Public -> HMCTS Access
// migration both sign-in UIs may be served, so each chain lists the new
// HMCTS Access hooks (data-testid / name) first and falls back to the legacy
// IDAM Web Public ids/types. Mirrors hmcts/playwright-common idam.po.ts.
const fields = {
  username: '[data-testid="idam-username-input"], input[id="username"], input[name="username"], input[type="email"]',
  password: '[data-testid="idam-password-input"], input[id="password"], input[name="password"], input[type="password"]',
};

const buttons = {
  submit: '[data-testid="idam-submit-button"], #login-submit-btn, [name="save"], button[type="submit"], input[type="submit"], input.button',
  hmctsSignIn: 'Sign in',
  acceptCookies: 'button[id="cookie-accept-submit"]',
  hideMessage: 'button[name="hide-accepted"]',
};

class LoginPage {
  async openCitizenLogin() {
    const isPlaywrightActive = await I.isPlaywright();
    console.log('Is Playwright active?', isPlaywrightActive);

    if (isPlaywrightActive) {
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

  async #login(email, password, endpoint, attempts = 0) {
    const MAX_ATTEMPTS = 2;
    // Wait for the sign-in form itself rather than page copy: legacy IDAM Web
    // Public shows "Email address" while the new HMCTS Access page shows
    // "Sign in or create an account". Waiting on the username field is
    // UI-agnostic and avoids a hang on either UI during migration.
    await I.waitForVisible(fields.username, config.WaitForText);
    await I.fillField(fields.username, email);
    await I.fillField(fields.password, password);
    await I.waitForVisible(buttons.submit);
    await I.click(buttons.submit);
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
