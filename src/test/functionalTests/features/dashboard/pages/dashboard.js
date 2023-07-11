const I = actor();

class DashboardPage {
  async open () {
    await I.amOnPage('/dashboard');
  }

  async verifyClaimNumberOnDashboard(claimNumber){
    await I.waitForText('Claims made against you');
    await I.see(claimNumber);
  }

  async verifyDashboardPageContent () {
    await I.waitForText('Your money claims account');
    await I.see('Claims made against you');
    await I.see('To view or progress your claim click on your claim number. Most recently created claims are listed first.');
    await I.see('Claim number');
    await I.see('Claimant name');
    await I.see('Claim amount');
    await I.see('Status');
    await I.see('Contact us for help');
  }
}

module.exports = new DashboardPage();
