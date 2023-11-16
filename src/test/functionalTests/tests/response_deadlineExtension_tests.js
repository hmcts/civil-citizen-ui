const config = require('../../config');

const ResponseSteps  =  require('../features/response/steps/lipDefendantResponseSteps');
const LoginSteps =  require('../features/home/steps/login');
const DashboardSteps = require('../features/dashboard/steps/dashboard');

const iHaveAlreadyAgreedMoretime = 'iHaveAlreadyAgreedMoretime';

let claimRef;
let caseData;
let claimNumber;
let securityCode;

Feature('Extended Response Time');

Before(async ({api}) => {
  if (['preview', 'demo'  ].includes(config.runningEnv)) {
    claimRef = await api.createSpecifiedClaim(config.applicantSolicitorUser);
    console.log('Claim has been created Successfully    <===>  ', claimRef);
    caseData = await api.retrieveCaseData(config.adminUser, claimRef);
    claimNumber = await caseData.legacyCaseReference;
    securityCode = await caseData.respondent1PinToPostLRspec.accessCode;
    console.log('claim number', claimNumber);
    console.log('Security code', securityCode);
    await LoginSteps.EnterUserCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
    await DashboardSteps.VerifyClaimOnDashboard(claimNumber);
  }else{
    claimRef = await api.createSpecifiedClaimLRvLR(config.applicantSolicitorUser);
    console.log('Claim has been created Successfully    <===>  ', claimRef);
    await LoginSteps.EnterUserCredentials(config.defendantLRCitizenUser.email, config.defendantLRCitizenUser.password);
  }
});

Scenario('No response submitted, date agreed upon request time  @citizenUI @nightly', async () => {
  await ResponseSteps.RespondToClaim(claimRef);
  await ResponseSteps.EnterYourOptionsForDeadline(claimRef, iHaveAlreadyAgreedMoretime);
  if (['preview', 'demo'  ].includes(config.runningEnv)) {
    await ResponseSteps.DefendantSummaryPage(claimRef);
  }
});
