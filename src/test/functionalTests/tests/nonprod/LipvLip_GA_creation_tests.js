const config = require('../../../config');
const {createAccount} = require('../../specClaimHelpers/api/idamHelper');
const LoginSteps = require('../../commonFeatures/home/steps/login');
const createGAAppSteps = require('../../citizenFeatures/response/steps/createGAAppSteps');
// eslint-disable-next-line no-unused-vars

let claimRef, claimType, caseData, claimNumber;

Feature('Lip v Lip GA Creation Tests');

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

Scenario('LipvLip Applicant GA creation tests @citizenUI @nightly - @api @ga @regression', async ({I}) => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);

    console.log('Creating GA app as claimant');
    await I.amOnPage('/dashboard');
    await I.click(claimNumber);
    await createGAAppSteps.askToSetAsideJudgementGA(claimRef, 'Miss Jane Doe v Sir John Doe', 'consent');

    console.log('Creating GA app as claimant');
    await I.amOnPage('/dashboard');
    await I.click(claimNumber);
    await createGAAppSteps.askToVaryAJudgementGA(claimRef, 'Miss Jane Doe v Sir John Doe', 'consent');

    console.log('Creating GA app as claimant');
    await I.amOnPage('/dashboard');
    await I.click(claimNumber);
    await createGAAppSteps.askCourtToReconsiderAnOrderGA(claimRef, 'Miss Jane Doe v Sir John Doe', 'consent');

    console.log('Creating GA app as claimant');
    await I.amOnPage('/dashboard');
    await I.click(claimNumber);
    await createGAAppSteps.askToChangeHearingDateGA(claimRef, 'Miss Jane Doe v Sir John Doe', 'notice');

    console.log('Creating GA app as claimant');
    await I.amOnPage('/dashboard');
    await I.click(claimNumber);
    await createGAAppSteps.askForMoreTimeCourtOrderGA(claimRef, 'Miss Jane Doe v Sir John Doe', 'notice');

    console.log('Creating GA app as claimant');
    await I.amOnPage('/dashboard');
    await I.click(claimNumber);
    await createGAAppSteps.askForReliefFromAPenaltyGA(claimRef, 'Miss Jane Doe v Sir John Doe', 'withoutnotice');

    console.log('Creating GA app as claimant');
    await I.amOnPage('/dashboard');
    await I.click(claimNumber);
    await createGAAppSteps.askToChangeSubmittedGA(claimRef, 'Miss Jane Doe v Sir John Doe', 'withoutnotice');
  }
});

Scenario('LipvLip Defendant GA creation tests @citizenUI @nightly - @api @ga', async ({I}) => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    await LoginSteps.EnterCitizenCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);

    console.log('Creating GA app as defendant');
    await I.amOnPage('/dashboard');
    await I.click(claimNumber);
    await createGAAppSteps.askCourtSummaryJudgmentGA(claimRef, 'Miss Jane Doe v Sir John Doe', 'consent');

    console.log('Creating GA app as defendant');
    await I.amOnPage('/dashboard');
    await I.click(claimNumber);
    await createGAAppSteps.askCourtStrikeOutGA(claimRef, 'Miss Jane Doe v Sir John Doe', 'consent');

    console.log('Creating GA app as defendant');
    await I.amOnPage('/dashboard');
    await I.click(claimNumber);
    await createGAAppSteps.askCourtToPauseClaimGA(claimRef, 'Miss Jane Doe v Sir John Doe', 'notice');

    console.log('Creating GA app as defendant');
    await I.amOnPage('/dashboard');
    await I.click(claimNumber);
    await createGAAppSteps.askCourtSanctionGA(claimRef, 'Miss Jane Doe v Sir John Doe', 'notice');

    console.log('Creating GA app as defendant');
    await I.amOnPage('/dashboard');
    await I.click(claimNumber);
    await createGAAppSteps.askCourtToSettleByConsentGA(claimRef, 'Miss Jane Doe v Sir John Doe', 'consent');

    console.log('Creating GA app as defendant');
    await I.amOnPage('/dashboard');
    await I.click(claimNumber);
    await createGAAppSteps.askSomethingNotOnListGA(claimRef, 'Miss Jane Doe v Sir John Doe', 'withoutnotice');
  }
});