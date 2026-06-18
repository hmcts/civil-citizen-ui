const config = require('../../../../config');
const {createAccount} = require('../../../specClaimHelpers/api/idamHelper');
const LoginSteps = require('../../../commonFeatures/home/steps/login');
const ResponseToDefenceLipVsLipSteps = require('../../../citizenFeatures/response/steps/responseToDefenceLipvLipSteps');
const { responseToTheClaimClaimant, responseToTheClaimDefendant } = require('../../../specClaimHelpers/dashboardNotificationConstants');
const { verifyNotificationTitleAndContent } = require('../../../specClaimHelpers/e2e/dashboardHelper');
// eslint-disable-next-line no-unused-vars
const yesIWantMoretime = 'yesIWantMoretime';

let claimType, claimantName, defendantName;

Feature('Response with RejectAll-DisputeAll - Small Claims & Fast Track').tag('@civil-citizen-nightly @ui-reject-all');

Scenario('Response with RejectAll-DisputeAll Small claims', async ({ api, I }) => {
  await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  claimType = 'SmallClaims';
  const claimRef = await api.createLiPClaim(config.claimantCitizenUser, claimType);
  const caseData = await api.retrieveCaseData(config.adminUser, claimRef);
  claimantName = await caseData.applicant1.partyName;
  defendantName = await caseData.respondent1.partyName;
  const claimNumber = await caseData.legacyCaseReference;
  await api.performCitizenResponse(config.defendantCitizenUser, claimRef, claimType, config.defenceType.rejectAllDisputeAllWithIndividual);
  await api.waitForFinishedBusinessProcess();
  await LoginSteps.EnterCitizenCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  const responseToTheClaimDefendantNotif = responseToTheClaimDefendant(claimantName);
  await verifyNotificationTitleAndContent(claimNumber, responseToTheClaimDefendantNotif.title, responseToTheClaimDefendantNotif.content);
  await I.click(responseToTheClaimDefendantNotif.nextSteps);
  await I.see('View the response to the claim', 'h1');
  await I.click('Sign out');
  await I.wait(1);
  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  const responseToTheClaimClaimantNotif = responseToTheClaimClaimant(defendantName);
  await verifyNotificationTitleAndContent(claimNumber, responseToTheClaimClaimantNotif.title, responseToTheClaimClaimantNotif.content);
  await I.click(responseToTheClaimClaimantNotif.nextSteps);
  await I.see('The defendant’s response', 'h1');  
  await ResponseToDefenceLipVsLipSteps.ResponseToDefenceStepsAsAnAcceptanceOfFullDefenceDisputeAll(claimRef, claimNumber);
  await api.waitForFinishedBusinessProcess();
});

Scenario('Response with RejectAll-DisputeAll Fast Track', async ({api}) => {
  await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  claimType = 'FastTrack';
  const claimRef = await api.createLiPClaim(config.claimantCitizenUser, claimType);
  const caseData = await api.retrieveCaseData(config.adminUser, claimRef);
  const claimNumber = await caseData.legacyCaseReference;
  await api.performCitizenResponse(config.defendantCitizenUser, claimRef, claimType, config.defenceType.rejectAllDisputeAllWithIndividual);
  await api.waitForFinishedBusinessProcess();
  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await ResponseToDefenceLipVsLipSteps.ResponseToDefenceStepsAsAnRejectionOfFullDefenceDisputeAll(claimRef, claimNumber);
  await api.waitForFinishedBusinessProcess();
}).tag('@civil-citizen-master @civil-citizen-pr');
