const config = require('../../../../config');
const {createAccount} = require('../../../specClaimHelpers/api/idamHelper');

const intTrackClaimType = 'Intermediate';
const carmEnabled = true;
let claimRef, caseData, claimNumber, securityCode;

Feature('LiP - Minti Intermediate').tag('@ui-nightly-prod');

Before(async () => {
  await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
});

// LiP Individual vs LiP Company
Scenario('LiP vs LiP Intermediate claim', async ({api}) => {
  claimRef = await api.createLiPClaim(config.claimantCitizenUser, intTrackClaimType, carmEnabled, 'DefendantCompany');
  console.log('LIP vs LIP claim has been created Successfully    <===>  ', claimRef);
  await api.setCaseId(claimRef);
  await api.waitForFinishedBusinessProcess();
  caseData = await api.retrieveCaseData(config.adminUser, claimRef);
  claimNumber = caseData.legacyCaseReference;
  securityCode = caseData.respondent1PinToPostLRspec.accessCode;
  console.log('claim number', claimNumber);
  console.log('Security code', securityCode);
  await api.performCitizenResponse(config.defendantCitizenUser, claimRef, intTrackClaimType, config.defenceType.rejectAllIntermediateTrackMinti, 'DefendantCompany');
  await api.claimantLipRespondToDefence(config.claimantCitizenUser, claimRef, true, 'AWAITING_APPLICANT_INTENTION', intTrackClaimType);
});
