const config = require('../../config');
const LoginSteps = require('../createClaim/steps/createLipvLipClaimSteps');
Feature('Create Claim Via Testing Support E2e @claimCreation').tag('@e2e');

Scenario('Create Claim - Via Testing Support E2e', async () => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    LoginSteps.createClaimDraftViaTestingSupportE2e();
  }
});
