const config = require('../../config');
const LoginSteps = require('../commonFeatures/home/steps/login');
const {createAccount, deleteAccount} = require('../specClaimHelpers/api/idamHelper');

Feature('Smoke Test');

Before(async () => {
  await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
});

Scenario('Verify if citizen user able to login to CUI', async () => {
  await LoginSteps.EnterCitizenCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
}).tag('@smoketest');

AfterSuite(async () => {
  await deleteAccount(config.defendantCitizenUser.email);
});
