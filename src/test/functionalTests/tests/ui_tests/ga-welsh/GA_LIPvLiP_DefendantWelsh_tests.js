const config = require('../../../../config');
const LoginSteps = require('../../../commonFeatures/home/steps/login');
const {createAccount} = require('../../../specClaimHelpers/api/idamHelper');

const createGASteps = require('../../../citizenFeatures/GA/steps/createGASteps');

let claimRef;
let caseData;
let claimNumber;

Feature('Lip v Lip - Defendant Welsh - GA application').tag('@civil-citizen-nightly @ui-ga-welsh');

Before(async ({api}) => {
  await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  claimRef = await api.createLiPClaim(config.claimantCitizenUser);
  caseData = await api.retrieveCaseData(config.adminUser, claimRef);
  claimNumber = await caseData.legacyCaseReference;
  console.log('claimRef has been created Successfully    <===>  ', claimRef);
  await api.assignToLipDefendant(claimRef);
  await api.performCitizenResponse(config.defendantCitizenUser, claimRef, 'SmallClaims', config.defenceType.rejectAllDisputeAllWithIndividual, '', 'WELSH', 'BOTH');
  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
});

Scenario('Response with RejectAll and DisputeAll - Defendant Welsh - GA (Ask for more time)', async ({I}) => {
  console.log('Creating GA app as claimant');
  await I.amOnPage('/dashboard');
  await I.click(claimNumber);
  await createGASteps.askForMoreTimeCourtOrderGA(claimRef, 'Miss Jane Doe v Sir John Doe');
  console.log('Creating GA app as defendant');
  await LoginSteps.EnterCitizenCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  await I.amOnPage('/dashboard');
  await I.click(claimNumber);
  await createGASteps.askForMoreTimeCourtOrderGA(claimRef, 'Miss Jane Doe v Sir John Doe', undefined, '', 'BOTH');
});
