const config = require('../../../config');
const ClaimCreation = require('../../createClaim/steps/claimCreation');
const {yesAndNoCheckBoxOptionValue} = require('../../commons/eligibleVariables');
const LoginSteps = require('../../createClaim/steps/createLipvLipClaimSteps');

Feature('Claim creation journey').tag('@e2e');

Scenario('Claim creation journey with interest with fess reference', () => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    //bilingual-language-preference and open task list
    ClaimCreation.start(yesAndNoCheckBoxOptionValue.YES);
    ClaimCreation.considerOtherOptions();
    ClaimCreation.completingYourClaim();
    ClaimCreation.yourDetails();
    ClaimCreation.theirDetails();
    ClaimCreation.claimAmount(true, true);
    ClaimCreation.claimDetails();
  }
});

Scenario('Claim creation journey without interest and without fees reference', () => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    //bilingual-language-preference and open task list
    ClaimCreation.start(yesAndNoCheckBoxOptionValue.YES);
    ClaimCreation.considerOtherOptions();
    ClaimCreation.completingYourClaim();
    ClaimCreation.yourDetails();
    ClaimCreation.theirDetails();
    ClaimCreation.claimAmount(false, true);
    ClaimCreation.claimDetails();
  }
});

Scenario('Claim creation journey - Submission ', () => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    ClaimCreation.checkAndSubmitYourClaim();
  }
});

Scenario('Create Claim - Via Testing Support E2e', async () => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    LoginSteps.createClaimDraftViaTestingSupportE2e();
  }
});
