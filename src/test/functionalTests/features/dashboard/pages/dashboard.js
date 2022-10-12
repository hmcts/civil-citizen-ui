const I = actor();

class DashboardPage {
  open () {
    I.amOnPage('/dashboard');
  }
  
  verifyDashboardPageContent () {
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

module.exports = new DashboardPage();
