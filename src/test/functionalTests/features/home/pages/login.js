const I = actor();
const config = require('../../../../config');

const fields = {
  username: 'input[id="username"]',
  password: 'input[id="password"]',
};

const buttons = {
  submit: 'input.button',
  hmctsSignIn: 'input[type="submit"]',
  acceptCookies: 'button[id="cookie-accept-submit"]',
  hideMessage: 'button[name="hide-accepted"]',
};

class LoginPage {
  async open() {
    await I.amOnPage('/');
  }

  async openOCMC() {
    await I.amOnPage('https://moneyclaims.aat.platform.hmcts.net');
  }

  async acceptCookies() {
    await I.click(buttons.acceptCookies);
    await I.click(buttons.hideMessage);
  }

  async login(email, password) {
    await I.waitForText('Email address', config.WaitForText);
    await I.waitForVisible(fields.username);
    await I.fillField(fields.username, email);
    await I.fillField(fields.password, password);
    await I.click(buttons.submit);
    await I.seeInCurrentUrl('/dashboard')
  }

  async loginOCMC(email, password) {
    await I.waitForText('Email address', config.WaitForText);
    await I.waitForVisible(fields.username);
    await I.fillField(fields.username, email);
    await I.fillField(fields.password, password);
    await I.click(buttons.submit);
  }
}

module.exports = new LoginPage();
