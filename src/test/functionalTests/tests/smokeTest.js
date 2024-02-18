const config = require('../../config');

const LoginSteps = require('../features/home/steps/login');

Feature('Smoke Test');

Scenario('Verify if citizen user able to login to CUI', async () => {
  await LoginSteps.EnterUserCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
}).tag('@smoketest');
