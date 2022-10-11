const DashboardPage = require('../pages/dashboard');

const dashboardPage = new DashboardPage();

module.exports.DashboardSteps = {

  DashboardPage () {
    dashboardPage.verifyDashboardPageContent();
  },
};
