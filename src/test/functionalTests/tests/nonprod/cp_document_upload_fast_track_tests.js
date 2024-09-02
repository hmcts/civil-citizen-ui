const config = require('../../../config');
//const CaseProgressionSteps = require('../../citizenFeatures/caseProgression/steps/caseProgressionSteps');
const DateUtilsComponent = require('../../citizenFeatures/caseProgression/util/DateUtilsComponent');
const LoginSteps = require('../../commonFeatures/home/steps/login');
const {createAccount} = require('../../specClaimHelpers/api/idamHelper');

const claimType = 'FastTrack';
let claimRef;

// const obj = {
//   api: 'string',
//   name2: 'string2',
// };

Feature('Case progression journey - Verify Documents tab - Uploaded Evidence by LR');

Before(async ({api}) => {
  //Once the CUI Release is done, we can remove this IF statement, so that tests will run on AAT as well.
  if (['preview', 'demo'].includes(config.runningEnv)) {
    await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
    const fourWeeksFromToday = DateUtilsComponent.DateUtilsComponent.rollDateToCertainWeeks(4);
    claimRef = await api.createSpecifiedClaim(config.applicantSolicitorUser, '', claimType);
    await api.performCitizenResponse(config.defendantCitizenUser, claimRef, claimType, config.defenceType.rejectAllDisputeAllWithIndividual);
    await api.viewAndRespondToDefence(config.applicantSolicitorUser, config.defenceType.rejectAll, 'JUDICIAL_REFERRAL','FAST_CLAIM');
    await api.performCaseProgressedToSDO(config.judgeUserWithRegionId1, claimRef, 'fastTrack');
    await api.performCaseProgressedToHearingInitiated(config.hearingCenterAdminWithRegionId1, claimRef, DateUtilsComponent.DateUtilsComponent.formatDateToYYYYMMDD(fourWeeksFromToday));
    await api.performEvidenceUpload(config.applicantSolicitorUser, claimRef, claimType);
    await api.waitForFinishedBusinessProcess();
    await LoginSteps.EnterCitizenCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  }
});

//covered in cp_upload_evidence_small_claims_tests
Scenario('Case progression journey - Fast Track - Verify uploaded documents by LR in the Documents tab', async () => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    //CaseProgressionSteps.verifyDocumentsUploadedBySolicitor(claimRef, claimType);
  }
});

