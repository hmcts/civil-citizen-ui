const config = require('../../../config');
const LoginSteps = require('../../commonFeatures/home/steps/login');
const DateUtilsComponent = require('../../citizenFeatures/caseProgression/util/DateUtilsComponent');
//const TrialArrangementSteps = require('../../citizenFeatures/caseProgression/steps/trialArrangementSteps');
const {createAccount} = require('../../specClaimHelpers/api/idamHelper');

const claimType = 'FastTrack';
let claimRef;

Feature('Case progression - Latest Update Trial Arrangements journey - Fast Track');

Before(async ({api}) => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
    const fourWeeksFromToday = DateUtilsComponent.DateUtilsComponent.rollDateToCertainWeeks(4);
    claimRef = await api.createSpecifiedClaim(config.applicantSolicitorUser, '', claimType);
    await api.performCitizenResponse(config.defendantCitizenUser, claimRef, claimType, config.defenceType.rejectAllDisputeAllWithIndividual);
    await api.viewAndRespondToDefence(config.applicantSolicitorUser, config.defenceType.rejectAll, 'JUDICIAL_REFERRAL', 'FAST_CLAIM');
    await api.performCaseProgressedToSDO(config.judgeUserWithRegionId1, claimRef, 'fastTrack');
    await api.performCaseProgressedToHearingInitiated(config.hearingCenterAdminWithRegionId1, claimRef, DateUtilsComponent.DateUtilsComponent.formatDateToYYYYMMDD(fourWeeksFromToday));
    await api.performTrialArrangements(config.applicantSolicitorUser, claimRef);
    await api.waitForFinishedBusinessProcess();
    await LoginSteps.EnterCitizenCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  }
});

//covered in cp_upload_evidence_small_claims_tests
Scenario('Fast Track Other Party Trial Arrangements Journey.', async () => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    //TrialArrangementSteps.verifyOtherPartyFinalisedTrialArrangementsJourney(claimRef, claimType);
  }
});

