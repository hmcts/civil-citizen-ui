
import I = CodeceptJS.I
import { DashboardSteps } from '../features/dashboard/steps/dashboard';
import { LoginSteps} from '../features/home/steps/login';
import {config} from '../../config';

const dashboardSteps: DashboardSteps = new DashboardSteps();
const loginSteps: LoginSteps = new LoginSteps();

Feature('Verify Dashboard page');

Before(() => {
  if(config.env == 'demo'){
    loginSteps.EnterHmctsCredentails(config.hmctsUsername, config.hmctsPassword);
  }
  loginSteps.EnterUserCredentials(config.username, config.password);
});

Scenario('Verify the content in the Dashboard page @citizenUI', () => {
  dashboardSteps.DashboardPage();
});

