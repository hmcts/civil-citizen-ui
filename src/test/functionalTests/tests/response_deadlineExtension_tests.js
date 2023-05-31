const config = require('../../config');

const ResponseSteps  =  require('../features/response/steps/lipDefendantResponseSteps');
const LoginSteps =  require('../features/home/steps/login');

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


Scenario('No response submitted, date agreed upon request time  @citizenUI @admitAll @regression', () => {
  ResponseSteps.RespondToClaim(claimRef);
  ResponseSteps.EnterYourOptionsForDeadline(claimRef, iHaveAlreadyAgreedMoretime);
  ResponseSteps.DefendantSummaryPage(claimRef);
});
