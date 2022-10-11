import { DashboardPage } from '../pages/dashboard';

const I= actor();
const dashboardPage = new DashboardPage();

export class DashboardSteps {

  DashboardPage () {
    dashboardPage.verifyDashboardPageContent();
  }
}
