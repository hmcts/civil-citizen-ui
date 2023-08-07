const config = require('../../config');

const ResponseSteps  =  require('../features/response/steps/lipDefendantResponseSteps');
const LoginSteps =  require('../features/home/steps/login');
const DashboardSteps = require('../features/dashboard/steps/dashboard');

const admitAll = 'full-admission';
const immediatePayment = 'immediate';
const dontWantMoreTime = 'dontWantMoreTime';

let claimRef;
let caseData;
let claimNumber;
let securityCode;

Feature('Response with AdmitAll');

Before(async ({api}) => {
  if (['preview', 'demo'  ].includes(config.runningEnv)) {
    claimRef = await api.createSpecifiedClaim(config.applicantSolicitorUser, 'pinInPost');
    console.log('Claim has been created Successfully    <===>  ', claimRef);
    caseData = await api.retrieveCaseData(config.adminUser, claimRef);
    claimNumber = await caseData.legacyCaseReference;
    securityCode = await caseData.respondent1PinToPostLRspec.accessCode;
    console.log('claim number', claimNumber);
    console.log('Security code', securityCode);
    await ResponseSteps.AssignCaseToLip(claimNumber, securityCode);
    await LoginSteps.EnterUserCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
    await DashboardSteps.VerifyClaimOnDashboard(claimNumber);
  }else{
    claimRef = await api.createSpecifiedClaimLRvLR(config.applicantSolicitorUser);
    console.log('Claim has been created Successfully    <===>  ', claimRef);
    await LoginSteps.EnterUserCredentials(config.defendantLRCitizenUser.email, config.defendantLRCitizenUser.password);
  }
});

Scenario('Response with AdmitAll and Immediate payment @citizenUI @admitAll @smoketest @nightly', async ({api}) => {
  await DashboardSteps.DashboardPage();
  await ResponseSteps.RespondToClaim(claimRef);
  await ResponseSteps.EnterPersonalDetails(claimRef);
  await ResponseSteps.EnterYourOptionsForDeadline(claimRef, dontWantMoreTime);
  await ResponseSteps.EnterResponseToClaim(claimRef, admitAll);
  await ResponseSteps.EnterPaymentOption(claimRef, admitAll, immediatePayment);
  await ResponseSteps.CheckAndSubmit(claimRef, admitAll);
  if (['preview', 'demo'  ].includes(config.runningEnv)) {
    // commenting until this is fixed https://tools.hmcts.net/jira/browse/CIV-9655
    // await api.enterBreathingSpace(config.applicantSolicitorUser);
    // await api.liftBreathingSpace(config.applicantSolicitorUser);
    await api.viewAndRespondToDefence(config.applicantSolicitorUser, config.defenceType.admitAllPayImmediate);
  }
});
