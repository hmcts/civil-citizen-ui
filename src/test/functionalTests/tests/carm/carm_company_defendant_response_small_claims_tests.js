const config = require('../../../config');
const LoginSteps = require('../../features/home/steps/login');
const ResponseSteps = require('../../features/response/steps/lipDefendantResponseSteps');

const claimType = 'SmallClaims';
const rejectAll = 'rejectAll';
const dontWantMoreTime = 'dontWantMoreTime';

const carmEnabled = true;
let claimRef;
let caseData;
let claimNumber;
let securityCode;

Feature('CARM - LiP Defendant Journey - Small claims track - Company');

Before(async ({api}) => {
  if (['preview', 'demo'  ].includes(config.runningEnv)) {
    claimRef = await api.createSpecifiedClaim(config.applicantSolicitorUser, '', claimType, carmEnabled, 'Company');
    console.log('claimRef has been created Successfully    <===>  '  , claimRef);
    caseData = await api.retrieveCaseData(config.adminUser, claimRef);
    claimNumber =  caseData.legacyCaseReference;
    securityCode = caseData.respondent1PinToPostLRspec.accessCode;
    console.log('claim number', claimNumber);
    console.log('Security code', securityCode);
    await LoginSteps.EnterUserCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  }else{
    claimRef = await api.createSpecifiedClaimLRvLR(config.applicantSolicitorUser);
    console.log('claimRef has been created Successfully    <===>  '  , claimRef);
    await LoginSteps.EnterUserCredentials(config.defendantLRCitizenUser.email, config.defendantLRCitizenUser.password);
  }
});

Scenario('LiP Defendant Response with Reject all claim @carm @smoketest', async () => {
  await ResponseSteps.RespondToClaim(claimRef);
  await ResponseSteps.EnterCompDetails(carmEnabled);
  await ResponseSteps.EnterYourOptionsForDeadline(claimRef, dontWantMoreTime);
  await ResponseSteps.EnterResponseToClaim(claimRef, rejectAll);
  await ResponseSteps.SelectOptionInRejectAllClaim('alreadyPaid');
  await ResponseSteps.EnterHowMuchYouHavePaid(claimRef, 500, rejectAll);
  await ResponseSteps.EnterWhyYouDisagreeTheClaimAmount(claimRef, rejectAll);
  await ResponseSteps.AddYourTimeLineEvents();
  await ResponseSteps.EnterYourEvidenceDetails();
  await ResponseSteps.EnterTelephoneMediationDetails(claimRef);
}).tag('@regression');
