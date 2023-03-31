const config =  require('../../config');
const  ResponseSteps  =  require('../features/response/steps/lipDefendantResponseSteps');
const  LoginSteps =  require('../features/home/steps/login');

const partAdmit = 'partAdmit';
const rejectAll = 'rejectAll';
const immediatePayment = 'immediate';
const bySetDate = 'bySetDate';
const repaymentPlan = 'repaymentPlan';

let claimRef;

Feature('Response with RejectAll');

Before(async ({api}) => {
  claimRef = await api.createSpecifiedClaim(config.applicantSolicitorUser);
  LoginSteps.EnterUserCredentials(config.Username, config.Password);
});

Scenario('Response with RejectAll and Immediate payment @citizenUI @rejectAll', () => {
  ResponseSteps.EnterPersonalDetails(claimRef);
  ResponseSteps.EnterResponseToClaim(claimRef, rejectAll);
  ResponseSteps.SelectOptionInRejectAllClaim('alreadyPaid');
  ResponseSteps.EnterPaymentOption(claimRef, immediatePayment);
  ResponseSteps.CheckAndSubmit(claimRef);
});

Scenario('Response with RejectAll and Date to PayOn @citizenUI @rejectAll', () => {
  ResponseSteps.EnterPersonalDetails(claimRef);
  ResponseSteps.EnterResponseToClaim(claimRef, partAdmit);
  ResponseSteps.SelectOptionInRejectAllClaim('alreadyPaid');
  ResponseSteps.EnterPaymentOption(claimRef, bySetDate);
  ResponseSteps.EnterDateToPayOn();
  ResponseSteps.EnterFinancialDetails(claimRef);
  ResponseSteps.CheckAndSubmit(claimRef);
});

Scenario('Response with RejectAll and Repayment plan @citizenUI @rejectAll', () => {
  ResponseSteps.EnterPersonalDetails(claimRef);
  ResponseSteps.EnterResponseToClaim(claimRef, partAdmit);
  ResponseSteps.SelectOptionInRejectAllClaim('alreadyPaid');
  ResponseSteps.EnterPaymentOption(claimRef, repaymentPlan);
  ResponseSteps.EnterFinancialDetails(claimRef);
  ResponseSteps.EnterRepaymentPlan(claimRef);
  ResponseSteps.CheckAndSubmit(claimRef);
});
