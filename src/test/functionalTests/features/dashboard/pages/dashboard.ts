import I = CodeceptJS.I

const I: I = actor();

export class DashboardPage {

  open (): void {
    I.amOnPage('/dashboard');
  }
  verifyDashboardPageContent (): void {
    I.see('Claims made against you');
  }
}
