const config = require('../../../config');
const Response = require('../../response/steps/response');
const {yesAndNoCheckBoxOptionValue} = require('../../commons/eligibleVariables');

Feature('Response').tag('@e2e');

Scenario('Response journey', async () => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    //bilingual-language-preference and open task list
    Response.start(yesAndNoCheckBoxOptionValue.YES);
    Response.considerOtherOptions();
    Response.completingYourClaim();
    Response.yourDetails();
    Response.theirDetails();
    Response.claimAmount(true, true);
    Response.claimDetails();
    Response.checkAndSubmitYourClaim();
  }
});

Scenario('Consider other options', () => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    //Response.considerOtherOptions();
  }
});
