const config = require('../../config');

const {unAssignAllUsers} = require('./../specClaimHelpers/api/caseRoleAssignmentHelper');
const LoginSteps =  require('../features/home/steps/login');
const DashboardSteps = require('../features/dashboard/steps/dashboard');
const {createAccount} = require('../specClaimHelpers/api/idamHelper');

const claimType = 'SmallClaims';
// eslint-disable-next-line no-unused-vars
let caseID;
let caseData;
let claimNumber;

Feature('Create LipvLip claim using API');

Before(async ({api}) => {
  // await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  caseID = await api.createLiPClaim(config.claimantEmailsVerificationCitizenUser, claimType);
  caseData = await api.retrieveCaseData(config.adminUser, caseID);
  claimNumber = await caseData.legacyCaseReference;
  await LoginSteps.EnterUserCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  await DashboardSteps.VerifyClaimOnDashboard(claimNumber);
});

Scenario('Create LipvLip claim and defendant response as FullAdmit @test', async ({api}) => {
  await api.performCitizenResponse(config.defendantCitizenUser, caseID, claimType, 'FA_PAY_IMMEDIATELY_INDIVIDUAL');
});

AfterSuite(async () => {
  await unAssignAllUsers();
});
