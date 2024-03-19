const config = require('../../config');

const LoginSteps = require('../features/home/steps/login');
const DashboardSteps = require('../features/dashboard/steps/dashboard');
const {createAccount} = require('../specClaimHelpers/api/idamHelper');
const ResponseSteps = require('../features/response/steps/lipDefendantResponseSteps');

const claimType = 'SmallClaims';

Feature('Create Lip v Lip claim -  Full Admit Pay by Instalments By Defendant');

Scenario('Create LipvLip claim and defendant response as FullAdmit pay by instalments - @api', async ({api}) => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
    await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
    let claimRef = await api.createLiPClaim(config.claimantCitizenUser, claimType);
    let caseData = await api.retrieveCaseData(config.adminUser, claimRef);
    let claimNumber = await caseData.legacyCaseReference;
    await LoginSteps.EnterUserCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
    await DashboardSteps.VerifyClaimOnDashboard(claimNumber);
    await ResponseSteps.SignOut();
    await api.performCitizenResponse(config.defendantCitizenUser, claimRef, claimType, config.defenceType.admitAllPayByInstallmentWithIndividual);
    await api.waitForFinishedBusinessProcess();
  }
}).tag('@regression-r2');
