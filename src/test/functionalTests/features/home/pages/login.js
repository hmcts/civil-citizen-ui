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
  open() {
    I.amOnPage('/');
  }

  acceptCookies() {
    I.click(buttons.acceptCookies);
    I.click(buttons.hideMessage);
  }

  login(email, password) {
    I.waitForText('Email address', config.WaitForText);
    I.waitForVisible(fields.username);
    I.fillField(fields.username, email);
    I.fillField(fields.password, password);
    I.click(buttons.submit);
    I.seeInCurrentUrl('/dashboard');
  }
}

module.exports = new LoginPage();
