const config =  require('../../config');
const  ResponseSteps  =  require('../features/response/steps/lipDefendantResponseSteps');
const  LoginSteps =  require('../features/home/steps/login');

const partAdmit = 'partial-admission';
const immediatePayment = 'immediate';
const bySetDate = 'bySetDate';
const repaymentPlan = 'repaymentPlan';
const dontWantMoreTime = 'dontWantMoreTime';
// eslint-disable-next-line no-unused-vars
const yesIWantMoretime = 'yesIWantMoretime';

let claimRef;

Feature('Response with PartAdmit');

Before(async ({api}) => {
  claimRef = await api.createSpecifiedClaim(config.applicantSolicitorUser);
  console.log('claimRef has been created Successfully for Part Admit Tests   <===>  '  , claimRef);
  if (claimRef) {
    LoginSteps.EnterUserCredentials(config.Username, config.Password);
  } else
  {
    console.log('claimRef has not been Created');
  }
});

Scenario('Response with PartAdmit-AlreadyPaid and Immediate payment @citizenUI @partAdmit @regression', () => {
  ResponseSteps.RespondToClaim(claimRef);
  ResponseSteps.EnterPersonalDetails(claimRef);
  ResponseSteps.EnterYourOptionsForDeadline(claimRef, dontWantMoreTime);
  ResponseSteps.EnterResponseToClaim(claimRef, partAdmit);
  ResponseSteps.SelectPartAdmitAlreadyPaid('yes');
  ResponseSteps.EnterHowMuchYouHavePaid(claimRef, 500, partAdmit);
  ResponseSteps.EnterWhyYouDisagreeTheClaimAmount(claimRef, partAdmit);
  ResponseSteps.AddYourTimeLineEvents();
  ResponseSteps.EnterYourEvidenceDetails();
  ResponseSteps.EnterFreeTelephoneMediationDetails(claimRef);
  ResponseSteps.EnterDQForSmallClaims(claimRef);
  ResponseSteps.CheckAndSubmit(claimRef, partAdmit);
});

Scenario('Response with PartAdmit-havent paid and Immediate payment @citizenUI @partAdmit @regression', () => {
  ResponseSteps.RespondToClaim(claimRef);
  ResponseSteps.EnterPersonalDetails(claimRef);
  ResponseSteps.EnterYourOptionsForDeadline(claimRef, dontWantMoreTime);
  ResponseSteps.EnterResponseToClaim(claimRef, partAdmit);
  ResponseSteps.SelectPartAdmitAlreadyPaid('no');
  ResponseSteps.EnterHowMuchMoneyYouOwe(claimRef, 500, partAdmit);
  ResponseSteps.EnterWhyYouDisagreeTheClaimAmount(claimRef, partAdmit);
  ResponseSteps.AddYourTimeLineEvents();
  ResponseSteps.EnterYourEvidenceDetails();
  ResponseSteps.EnterPaymentOption(claimRef, partAdmit, immediatePayment);
  ResponseSteps.EnterFreeTelephoneMediationDetails(claimRef);
  ResponseSteps.EnterDQForSmallClaims(claimRef);
  ResponseSteps.CheckAndSubmit(claimRef, partAdmit);
});

Scenario('Response with PartAdmit and Date to PayOn @citizenUI @partAdmit', () => {
  ResponseSteps.EnterPersonalDetails(claimRef);
  ResponseSteps.EnterResponseToClaim(claimRef, partAdmit);
  ResponseSteps.SelectPartAdmitAlreadyPaid('yes');
  ResponseSteps.EnterPaymentOption(claimRef, partAdmit, bySetDate);
  ResponseSteps.EnterDateToPayOn();
  ResponseSteps.EnterFinancialDetails(claimRef);
  ResponseSteps.EnterHowMuchYouHavePaid(claimRef, 500), partAdmit;
  ResponseSteps.EnterWhyYouDisagreeTheClaimAmount(claimRef, partAdmit);
  ResponseSteps.AddYourTimeLineEvents();
  ResponseSteps.EnterYourEvidenceDetails();
  ResponseSteps.EnterFreeTelephoneMediationDetails(claimRef);
  ResponseSteps.EnterYourOptions(claimRef, yesIWantMoretime);
  ResponseSteps.RespondToRequest(claimRef);
  ResponseSteps.EnterFreeTelephoneMediationDetails(claimRef);
  ResponseSteps.AddMandatoryPhoneNumber();
  ResponseSteps.CheckAndSubmit(claimRef, partAdmit);
});

Scenario('Response with PartAdmit and Repayment plan @citizenUI @partAdmit', () => {
  ResponseSteps.EnterPersonalDetails(claimRef);
  ResponseSteps.EnterResponseToClaim(claimRef, partAdmit);
  ResponseSteps.SelectPartAdmitAlreadyPaid('yes');
  ResponseSteps.EnterPaymentOption(claimRef, partAdmit, repaymentPlan);
  ResponseSteps.EnterFinancialDetails(claimRef);
  ResponseSteps.EnterRepaymentPlan(claimRef);
  ResponseSteps.EnterHowMuchYouHavePaid(claimRef, 500, partAdmit);
  ResponseSteps.EnterYourOptions(claimRef, dontWantMoreTime);
  ResponseSteps.EnterWhyYouDisagreeTheClaimAmount(claimRef, partAdmit);
  ResponseSteps.AddYourTimeLineEvents();
  ResponseSteps.EnterFreeTelephoneMediationDetails(claimRef);
  ResponseSteps.AddMandatoryPhoneNumber();
  ResponseSteps.CheckAndSubmit(claimRef, partAdmit);
});
