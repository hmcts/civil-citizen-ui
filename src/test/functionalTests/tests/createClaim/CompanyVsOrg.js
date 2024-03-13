const steps  =  require('../../features/createClaim/steps/createLipvLipClaimSteps');
const config = require('../../../config');

const {createAccount} = require('../../specClaimHelpers/api/idamHelper');
const LoginSteps = require('../../features/home/steps/login');

let caseRef, claimInterestFlag, StandardInterest, selectedHWF, claimAmount=1600, claimFee=115, claimantPartyType = 'Company';

Feature('Create Lip v Lip claim - Company vs Org - @apitest').tag('@regression-r2');

Scenario('Create Claim -  Company vs Org - Fast track - no interest - no hwf', async ({api}) => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    selectedHWF = false;
    claimInterestFlag = false;
    StandardInterest = false;
    await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
    await LoginSteps.EnterUserCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
    await steps.createClaimDraftViaTestingSupport();
    await steps.addCompanyClaimant();
    await steps.addOrgDefendant();
    caseRef = await steps.checkAndSubmit(selectedHWF, claimantPartyType);
    await api.setCaseId(caseRef);
    await api.waitForFinishedBusinessProcess();
    await steps.payClaimFee(9000, 455);
    await api.waitForFinishedBusinessProcess();
  }
});

Scenario('Create Claim -  Company vs Org - Fast track - with standard interest - no hwf', async ({api}) => {
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
    caseRef = await steps.checkAndSubmit(selectedHWF, claimantPartyType);
    await api.setCaseId(caseRef);
    await api.waitForFinishedBusinessProcess();
    await steps.payClaimFee(claimAmount, claimFee);
    await api.waitForFinishedBusinessProcess();
  }
});

Scenario('Create Claim -  Company vs Org - Fast track - with variable interest - no hwf', async ({api}) => {
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
    caseRef = await steps.checkAndSubmit(selectedHWF, claimantPartyType);
    await api.setCaseId(caseRef);
    await api.waitForFinishedBusinessProcess();
    await steps.payClaimFee(claimAmount, claimFee);
    await api.waitForFinishedBusinessProcess();
  }
});

Scenario('Create Claim -  Company vs Org - Fast track - with variable interest - with hwf', async ({api}) => {
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
    caseRef = await steps.checkAndSubmit(selectedHWF, claimantPartyType);
    await api.setCaseId(caseRef);
    await api.waitForFinishedBusinessProcess();
  }
});