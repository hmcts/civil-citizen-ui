const I = actor();
const config = require('../../../../config');
const cuiCookies = require('../../../specClaimHelpers/fixtures/cookies/cuiCookies');
const cmcCookies = require('../../../specClaimHelpers/fixtures/cookies/cmcCookies');
const idamCookies = require('../../../specClaimHelpers/fixtures/cookies/idamCookies');
const generateExuiCookies = require('../../../specClaimHelpers/fixtures/cookies/exuiCookies');

const fields = {
  username: 'input[id="username"]',
  password: 'input[id="password"]',
};

const buttons = {
  submit: 'input.button',
  hmctsSignIn: 'Sign in',
  acceptCookies: 'button[id="cookie-accept-submit"]',
  hideMessage: 'button[name="hide-accepted"]',
};

class LoginPage {
  async openCitizenLogin() {
    const isPlaywrightActive = await I.isPlaywright();
    console.log('Is Playwright active?', isPlaywrightActive);

    if (isPlaywrightActive) {
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

  async #login(email, password, endpoint) {
    await I.waitForContent('Email address', config.WaitForText);
    await I.waitForVisible(fields.username);
    await I.fillField(fields.username, email);
    await I.fillField(fields.password, password);
    await I.click(buttons.submit);
    await I.wait(3);
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
