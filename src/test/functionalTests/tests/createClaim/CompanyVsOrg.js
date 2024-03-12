const steps  =  require('../../features/createClaim/steps/createLipvLipClaimSteps');
const config = require('../../../config');

const {createAccount} = require('../../specClaimHelpers/api/idamHelper');
const LoginSteps = require('../../features/home/steps/login');

let claimInterestFlag, StandardInterest, selectedHWF, claimAmount=16000, claimantPartyType = 'Company';

Feature('Create Lip v Lip claim - Company vs Org - @apitest').tag('@regression-r2');

Scenario('Create Claim -  Company vs Org - Fast track - no interest - no hwf', async () => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    selectedHWF = false;
    claimInterestFlag = false;
    StandardInterest = false;
    await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
    await LoginSteps.EnterUserCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
    await steps.createClaimDraftViaTestingSupport();
    await steps.addCompanyClaimant();
    await steps.addOrgDefendant();
    await steps.checkAndSubmit(selectedHWF, claimantPartyType);
  }
});

Scenario('Create Claim -  Company vs Org - Fast track - with standard interest - no hwf', async () => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    selectedHWF = false;
    claimInterestFlag = true;
    StandardInterest = true;
    await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
    await LoginSteps.EnterUserCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
    await steps.createClaimDraftViaTestingSupport();
    await steps.addCompanyClaimant();
    await steps.addOrgDefendant();
    await steps.updateClaimAmount(claimAmount, claimInterestFlag, StandardInterest, selectedHWF);
    await steps.checkAndSubmit(selectedHWF, claimantPartyType);
  }
});

Scenario('Create Claim -  Company vs Org - Fast track - with variable interest - no hwf', async () => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    selectedHWF = false;
    claimInterestFlag = true;
    StandardInterest = false;
    await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
    await LoginSteps.EnterUserCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
    await steps.createClaimDraftViaTestingSupport();
    await steps.addCompanyClaimant();
    await steps.addOrgDefendant();
    await steps.updateClaimAmount(claimAmount, claimInterestFlag, StandardInterest, selectedHWF);
    await steps.checkAndSubmit(selectedHWF, claimantPartyType);
  }
});

Scenario('Create Claim -  Company vs Org - Fast track - with variable interest - with hwf', async () => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    selectedHWF = true;
    claimInterestFlag = true;
    StandardInterest = false;
    await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
    await LoginSteps.EnterUserCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
    await steps.createClaimDraftViaTestingSupport();
    await steps.addCompanyClaimant();
    await steps.addOrgDefendant();
    await steps.updateClaimAmount(claimAmount, claimInterestFlag, StandardInterest, selectedHWF);
    await steps.checkAndSubmit(selectedHWF, claimantPartyType);
  }
});