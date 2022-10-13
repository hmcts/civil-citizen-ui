import {config} from '../../config';
import { ResponseSteps } from '../features/response/steps/prepareYourResponseSteps';
import { CommonSteps } from '../features/response/steps/commonSteps';
import { LoginSteps} from '../features/home/steps/login';

const responseSteps: ResponseSteps = new ResponseSteps();
const commonSteps: CommonSteps = new CommonSteps();
const loginSteps: LoginSteps = new LoginSteps();
const claimRef = '1664447267229555';
const yesIWantMoretime = 'yesIWantMoretime';
const iHaveAlreadyAgreedMoretime = 'iHaveAlreadyAgreedMoretime';
const requestRefused = 'requestRefused';
const dontWantMoreTime = 'dontWantMoreTime';
const partAdmit = 'partAdmit';
const immediatePayment = 'immediate';
const bySetDate = 'bySetDate';
const repaymentPlan = 'repaymentPlan';

Feature('Response with PartAdmit');

Before(() => {
  loginSteps.EnterUserCredentials(config.Username, config.Password);
});

Scenario('Response with PartAdmit and Immediate payment @citizenUI @partAdmit1', () => {
  commonSteps.EnterPersonalDetails(claimRef);
  commonSteps.EnterYourOptionsForDeadline(claimRef, dontWantMoreTime);
  responseSteps.EnterResponseToClaim(claimRef, partAdmit);
  responseSteps.SelectPartAdmitAlreadyPaid('yes');
  responseSteps.EnterPaymentOption(claimRef, immediatePayment);
  responseSteps.EnterHowMuchYouHavePaid(claimRef, 500);
  responseSteps.EnterWhyYouDisagreeTheClaimAmount(claimRef);
  responseSteps.CheckAndSubmit(claimRef);
});

Scenario('Response with PartAdmit and Date to PayOn @citizenUI @partAdmit', () => {
  commonSteps.EnterPersonalDetails(claimRef);
  commonSteps.EnterYourOptionsForDeadline(claimRef, dontWantMoreTime);
  responseSteps.EnterResponseToClaim(claimRef, partAdmit);
  responseSteps.SelectPartAdmitAlreadyPaid('yes');
  responseSteps.EnterPaymentOption(claimRef, bySetDate);
  responseSteps.EnterDateToPayOn();
  commonSteps.EnterFinancialDetails(claimRef);
  responseSteps.CheckAndSubmit(claimRef);
});

Scenario('Response with PartAdmit and Repayment plan @citizenUI @partAdmit', () => {
  commonSteps.EnterPersonalDetails(claimRef);
  commonSteps.EnterYourOptionsForDeadline(claimRef, dontWantMoreTime);
  responseSteps.EnterResponseToClaim(claimRef, partAdmit);
  responseSteps.SelectPartAdmitAlreadyPaid('yes');
  responseSteps.EnterPaymentOption(claimRef, repaymentPlan);
  commonSteps.EnterFinancialDetails(claimRef);
  responseSteps.EnterRepaymentPlan(claimRef);
  responseSteps.CheckAndSubmit(claimRef);
});
