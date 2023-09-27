const config = require('../../config');

const ResponseSteps  =  require('../features/response/steps/lipDefendantResponseSteps');
const LoginSteps =  require('../features/home/steps/login');

const iHaveAlreadyAgreedMoretime = 'iHaveAlreadyAgreedMoretime';
const yesIWantMoretime = 'yesIWantMoretime';
const dontWantMoreTime = 'dontWantMoreTime';
const admitAll = 'full-admission';
const partAdmit = 'partial-admission';
const rejectAll = 'rejectAll';

let claimRef;
let caseData;
let claimNumber;
let securityCode;

Feature('Negative Scenarios for Defendant Response');

Before(async ({api}) => {
  if (['preview', 'demo'  ].includes(config.runningEnv)) {
    claimRef = await api.createSpecifiedClaim(config.applicantSolicitorUser);
    console.log('claimRef has been created Successfully    <===>  '  , claimRef);
    caseData = await api.retrieveCaseData(config.adminUser, claimRef);
    claimNumber = await caseData.legacyCaseReference;
    securityCode = await caseData.respondent1PinToPostLRspec.accessCode;
    console.log('claim number', claimNumber);
    console.log('Security code', securityCode);
    await LoginSteps.EnterUserCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  }else{
    claimRef = await api.createSpecifiedClaimLRvLR(config.applicantSolicitorUser);
    console.log('claimRef has been created Successfully    <===>  '  , claimRef);
    await LoginSteps.EnterUserCredentials(config.defendantLRCitizenUser.email, config.defendantLRCitizenUser.password);
  }
});

Scenario('Respond To Claim in english or welsh screen @nightly', async () => {
  await ResponseSteps.RespondToClaimError(claimRef);
});

Scenario('Personal detail error screen @nightly', async () => {
  await ResponseSteps.RespondToClaim(claimRef);
  await ResponseSteps.EnterPersonalDetailsError(claimRef);
});

Scenario('View your options before response deadline error screen @nightly', async () => {
  await ResponseSteps.RespondToClaim(claimRef);
  await ResponseSteps.EnterPersonalDetails(claimRef);
  await ResponseSteps.EnterYourOptionsForDeadlineError(claimRef, iHaveAlreadyAgreedMoretime);
  await ResponseSteps.EnterYourOptionsForDeadlineError(claimRef, yesIWantMoretime);
});

Scenario('Respond to claim screens @nightly @test', async () => {
  await ResponseSteps.RespondToClaim(claimRef);
  await ResponseSteps.EnterResponseToClaimError(claimRef, partAdmit);
  await ResponseSteps.EnterResponseToClaimError(claimRef, rejectAll);
});
