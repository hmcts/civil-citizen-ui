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
const admitAll = 'admitAll';
const immediatePayment = 'immediate';
const bySetDate = 'bySetDate';
const repaymentPlan = 'repaymentPlan';

Feature('Response with AdmitAll');

Before(() => {
  loginSteps.EnterUserCredentials(config.Username, config.Password);
});

Scenario('Response with AdmitAll and Immediate payment @citizenUI @admitAll', () => {
  commonSteps.EnterPersonalDetails(claimRef);
  commonSteps.EnterYourOptionsForDeadline(claimRef, dontWantMoreTime);
  responseSteps.EnterResponseToClaim(claimRef, admitAll);
  responseSteps.EnterPaymentOption(claimRef, immediatePayment);
  responseSteps.CheckAndSubmit(claimRef);
});

Scenario('Response with AdmitAll and Date to PayOn @citizenUI @admitAll', () => {
  commonSteps.EnterPersonalDetails(claimRef);
  commonSteps.EnterYourOptionsForDeadline(claimRef, dontWantMoreTime);
  responseSteps.EnterResponseToClaim(claimRef, admitAll);
  responseSteps.EnterPaymentOption(claimRef, bySetDate);
  responseSteps.EnterDateToPayOn();
  commonSteps.EnterFinancialDetails(claimRef);
  responseSteps.CheckAndSubmit(claimRef);
});

Scenario('Response with AdmitAll and Repayment plan @citizenUI @admitAll', () => {
  commonSteps.EnterPersonalDetails(claimRef);
  commonSteps.EnterYourOptionsForDeadline(claimRef, dontWantMoreTime);
  responseSteps.EnterResponseToClaim(claimRef, admitAll);
  responseSteps.EnterPaymentOption(claimRef, repaymentPlan);
  commonSteps.EnterFinancialDetails(claimRef);
  responseSteps.EnterRepaymentPlan(claimRef);
  responseSteps.CheckAndSubmit(claimRef);
});
