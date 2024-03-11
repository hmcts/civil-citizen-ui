const steps  =  require('../../features/createClaim/steps/createLipvLipClaimSteps');
const config = require('../../../config');

const {createAccount} = require('../../specClaimHelpers/api/idamHelper');
const LoginSteps = require('../../features/home/steps/login');

let caseRef, claimInterestFlag, StandardInterest, selectedHWF, claimAmount=16000, claimantPartyType = 'Org';

Feature('Create Lip v Lip claim - Org vs Sole trader').tag('@regression-r2');

Scenario('Create Claim -  Org vs Sole trader - Fast track - no interest - no hwf', async ({api}) => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    selectedHWF = false;
    claimInterestFlag = false;
    StandardInterest = false;
    await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
    await LoginSteps.EnterUserCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
    await steps.createClaimDraftViaTestingSupport();
    await steps.addOrgClaimant();
    await steps.addSoleTraderDefendant();
    caseRef = await steps.checkAndSubmit(selectedHWF, claimantPartyType);
    await api.setCaseId(caseRef);
    await api.waitForFinishedBusinessProcess();
    await steps.payClaimFee(9000, 455);
    await api.waitForFinishedBusinessProcess();
  }
});

Scenario('Create Claim -  Org vs Sole trader - Fast track - with standard interest - no hwf', async ({api}) => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    selectedHWF = false;
    claimInterestFlag = true;
    StandardInterest = true;
    await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
    await LoginSteps.EnterUserCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
    await steps.createClaimDraftViaTestingSupport();
    await steps.addOrgClaimant();
    await steps.addSoleTraderDefendant();
    await steps.updateClaimAmount(claimAmount, claimInterestFlag, StandardInterest, selectedHWF);
    caseRef = await steps.checkAndSubmit(selectedHWF, claimantPartyType);
    await api.setCaseId(caseRef);
    await api.waitForFinishedBusinessProcess();
    await steps.payClaimFee(1600, 115);
    await api.waitForFinishedBusinessProcess();
  }
});

Scenario('Create Claim -  Org vs Sole trader - Fast track - with variable interest - no hwf', async ({api}) => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    selectedHWF = false;
    claimInterestFlag = true;
    StandardInterest = false;
    await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
    await LoginSteps.EnterUserCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
    await steps.createClaimDraftViaTestingSupport();
    await steps.addOrgClaimant();
    await steps.addSoleTraderDefendant();
    await steps.updateClaimAmount(claimAmount, claimInterestFlag, StandardInterest, selectedHWF);
    caseRef = await steps.checkAndSubmit(selectedHWF, claimantPartyType);
    await api.setCaseId(caseRef);
    await api.waitForFinishedBusinessProcess();
    await steps.payClaimFee(1600, 115);
    await api.waitForFinishedBusinessProcess();
  }
});

Scenario('Create Claim -  Org vs Sole trader - Fast track - with variable interest - with hwf', async ({api}) => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    selectedHWF = true;
    claimInterestFlag = true;
    StandardInterest = false;
    await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
    await LoginSteps.EnterUserCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
    await steps.createClaimDraftViaTestingSupport();
    await steps.addOrgClaimant();
    await steps.addSoleTraderDefendant();
    await steps.updateClaimAmount(claimAmount, claimInterestFlag, StandardInterest, selectedHWF);
    caseRef = await steps.checkAndSubmit(selectedHWF, claimantPartyType);
    await api.setCaseId(caseRef);
    await api.waitForFinishedBusinessProcess();
  }
});