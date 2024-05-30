const config = require('../../../config');
const {createAccount} = require('../../specClaimHelpers/api/idamHelper');

const claimType = 'SmallClaims';
const carmEnabled = true;
let claimRef;

let mediationAdmin = config.localMediationTests ? config.hearingCenterAdminLocal : config.caseWorker;

Feature('LR - CARM - Mediation Journey');

Before(async () => {
  if (['preview', 'demo'  ].includes(config.runningEnv)) {
    await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
    await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  }
});

// LR Individual vs LiP Organisation
Scenario('LR vs LiP Unsuccessful Mediation with Upload Documents', async ({api, noc}) => {
  if (['preview', 'demo'  ].includes(config.runningEnv)) {
    claimRef = await api.createLiPClaim(config.claimantCitizenUser, claimType, carmEnabled, 'IndividualVOrganisation');
    console.log('LIP vs LIP claim has been created Successfully    <===>  '  , claimRef);
    await noc.requestNoticeOfChangeForApplicant1Solicitor(claimRef, config.applicantSolicitorUser);
    await api.checkUserCaseAccess(config.claimantCitizenUser, false);
    await api.checkUserCaseAccess(config.applicantSolicitorUser, true);
    await api.performCitizenResponse(config.defendantCitizenUser, claimRef, claimType, config.defenceType.rejectAllSmallClaimsCarm, 'DefendantOrganisation');
    await api.claimantLrRespondToDefence(config.applicantSolicitorUser, claimRef, 'IN_MEDIATION');
    await api.mediationUnsuccessful(mediationAdmin, true, ['NOT_CONTACTABLE_CLAIMANT_ONE', 'NOT_CONTACTABLE_DEFENDANT_ONE']);
    await api.uploadMediationDocumentsExui(config.applicantSolicitorUser, claimRef);
    await api.uploadMediationDocumentsCui(config.defendantCitizenUser, claimRef);
    await api.waitForFinishedBusinessProcess();
  }
}).tag('@regression-carm');

// LiP Sole Trader vs LR Company
Scenario('LiP vs LR Unsuccessful Mediation with Upload Documents', async ({api, noc}) => {
  if (['preview', 'demo'  ].includes(config.runningEnv)) {
    claimRef = await api.createLiPClaim(config.claimantCitizenUser, claimType, carmEnabled, 'SoleTraderVCompany');
    console.log('LIP vs LiP claim has been created Successfully    <===>  '  , claimRef);
    await noc.requestNoticeOfChangeForRespondent1Solicitor(claimRef, config.defendantSolicitorUser);
    await api.checkUserCaseAccess(config.defendantCitizenUser, false);
    await api.checkUserCaseAccess(config.defendantSolicitorUser, true);
    await api.performLrResponse(config.defendantSolicitorUser, claimRef, claimType, config.defenceType.rejectAllSmallClaimsCarm, 'SoleTraderVCompany');
    await api.claimantLipRespondToDefence(config.claimantCitizenUser, claimRef, true, 'IN_MEDIATION');
    await api.mediationUnsuccessful(mediationAdmin, true, ['NOT_CONTACTABLE_CLAIMANT_ONE', 'NOT_CONTACTABLE_DEFENDANT_ONE']);
    await api.uploadMediationDocumentsCui(config.claimantCitizenUser, claimRef);
    await api.uploadMediationDocumentsExui(config.defendantSolicitorUser);
    await api.waitForFinishedBusinessProcess();
  }
}).tag('@regression-carm');
