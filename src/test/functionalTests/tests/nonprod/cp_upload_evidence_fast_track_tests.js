const config = require('../../../config');
//const CaseProgressionSteps = require('../../citizenFeatures/caseProgression/steps/caseProgressionSteps');
const LoginSteps = require('../../commonFeatures/home/steps/login');
const DateUtilsComponent = require('../../citizenFeatures/caseProgression/util/DateUtilsComponent');
//const TrialArrangementSteps = require('../../citizenFeatures/caseProgression/steps/trialArrangementSteps');
const {createAccount} = require('../../specClaimHelpers/api/idamHelper');

const claimType = 'FastTrack';
let claimRef;

Feature('Case progression journey - Upload Evidence - Defendant & Claimant Response with RejectAll - Fast Track ');

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

Scenario('Fast Track Response with RejectAll and DisputeAll For the Case Progression and Hearing Scheduled Process To Complete',  async () => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    /*CaseProgressionSteps.verifyLatestUpdatePageForCaseProgressionState(claimRef, claimType, true);
    //Lip initiates docs
    CaseProgressionSteps.initiateUploadEvidenceJourney(claimRef, claimType);
    await api.performEvidenceUpload(config.applicantSolicitorUser, claimRef, claimType);
    //Lip verifies solicitor docs
    CaseProgressionSteps.verifyDocumentsUploadedBySolicitor(claimRef, claimType);
    await api.performTrialArrangements(config.applicantSolicitorUser, claimRef);
    TrialArrangementSteps.verifyOtherPartyFinalisedTrialArrangementsJourney(claimRef, claimType);*/

  }
}).tag('@nightly');

