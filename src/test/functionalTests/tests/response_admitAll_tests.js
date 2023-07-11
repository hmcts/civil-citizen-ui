const config = require('../../config');

const ResponseSteps  =  require('../features/response/steps/lipDefendantResponseSteps');
const LoginSteps =  require('../features/home/steps/login');
const DashboardSteps = require('../features/dashboard/steps/dashboard');

const admitAll = 'full-admission';
const immediatePayment = 'immediate';
const bySetDate = 'bySetDate';
const repaymentPlan = 'repaymentPlan';
const dontWantMoreTime = 'dontWantMoreTime';

let claimRef;
let caseData;
let claimNumber;
let securityCode;
const delay = ms => new Promise(res => setTimeout(res, ms));

Feature('Response with AdmitAll @regression');

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

Scenario('Response with AdmitAll and Immediate payment @citizenUI @admitAll @smoketest @regression', async ({api}) => {
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

Scenario('Response with AdmitAll and Date to PayOn @citizenUI @admitAll @regression', async ({api}) => {
  await ResponseSteps.RespondToClaim(claimRef);
  await ResponseSteps.EnterPersonalDetails(claimRef);
  await ResponseSteps.EnterYourOptionsForDeadline(claimRef, dontWantMoreTime);
  await ResponseSteps.EnterResponseToClaim(claimRef, admitAll);
  await ResponseSteps.EnterPaymentOption(claimRef, admitAll, bySetDate);
  await ResponseSteps.EnterDateToPayOn();
  await ResponseSteps.EnterFinancialDetails(claimRef);
  await ResponseSteps.CheckAndSubmit(claimRef, admitAll);
  if (['preview', 'demo'  ].includes(config.runningEnv)) {
    // commenting until this is fixed https://tools.hmcts.net/jira/browse/CIV-9655
    // await api.enterBreathingSpace(config.applicantSolicitorUser);
    // await api.liftBreathingSpace(config.applicantSolicitorUser);
    await api.viewAndRespondToDefence(config.applicantSolicitorUser, config.defenceType.admitAllPayBySetDate, config.claimState.PROCEEDS_IN_HERITAGE_SYSTEM);
  }
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
  if (['preview', 'demo'  ].includes(config.runningEnv)) {
    // commenting until this is fixed https://tools.hmcts.net/jira/browse/CIV-9655
    // await api.enterBreathingSpace(config.applicantSolicitorUser);
    // await api.liftBreathingSpace(config.applicantSolicitorUser);
    await api.viewAndRespondToDefence(config.applicantSolicitorUser, config.defenceType.admitAllPayByInstallment, config.claimState.PROCEEDS_IN_HERITAGE_SYSTEM);
  }
});

