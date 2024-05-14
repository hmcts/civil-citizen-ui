const config = require('../../../config');
const {createAccount} = require('../../specClaimHelpers/api/idamHelper');

const claimType = 'SmallClaims';
const carmEnabled = true;
let claimRef;

let mediationAdmin = config.localMediationTests ? config.hearingCenterAdminLocal : config.caseWorker;

Feature('LiP - CARM - Mediation Journey');

Before(async () => {
  if (['preview', 'demo'  ].includes(config.runningEnv)) {
    await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
    await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  }
});

// LiP Individual vs LiP Company
Scenario('LiP vs LiP Unsuccessful Mediation with Upload Documents', async ({api}) => {
  if (['preview', 'demo'  ].includes(config.runningEnv)) {
    claimRef = await api.createLiPClaim(config.claimantCitizenUser, claimType, carmEnabled, 'DefendantCompany');
    console.log('LIP vs LIP claim has been created Successfully    <===>  '  , claimRef);
    await api.performCitizenResponse(config.defendantCitizenUser, claimRef, claimType, config.defenceType.rejectAllSmallClaimsCarm, 'DefendantCompany');
    await api.claimantLipRespondToDefence(config.claimantCitizenUser, claimRef, true, 'IN_MEDIATION');
    await api.mediationUnsuccessful(mediationAdmin, true);
    await api.uploadMediationDocumentsCui(config.claimantCitizenUser, claimRef);
    await api.uploadMediationDocumentsCui(config.defendantCitizenUser, claimRef);
    await api.waitForFinishedBusinessProcess();
  }
}).tag('@regression-r2');

// LiP Individual vs LiP Sole Trader
Scenario('LiP vs LiP Successful Mediation', async ({api}) => {
  if (['preview', 'demo'  ].includes(config.runningEnv)) {
    claimRef = await api.createLiPClaim(config.claimantCitizenUser, claimType, carmEnabled, 'DefendantSoleTrader');
    console.log('LIP vs LIP claim has been created Successfully    <===>  '  , claimRef);
    await api.performCitizenResponse(config.defendantCitizenUser, claimRef, claimType, config.defenceType.rejectAllSmallClaimsCarm, 'DefendantSoleTrader');
    await api.claimantLipRespondToDefence(config.claimantCitizenUser, claimRef, true, 'IN_MEDIATION');
    await api.mediationSuccessful(mediationAdmin, true);
    await api.waitForFinishedBusinessProcess();
  }
}).tag('@regression-r2');
