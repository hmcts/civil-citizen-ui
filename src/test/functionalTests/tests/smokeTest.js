const config = require('../../config');

const LoginSteps = require('../features/home/steps/login');
const {createAccount, deleteAccount} = require('./../specClaimHelpers/api/idamHelper');

Feature('Smoke Test');

Before(async ({api}) => {
  await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
});

Scenario('Verify if citizen user able to login to CUI', async () => {
  await LoginSteps.EnterUserCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
}).tag('@smoketest');

AfterSuite(async () => {
  await deleteAccount(config.defendantCitizenUser.email);
});
