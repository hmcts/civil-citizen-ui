const config = require('../../../../config');
const PartAdmit = require('../../../response/steps/response');
const {rejectOfClaimType} = require('../../../commons/responseVariables');
const {yesAndNoCheckBoxOptionValue} = require('../../../commons/eligibleVariables');

Feature('Response journey defendant Part Admin').tag('@leo');

Scenario('already paid', () => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    const claimId = '1645882162449418';
    PartAdmit.start(claimId);
    PartAdmit.confirmYourDetails(claimId);
    PartAdmit.chooseResponsePartAdmitOfTheClaim(yesAndNoCheckBoxOptionValue.YES);
    PartAdmit.howMuchYouHavePaid();
    PartAdmit.freeTelephoneMediation();
    PartAdmit.giveUsDetailsInCaseThereIsAHearing();
    PartAdmit.checkAndSubmitYourResponse(true);
  }
});

Scenario('dispute all of the claim', () => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    const claimId = '1645882162449428';
    PartAdmit.start(claimId);
    PartAdmit.confirmYourDetails(claimId);
    PartAdmit.chooseResponseRejectAllOfClaim(rejectOfClaimType.I_DISPUTE_ALL_OF_THE_CLAIM);
    PartAdmit.tellUsWhyYouDisagreeWithTheClaim();
    PartAdmit.freeTelephoneMediation();
    PartAdmit.giveUsDetailsInCaseThereIsAHearing();
    PartAdmit.checkAndSubmitYourResponse(true);
  }
});
