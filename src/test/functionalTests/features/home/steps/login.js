
const LoginPage = require('../pages/login');

class LoginSteps  {

  async AcceptCookies() {
    await LoginPage.acceptCookies();
  }

  async EnterUserCredentials(username, password) {
    await LoginPage.open();
    await this.AcceptCookies();
    await LoginPage.login(username, password);
  }
}

module.exports =  new LoginSteps();
