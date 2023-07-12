
const LoginPage = require('../pages/login');
const I= actor();

class LoginSteps  {

  async AcceptCookies() {
    await LoginPage.acceptCookies();
  }

  async EnterUserCredentials(username, password) {
    await LoginPage.open();
    await this.AcceptCookies();
    await LoginPage.login(username, password);
  }

  async EnterUserCredentialsAndVerifyClaimNumber(username, password, claimNumber){
    // eslint-disable-next-line no-undef
    await retryTo(() => {
      LoginPage.open();
      this.AcceptCookies();
      LoginPage.login(username, password);
      I.see(claimNumber);
    }, 3);
  }
}

module.exports =  new LoginSteps();
