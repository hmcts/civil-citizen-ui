const config = require('../../../config');
const {createAccount} = require('../../specClaimHelpers/api/idamHelper');
const LoginSteps = require('../../commonFeatures/home/steps/login');
const createGAAppSteps = require('../../citizenFeatures/response/steps/createGAAppSteps');
// eslint-disable-next-line no-unused-vars

let claimRef, claimType, caseData, claimNumber;

Feature('Lip v Lip GA Creation Tests');

Before(async ({api}) => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
    
    claimType = 'FastTrack';
    claimRef = await api.createSpecifiedClaim(config.applicantSolicitorUser, null, claimType);
    caseData = await api.retrieveCaseData(config.adminUser, claimRef);
    claimNumber = await caseData.legacyCaseReference;

    await api.assignToLipDefendant(claimRef);
    await api.waitForFinishedBusinessProcess();
  }
});

Scenario('LipvLR Defendant GA creation tests @citizenUI @nightly - @api @ga @regression @debug', async ({I}) => {
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