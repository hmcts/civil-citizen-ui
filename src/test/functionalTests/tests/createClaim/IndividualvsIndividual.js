const steps  =  require('../../features/createClaim/steps/createLipvLipClaimSteps');
const config = require('../../../config');

const {createAccount} = require('../../specClaimHelpers/api/idamHelper');
const LoginSteps = require('../../features/home/steps/login');

let claimInterestFlag, StandardInterest, selectedHWF, claimAmount=1600;

Feature('Create Lip v Lip claim - Individual vs Individual').tag('@regression-r2');

Scenario('Create Claim -  Individual vs Individual - small claims - no interest - no hwf', async () => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    selectedHWF = false;
    claimInterestFlag = false;
    StandardInterest = false;
    await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
    await LoginSteps.EnterUserCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
    await steps.createClaimDraftViaTestingSupport();
    await steps.checkAndSubmit(selectedHWF);
  }
});

Scenario('Create Claim -  Individual vs Individual - small claims - with standard interest - no hwf', async () => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    selectedHWF = false;
    claimInterestFlag = true;
    StandardInterest = true;
    await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
    await LoginSteps.EnterUserCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
    await steps.createClaimDraftViaTestingSupport();
    await steps.updateClaimAmount(claimAmount, claimInterestFlag, StandardInterest, selectedHWF);
    await steps.checkAndSubmit(selectedHWF);
  }
});

Scenario('Create Claim -  Individual vs Individual - small claims - with variable interest - no hwf', async () => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    selectedHWF = false;
    claimInterestFlag = true;
    StandardInterest = false;
    await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
    await LoginSteps.EnterUserCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
    await steps.createClaimDraftViaTestingSupport();
    await steps.updateClaimAmount(claimAmount, claimInterestFlag, StandardInterest, selectedHWF);
    await steps.checkAndSubmit(selectedHWF);
  }
});

Scenario('Create Claim -  Individual vs Individual - small claims - with variable interest - with hwf', async () => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    selectedHWF = true;
    claimInterestFlag = true;
    StandardInterest = false;
    await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
    await LoginSteps.EnterUserCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
    await steps.createClaimDraftViaTestingSupport();
    await steps.updateClaimAmount(claimAmount, claimInterestFlag, StandardInterest, selectedHWF);
    await steps.checkAndSubmit(selectedHWF);
  }
});