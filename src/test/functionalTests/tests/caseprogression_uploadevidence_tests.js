const config = require('../../config');
const UploadEvidenceSteps = require('../features/caseProgression/steps/caseProgressionSteps');
const LoginSteps = require('../features/home/steps/login');
const ResponseSteps = require('../features/response/steps/lipDefendantResponseSteps');

let claimRef;
let caseData;
let claimNumber;
let securityCode;

Feature('Case progression journey - Defendant & Claimant Response with RejectAll');

Before(async ({api}) => {
  if (['preview', 'demo'  ].includes(config.runningEnv)) {
    claimRef = await api.createSpecifiedClaim(config.applicantSolicitorUser);
    console.log('claim has been created Successfully    <===>  '  , claimRef);
    caseData = await api.retrieveCaseData(config.adminUser, claimRef);
    claimNumber = caseData.legacyCaseReference;
    securityCode = caseData.respondent1PinToPostLRspec.accessCode;
    await ResponseSteps.AssignCaseToLip(claimNumber, securityCode);
    await api.performCitizenResponse(config.defendantCitizenUser, claimRef);
    await api.viewAndRespondToDefence(config.applicantSolicitorUser, config.defenceType.rejectAll,'JUDICIAL_REFERRAL');
    await api.performCaseProgressedToSDO(config.judgeUserWithRegionId1, claimRef);
    await api.performCaseProgressedToHearingInitiated(config.hearingCenterAdminWithRegionId1, claimRef);
    if (claimRef) {
      await LoginSteps.EnterUserCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
    } else {
      console.log('claimRef has not been Created');
    }
  }
});

Scenario('Response with RejectAll and DisputeAll For the Case Progression and Hearing Scheduled Process To Complete', () => {
  if (['preview', 'demo'  ].includes(config.runningEnv)) {
    UploadEvidenceSteps.initiateUploadEvidenceJourney(claimRef);
  }
}).tag('@disabled');
