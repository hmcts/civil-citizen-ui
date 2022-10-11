
import { LoginPage } from '../pages/login';

const loginPage = new LoginPage();

export class LoginSteps {

  AcceptCookies() {
    loginPage.acceptCookies();
  }

  EnterUserCredentials (username, password) {    
    loginPage.open();
    this.AcceptCookies();
    loginPage.login(username, password);
  }
}
