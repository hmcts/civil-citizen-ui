const DashboardSteps = require('../features/dashboard/steps/dashboard');
const LoginSteps = require('../features/home/steps/login');
const config = require('../../config');

const dashboardSteps = new DashboardSteps();
const loginSteps = new LoginSteps();

Feature('Verify Dashboard page');

Before(() => {
  loginSteps.EnterUserCredentials(config.Username, config.Password);
});

Scenario('Verify the content in the Dashboard page @citizenUI @smoketest @test', () => {
  dashboardSteps.DashboardPage();
});

