
const LoginPage = require('../pages/login');

class LoginSteps  {

  AcceptCookies() {
    LoginPage.acceptCookies();
  }

  EnterUserCredentials(username, password) {    
    LoginPage.open();
    this.AcceptCookies();
    LoginPage.login(username, password);
  }
}

module.exports =  new LoginSteps();
