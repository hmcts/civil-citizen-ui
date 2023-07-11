const DashboardSteps = require('../features/dashboard/steps/dashboard');
const LoginSteps = require('../features/home/steps/login');
const config = require('../../config');

Feature('Verify Dashboard page');

Before(async () => {
  await LoginSteps.EnterUserCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
});

Scenario('Verify the content in the Dashboard page @citizenUI', async () => {
  await DashboardSteps.DashboardPage();
});

