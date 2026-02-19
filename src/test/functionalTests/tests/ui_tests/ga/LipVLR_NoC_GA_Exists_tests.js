const config = require('../../../../config');
const {createAccount} = require('../../../specClaimHelpers/api/idamHelper');
const LoginSteps = require('../../../commonFeatures/home/steps/login');
const createGASteps = require('../../../citizenFeatures/GA/steps/createGASteps');
const nocSteps = require('../../../lrFeatures/noc/steps/nocSteps');
const {nocForLip} = require('../../../specClaimHelpers/dashboardNotificationConstants');
const {verifyNotificationTitleAndContent} = require('../../../specClaimHelpers/e2e/dashboardHelper');

let claimRef, claimType, caseData, legacyCaseReference, defendantName;

Feature('Lip v Lip with GA and perform NoC').tag('@civil-citizen-nightly @ui-ga @ui-noc');

Before(async ({api}) => {
  await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);

  claimType = 'FastTrack';
  claimRef = await api.createLiPClaim(config.claimantCitizenUser, claimType);
  caseData = await api.retrieveCaseData(config.adminUser, claimRef);
  legacyCaseReference = await caseData.legacyCaseReference;
  defendantName = await caseData.respondent1.partyName;

  await api.assignToLipDefendant(claimRef);
  await api.waitForFinishedBusinessProcess();
});

Scenario('LipvLip Applicant creates GA and perform NoC', async ({I, api}) => {
  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);

  console.log('Creating set aside GA app as claimant');
  await I.amOnPage('/dashboard');
  await I.click(legacyCaseReference);
  await createGASteps.askToSetAsideJudgementGA(claimRef, 'Miss Jane Doe v Sir John Doe', 'consent');

  //Perform NoC
  await nocSteps.requestNoticeOfChangeForRespondent1Solicitor(claimRef, defendantName, config.defendantSolicitorUser);
  await api.checkUserCaseAccess(config.defendantCitizenUser, false);
  await api.checkUserCaseAccess(config.defendantSolicitorUser, true);

  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await I.amOnPage('/dashboard');
  await I.click(legacyCaseReference);

  const nocForLipNotif = nocForLip(defendantName);
  await verifyNotificationTitleAndContent(legacyCaseReference, nocForLipNotif.title, nocForLipNotif.content);
  await I.click(nocForLipNotif.nextSteps);
});

Scenario('LipvLip Defendant creates GA and perform NoC', async ({I, api}) => {
  await LoginSteps.EnterCitizenCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);

  console.log('Creating pause claim GA app as defendant');
  await I.amOnPage('/dashboard');
  await I.click(legacyCaseReference);
  await createGASteps.askCourtToPauseClaimGA(claimRef, 'Miss Jane Doe v Sir John Doe', 'notice');

  //Perform NoC
  await nocSteps.requestNoticeOfChangeForRespondent1Solicitor(claimRef, defendantName, config.defendantSolicitorUser);
  await api.checkUserCaseAccess(config.defendantCitizenUser, false);
  await api.checkUserCaseAccess(config.defendantSolicitorUser, true);

  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await I.amOnPage('/dashboard');
  await I.click(legacyCaseReference);

  const nocForLipNotif = nocForLip(defendantName);
  await verifyNotificationTitleAndContent(legacyCaseReference, nocForLipNotif.title, nocForLipNotif.content);
  await I.click(nocForLipNotif.nextSteps);
});
