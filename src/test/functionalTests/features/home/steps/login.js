
const LoginPage = require('../pages/login');
const I= actor();

class LoginSteps  {

  async AcceptCookies() {
    await LoginPage.acceptCookies();
  }

  async EnterUserCredentials(username, password) {
    await I.wait(10);
    await LoginPage.open();
    //await this.AcceptCookies(); -- skip as it is flaky
    await LoginPage.login(username, password);
  }

  async EnterUserCredentialsOCMC(username, password) {
    await I.wait(10);
    await LoginPage.openOCMC();
    //await this.AcceptCookies(); -- skip as it is flaky
    await LoginPage.loginOCMC(username, password);
  }
}

module.exports =  new LoginSteps();
