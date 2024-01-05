const config = require('../../config');

const ResponseSteps  =  require('../features/response/steps/lipDefendantResponseSteps');
const LoginSteps =  require('../features/home/steps/login');
const {unAssignAllUsers} = require('./../specClaimHelpers/api/caseRoleAssignmentHelper');

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

Scenario('Testing error messages @nightly', async () => {
  //Respond To Claim in english or welsh error screen
  await ResponseSteps.RespondToClaimError(claimRef);
  await ResponseSteps.RespondToClaim(claimRef);
  //Todo:get Personal detail error screen passing
  //await ResponseSteps.EnterPersonalDetailsError(claimRef);
  await ResponseSteps.EnterPersonalDetails(claimRef);
  //View your options before response deadline error screen
  // await ResponseSteps.EnterYourOptionsForDeadlineError(claimRef, iHaveAlreadyAgreedMoretime);
  // await ResponseSteps.EnterYourOptionsForDeadlineError(claimRef, yesIWantMoretime);
  await ResponseSteps.EnterYourOptionsForDeadline(claimRef, dontWantMoreTime);
  //Choose a response error screens
  await ResponseSteps.EnterResponseToClaimError(claimRef, partAdmit);
  await ResponseSteps.EnterResponseToClaimError(claimRef, rejectAll);
  await ResponseSteps.EnterFreeTelephoneMediationDetailsError(claimRef);
  //How much money do you admit you owe? error screen
  await ResponseSteps.EnterResponseToClaim(claimRef, partAdmit);
  await ResponseSteps.SelectPartAdmitAlreadyPaid('no');
  await ResponseSteps.EnterHowMuchMoneyYouOweError(claimRef, partAdmit);
  await ResponseSteps.EnterHowMuchMoneyYouOwe(claimRef, 500, partAdmit);
  //Why do you disagree with the amount claimed? error screen
  await ResponseSteps.EnterWhyYouDisagreeTheClaimAmountError(claimRef, partAdmit);
  //Decide how you'll pay error screen
  await ResponseSteps.EnterResponseToClaim(claimRef, admitAll);
  await ResponseSteps.EnterPaymentOption(claimRef, admitAll, bySetDate);
  await ResponseSteps.EnterDateToPayOnError();
  //Your repayment plan error screen
  await ResponseSteps.EnterRepaymentPlanError(claimRef);
  //Tell us how much you've paid error screen
  await ResponseSteps.EnterResponseToClaim(claimRef, rejectAll);
  await ResponseSteps.SelectOptionInRejectAllClaim('alreadyPaid');
  await ResponseSteps.EnterHowMuchYouHavePaidError(claimRef, 500, rejectAll);
  await ResponseSteps.EnterResponseToClaim(claimRef, partAdmit);
  await ResponseSteps.SelectPartAdmitAlreadyPaid('yes');
  await ResponseSteps.EnterHowMuchYouHavePaidError(claimRef, 500, partAdmit);
});

Scenario('Personal detail error screen @nightly', async () => {
  await ResponseSteps.RespondToClaim(claimRef);
  await ResponseSteps.EnterPersonalDetailsError(claimRef);
});

//todo:financial screens
Scenario('Share your financial details screens @nightly', async () => {
});

AfterSuite(async  () => {
  await unAssignAllUsers();
});
