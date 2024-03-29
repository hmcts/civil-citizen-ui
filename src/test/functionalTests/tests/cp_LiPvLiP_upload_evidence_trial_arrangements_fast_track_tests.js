const config = require('../../config');
const CaseProgressionSteps = require('../features/caseProgression/steps/caseProgressionSteps');
const LoginSteps = require('../features/home/steps/login');
const DateUtilsComponent = require('../features/caseProgression/util/DateUtilsComponent');
const TrialArrangementSteps = require('../features/caseProgression/steps/trialArrangementSteps');
const {createAccount} = require('./../specClaimHelpers/api/idamHelper');

const claimType = 'FastTrack';
const partyType = 'LiPvLiP';
let claimRef;

Feature('Case progression journey - Claimant Lip Upload Evidence and Trial Arrangements - Fast Track');

Before(async ({api}) => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
    await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
    const fourWeeksFromToday = DateUtilsComponent.DateUtilsComponent.rollDateToCertainWeeks(4);
    claimRef = await api.createLiPClaim(config.claimantCitizenUser, claimType);
    await api.performCitizenResponse(config.defendantCitizenUser, claimRef, claimType, config.defenceType.rejectAllDisputeAllWithIndividual);
    await api.claimantLipRespondToDefence(config.claimantCitizenUser, claimRef, 'JUDICIAL_REFERRAL');
    await api.performCaseProgressedToSDO(config.judgeUserWithRegionId1, claimRef, 'fastTrack');
    await api.performCaseProgressedToHearingInitiated(config.hearingCenterAdminWithRegionId1, claimRef, DateUtilsComponent.DateUtilsComponent.formatDateToYYYYMMDD(fourWeeksFromToday));
    await api.waitForFinishedBusinessProcess();
    await LoginSteps.EnterUserCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  }
});

Scenario('Citizen Claimant perform evidence upload and trial arrangements',  async ({api}) => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    CaseProgressionSteps.initiateUploadEvidenceJourney(claimRef, claimType, partyType);
    TrialArrangementSteps.initiateTrialArrangementJourney(claimRef, claimType, 'yes', partyType);
    await api.waitForFinishedBusinessProcess();
    TrialArrangementSteps.verifyTrialArrangementsMade();
  }
}).tag('@regression-cp');

