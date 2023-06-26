const DashboardPage = require('../pages/dashboard');

//const dashboardPage =  new DashboardPage();

class DashboardSteps {

  async DashboardPage () {
    await DashboardPage.verifyDashboardPageContent();
  }
}

module.exports = new DashboardSteps();
