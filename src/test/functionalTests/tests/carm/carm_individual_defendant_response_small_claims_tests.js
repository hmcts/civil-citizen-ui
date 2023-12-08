const config = require('../../../config');
const LoginSteps = require('../../features/home/steps/login');
const ResponseSteps = require('../../features/response/steps/lipDefendantResponseSteps');

const claimType = 'SmallClaims';
const partAdmit = 'partial-admission';
const dontWantMoreTime = 'dontWantMoreTime';

const carmEnabled = true;
let claimRef;
let caseData;
let claimNumber;
let securityCode;

Feature('CARM - LiP Defendant Journey - Small claims track - Individual');

Before(async ({api}) => {
  if (['preview', 'demo'  ].includes(config.runningEnv)) {
    claimRef = await api.createSpecifiedClaim(config.applicantSolicitorUser, '', claimType, carmEnabled, 'Individual');
    console.log('claimRef has been created Successfully    <===>  '  , claimRef);
    caseData = await api.retrieveCaseData(config.adminUser, claimRef);
    claimNumber =  caseData.legacyCaseReference;
    securityCode = caseData.respondent1PinToPostLRspec.accessCode;
    console.log('claim number', claimNumber);
    console.log('Security code', securityCode);
    await LoginSteps.EnterUserCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  }
});

Scenario('LiP Defendant Response with Part Admit', async () => {
  await ResponseSteps.RespondToClaim(claimRef);
  await ResponseSteps.EnterPersonalDetails(claimRef, carmEnabled);
  await ResponseSteps.EnterYourOptionsForDeadline(claimRef, dontWantMoreTime);
  await ResponseSteps.EnterResponseToClaim(claimRef, partAdmit);
  await ResponseSteps.SelectPartAdmitAlreadyPaid('yes');
  await ResponseSteps.EnterHowMuchYouHavePaid(claimRef, 500, partAdmit);
  await ResponseSteps.EnterWhyYouDisagreeTheClaimAmount(claimRef, partAdmit);
  await ResponseSteps.AddYourTimeLineEvents();
  await ResponseSteps.EnterYourEvidenceDetails();
  await ResponseSteps.EnterTelephoneMediationDetails(claimRef);
  await ResponseSteps.ConfirmContactPerson(claimRef);
  await ResponseSteps.ConfirmAltPhoneDetails();
  await ResponseSteps.ConfirmAltEmailDetails();
  // Not yet implemented
  //await ResponseSteps.EnterUnavailableDates(claimRef);
}).tag('@carm');
