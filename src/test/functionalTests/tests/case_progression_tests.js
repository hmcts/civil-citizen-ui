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
  console.log('claimRef has been created Successfully    <===>  '  , claimRef);
  if (claimRef) {
    LoginSteps.EnterUserCredentials(config.Username, config.Password);
  } else
  {
    console.log('claimRef has not been Created');
  }
});

Scenario('Response with AdmitAll and Immediate payment @citizenUI @admitAll @regression', () => {
  ResponseSteps.RespondToClaim(claimRef);
}).tag('@regression');
