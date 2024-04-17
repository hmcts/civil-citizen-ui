const config = require('../../config');

const LoginSteps =  require('../features/home/steps/login');
const DashboardSteps = require('../features/dashboard/steps/dashboard');
const {createAccount} = require('../specClaimHelpers/api/idamHelper');
const ResponseSteps = require('../features/response/steps/lipDefendantResponseSteps');
const CreateLipvLipClaimSteps  =  require('../features/createClaim/steps/createLipvLipClaimSteps');


const claimType = 'SmallClaims';
// eslint-disable-next-line no-unused-vars
let claimRef;
let caseData;
let claimNumber;

Feature('Create Lip v Lip claim -  Full Admit and pay Immediately');

Scenario('Create LipvLip claim and defendant response as FullAdmit and pay immediately', async ({api}) => {
  if (['aat'].includes(config.runningEnv)) {
    await LoginSteps.EnterUserCredentials(config.claimantEmailsVerificationCitizenUser.email, config.claimantEmailsVerificationCitizenUser.password);
    await CreateLipvLipClaimSteps.EligibilityCheckStepsForClaimCreationOCMC();
    let claimRef = await CreateLipvLipClaimSteps.CreateClaimCreationOCMC(false);
    await CreateLipvLipClaimSteps.CheckOCMCcasePreview(claimRef);
  }
}).tag('@ocmc');
