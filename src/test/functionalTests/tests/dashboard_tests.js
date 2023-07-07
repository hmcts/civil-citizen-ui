const DashboardSteps = require('../features/dashboard/steps/dashboard');
const LoginSteps = require('../features/home/steps/login');
const config = require('../../config');

Feature('Verify Dashboard page');

Before(async () => {
  await LoginSteps.EnterUserCredentials(config.Username, config.Password);
});

Scenario('Verify the content in the Dashboard page @citizenUI', async () => {
  await DashboardSteps.DashboardPage();
});

