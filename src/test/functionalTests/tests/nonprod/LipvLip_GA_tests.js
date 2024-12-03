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

Scenario('LipvLip GA tests @citizenUI @nightly - @api @ga @regression', async ({I}) => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);

    console.log('Creating GA app as claimant');
    await I.amOnPage('/dashboard');
    await I.click(claimNumber);
    await createGAAppSteps.askToSetAsideJudgementGA(caseRef, 'Mr Claimant person v mr defendant person', 'consent');

    console.log('Creating GA app as claimant');
    await I.amOnPage('/dashboard');
    await I.click(claimNumber);
    await createGAAppSteps.askToVaryAJudgementGA(caseRef, 'Mr Claimant person v mr defendant person', 'consent');

    console.log('Creating GA app as claimant');
    await I.amOnPage('/dashboard');
    await I.click(claimNumber);
    await createGAAppSteps.askCourtToReconsiderAnOrderGA(caseRef, 'Mr Claimant person v mr defendant person', 'consent');

    console.log('Creating GA app as claimant');
    await I.amOnPage('/dashboard');
    await I.click(claimNumber);
    await createGAAppSteps.askToChangeHearingDateGA(caseRef, 'Mr Claimant person v mr defendant person', 'notice');

    console.log('Creating GA app as claimant');
    await I.amOnPage('/dashboard');
    await I.click(claimNumber);
    await createGAAppSteps.askForMoreTimeCourtOrderGA(caseRef, 'Mr Claimant person v mr defendant person', 'notice');

    console.log('Creating GA app as claimant');
    await I.amOnPage('/dashboard');
    await I.click(claimNumber);
    await createGAAppSteps.askForReliefFromAPenaltyGA(caseRef, 'Mr Claimant person v mr defendant person', 'withoutnotice');

    console.log('Creating GA app as claimant');
    await I.amOnPage('/dashboard');
    await I.click(claimNumber);
    await createGAAppSteps.askToChangeSubmittedGA(caseRef, 'Mr Claimant person v mr defendant person', 'withoutnotice');

    await LoginSteps.EnterCitizenCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);

    console.log('Creating GA app as defendant');
    await I.amOnPage('/dashboard');
    await I.click(claimNumber);
    await createGAAppSteps.askCourtSummaryJudgmentGA(caseRef, 'Mr Claimant person v mr defendant person', 'consent');

    console.log('Creating GA app as defendant');
    await I.amOnPage('/dashboard');
    await I.click(claimNumber);
    await createGAAppSteps.askCourtStrikeOutGA(caseRef, 'Mr Claimant person v mr defendant person', 'consent');

    console.log('Creating GA app as defendant');
    await I.amOnPage('/dashboard');
    await I.click(claimNumber);
    await createGAAppSteps.askCourtToPauseClaimGA(caseRef, 'Mr Claimant person v mr defendant person', 'notice');

    console.log('Creating GA app as defendant');
    await I.amOnPage('/dashboard');
    await I.click(claimNumber);
    await createGAAppSteps.askCourtSanction(caseRef, 'Mr Claimant person v mr defendant person', 'notice');

    console.log('Creating GA app as defendant');;
    await I.amOnPage('/dashboard');
    await I.click(claimNumber);
    await createGAAppSteps.askCourtToSettleByConsentGA(caseRef, 'Mr Claimant person v mr defendant person', 'consent');

    console.log('Creating GA app as defendant');
    await I.amOnPage('/dashboard');
    await I.click(claimNumber);
    await createGAAppSteps.askSomethingNotOnListGA(caseRef, 'Mr Claimant person v mr defendant person', 'withoutnotice');
  }
});
