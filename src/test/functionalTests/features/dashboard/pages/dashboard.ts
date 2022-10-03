import I = CodeceptJS.I

const I: I = actor();

const fields = {
  accounts1: 'span[Contact us for help]',
  accounts2: 'accounts[1][typeOfAccount]',
  accounts3: 'accounts[2][typeOfAccount]',
  jointAccount1: 'accounts[0][joint]',
  jointAccount2: 'accounts[1][joint]',
  jointAccount3: 'accounts[2][joint]',
  account1Balance: 'input[id="accounts[0][balance]"]',
  account2Balance: 'input[id="accounts[1][balance]"]',
  account3Balance: 'input[id="accounts[2][balance]"]',
};

export class DashboardPage {
  open (): void {
    I.amOnPage('/dashboard');
  }
  verifyDashboardPageContent (): void {
    I.see('Your money claims account');
    I.see('Claims you\'ve made');
    I.see('To view or progress your claim click on your claim number. Most recently created claims are listed first.');
    I.see('Claim number');
    I.see('Defendant name');
    I.see('Claim amount');
    I.see('Next steps');
    I.see('Deadline');
    I.see('Actions');
    I.see('Claims made against you');
    I.see('To view or progress your claim click on your claim number. Most recently created claims are listed first.');
    I.see('Claim number');
    I.see('Claimant name');
    I.see('Claim amount');
    I.see('Status');
    I.see('Contact us for help');
  }
}
