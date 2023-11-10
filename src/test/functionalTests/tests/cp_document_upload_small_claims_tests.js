const config = require('../../config');
const UploadEvidenceSteps = require('../features/caseProgression/steps/caseProgressionSteps');
const DateUtilsComponent = require('../features/caseProgression/util/DateUtilsComponent');
const LoginSteps = require('../features/home/steps/login');

const claimType = 'SmallClaims';
let claimRef;

Feature('Case progression journey - Verify Documents tab - Uploaded Evidence by LR');

Before(async ({api}) => {
  //Once the CUI Release is done, we can remove this IF statement, so that tests will run on AAT as well.
  if (['preview', 'demo'].includes(config.runningEnv)) {
    claimRef = await api.createSpecifiedClaim(config.applicantSolicitorUser, '', claimType);
    await LoginSteps.EnterUserCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
    await api.performCitizenResponse(config.defendantCitizenUser, claimRef, claimType);
    await api.viewAndRespondToDefence(config.applicantSolicitorUser, config.defenceType.rejectAll, 'JUDICIAL_REFERRAL');
    await api.performCaseProgressedToSDO(config.judgeUserWithRegionId1, claimRef);
    await api.performCaseProgressedToHearingInitiated(config.hearingCenterAdminWithRegionId1, claimRef);
    await api.performEvidenceUpload(config.applicantSolicitorUser, claimRef);
    await LoginSteps.EnterUserCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  }
});

Scenario('Case progression journey - Small Claims - Verify uploaded documents by LR in the Documents tab', () => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    UploadEvidenceSteps.verifyDocumentsUploadedBySolicitor(claimRef, claimType);
  }
}).tag('@regression');
