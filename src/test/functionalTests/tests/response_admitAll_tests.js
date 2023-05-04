const config = require('../../config');

const ResponseSteps  =  require('../features/response/steps/lipDefendantResponseSteps');
const LoginSteps =  require('../features/home/steps/login');

const admitAll = 'full-admission';
const immediatePayment = 'immediate';
const bySetDate = 'bySetDate';
const repaymentPlan = 'repaymentPlan';
const dontWantMoreTime = 'dontWantMoreTime';

let claimRef;

Feature('Response with AdmitAll');

Before(async ({api}) => {
  claimRef = await api.createSpecifiedClaim(config.applicantSolicitorUser);
  await api.performCitizenResponse(config.defendantCitizenUser, claimRef);
  console.log('claimRef has been created Successfully    <===>  '  , claimRef);
  if (claimRef) {
    LoginSteps.EnterUserCredentials(config.Username, config.Password);
  } else
  {
    console.log('claimRef has not been Created');
  }
});

Scenario('Response with AdmitAll and Immediate payment @pats @citizenUI @admitAll @regression', () => {
  /*ResponseSteps.RespondToClaim(claimRef);
  ResponseSteps.EnterPersonalDetails(claimRef);
  ResponseSteps.EnterYourOptionsForDeadline(claimRef, dontWantMoreTime);
  ResponseSteps.EnterResponseToClaim(claimRef, admitAll);
  ResponseSteps.EnterPaymentOption(claimRef, admitAll, immediatePayment);
  ResponseSteps.CheckAndSubmit(claimRef, admitAll);*/
});

Scenario('Response with AdmitAll and Date to PayOn @citizenUI @admitAll @regression', () => {
  ResponseSteps.RespondToClaim(claimRef);
  ResponseSteps.EnterPersonalDetails(claimRef);
  ResponseSteps.EnterYourOptionsForDeadline(claimRef, dontWantMoreTime);
  ResponseSteps.EnterResponseToClaim(claimRef, admitAll);
  ResponseSteps.EnterPaymentOption(claimRef, admitAll, bySetDate);
  ResponseSteps.EnterDateToPayOn();
  ResponseSteps.EnterFinancialDetails(claimRef);
  ResponseSteps.CheckAndSubmit(claimRef, admitAll);
});

Scenario('Response with AdmitAll and Repayment plan @citizenUI @admitAll @regression', () => {
  ResponseSteps.RespondToClaim(claimRef);
  ResponseSteps.EnterPersonalDetails(claimRef);
  ResponseSteps.EnterYourOptionsForDeadline(claimRef, dontWantMoreTime);
  ResponseSteps.EnterResponseToClaim(claimRef, admitAll);
  ResponseSteps.EnterPaymentOption(claimRef, admitAll, repaymentPlan);
  ResponseSteps.EnterFinancialDetails(claimRef);
  ResponseSteps.EnterRepaymentPlan(claimRef);
  ResponseSteps.CheckAndSubmit(claimRef, admitAll);
});
