const config = require('../../../config');
const LoginSteps = require('../../commonFeatures/home/steps/login');
const {createAccount} = require('../../specClaimHelpers/api/idamHelper');

const createGASteps = require('../../citizenFeatures/GA/steps/createGASteps');

let claimRef;
let caseData;
let claimNumber;

Feature('LR v Lip - Defendant Welsh - GA application');

Before(async ({api}) => {
  await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  claimRef = await api.createSpecifiedClaim(config.applicantSolicitorUser);
  caseData = await api.retrieveCaseData(config.adminUser, claimRef);
  claimNumber = await caseData.legacyCaseReference;
  console.log('claimRef has been created Successfully    <===>  ', claimRef);
  await api.assignToLipDefendant(claimRef);
  await api.performCitizenResponse(config.defendantCitizenUser, claimRef, 'SmallClaims', config.defenceType.rejectAllDisputeAllWithIndividual, '', 'WELSH', 'BOTH');
  await LoginSteps.EnterCitizenCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
});

Scenario('Response with RejectAll and DisputeAll - Defendat Welsh - GA (Ask for more time)', async ({I}) => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    console.log('Creating GA app as defendant');
    await I.amOnPage('/dashboard');
    await I.click(claimNumber);
    await createGASteps.askForMoreTimeCourtOrderGA(claimRef, 'Test Inc v Sir John Doe', undefined, '', 'BOTH');
  }
});
