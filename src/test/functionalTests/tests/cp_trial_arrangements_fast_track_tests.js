const config = require('../../config');
const LoginSteps = require('../features/home/steps/login');
const DateUtilsComponent = require('../features/caseProgression/util/DateUtilsComponent');

const claimType = 'FastTrack';
let claimRef;

Feature('Case progression journey - Upload Evidence - Fast Track - Defendant & Claimant Response with RejectAll');

Before(async ({api}) => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    const fourWeeksFroToday = DateUtilsComponent.DateUtilsComponent.rollDateToCertainWeeks(4);
    claimRef = await api.createSpecifiedClaim(config.applicantSolicitorUser, '', claimType);
    await api.performCitizenResponse(config.defendantCitizenUser, claimRef, claimType);
    await api.viewAndRespondToDefence(config.applicantSolicitorUser, config.defenceType.rejectAll, 'JUDICIAL_REFERRAL');
    await api.performCaseProgressedToSDO(config.judgeUserWithRegionId1, claimRef);
    await api.performCaseProgressedToHearingInitiated(config.hearingCenterAdminWithRegionId1, claimRef, DateUtilsComponent.DateUtilsComponent.formatDateToYYYYMMDD(fourWeeksFroToday));
    await LoginSteps.EnterUserCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  }
});

Scenario('Fast Track Response with RejectAll and DisputeAll For the Case Progression and Hearing Scheduled Process To Complete', () => {
}).tag('@regression');
