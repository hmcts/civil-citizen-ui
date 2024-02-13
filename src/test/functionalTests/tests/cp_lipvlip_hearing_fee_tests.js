const config = require('../../config');
const LoginSteps = require('../features/home/steps/login');
const HearingFeeSteps = require('../features/caseProgression/steps/hearingFeeSteps');
const {unAssignAllUsers} = require('./../specClaimHelpers/api/caseRoleAssignmentHelper');
const {createAccount, deleteAccount} = require('./../specClaimHelpers/api/idamHelper');

const claimType = 'FastTrack';
let claimRef = '1706889862101079';

Feature('Case progression - Lip v Lip - Hearing Fee journey');

Before(async ({api}) => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    // await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
    // const fourWeeksFromToday = DateUtilsComponent.DateUtilsComponent.rollDateToCertainWeeks(4);
    // claimRef = await api.createSpecifiedClaim(config.applicantSolicitorUser, '', claimType);
    // await api.performCitizenResponse(config.defendantCitizenUser, claimRef, claimType);
    // await api.viewAndRespondToDefence(config.applicantSolicitorUser, config.defenceType.rejectAll, 'JUDICIAL_REFERRAL', 'FAST_CLAIM');
    // await api.performCaseProgressedToSDO(config.judgeUserWithRegionId1, claimRef, 'fastTrack');
    // await api.performCaseProgressedToHearingInitiated(config.hearingCenterAdminWithRegionId1, claimRef, DateUtilsComponent.DateUtilsComponent.formatDateToYYYYMMDD(fourWeeksFromToday));
    await LoginSteps.EnterUserCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  }
});

// Scenario('Apply for Help with Fees Journey.', () => {
//   if (['preview', 'demo'].includes(config.runningEnv)) {
//     HearingFeeSteps.initiateApplyForHelpWithFeesJourney(claimRef, '123', '12 February 2024' );
//   }
// }).tag('@regression');

Scenario('Pay the Hearing Fee Journey.', () => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    HearingFeeSteps.payHearingFeeJourney(claimRef, '123', '14 November 2024');
  }
}).tag('@regression');

// AfterSuite(async  () => {
//   await unAssignAllUsers();
//   await deleteAccount(config.defendantCitizenUser.email);
// });
