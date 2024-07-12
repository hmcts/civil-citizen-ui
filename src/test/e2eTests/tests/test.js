const config = require('../../config');
const LoginSteps = require('../createClaim/steps/createLipvLipClaimSteps');
Feature('Create Lip v Lip claim - Individual vs Individual @claimCreation').tag('@e2e');

Scenario('Create Claim -  Individual vs Individual - small claims - with standard interest - no hwf', async () => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    LoginSteps.createClaimDraftViaTestingSupportE2e();
  }
});
