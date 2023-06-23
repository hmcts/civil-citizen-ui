const config = require('../../config');

const ResponseSteps  =  require('../features/response/steps/lipDefendantResponseSteps');
const LoginSteps =  require('../features/home/steps/login');

const admitAll = 'full-admission';
const immediatePayment = 'immediate';
const bySetDate = 'bySetDate';
const repaymentPlan = 'repaymentPlan';
const dontWantMoreTime = 'dontWantMoreTime';

let claimRef;

Feature('Response with AdmitAll @regression');

Before(async ({api}) => {
  claimRef = await api.createSpecifiedClaim(config.applicantSolicitorUser);
  console.log('claimRef has been created Successfully    <===>  '  , claimRef);
  if (claimRef) {
    await LoginSteps.EnterUserCredentials(config.Username, config.Password);
  } else {
    console.log('claimRef has not been Created');
  }
});

Scenario('Response with AdmitAll and Immediate payment @citizenUI @admitAll @regression', async ({api}) => {
  await ResponseSteps.RespondToClaim(claimRef);
  await ResponseSteps.EnterPersonalDetails(claimRef);
  await ResponseSteps.EnterYourOptionsForDeadline(claimRef, dontWantMoreTime);
  await ResponseSteps.EnterResponseToClaim(claimRef, admitAll);
  await ResponseSteps.EnterPaymentOption(claimRef, admitAll, immediatePayment);
  await ResponseSteps.CheckAndSubmit(claimRef, admitAll);
  await api.enterBreathingSpace(config.applicantSolicitorUser);
  await api.liftBreathingSpace(config.applicantSolicitorUser);
});

Scenario('Response with AdmitAll and Date to PayOn @citizenUI @admitAll @regression', async ({api}) => {
  await ResponseSteps.RespondToClaim(claimRef);
  await ResponseSteps.EnterPersonalDetails(claimRef);
  await ResponseSteps.EnterYourOptionsForDeadline(claimRef, dontWantMoreTime);
  await ResponseSteps.EnterResponseToClaim(claimRef, admitAll);
  await ResponseSteps.EnterPaymentOption(claimRef, admitAll, bySetDate);
  await ResponseSteps.EnterDateToPayOn();
  await ResponseSteps.EnterFinancialDetails(claimRef);
  await ResponseSteps.CheckAndSubmit(claimRef, admitAll);
  await api.enterBreathingSpace(config.applicantSolicitorUser);
  await api.liftBreathingSpace(config.applicantSolicitorUser);
  await api.viewAndRespondToDefence(config.applicantSolicitorUser, 'ADMIT_ALL_PAY_BY_SET_DATE');
});

Scenario('Response with AdmitAll and Repayment plan @citizenUI @admitAll @regression', async ({api}) => {
  await ResponseSteps.RespondToClaim(claimRef);
  await ResponseSteps.EnterPersonalDetails(claimRef);
  await ResponseSteps.EnterYourOptionsForDeadline(claimRef, dontWantMoreTime);
  await ResponseSteps.EnterResponseToClaim(claimRef, admitAll);
  await ResponseSteps.EnterPaymentOption(claimRef, admitAll, repaymentPlan);
  await ResponseSteps.EnterFinancialDetails(claimRef);
  await ResponseSteps.EnterRepaymentPlan(claimRef);
  await ResponseSteps.CheckAndSubmit(claimRef, admitAll);
  await api.enterBreathingSpace(config.applicantSolicitorUser);
  await api.liftBreathingSpace(config.applicantSolicitorUser);
  await api.viewAndRespondToDefence(config.applicantSolicitorUser, 'ADMIT_ALL_PAY_BY_INSTALLMENTS');
});

