const config = require('../../config');
const CaseProgressionSteps = require('../features/caseProgression/steps/caseProgressionSteps');
const LoginSteps = require('../features/home/steps/login');
const {createAccount} = require('./../specClaimHelpers/api/idamHelper');

const claimType = 'SmallClaims';
let claimRef;

Feature('Case progression - Case Struck Out journey - Small Claims');

Before(async ({api}) => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
    claimRef = await api.createSpecifiedClaim(config.applicantSolicitorUser, '', claimType);
    await api.performCitizenResponse(config.defendantCitizenUser, claimRef, claimType, config.defenceType.rejectAllDisputeAllWithIndividual);
    await api.viewAndRespondToDefence(config.applicantSolicitorUser, config.defenceType.rejectAll, 'JUDICIAL_REFERRAL', 'SMALL_CLAIM');
    await api.performCaseProgressedToSDO(config.judgeUserWithRegionId1, claimRef, 'smallClaimsTrack');
    await api.performCaseProgressedToHearingInitiated(config.hearingCenterAdminWithRegionId1, claimRef);
    await api.performCaseHearingFeeUnpaid(config.hearingCenterAdminWithRegionId1, claimRef);
    await api.waitForFinishedBusinessProcess();
    await LoginSteps.EnterUserCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  }
});

Scenario('Small claims case is struck out due to hearing fee not being paid', async () => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    CaseProgressionSteps.verifyLatestUpdatePageForCaseStruckOut(claimRef, claimType);
  }
}).tag('@regression-cp');

