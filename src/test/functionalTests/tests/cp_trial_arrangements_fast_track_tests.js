const config = require('../../config');
const LoginSteps = require('../features/home/steps/login');
const DateUtilsComponent = require('../features/caseProgression/util/DateUtilsComponent');
const TrialArrangementSteps = require('../features/caseProgression/steps/trialArrangementSteps');
const {unAssignAllUsers} = require('./../specClaimHelpers/api/caseRoleAssignmentHelper');

const claimType = 'FastTrack';
let claimRef;

Feature('Case progression - Trial Arrangements journey - Fast Track');

Before(async ({api}) => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    const fourWeeksFromToday = DateUtilsComponent.DateUtilsComponent.rollDateToCertainWeeks(4);
    claimRef = await api.createSpecifiedClaim(config.applicantSolicitorUser, '', claimType);
    await api.performCitizenResponse(config.defendantCitizenUser, claimRef, claimType);
    await api.viewAndRespondToDefence(config.applicantSolicitorUser, config.defenceType.rejectAll, 'JUDICIAL_REFERRAL');
    await api.performCaseProgressedToSDO(config.judgeUserWithRegionId1, claimRef);
    await api.performCaseProgressedToHearingInitiated(config.hearingCenterAdminWithRegionId1, claimRef, DateUtilsComponent.DateUtilsComponent.formatDateToYYYYMMDD(fourWeeksFromToday));
    await LoginSteps.EnterUserCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  }
});

Scenario('Fast Track Trial Arrangements - not ready for Trial Journey.', () => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    TrialArrangementSteps.initiateTrialArrangementJourney(claimRef, claimType, 'no');
  }
}).tag('@disabled');

Scenario('Fast Track Trial Arrangements - ready for Trial Journey.', () => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    TrialArrangementSteps.initiateTrialArrangementJourney(claimRef, claimType, 'yes');
  }
}).tag('@disabled');

AfterSuite(async  () => {
  await unAssignAllUsers();
});
