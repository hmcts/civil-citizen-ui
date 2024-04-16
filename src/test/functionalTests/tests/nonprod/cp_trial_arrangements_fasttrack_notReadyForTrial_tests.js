const config = require('../../../config');
const LoginSteps = require('../../commonFeatures/home/steps/login');
const DateUtilsComponent = require('../../citizenFeatures/caseProgression/util/DateUtilsComponent');
const TrialArrangementSteps = require('../../citizenFeatures/caseProgression/steps/trialArrangementSteps');
const {createAccount} = require('../../specClaimHelpers/api/idamHelper');

const claimType = 'FastTrack';
let claimRef;

Feature('Case progression - Trial Arrangements journey - Fast Track - not ready for Trial Journey');

Before(async ({api}) => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
    const fourWeeksFromToday = DateUtilsComponent.DateUtilsComponent.rollDateToCertainWeeks(4);
    claimRef = await api.createSpecifiedClaim(config.applicantSolicitorUser, '', claimType);
    await api.performCitizenResponse(config.defendantCitizenUser, claimRef, claimType, config.defenceType.rejectAllDisputeAllWithIndividual);
    await api.viewAndRespondToDefence(config.applicantSolicitorUser, config.defenceType.rejectAll, 'JUDICIAL_REFERRAL', 'FAST_CLAIM');
    await api.performCaseProgressedToSDO(config.judgeUserWithRegionId1, claimRef, 'fastTrack');
    await api.performCaseProgressedToHearingInitiated(config.hearingCenterAdminWithRegionId1, claimRef, DateUtilsComponent.DateUtilsComponent.formatDateToYYYYMMDD(fourWeeksFromToday));
    await api.waitForFinishedBusinessProcess();
    await LoginSteps.EnterCitizenCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  }
});

//Bug CIV-12591
Scenario('Fast Track Trial Arrangements - not ready for Trial Journey.', async ({api}) => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    TrialArrangementSteps.initiateTrialArrangementJourney(claimRef, claimType, 'no');
    await api.waitForFinishedBusinessProcess();
    TrialArrangementSteps.verifyTrialArrangementsMade();
  }
}).tag('@regression-cp');

