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

Feature('Response with AdmitAll @regression');

Before(async ({api}) => {
  claimRef = await api.createSpecifiedClaim(config.applicantSolicitorUser);
  console.log('Claim has been created Successfully    <===>  ', claimRef);
  caseData = await api.retrieveCaseData(config.adminUser, claimRef);
  claimNumber = await caseData.legacyCaseReference;
  securityCode = await caseData.respondent1PinToPostLRspec.accessCode;
  console.log('claim number', claimNumber);
  console.log('Security code', securityCode);
  await ResponseSteps.AssignCaseToLip(claimNumber, securityCode);
  await LoginSteps.EnterUserCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
});

Scenario('Response with AdmitAll and Immediate payment @citizenUI @admitAll @smoketest', async ({api}) => {
  await DashboardSteps.VerifyClaimOnDashboard(claimNumber);
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
  await DashboardSteps.VerifyClaimOnDashboard(claimNumber);
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
  await DashboardSteps.VerifyClaimOnDashboard(claimNumber);
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

