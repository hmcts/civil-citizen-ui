const config = require('../../config');

const LoginSteps =  require('../features/home/steps/login');
const {createAccount} = require('../specClaimHelpers/api/idamHelper');
const CreateLipvLipClaimSteps  =  require('../features/createClaim/steps/createLipvLipClaimSteps');

// eslint-disable-next-line no-unused-vars
let claimRef;

Feature('Create Lip v Lip claim -  Full Admit and pay Immediately');

Scenario('Create OCMC case and view it in preview @ocmc', async () => {
  await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await LoginSteps.EnterUserCredentialsOCMC(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await CreateLipvLipClaimSteps.EligibilityCheckStepsForClaimCreationOCMC();
  let claimRef = await CreateLipvLipClaimSteps.CreateClaimCreationOCMC(false);
  await LoginSteps.EnterUserCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await CreateLipvLipClaimSteps.CheckOCMCcasePreview(claimRef);
}).tag('@regression-cui-r1');
