const config = require('../../config');
const LoginSteps = require('./../commonFeatures/home/steps/login');
const CitizenDashboardSteps = require('../citizenFeatures/citizenDashboard/steps/citizenDashboard');
const {createAccount} = require('../specClaimHelpers/api/idamHelper');
const ResponseSteps = require('../citizenFeatures/response/steps/lipDefendantResponseSteps');

const claimType = 'SmallClaims';
// eslint-disable-next-line no-unused-vars
let claimRef;
let caseData;
let claimNumber;

Feature('Create Lip v Lip claim -  Full Admit Pay by Instalments By Defendant');

Scenario('Create LipvLip claim and defendant response as FullAdmit pay by instalments - @api', async ({api}) => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
    await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
    claimRef = await api.createLiPClaim(config.claimantCitizenUser, claimType);
    caseData = await api.retrieveCaseData(config.adminUser, claimRef);
    claimNumber = await caseData.legacyCaseReference;
    await LoginSteps.EnterCitizenCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
    await CitizenDashboardSteps.VerifyClaimOnDashboard(claimNumber);
    await ResponseSteps.SignOut();
    await api.performCitizenResponse(config.defendantCitizenUser, claimRef, claimType, config.defenceType.admitAllPayByInstallmentWithIndividual);
    await api.waitForFinishedBusinessProcess();
  }
}).tag('@regression-r2');
