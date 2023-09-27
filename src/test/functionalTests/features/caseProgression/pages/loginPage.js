const I = actor();



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

module.exports = LatestUpdate;
