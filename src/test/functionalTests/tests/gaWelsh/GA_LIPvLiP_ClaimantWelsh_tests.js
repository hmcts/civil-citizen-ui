const config = require('../../../config');
const LoginSteps = require('../../commonFeatures/home/steps/login');
const {createAccount} = require('../../specClaimHelpers/api/idamHelper');

const createGAAppSteps = require('../../citizenFeatures/response/steps/createGAAppSteps');

let claimRef;
let caseData;
let claimNumber;

Feature('Lip v Lip - Claimant Welsh - GA application');

Before(async ({api}) => {
  await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  claimRef = await api.createLiPClaim(config.claimantCitizenUser,'',false,'Individual', 'BOTH');
  caseData = await api.retrieveCaseData(config.adminUser, claimRef);
  claimNumber = await caseData.legacyCaseReference;
  console.log('claimRef has been created Successfully    <===>  ', claimRef);
  await api.performTranslatedDocUpload(config.caseWorker, claimRef);
  await api.assignToLipDefendant(claimRef);
  await api.performCitizenResponse(config.defendantCitizenUser, claimRef, 'SmallClaims', config.defenceType.rejectAllDisputeAllWithIndividual);
  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
});

Scenario('Response with RejectAll and DisputeAll - Claimant Welsh - GA (Ask for more time)', async ({I}) => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    console.log('Creating GA app as claimant');
    await I.amOnPage('/dashboard');
    await I.click(claimNumber);
    await createGAAppSteps.askForMoreTimeCourtOrderGA(claimRef, 'Miss Jane Doe v Sir John Doe');
    console.log('Creating GA app as defendant');
    await LoginSteps.EnterCitizenCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
    await I.amOnPage('/dashboard');
    await I.click(claimNumber);
    await createGAAppSteps.askForMoreTimeCourtOrderGA(claimRef, 'Miss Jane Doe v Sir John Doe');
  }
});
