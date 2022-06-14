import I = CodeceptJS.I
import { DashboardPage } from '../pages/dashboard';

const I: I = actor();
const dashboardPage: DashboardPage = new DashboardPage();

export class DashboardSteps {

  DashboardPage (): void {
    dashboardPage.open();
    dashboardPage.verifyDashboardPageContent();
  }
}
