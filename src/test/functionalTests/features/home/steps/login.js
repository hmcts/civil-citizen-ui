
const LoginPage = require('../pages/login');
const I= actor();

class LoginSteps  {

  async AcceptCookies() {
    await LoginPage.acceptCookies();
  }

  async EnterUserCredentials(username, password) {
    await I.wait(10);
    await LoginPage.open();
    await this.AcceptCookies();
    await LoginPage.login(username, password);
  }
}

module.exports =  new LoginSteps();
