const config = require('../../../../config');
const {createAccount} = require('../../../specClaimHelpers/api/idamHelper');
const LoginSteps = require('../../../commonFeatures/home/steps/login');
const createGASteps = require('../../../citizenFeatures/GA/steps/createGASteps');
// eslint-disable-next-line no-unused-vars

let claimRef, caseData, claimNumber;

Feature('LR v Lip GA Creation Tests').tag('@nightly-prod @ga');

Before(async ({api}) => {
  await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  
  claimRef = await api.createSpecifiedClaim(config.applicantSolicitorUser);
  caseData = await api.retrieveCaseData(config.adminUser, claimRef);
  claimNumber = await caseData.legacyCaseReference;

  await api.assignToLipDefendant(claimRef);
  await api.waitForFinishedBusinessProcess();
});

Scenario('LRvLip Defendant GA creation tests', async ({I}) => {
  await LoginSteps.EnterCitizenCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);

  console.log('Creating summary judgment GA app as defendant');
  await I.amOnPage('/dashboard');
  await I.click(claimNumber);
  await createGASteps.askCourtSummaryJudgmentGA(claimRef, 'Test Inc v Sir John Doe', 'consent');

  console.log('Creating strike out GA app as defendant');
  await createGASteps.askCourtStrikeOutGA(claimRef, 'Test Inc v Sir John Doe', 'consent');

  console.log('Creating pause claim GA app as defendant');
  await createGASteps.askCourtToPauseClaimGA(claimRef, 'Test Inc v Sir John Doe', 'notice');

  console.log('Creating impose a sanction GA app as defendant');
  await createGASteps.askCourtSanctionGA(claimRef, 'Test Inc v Sir John Doe', 'notice');

  console.log('Creating settle by consent GA app as defendant');
  await createGASteps.askCourtToSettleByConsentGA(claimRef, 'Test Inc v Sir John Doe', 'consent');

  console.log('Creating not on list GA app as defendant');
  await createGASteps.askSomethingNotOnListGA(claimRef, 'Test Inc v Sir John Doe', 'withoutnotice');
});