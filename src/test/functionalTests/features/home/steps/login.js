
const LoginPage = require('../pages/login');

const loginPage = new LoginPage();

module.exports.LoginSteps = {

  AcceptCookies() {
    loginPage.acceptCookies();
  },

  EnterUserCredentials (username, password) {    
    loginPage.open();
    this.AcceptCookies();
    loginPage.login(username, password);
  },
};
