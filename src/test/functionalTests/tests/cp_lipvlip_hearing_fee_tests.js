const config = require('../../config');
const LoginSteps = require('../features/home/steps/login');
const HearingFeeSteps = require('../features/caseProgression/steps/hearingFeeSteps');
const DateUtilsComponent = require('../features/caseProgression/util/DateUtilsComponent');
const {unAssignAllUsers} = require('./../specClaimHelpers/api/caseRoleAssignmentHelper');
const {createAccount, deleteAccount} = require('./../specClaimHelpers/api/idamHelper');
const DashboardSteps = require('../features/dashboard/steps/dashboard');

// eslint-disable-next-line no-unused-vars
let caseData;
let claimNumber;
const claimType = 'FastTrack';
let claimRef;

Feature('Case progression - Lip v Lip - Hearing Fee journey');

Before(async ({api}) => {
  if (['preview', 'demo'].includes(config.runningEnv)) {

    claimNumber = await api.createLiPClaim(config.claimantCitizenUser);
    caseData = await api.retrieveCaseData(config.adminUser, claimNumber);
    claimRef = await caseData.legacyCaseReference;
    await LoginSteps.EnterUserCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
    await DashboardSteps.VerifyClaimOnDashboard(claimNumber);

    await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
    const fourWeeksFromToday = DateUtilsComponent.DateUtilsComponent.rollDateToCertainWeeks(4);
    claimRef = await api.createSpecifiedClaim(config.applicantSolicitorUser, '', claimType);
    await api.performCitizenResponse(config.defendantCitizenUser, claimRef, claimType);
    await api.viewAndRespondToDefence(config.applicantSolicitorUser, config.defenceType.rejectAll, 'JUDICIAL_REFERRAL', 'FAST_CLAIM');
    await api.performCaseProgressedToSDO(config.judgeUserWithRegionId1, claimRef, 'fastTrack');
    await api.performCaseProgressedToHearingInitiated(config.hearingCenterAdminWithRegionId1, claimRef, DateUtilsComponent.DateUtilsComponent.formatDateToYYYYMMDD(fourWeeksFromToday));

    await LoginSteps.EnterUserCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  }
});

Scenario('Apply for Help with Fees Journey.', () => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    HearingFeeSteps.initiateApplyForHelpWithFeesJourney(claimRef, '123', '12 February 2024' );
  }
}).tag('@regression');

Scenario('Pay the Hearing Fee Journey.', () => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    HearingFeeSteps.payHearingFeeJourney(claimRef, '123', '14 November 2024');
  }
}).tag('@regression');

AfterSuite(async  () => {
  await unAssignAllUsers();
  await deleteAccount(config.defendantCitizenUser.email);
});
