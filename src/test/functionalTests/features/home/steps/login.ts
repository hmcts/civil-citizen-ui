import I = CodeceptJS.I
import { LoginPage } from '../pages/login';

const I: I = actor();
const loginPage: LoginPage = new LoginPage();

export class LoginSteps {

  AcceptCookies(): void {
    loginPage.acceptCookies();
  }

  EnterUserCredentials (username: string | undefined, password: string | undefined): void {    
    loginPage.open();
    this.AcceptCookies();
    loginPage.login(username, password);
  }
}
