const config = require('../../config');

const ResponseSteps  =  require('../features/response/steps/prepareYourResponseSteps');
const CommonSteps  =  require('../features/response/steps/commonSteps');
const LoginSteps =  require('../features/home/steps/login');

const admitAll = 'admitAll';
const immediatePayment = 'immediate';
const bySetDate = 'bySetDate';
const repaymentPlan = 'repaymentPlan';

let claimRef;

Feature('Response with AdmitAll');

Before(async ({api}) => {
  claimRef = await api.createSpecifiedClaim(config.applicantSolicitorUser);
  console.log('claimRef has been created Successfully    <===>  '  , claimRef);
  LoginSteps.EnterUserCredentials(config.Username, config.Password);
});

Scenario('Response with AdmitAll and Immediate payment @citizenUI @admitAll', () => {
  CommonSteps.EnterPersonalDetails(claimRef);
  ResponseSteps.EnterResponseToClaim(claimRef, admitAll);
  ResponseSteps.EnterPaymentOption(claimRef, immediatePayment);
  ResponseSteps.CheckAndSubmit(claimRef);
});

Scenario('Response with AdmitAll and Date to PayOn @citizenUI @admitAll', () => {
  CommonSteps.EnterPersonalDetails(claimRef);
  ResponseSteps.EnterResponseToClaim(claimRef, admitAll);
  ResponseSteps.EnterPaymentOption(claimRef, bySetDate);
  ResponseSteps.EnterDateToPayOn();
  CommonSteps.EnterFinancialDetails(claimRef);
  ResponseSteps.CheckAndSubmit(claimRef);
});

Scenario('Response with AdmitAll and Repayment plan @citizenUI @admitAll', () => {
  CommonSteps.EnterPersonalDetails(claimRef);
  ResponseSteps.EnterResponseToClaim(claimRef, admitAll);
  ResponseSteps.EnterPaymentOption(claimRef, repaymentPlan);
  CommonSteps.EnterFinancialDetails(claimRef);
  ResponseSteps.EnterRepaymentPlan(claimRef);
  ResponseSteps.CheckAndSubmit(claimRef);
});
