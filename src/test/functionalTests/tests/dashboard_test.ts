import I = CodeceptJS.I
import { DashboardSteps } from '../features/dashboard/steps/dashboard';

const dashboardSteps: DashboardSteps = new DashboardSteps();

Feature('Verify Dashboard page');

Scenario('Verify the content in the Dashboard page @citizenUI', async (I: I) => {
  dashboardSteps.DashboardPage();
});

