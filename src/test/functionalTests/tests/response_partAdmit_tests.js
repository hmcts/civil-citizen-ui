const config =  require('../../config');
const  ResponseSteps  =  require('../features/response/steps/prepareYourResponseSteps');
const  CommonSteps  =  require('../features/response/steps/commonSteps');
const  LoginSteps =  require('../features/home/steps/login');

const partAdmit = 'partAdmit';
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

Scenario('Response with PartAdmit and Immediate payment @citizenUI @partAdmit', () => {
  CommonSteps.EnterPersonalDetails(claimRef);
  CommonSteps.EnterYourOptionsForDeadline(claimRef, dontWantMoreTime);
  ResponseSteps.EnterResponseToClaim(claimRef, partAdmit);
  ResponseSteps.SelectPartAdmitAlreadyPaid('yes');
  ResponseSteps.EnterPaymentOption(claimRef, immediatePayment);
  ResponseSteps.EnterHowMuchYouHavePaid(claimRef, 500);
  ResponseSteps.EnterWhyYouDisagreeTheClaimAmount(claimRef);
  ResponseSteps.AddYourTimeLineEvents();
  ResponseSteps.EnterYourEvidenceDetails();
  ResponseSteps.EnterFreeTelephoneMediationDetails(claimRef);
  ResponseSteps.AddMandatoryPhoneNumber();
  ResponseSteps.CheckAndSubmit(claimRef);
});

Scenario('Response with PartAdmit and Date to PayOn @citizenUI @partAdmit', () => {
  CommonSteps.EnterPersonalDetails(claimRef);
  ResponseSteps.EnterResponseToClaim(claimRef, partAdmit);
  ResponseSteps.SelectPartAdmitAlreadyPaid('yes');
  ResponseSteps.EnterPaymentOption(claimRef, bySetDate);
  ResponseSteps.EnterDateToPayOn();
  CommonSteps.EnterFinancialDetails(claimRef);
  ResponseSteps.CheckAndSubmit(claimRef);
});

Scenario('Response with PartAdmit and Repayment plan @citizenUI @partAdmit', () => {
  CommonSteps.EnterPersonalDetails(claimRef);
  ResponseSteps.EnterResponseToClaim(claimRef, partAdmit);
  ResponseSteps.SelectPartAdmitAlreadyPaid('yes');
  ResponseSteps.EnterPaymentOption(claimRef, repaymentPlan);
  CommonSteps.EnterFinancialDetails(claimRef);
  ResponseSteps.EnterRepaymentPlan(claimRef);
  ResponseSteps.CheckAndSubmit(claimRef);
});
