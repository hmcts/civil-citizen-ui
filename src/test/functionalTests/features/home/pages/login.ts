import I = CodeceptJS.I

const I: I = actor();

const fields = {
  username: 'input[id="username"]',
  password: 'input[id="password"]',
};
const buttons = {
  submit: 'input.button',
  hmctsSignIn: 'input[type="submit"]',
  acceptCookies: 'button[id="cookie-accept-submit"]',
  hideMessage: 'button[name="hide-accepted"]',
};

export class LoginPage {

  open (): void {
    I.amOnPage('/');
  }

  acceptCookies (): void {
    I.click(buttons.acceptCookies);
    I.click(buttons.hideMessage);
  }

  login (email: string | undefined, password: string | undefined): void {
    I.waitForVisible(fields.username);
    I.fillField(fields.username, email);
    I.fillField(fields.password, password);
    I.click(buttons.submit);
    I.seeInCurrentUrl('/dashboard');
  }
}
