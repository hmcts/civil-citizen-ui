import { DashboardSteps } from '../features/dashboard/steps/dashboard';
import { LoginSteps} from '../features/home/steps/login';
import {config} from '../../config';

const dashboardSteps: DashboardSteps = new DashboardSteps();
const loginSteps: LoginSteps = new LoginSteps();

Feature('Verify Dashboard page');

Before(() => {
  loginSteps.EnterUserCredentials(config.Username, config.Password);
});

Scenario('Verify the content in the Dashboard page @citizenUI @smoketest @test', () => {
  dashboardSteps.DashboardPage();
});

