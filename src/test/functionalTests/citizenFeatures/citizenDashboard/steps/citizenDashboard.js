const CitizenDashboardPage = require('../pages/citizenDashboard');

//const dashboardPage =  new DashboardPage();

class CitizenCitizenDashboardSteps {

  async CitizenDashboardPage () {
    await CitizenDashboardPage.verifyDashboardPageContent();
  }
  async VerifyClaimOnDashboard(claimNumber)  {
    await CitizenDashboardPage.verifyClaimNumberOnDashboard(claimNumber);
  }
}

module.exports = new CitizenCitizenDashboardSteps();
