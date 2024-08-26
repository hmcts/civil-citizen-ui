const config = require('../../../../config');
const Response = require('../../../response/steps/response');
const {responseType, paymentType} = require('../../../commons/responseVariables');

Feature('Response journey defendant Full admit').tag('@e2e');

Scenario('Pay immediately', () => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    const claimId = '1645882162449408';
    Response.start(claimId);
    Response.confirmYourDetails(claimId);
    Response.chooseResponseAdmitAllOfTheClaim(responseType.I_ADMIT_ALL_OF_THE_CLAIM);
    Response.decideHowYouWillPay(paymentType.IMMEDIATELY);
    Response.checkAndSubmitYourResponse(false);
  }
});

Scenario('By a set date', () => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    const claimId = '1645882162449418';
    Response.start(claimId);
    Response.confirmYourDetails(claimId);
    Response.chooseResponseAdmitAllOfTheClaim(responseType.I_ADMIT_ALL_OF_THE_CLAIM);
    Response.decideHowYouWillPay(paymentType.BY_A_SET_DATE);
    Response.shareYourFinancialDetails();
    Response.checkAndSubmitYourResponse(false);
  }
});

Scenario(' by installments', () => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    const claimId = '1645882162449428';
    Response.start(claimId);
    Response.confirmYourDetails(claimId);
    Response.chooseResponseAdmitAllOfTheClaim(responseType.I_ADMIT_ALL_OF_THE_CLAIM);
    Response.decideHowYouWillPay(paymentType.I_WILL_SUGGEST_A_REPAYMENT_PLAN);
    Response.shareYourFinancialDetails();
    Response.yourRepaymentPlan(false);
    Response.checkAndSubmitYourResponse(false);
  }
});

