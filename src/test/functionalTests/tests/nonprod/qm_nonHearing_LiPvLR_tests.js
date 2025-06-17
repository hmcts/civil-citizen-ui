const config = require('../../../config');
const { createAccount } = require('../../specClaimHelpers/api/idamHelper');

let claimRef, caseData, claimNumber;

Feature('QM - LIP - Claimant and Defendant Journey - Non Hearing @regression-qm');

const claimType = 'SmallClaims';
const carmEnabled = true;
// const mediationAdmin = config.localMediationTests ? config.hearingCenterAdminLocal : config.caseWorker;

Before(async () => {
  await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
});

Scenario.only('LR v LIP Query Management', async ({ api, qmApi, noc}) => {
  claimRef = await api.createLiPClaim(config.claimantCitizenUser, claimType, carmEnabled, 'IndividualVOrganisation');
  await api.setCaseId(claimRef);
  await api.waitForFinishedBusinessProcess();
  caseData = await api.retrieveCaseData(config.adminUser, claimRef);
  claimNumber = caseData.legacyCaseReference;
  console.log('claim number', claimNumber);
  await noc.requestNoticeOfChangeForApplicant1Solicitor(claimRef, config.applicantSolicitorUser);
  // await api.performCitizenResponse(config.defendantCitizenUser, claimRef, claimType, config.defenceType.rejectAllSmallClaimsCarm, 'DefendantOrganisation');
  // await api.claimantLrRespondToDefence(config.applicantSolicitorUser, claimRef, 'IN_MEDIATION');
  // await api.mediationUnsuccessful(mediationAdmin, true, ['NOT_CONTACTABLE_DEFENDANT_ONE']);
  await api.waitForFinishedBusinessProcess();
});

