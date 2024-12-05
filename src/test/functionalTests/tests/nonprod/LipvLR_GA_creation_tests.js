const config = require('../../../config');
const {createAccount} = require('../../specClaimHelpers/api/idamHelper');
const LoginSteps = require('../../commonFeatures/home/steps/login');
const createGAAppSteps = require('../../citizenFeatures/response/steps/createGAAppSteps');
// eslint-disable-next-line no-unused-vars

let claimRef, caseData, claimNumber;

Feature('Lip v Lip GA Creation Tests');

Before(async ({api}) => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
    
    claimRef = await api.createSpecifiedClaim(config.applicantSolicitorUser);
    caseData = await api.retrieveCaseData(config.adminUser, claimRef);
    claimNumber = await caseData.legacyCaseReference;

    await api.assignToLipDefendant(claimRef);
    await api.waitForFinishedBusinessProcess();
  }
});

Scenario('LipvLR Defendant GA creation tests @citizenUI @nightly - @api @ga @regression', async ({I}) => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    await LoginSteps.EnterCitizenCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);

    console.log('Creating summary judgment GA app as defendant');
    await I.amOnPage('/dashboard');
    await I.click(claimNumber);
    await createGAAppSteps.askCourtSummaryJudgmentGA(claimRef, 'Test Inc v Sir John Doe', 'consent');

    console.log('Creating strike out GA app as defendant');
    await createGAAppSteps.askCourtStrikeOutGA(claimRef, 'Test Inc v Sir John Doe', 'consent');

    console.log('Creating pause claim GA app as defendant');
    await createGAAppSteps.askCourtToPauseClaimGA(claimRef, 'Test Inc v Sir John Doe', 'notice');

    console.log('Creating impose a sanction GA app as defendant');
    await createGAAppSteps.askCourtSanctionGA(claimRef, 'Test Inc v Sir John Doe', 'notice');

    console.log('Creating settle by consent GA app as defendant');
    await createGAAppSteps.askCourtToSettleByConsentGA(claimRef, 'Test Inc v Sir John Doe', 'consent');

    console.log('Creating not on list GA app as defendant');
    await createGAAppSteps.askSomethingNotOnListGA(claimRef, 'Test Inc v Sir John Doe', 'withoutnotice');
  }
});