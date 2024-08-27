const config = require('../../../config');
const Response = require('../../response/steps/response');
const {responseType, paymentType, rejectOfClaimType} = require('../../commons/responseVariables');

Feature('Response journey').tag('@e2e');

Scenario('Response defendant with admit all of the claim', () => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    const claimId = '1645882162449408';
    Response.start(claimId);
    Response.confirmYourDetails(claimId);
    Response.chooseResponseAdmitAllOfTheClaim(responseType.I_ADMIT_ALL_OF_THE_CLAIM);
    Response.decideHowYouWillPay(paymentType.IMMEDIATELY);
    Response.checkAndSubmitYourResponse(false);
  }
});

Scenario('Response defendant with reject all and already paid', () => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    const claimId = '1645882162449418';
    Response.start(claimId);
    Response.confirmYourDetails(claimId);
    Response.chooseResponseRejectAllOfClaim(rejectOfClaimType.I_HAVE_PAID_WHAT_I_BELIEVE_I_OWE);
    Response.tellUsHowMuchYouHavePaid();
    Response.freeTelephoneMediation();
    Response.giveUsDetailsInCaseThereIsAHearing();
    Response.checkAndSubmitYourResponse(true);
  }
});

Scenario('Response defendant with reject all and dispute all of the claim', () => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    const claimId = '1645882162449428';
    Response.start(claimId);
    Response.confirmYourDetails(claimId);
    Response.chooseResponseRejectAllOfClaim(rejectOfClaimType.I_DISPUTE_ALL_OF_THE_CLAIM);
    Response.tellUsWhyYouDisagreeWithTheClaim();
    Response.freeTelephoneMediation();
    Response.giveUsDetailsInCaseThereIsAHearing();
    Response.checkAndSubmitYourResponse(true);
  }
});
