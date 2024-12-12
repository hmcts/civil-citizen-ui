const config = require('../../../config');
const {createAccount} = require('../../specClaimHelpers/api/idamHelper');
const LoginSteps = require('../../commonFeatures/home/steps/login');
const createGASteps = require('../../citizenFeatures/GA/steps/createGASteps');
const respondGASteps = require('../../citizenFeatures/GA/steps/respondGASteps');
// eslint-disable-next-line no-unused-vars

let claimRef, claimType, caseData, claimNumber, gaID;

Feature('Lip v Lip GA e2e Tests');

Before(async ({api}) => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
    await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
    
    claimType = 'FastTrack';
    claimRef = await api.createLiPClaim(config.claimantCitizenUser, claimType);
    caseData = await api.retrieveCaseData(config.adminUser, claimRef);
    claimNumber = await caseData.legacyCaseReference;

    await api.assignToLipDefendant(claimRef);
    await api.waitForFinishedBusinessProcess();
  }
});

Scenario('LipvLip Applicant GA creation e2e tests @citizenUI @nightly - @api @ga @regression', async ({I, api}) => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);

    console.log('Creating more time to do order GA app as claimant');
    await I.amOnPage('/dashboard');
    await I.click(claimNumber);
    gaID = await createGASteps.askForMoreTimeCourtOrderGA(claimRef, 'Miss Jane Doe v Sir John Doe', 'notice');

    //defendant response
    console.log('Responding to the GA as defendant');
    await LoginSteps.EnterCitizenCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
    await I.amOnPage('/dashboard');
    await I.click(claimNumber);
    
    await respondGASteps.respondToGA(claimRef, gaID, 'Respond to an application to more time to do what is required by a court order', 'Miss Jane Doe v Sir John Doe');

    await api.makeOrderGA(gaID);
  }
});