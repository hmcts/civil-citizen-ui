const config = require('../../config');

const {unAssignAllUsers} = require('./../specClaimHelpers/api/caseRoleAssignmentHelper');
const LoginSteps =  require('../features/home/steps/login');
const DashboardSteps = require('../features/dashboard/steps/dashboard');

const claimType = 'SmallClaims';
// eslint-disable-next-line no-unused-vars
let caseID;
let caseData;
let claimNumber;

Feature('Create LipvLip claim using API');

Before(async ({api}) => {
  caseID = await api.createLiPClaim(config.claimantCitizenUser);
  caseData = await api.retrieveCaseData(config.adminUser, caseID);
  claimNumber = await caseData.legacyCaseReference;
  await LoginSteps.EnterUserCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  await DashboardSteps.VerifyClaimOnDashboard(claimNumber);
});

Scenario('Create LipvLip claim using API', async ({api}) => {
  //this is the existing DefendantResponse API call used by CP team. It is RejectAll and DisputeAll
  await api.performCitizenResponse(config.defendantCitizenUser, caseID, claimType);
});

AfterSuite(async () => {
  await unAssignAllUsers();
});
