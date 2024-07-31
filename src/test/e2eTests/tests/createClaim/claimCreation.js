const config = require('../../../config');
const ClaimCreation = require('../../createClaim/steps/claimCreation');
const {yesAndNoCheckBoxOptionValue} = require('../../commons/eligibleVariables');

Feature('Claim creation journey').tag('@e2e');

Scenario('Claim creation journey with interest with fess reference', async () => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    //bilingual-language-preference and open task list
    ClaimCreation.start(yesAndNoCheckBoxOptionValue.YES);
    ClaimCreation.considerOtherOptions();
    ClaimCreation.completingYourClaim();
    ClaimCreation.yourDetails();
    ClaimCreation.theirDetails();
    ClaimCreation.claimAmount(true, true);
    ClaimCreation.claimDetails();
    ClaimCreation.checkAndSubmitYourClaim();
  }
});

Scenario('Claim creation journey without interest and without fees reference', async () => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    //bilingual-language-preference and open task list
    ClaimCreation.start(yesAndNoCheckBoxOptionValue.YES);
    ClaimCreation.considerOtherOptions();
    ClaimCreation.completingYourClaim();
    ClaimCreation.yourDetails();
    ClaimCreation.theirDetails();
    ClaimCreation.claimAmount(false, true);
    ClaimCreation.claimDetails();
    ClaimCreation.checkAndSubmitYourClaim();
  }
});
