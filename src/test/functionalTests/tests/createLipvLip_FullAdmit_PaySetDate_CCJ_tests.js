const config = require('../../config');

const {unAssignAllUsers} = require('./../specClaimHelpers/api/caseRoleAssignmentHelper');
const LoginSteps = require('../features/home/steps/login');
const DashboardSteps = require('../features/dashboard/steps/dashboard');
const {createAccount} = require('../specClaimHelpers/api/idamHelper');
const ResponseToDefenceLipVsLipSteps = require('../features/createClaim/steps/responseToDefenceLipvLipSteps');
const ResponseSteps = require('../features/response/steps/lipDefendantResponseSteps');

const claimType = 'SmallClaims';
// eslint-disable-next-line no-unused-vars
let claimRef;
let caseData;
let claimNumber;

Feature('Create Lip v Lip claim -  Full Admit Pay by Set Date By Defendant and Accepted and raise CCJ By Claimant');

Scenario('Create LipvLip claim and defendant response as FullAdmit pay by set date @test', async ({api}) => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
    await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
    claimRef = await api.createLiPClaim(config.claimantEmailsVerificationCitizenUser, claimType);
    caseData = await api.retrieveCaseData(config.adminUser, claimRef);
    claimNumber = await caseData.legacyCaseReference;
    await LoginSteps.EnterUserCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
    await DashboardSteps.VerifyClaimOnDashboard(claimNumber);
    await ResponseSteps.SignOut();
    await api.performCitizenResponse(config.defendantCitizenUser, claimRef, claimType, 'FA_PAY_BY_SET_DATE_INDIVIDUAL');
    await LoginSteps.EnterUserCredentials(config.claimantEmailsVerificationCitizenUser.email, config.claimantCitizenUser.password);
    await ResponseToDefenceLipVsLipSteps.ResponseToDefenceStepsAsAnAcceptanceOfFullAdmitPayBySetDate(claimRef, claimNumber);
    await api.waitForFinishedBusinessProcess();
  }
}).tag('@regression-r2');

AfterSuite(async () => {
  await unAssignAllUsers();
});
