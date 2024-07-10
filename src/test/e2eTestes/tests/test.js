const config = require('../../config');
const LoginSteps = require('../../functionalTests/commonFeatures/home/steps/login');
//const idamHelper = require('../../functionalTests/specClaimHelpers/api/idamHelper');
const steps  =  require('../../functionalTests/citizenFeatures/createClaim/steps/createLipvLipClaimSteps');

Feature('Create Lip v Lip claim - Individual vs Individual @claimCreation').tag('@e2e');

Scenario('Create Claim -  Individual vs Individual - small claims - with standard interest - no hwf', async ({I, api}) => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    //let userAuth = await idamHelper.accessToken(config.claimantCitizenUser);
    //let userId = await idamHelper.userId(userAuth);
    //console.log(userId);
    //selectedHWF = false;
    //const defaultClaimFee = 455;
    //const defaultClaimAmount = 9000;
    //await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
    //LoginSteps.EnterCitizenWithoutCredentials();
    await steps.createClaimDraftViaTestingSupport();
    //Change defendant to company, and add flightdelay claim
    //await steps.addCompanyDefendant();
    //caseRef = await steps.checkAndSubmit(selectedHWF);
    //await api.setCaseId(caseRef);
    //await api.waitForFinishedBusinessProcess();
    //await steps.clickPayClaimFee();
    //await steps.verifyAndPayClaimFee(defaultClaimAmount, defaultClaimFee);
    //await api.waitForFinishedBusinessProcess();
  }
});
