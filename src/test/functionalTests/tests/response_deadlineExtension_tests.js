const config = require('../../config');

const ResponseSteps  =  require('../features/response/steps/lipDefendantResponseSteps');
const LoginSteps =  require('../features/home/steps/login');

const admitAll = 'full-admission';
const immediatePayment = 'immediate';
const bySetDate = 'bySetDate';
const repaymentPlan = 'repaymentPlan';
const dontWantMoreTime = 'dontWantMoreTime';
const iHaveAlreadyAgreedMoretime = 'iHaveAlreadyAgreedMoretime';

let claimRef;

Feature('Extended Response Time');

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


Scenario('No response submitted, date agreed upon request time  @citizenUI @admitAll @test', () => {
  ResponseSteps.RespondToClaim(claimRef);
  ResponseSteps.EnterYourOptionsForDeadline(claimRef, iHaveAlreadyAgreedMoretime);
  ResponseSteps.DefendantSummaryPage(claimRef);
});
