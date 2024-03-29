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
  async open() {
    await I.amOnPage('/');
  }

  async acceptCookies() {
    await I.click(buttons.acceptCookies);
    await I.click(buttons.hideMessage);
  }

  async login(email, password) {
    await I.waitForContent('Email address', config.WaitForText);
    await I.waitForVisible(fields.username);
    await I.fillField(fields.username, email);
    await I.fillField(fields.password, password);
    await I.click(buttons.hmctsSignIn);
    await I.wait(3);
    await I.seeInCurrentUrl('/dashboard');
  }
}

module.exports = new LoginPage();
