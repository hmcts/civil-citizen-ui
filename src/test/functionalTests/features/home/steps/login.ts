import I = CodeceptJS.I
import { LoginPage } from '../pages/login';

const I: I = actor();
const loginPage: LoginPage = new LoginPage();

export class LoginSteps {

  EnterHmctsCredentails(username: string, password: string): void {
    loginPage.open();
    loginPage.loginhmcts(username, password);
  }

  EnterUserCredentials (username: string, password: string): void {
    loginPage.open();
    loginPage.login(username, password);
  }
}
