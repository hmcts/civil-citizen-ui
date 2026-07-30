const I = actor();
const config = require('../../../../config');
const cuiCookies = require('../../../specClaimHelpers/fixtures/cookies/cuiCookies');
const cmcCookies = require('../../../specClaimHelpers/fixtures/cookies/cmcCookies');
const idamCookies = require('../../../specClaimHelpers/fixtures/cookies/idamCookies');
const generateExuiCookies = require('../../../specClaimHelpers/fixtures/cookies/exuiCookies');

const fields = {
  username: 'input[id="username"]',
  email: 'input[id="email"], input[name="email"]', // new HMCTS Access
  password: 'input[id="password"], input[name="password"]',
};

const buttons = {
  submit: '#login-submit-btn, button[type="submit"], input[type="submit"], input.button',

  hmctsSignIn: 'a[href="/enter-email"]',
  continue: 'button.govuk-button[type="submit"]',

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

  async #loginUsingHmctsAccess(email, password) {
    // LaunchDarkly flag: hmcts-access-migration-enabled
    // When enabled, HMCTS Access displays the new sign-in journey.

    const signInLinkVisible =
      await I.grabNumberOfVisibleElements(buttons.hmctsSignIn);

    // First screen: "Sign in or create an account"
    if (signInLinkVisible > 0) {
      await I.click(buttons.hmctsSignIn);
    }

    // Second screen: enter email address
    await I.waitForContent(
      'Enter your email address',
      config.WaitForText,
    );

    await I.waitForVisible(
      fields.email,
      config.WaitForText,
    );

    await I.fillField(fields.email, email);

    await I.waitForClickable(
      buttons.continue,
      config.WaitForText,
    );

    await I.click(buttons.continue);

    // Third screen: enter password
    await I.waitForContent(
      'Enter your password',
      config.WaitForText,
    );

    await I.waitForVisible(
      fields.password,
      config.WaitForText,
    );

    await I.fillField(fields.password, password);

    await I.waitForClickable(
      buttons.continue,
      config.WaitForText,
    );

    await I.click(buttons.continue);
  }

  async #login(email, password, endpoint, attempts = 0) {
    const MAX_ATTEMPTS = 2;

    const currentUrl = await I.grabCurrentUrl();

    /*
     * LaunchDarkly flag:
     * hmcts-access-migration-enabled
     *
     * Toggle ON:
     * HMCTS Access displays the new sign-in journey.
     *
     * Toggle OFF:
     * Legacy IDAM displays the existing email and password form.
     *
     * LaunchDarkly controls which UI is displayed.
     * The automation detects the UI and selects the correct login flow.
     */
    const isHmctsAccessMigrationEnabled =
      currentUrl.includes('/sign-in-or-create') ||
      currentUrl.includes('/enter-email') ||
      await I.grabNumberOfVisibleElements(buttons.hmctsSignIn) > 0 ||
      await I.grabNumberOfVisibleElements(fields.email) > 0;

    if (isHmctsAccessMigrationEnabled) {
      console.log(
        'hmcts-access-migration-enabled: ON - using HMCTS Access login',
      );

      await this.#loginUsingHmctsAccess(email, password);
    } else {
      console.log(
        'hmcts-access-migration-enabled: OFF - using legacy IDAM login',
      );

      // Existing legacy IDAM flow remains unchanged
      await I.waitForContent(
        'Email address',
        config.WaitForText,
      );

      await I.waitForVisible(fields.username);
      await I.fillField(fields.username, email);
      await I.fillField(fields.password, password);
      await I.waitForVisible(buttons.submit);
      await I.clickWithRetry(buttons.submit, 2);
    }

    await I.wait(3);

    const url = await I.grabCurrentUrl();

    if (!url.includes(endpoint)) {
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
