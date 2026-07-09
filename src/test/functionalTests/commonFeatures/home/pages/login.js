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

  async #login(email, password, endpoint, attempts = 0) {
    const MAX_ATTEMPTS = 2;
    // Wait for the sign-in form itself rather than page copy: legacy IDAM Web
    // Public shows "Email address" while the new HMCTS Access page shows
    // "Sign in or create an account". Waiting on the username field is
    // UI-agnostic and avoids a hang on either UI during migration.
    await I.waitForVisible(fields.username, config.WaitForText);
    await I.fillField(fields.username, email);

    // Detect which sign-in UI is being served and drive it accordingly, so the
    // tests stay green whether the HMCTS Access toggle is on or off (and thus
    // prove online users on either UI are unaffected). Legacy IDAM Web Public
    // ("classic") shows email + password on a single page, so the password
    // field is already present. HMCTS Access ("modern") is a two-step flow:
    // email first, then password on the next page. Mirrors the IDAM team's
    // classic/modern login split.
    const passwordOnSamePage = await I.grabNumberOfVisibleElements(fields.password);
    if (passwordOnSamePage) {
      await this.#classicLogin(password);
    } else {
      await this.#modernLogin(password);
    }
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

  // Legacy IDAM Web Public ("classic"): email and password live on the same
  // page, so just fill the password and submit.
  async #classicLogin(password) {
    await I.fillField(fields.password, password);
    await I.waitForVisible(buttons.submit);
    await I.clickWithRetry(buttons.submit, 2);
  }

  // HMCTS Access ("modern"): two-step flow. Continue past the email step, wait
  // for the password page, then fill the password and submit.
  async #modernLogin(password) {
    await I.waitForVisible(buttons.submit);
    await I.clickWithRetry(buttons.submit, 2);
    await I.waitForVisible(fields.password, config.WaitForText);
    await I.fillField(fields.password, password);
    await I.waitForVisible(buttons.submit);
    await I.clickWithRetry(buttons.submit, 2);
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
