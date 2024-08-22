const config = require('../../../../config');
const Response = require('../../../response/steps/response');
const {responseType, paymentType} = require('../../../commons/responseVariables');

Feature('Response journey defendant Full admit').tag('@leo');

Scenario('Pay immediately', () => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    const claimId = '1645882162449408';
    Response.start(claimId);
    //Response.confirmYourDetails(claimId);
    //Response.chooseResponseAdmitAllOfTheClaim(responseType.I_ADMIT_ALL_OF_THE_CLAIM);
    //Response.decideHowYouWillPay(paymentType.IMMEDIATELY);
    Response.checkAndSubmitYourResponse(false);
  }
});

