const steps  =  require('../../../citizenFeatures/createClaim/steps/createLipvLipClaimSteps');
const config = require('../../../../config');

const {createAccount} = require('../../../specClaimHelpers/api/idamHelper');
const LoginSteps = require('../../../commonFeatures/home/steps/login');

let caseRef, selectedHWF;

Feature('Create Lip v Company claim - Individual vs Company @claimCreation').tag('@regression-r2');

Scenario('Create Claim -  Individual vs Company - small claims - no interest - no hwf - flightdelay claim', async ({api}) => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    selectedHWF = false;
    const defaultClaimFee = 455;
    const defaultClaimAmount = 9000;
    await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
    await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
    await steps.createClaimDraftViaTestingSupport();
    //Change defendant to company, and add flightdelay claim
    await steps.addCompanyDefendant();
    caseRef = await steps.checkAndSubmit(selectedHWF);
    await api.setCaseId(caseRef);
    await api.waitForFinishedBusinessProcess();
    await steps.clickPayClaimFee();
    await steps.verifyAndPayClaimFee(defaultClaimAmount, defaultClaimFee);
    await api.waitForFinishedBusinessProcess();
  }
});