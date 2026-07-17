const LoginPage = require('../../../commonFeatures/home/pages/login');

class LoginSteps {
  async AcceptCookies() {
    await LoginPage.acceptCookies();
  }

  async EnterCitizenCredentials(username, password, manualPIP = false) {
    if (!manualPIP) {
      await LoginPage.openCitizenLogin();
    }
    //await this.AcceptCookies(); -- skip as it is flaky
    await LoginPage.citizenLogin(username, password);
  }

  // Attempts a citizen sign-in with credentials expected to be rejected (e.g. wrong
  // password). Verifies HMCTS Access / legacy shows the error and does not redirect.
  async EnterInvalidCitizenCredentials(username, password) {
    await LoginPage.citizenLoginExpectingFailure(username, password);
  }

  async EnterCitizenCredentialsOCMC(username, password) {
    await LoginPage.openOCMC();
    //await this.AcceptCookies(); -- skip as it is flaky
    await LoginPage.ocmcLogin(username, password);
  }

  async EnterCaseworkerCredentials(username, password) {
    await LoginPage.openManageCase();
    //await this.AcceptCookies(); -- skip as it is flaky
    await LoginPage.caseworkerLogin(username, password);
  }
}

module.exports = new LoginSteps();
