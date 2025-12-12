const config = require('../../../../config');
const {createAccount} = require('../../../specClaimHelpers/api/idamHelper');
const LoginSteps = require('../../../commonFeatures/home/steps/login');
const createGASteps = require('../../../citizenFeatures/GA/steps/createGASteps');

let claimRef, claimType, caseData, claimNumber;

Feature('Lip v Lip GA Creation Tests').tag('@nightly-prod @ga');

Before(async ({api}) => {
  await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);

  claimType = 'FastTrack';
  claimRef = await api.createLiPClaim(config.claimantCitizenUser, claimType);
  caseData = await api.retrieveCaseData(config.adminUser, claimRef);
  claimNumber = await caseData.legacyCaseReference;

  await api.assignToLipDefendant(claimRef);
  await api.waitForFinishedBusinessProcess();
});

Scenario('LipvLip Applicant GA creation tests', async ({I}) => {
  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);

  console.log('Creating set aside GA app as claimant');
  await I.amOnPage('/dashboard');
  await I.click(claimNumber);
  await createGASteps.askToSetAsideJudgementGA(claimRef, 'Miss Jane Doe v Sir John Doe', 'consent');

  console.log('Creating vary a judgment GA app as claimant');
  await createGASteps.askToVaryAJudgementGA(claimRef, 'Miss Jane Doe v Sir John Doe', 'consent');

  console.log('Creating court to reconsider an order GA app as claimant');
  await createGASteps.askCourtToReconsiderAnOrderGA(claimRef, 'Miss Jane Doe v Sir John Doe', 'consent');

  console.log('Creating change hearing date GA app as claimant');
  await createGASteps.askToChangeHearingDateGA(claimRef, 'Miss Jane Doe v Sir John Doe', 'notice');

  console.log('Creating more time to do order GA app as claimant');
  await createGASteps.askForMoreTimeCourtOrderGA(claimRef, 'Miss Jane Doe v Sir John Doe', 'notice');

  console.log('Creating relief from penalty GA app as claimant');
  await createGASteps.askForReliefFromAPenaltyGA(claimRef, 'Miss Jane Doe v Sir John Doe', 'withoutnotice');

  console.log('Creating change claim or defence GA app as claimant');
  await createGASteps.askToChangeSubmittedGA(claimRef, 'Miss Jane Doe v Sir John Doe', 'withoutnotice');

  console.log('Creating multiple applications as claimant');
  await createGASteps.createMultipleApplications(claimRef, 'Miss Jane Doe v Sir John Doe', 'consent');
});

Scenario('LipvLip Defendant GA creation tests', async ({I}) => {
  await LoginSteps.EnterCitizenCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);

  console.log('Creating summary judgment GA app as defendant');
  await I.amOnPage('/dashboard');
  await I.click(claimNumber);
  await createGASteps.askCourtSummaryJudgmentGA(claimRef, 'Miss Jane Doe v Sir John Doe', 'consent');

  console.log('Creating strike out GA app as defendant');
  await createGASteps.askCourtStrikeOutGA(claimRef, 'Miss Jane Doe v Sir John Doe', 'consent');

  console.log('Creating pause claim GA app as defendant');
  await createGASteps.askCourtToPauseClaimGA(claimRef, 'Miss Jane Doe v Sir John Doe', 'notice');

  console.log('Creating impose a sanction GA app as defendant');
  await createGASteps.askCourtSanctionGA(claimRef, 'Miss Jane Doe v Sir John Doe', 'notice');

  console.log('Creating settle by consent GA app as defendant');
  await createGASteps.askCourtToSettleByConsentGA(claimRef, 'Miss Jane Doe v Sir John Doe', 'consent');

  console.log('Creating not on list GA app as defendant');
  await createGASteps.askSomethingNotOnListGA(claimRef, 'Miss Jane Doe v Sir John Doe', 'withoutnotice');
});
