const steps = require('../../../citizenFeatures/createClaim/steps/createLipvLipClaimSteps');
const config = require('../../../../config');

const {createAccount} = require('../../../specClaimHelpers/api/idamHelper');
const LoginSteps = require('../../../commonFeatures/home/steps/login');

let caseRef, selectedHWF;

const createGASteps = require('../../../citizenFeatures/GA/steps/createGASteps');

Feature('Create Lip v Company claim - Individual vs Company').tag('@e2e-create-claim');

Scenario('Create Claim -  Individual vs Company - small claims - no interest - no hwf - flightdelay claim - GA (Ask for more time)', async ({
  api,
  I,
}) => {
  selectedHWF = false;
  const defaultClaimFee = 455;
  const defaultClaimAmount = 9000;
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
  const caseData = await api.retrieveCaseData(config.adminUser, caseRef);
  const claimNumber = await caseData.legacyCaseReference;
  await api.assignToLipDefendant(caseRef);
  console.log('Creating GA app as claimant');
  await I.amOnPage('/dashboard');
  await I.click(claimNumber);
  await createGASteps.askForMoreTimeCourtOrderGA(caseRef, 'Mr Claimant person v Defendant Company name');
  console.log('Creating GA app as defendant');
  await LoginSteps.EnterCitizenCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  await I.amOnPage('/dashboard');
  await I.click(claimNumber);
  await createGASteps.askForMoreTimeCourtOrderGA(caseRef, 'Mr Claimant person v Defendant Company name', 'withoutnotice', 'company');
});
