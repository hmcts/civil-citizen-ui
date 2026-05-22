const config = require('../../../../config');
const I = actor();

class CitizenDashboardPage {
  async open() {
    await I.amOnPage('/dashboard');
  }

  async verifyClaimNumberOnDashboard(claimNumber) {
    const maxRetries = 10;
    const retryDelaySeconds = 3;

    for (let tries = 1; tries <= maxRetries; tries++) {
      console.log(`Verifying claim ${claimNumber} on dashboard... attempt ${tries}`);
      const pageSource = await I.grabTextFrom('body');
      if (pageSource.includes('Something went wrong')) {
        console.log(`Dashboard technical error on attempt ${tries}, refreshing...`);
      } else if (pageSource.includes(claimNumber) && pageSource.includes('Claim number')) {
        await I.see('Claimant name');
        await I.see('Claim amount');
        await I.see('Status');
        await I.see(claimNumber);
        return;
      }

      if (tries === maxRetries) {
        throw new Error(
          `Claim ${claimNumber} not found on dashboard after ${maxRetries} attempts. `
          + `Page contained: "${pageSource.slice(0, 500)}"`,
        );
      }

      await I.wait(retryDelaySeconds);
      await I.refreshPage();
    }
  }

  async verifyDashboardPageContent() {
    await I.waitForContent('Your money claims account', config.WaitForText);
    await I.see('Claims made against you');
    await I.see('To view or progress your claim click on your claim number. Most recently created claims are listed first.');
    await I.see('Claim number');
    await I.see('Claimant name');
    await I.see('Claim amount');
    await I.see('Status');
    await I.see('Contact us for help');
  }

  async verifyStatusOnDashboard(status, xpath) {
    if (status) {
      await I.waitForContent('Your money claims account', config.WaitForText);
      await I.see(status, xpath);
    }
  }
}

module.exports = new CitizenDashboardPage();
