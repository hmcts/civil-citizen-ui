
const LoginPage = require('../pages/login');
const I= actor();

class LoginSteps  {

  AcceptCookies() {
    LoginPage.acceptCookies();
  }

  EnterUserCredentials(username, password) {
    I.wait(10);
    LoginPage.open();
    this.AcceptCookies();
    LoginPage.login(username, password);
  }
}

module.exports =  new LoginSteps();
