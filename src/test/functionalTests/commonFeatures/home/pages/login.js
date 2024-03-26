const I = actor();
const config = require('../../../../config');

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
    await I.amOnPage('/');
  }

  async openManageCase() {
    await I.amOnPage(config.url.manageCase);
  }

  async acceptCookies() {
    await I.click(buttons.acceptCookies);
    await I.click(buttons.hideMessage);
  }

  async #login(email, password, endpoint) {
    await I.waitForText('Email address', config.WaitForText);
    await I.waitForVisible(fields.username);
    await I.fillField(fields.username, email);
    await I.fillField(fields.password, password);
    await I.click(buttons.submit);
    await I.seeInCurrentUrl(endpoint);
  }

  async citizenLogin(email, password) {
    await this.#login(email, password, '/dashboard');
  }

  async caseWorkerLogin(email, password) {
    await this.#login(email, password, '/work/my-work/list');
  }
}

module.exports = new LoginPage();
