const config = require('../../config');

const ResponseSteps  =  require('../features/response/steps/lipDefendantResponseSteps');
const LoginSteps =  require('../features/home/steps/login');

const iHaveAlreadyAgreedMoretime = 'iHaveAlreadyAgreedMoretime';
const yesIWantMoretime = 'yesIWantMoretime';
const dontWantMoreTime = 'dontWantMoreTime';
const admitAll = 'full-admission';
const partAdmit = 'partial-admission';
const rejectAll = 'rejectAll';
const bySetDate = 'bySetDate';

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

Scenario('Respond To Claim in english or welsh screen @nightly @test', async () => {
  await ResponseSteps.RespondToClaimError(claimRef);
});

Scenario('Personal detail error screen @nightly @test', async () => {
  await ResponseSteps.RespondToClaim(claimRef);
  await ResponseSteps.EnterPersonalDetailsError(claimRef);
});

Scenario('View your options before response deadline error screen @nightly @test', async () => {
  await ResponseSteps.RespondToClaim(claimRef);
  await ResponseSteps.EnterPersonalDetails(claimRef);
  await ResponseSteps.EnterYourOptionsForDeadlineError(claimRef, iHaveAlreadyAgreedMoretime);
  await ResponseSteps.EnterYourOptionsForDeadlineError(claimRef, yesIWantMoretime);
});

Scenario('Choose a response screens @nightly @test', async () => {
  await ResponseSteps.EnterResponseToClaimError(claimRef, partAdmit);
  await ResponseSteps.EnterResponseToClaimError(claimRef, rejectAll);
});

Scenario('How much money do you admit you owe? screen @nightly @test', async () => {
  await ResponseSteps.RespondToClaim(claimRef);
  await ResponseSteps.EnterPersonalDetails(claimRef);
  await ResponseSteps.EnterYourOptionsForDeadline(claimRef, dontWantMoreTime);
  await ResponseSteps.EnterResponseToClaim(claimRef, partAdmit);
  await ResponseSteps.SelectPartAdmitAlreadyPaid('no');
  await ResponseSteps.EnterHowMuchMoneyYouOweError(claimRef, partAdmit);
});

Scenario('Why do you disagree with the amount claimed? screen @nightly @test', async () => {
  await ResponseSteps.RespondToClaim(claimRef);
  await ResponseSteps.EnterPersonalDetails(claimRef);
  await ResponseSteps.EnterYourOptionsForDeadline(claimRef, dontWantMoreTime);
  await ResponseSteps.EnterResponseToClaim(claimRef, partAdmit);
  await ResponseSteps.SelectPartAdmitAlreadyPaid('no');
  await ResponseSteps.EnterWhyYouDisagreeTheClaimAmountError(claimRef, partAdmit);
});

Scenario('Decide how you\'ll pay @nightly @test', async () => {
  await ResponseSteps.EnterPaymentOptionError(claimRef, admitAll, bySetDate);
});

//todo:financial screens
Scenario('Share your financial details screens @nightly ', async () => {
});

Scenario('Your repayment plan @nightly @test', async () => {
  await ResponseSteps.EnterRepaymentPlanError(claimRef);
});

Scenario('Tell us how much you\'ve paid @nightly @test', async () => {
  await ResponseSteps.RespondToClaim(claimRef);
  await ResponseSteps.EnterPersonalDetails(claimRef);
  await ResponseSteps.EnterYourOptionsForDeadline(claimRef, dontWantMoreTime);
  await ResponseSteps.EnterResponseToClaim(claimRef, rejectAll);
  await ResponseSteps.SelectOptionInRejectAllClaim('alreadyPaid');
  await ResponseSteps.EnterHowMuchYouHavePaidError(claimRef, 500, rejectAll);
  await ResponseSteps.EnterResponseToClaim(claimRef, partAdmit);
  await ResponseSteps.SelectPartAdmitAlreadyPaid('yes');
  await ResponseSteps.EnterHowMuchYouHavePaidError(claimRef, 500, partAdmit);
});
