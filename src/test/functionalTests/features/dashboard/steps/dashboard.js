const DashboardPage = require('../pages/dashboard');

//const dashboardPage =  new DashboardPage();

class DashboardSteps {

  async DashboardPage () {
    await DashboardPage.verifyDashboardPageContent();
  }
  async VerifyClaimOnDashboard(claimNumber)  {
    await DashboardPage.verifyClaimNumberOnDashboard(claimNumber);
  }
}

module.exports = new DashboardSteps();
