
const LoginPage = require('../../../commonFeatures/home/pages/login')
const I= actor();

class LoginSteps  {

  async AcceptCookies() {
    await LoginPage.acceptCookies();
  }

  async EnterCitizenCredentials(username, password) {
    await I.wait(10);
    await LoginPage.openCitizenLogin();
    //await this.AcceptCookies(); -- skip as it is flaky
    await LoginPage.citizenLogin(username, password);
  }

  async EnterCaseworkerCredentials(username, password) {
    await I.wait(10);
    await LoginPage.openManageCase();
    //await this.AcceptCookies(); -- skip as it is flaky
    await LoginPage.caseWorkerLogin(username, password);
  }
}

module.exports =  new LoginSteps();
