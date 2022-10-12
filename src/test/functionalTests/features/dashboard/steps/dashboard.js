const DashboardPage = require('../pages/dashboard');

//const dashboardPage =  new DashboardPage();

class DashboardSteps {

  DashboardPage () {
    DashboardPage.verifyDashboardPageContent();
  }
}

module.exports = new DashboardSteps();
