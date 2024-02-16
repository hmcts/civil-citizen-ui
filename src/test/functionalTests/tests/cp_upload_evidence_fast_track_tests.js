const config = require('../../config');
const CaseProgressionSteps = require('../features/caseProgression/steps/caseProgressionSteps');
const LoginSteps = require('../features/home/steps/login');
const DateUtilsComponent = require('../features/caseProgression/util/DateUtilsComponent');
const TrialArrangementSteps = require('../features/caseProgression/steps/trialArrangementSteps');
const {unAssignAllUsers} = require('./../specClaimHelpers/api/caseRoleAssignmentHelper');

const claimType = 'FastTrack';
let claimRef;

Feature('Case progression journey - Upload Evidence - Defendant & Claimant Response with RejectAll - Fast Track ');

Before(async ({api}) => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    const fourWeeksFromToday = DateUtilsComponent.DateUtilsComponent.rollDateToCertainWeeks(4);
    claimRef = await api.createSpecifiedClaim(config.applicantSolicitorUser, '', claimType);
    await api.performCitizenResponse(config.defendantCitizenUser, claimRef, claimType);
    await api.viewAndRespondToDefence(config.applicantSolicitorUser, config.defenceType.rejectAll, 'JUDICIAL_REFERRAL', 'FAST_CLAIM');
    await api.performCaseProgressedToSDO(config.judgeUserWithRegionId1, claimRef, 'fastTrack');
    await api.performCaseProgressedToHearingInitiated(config.hearingCenterAdminWithRegionId1, claimRef, DateUtilsComponent.DateUtilsComponent.formatDateToYYYYMMDD(fourWeeksFromToday));
    await api.waitForFinishedBusinessProcess();
    await LoginSteps.EnterUserCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  }
});

Scenario('Fast Track Response with RejectAll and DisputeAll For the Case Progression and Hearing Scheduled Process To Complete',  async ({api}) => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    CaseProgressionSteps.verifyLatestUpdatePageForCaseProgressionState(claimRef, claimType, true);
    //Lip initiates docs
    CaseProgressionSteps.initiateUploadEvidenceJourney(claimRef, claimType);
    await api.performEvidenceUpload(config.applicantSolicitorUser, claimRef, claimType);
    //Lip verifies solicitor docs
    CaseProgressionSteps.verifyDocumentsUploadedBySolicitor(claimRef, claimType);
    await api.performTrialArrangements(config.applicantSolicitorUser, claimRef);
    TrialArrangementSteps.verifyOtherPartyFinalisedTrialArrangementsJourney(claimRef, claimType);
    
  }
}).tag('@regression-cp');

AfterSuite(async  () => {
  await unAssignAllUsers();
});
