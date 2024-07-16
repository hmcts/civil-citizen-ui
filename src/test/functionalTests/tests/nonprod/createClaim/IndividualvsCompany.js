const steps  =  require('../../../citizenFeatures/createClaim/steps/createLipvLipClaimSteps');
const config = require('../../../../config');

const createGAAppSteps = require('../../../citizenFeatures/response/steps/createGAAppSteps');

const {createAccount} = require('../../../specClaimHelpers/api/idamHelper');
const LoginSteps = require('../../../commonFeatures/home/steps/login');

let caseRef, selectedHWF, caseData, claimNumber;

Feature('Create Lip v Company claim - Individual vs Company @claimCreation').tag('@regression-r2');

Scenario('Create Claim -  Individual vs Company - small claims - no interest - no hwf - flightdelay claim', async ({api, I}) => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    selectedHWF = false;
    const defaultClaimFee = 455;
    const defaultClaimAmount = 15000;
    await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
    await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
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
    caseData = await api.retrieveCaseData(config.adminUser, caseRef);
    claimNumber = await caseData.legacyCaseReference;
    await api.assignToLipDefendant(caseRef);
    console.log('Creating GA app as claimant');
    await I.amOnPage('/dashboard');
    await I.click(claimNumber);
    await createGAAppSteps.askForMoreTimeCourtOrderGA();
    console.log('Creating GA app as claimant');
    await LoginSteps.EnterCitizenCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
    await I.amOnPage('/dashboard');
    await I.click(claimNumber);
    await createGAAppSteps.askForMoreTimeCourtOrderGA();
  }
});