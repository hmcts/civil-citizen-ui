const config = require('../../../../config');
const RejectAll = require('../../../response/steps/response');
const {rejectOfClaimType} = require('../../../commons/responseVariables');

Feature('Response journey defendant reject all').tag('@e2e');

Scenario('already paid', () => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    const claimId = '1645882162449468';
    RejectAll.start(claimId);
    RejectAll.confirmYourDetails(claimId);
    RejectAll.chooseResponseRejectAllOfClaim(rejectOfClaimType.I_HAVE_PAID_WHAT_I_BELIEVE_I_OWE);
    RejectAll.tellUsHowMuchYouHavePaid();
    RejectAll.freeTelephoneMediation();
    RejectAll.giveUsDetailsInCaseThereIsAHearing();
    RejectAll.checkAndSubmitYourResponse(true);
  }
});

Scenario('dispute all of the claim', () => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    const claimId = '1645882162449478';
    RejectAll.start(claimId);
    RejectAll.confirmYourDetails(claimId);
    RejectAll.chooseResponseRejectAllOfClaim(rejectOfClaimType.I_DISPUTE_ALL_OF_THE_CLAIM);
    RejectAll.tellUsWhyYouDisagreeWithTheClaim();
    RejectAll.freeTelephoneMediation();
    RejectAll.giveUsDetailsInCaseThereIsAHearing();
    RejectAll.checkAndSubmitYourResponse(true);
  }
});
