const config =  require('../../config');
const  ResponseSteps  =  require('../features/response/steps/lipDefendantResponseSteps');
const  LoginSteps =  require('../features/home/steps/login');

const partAdmit = 'partial-admission';
const dontWantMoreTime = 'dontWantMoreTime';

let claimRef;
let claimType = 'FastTrack';
let caseData;
let claimNumber;
let securityCode;
const delay = ms => new Promise(res => setTimeout(res, ms));

Feature('Response with PartAdmit');

Before(async ({api}) => {
  claimRef = await api.createSpecifiedClaim(config.applicantSolicitorUser, null, claimType);
  console.log('claimRef has been created Successfully for Part Admit Tests   <===>  '  , claimRef);
  caseData = await api.retrieveCaseData(config.adminUser, claimRef);
  claimNumber = caseData.legacyCaseReference;
  securityCode = caseData.respondent1PinToPostLRspec.accessCode;
  await delay(10000);
  await ResponseSteps.AssignCaseToLip(claimNumber, securityCode);
  if (claimRef) {
    await LoginSteps.EnterUserCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  } else
  {
    console.log('claimRef has not been Created');
  }
});

// Add a regression tag once the defect https://tools.hmcts.net/jira/browse/CIV-9366 is fixed
Scenario('Response with PartAdmit-AlreadyPaid @citizenUI @partAdmit', async () => {
  await ResponseSteps.RespondToClaim(claimRef);
  await ResponseSteps.EnterCompanyDetails();
  await ResponseSteps.EnterYourOptionsForDeadline(claimRef, dontWantMoreTime);
  await ResponseSteps.EnterResponseToClaim(claimRef, partAdmit);
  await ResponseSteps.SelectPartAdmitAlreadyPaid('yes');
  await ResponseSteps.EnterHowMuchYouHavePaid(claimRef, 500, partAdmit);
  await ResponseSteps.EnterWhyYouDisagreeTheClaimAmount(claimRef, partAdmit);
  await ResponseSteps.AddYourTimeLineEvents();
  await ResponseSteps.EnterYourEvidenceDetails();
  await ResponseSteps.EnterNoMediation(claimRef);
  await ResponseSteps.EnterDQForFastTrack(claimRef);
  await ResponseSteps.CheckAndSubmit(claimRef, partAdmit);
});
