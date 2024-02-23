const config = require('../../config');
const CaseProgressionSteps = require('../features/caseProgression/steps/caseProgressionSteps');
const DateUtilsComponent = require('../features/caseProgression/util/DateUtilsComponent');
const LoginSteps = require('../features/home/steps/login');
const {createAccount} = require('./../specClaimHelpers/api/idamHelper');

const claimType = 'FastTrack';
let claimRef;

Feature('Case progression journey - Verify Bundle - Fast Track ');

Before(async ({api}) => {
  if (['demo'].includes(config.runningEnv)) {
    await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
    const twoWeeksFromToday = DateUtilsComponent.DateUtilsComponent.rollDateToCertainWeeks(2);
    claimRef = await api.createSpecifiedClaim(config.applicantSolicitorUser, '', claimType);
    await LoginSteps.EnterUserCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
    await api.performCitizenResponse(config.defendantCitizenUser, claimRef, claimType);
    await api.viewAndRespondToDefence(config.applicantSolicitorUser, config.defenceType.rejectAll, 'JUDICIAL_REFERRAL', 'FAST_CLAIM');
    await api.performCaseProgressedToSDO(config.judgeUserWithRegionId1, claimRef,'fastTrack');
    await api.performCaseProgressedToHearingInitiated(config.hearingCenterAdminWithRegionId1, claimRef, DateUtilsComponent.DateUtilsComponent.formatDateToYYYYMMDD(twoWeeksFromToday));
    await api.performEvidenceUpload(config.applicantSolicitorUser, claimRef, claimType);
    await api.performBundleGeneration(config.hearingCenterAdminWithRegionId1, claimRef);
    await api.waitForFinishedBusinessProcess();
  }
});

Scenario('Case progression journey - Fast Track - Verify Bundles tab', async () => {
  if (['demo'].includes(config.runningEnv)) {
    CaseProgressionSteps.verifyBundle(claimRef, claimType);
  }
}).tag('@regression-cp');
