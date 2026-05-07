const config = require('../../../../config');
const LoginSteps = require('../../../commonFeatures/home/steps/login');
const {createAccount} = require('../../../specClaimHelpers/api/idamHelper');
const ClaimantResponseSteps = require('../../../citizenFeatures/response/steps/lipClaimantResponseSteps');

const claimType = 'SmallClaims';
// eslint-disable-next-line no-unused-vars
let claimRef, caseData, claimNumber;

Feature('LiP v LiP - Judgment Buffer (Judgment Requested state)').tag('@ui-judgment-buffer');

Scenario('Claimant requests CCJ on LiP-vs-LiP, lands on new buffer screen, both parties retain full options', async ({I, api}) => {
  // Setup - LiP v LiP small claim, defendant deadline rolled forward, no defence submitted
  await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  claimRef = await api.createLiPClaim(config.claimantCitizenUser, claimType);
  caseData = await api.retrieveCaseData(config.adminUser, claimRef);
  claimNumber = await caseData.legacyCaseReference;
  await api.amendRespondent1ResponseDeadline(config.systemUpdate2);

  // AC1 (DTSCCI-5058) - claimant requests CCJ, sees new buffer confirmation banner
  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await ClaimantResponseSteps.verifyDefaultJudgmentBuffer(claimRef);
  await api.waitForFinishedBusinessProcess();

  // AC2 (DTSCCI-5058) - claimant signs out and back in, case still accessible from dashboard
  await I.click('Sign out');
  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await I.amOnPage('/dashboard');
  await I.see(claimNumber);

  // AC3 (DTSCCI-5058) - defendant signs in and can still submit a response while case is in JUDGMENT_REQUESTED
  await I.click('Sign out');
  await LoginSteps.EnterCitizenCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  await api.performCitizenResponse(config.defendantCitizenUser, claimRef, claimType, config.defenceType.rejectAllDisputeAllWithIndividual);
  await api.waitForFinishedBusinessProcess();
});
