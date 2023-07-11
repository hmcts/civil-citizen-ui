const config = require('../../config');

const ResponseSteps  =  require('../features/response/steps/lipDefendantResponseSteps');
const LoginSteps =  require('../features/home/steps/login');

const iHaveAlreadyAgreedMoretime = 'iHaveAlreadyAgreedMoretime';

let claimRef;
let caseData;
let claimNumber;
let securityCode;
const delay = ms => new Promise(res => setTimeout(res, ms));

Feature('Extended Response Time');

Before(async ({api}) => {
  claimRef = await api.createSpecifiedClaim(config.applicantSolicitorUser);
  console.log('claimRef has been created Successfully    <===>  '  , claimRef);
  caseData = await api.retrieveCaseData(config.adminUser, claimRef);
  claimNumber = caseData.legacyCaseReference;
  securityCode = caseData.respondent1PinToPostLRspec.accessCode;
  await delay(10000);
  await ResponseSteps.AssignCaseToLip(claimNumber, securityCode);
  if (claimRef) {
    await LoginSteps.EnterUserCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  } else {
    console.log('claimRef has not been Created');
  }
});

Scenario('No response submitted, date agreed upon request time  @citizenUI @admitAll @disabled', async () => {
  await ResponseSteps.RespondToClaim(claimRef);
  await ResponseSteps.EnterYourOptionsForDeadline(claimRef, iHaveAlreadyAgreedMoretime);
  await ResponseSteps.DefendantSummaryPage(claimRef);
});
