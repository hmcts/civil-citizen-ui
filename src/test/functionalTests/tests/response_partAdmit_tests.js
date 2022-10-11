import {config} from '../../config';
import { ResponseSteps } from '../features/response/steps/prepareYourResponseSteps';
import { CommonSteps } from '../features/response/steps/commonSteps';
import { LoginSteps} from '../features/home/steps/login';

const responseSteps = new ResponseSteps();
const commonSteps = new CommonSteps();
const loginSteps = new LoginSteps();
const partAdmit = 'partAdmit';
const immediatePayment = 'immediate';
const bySetDate = 'bySetDate';
const repaymentPlan = 'repaymentPlan';

let claimRef;

Feature('Response with PartAdmit');

Before(async ({api}) => {
  claimRef = await api.createSpecifiedClaim(config.applicantSolicitorUser);
  loginSteps.EnterUserCredentials(config.Username, config.Password);
});

Scenario('Response with PartAdmit and Immediate payment @citizenUI @partAdmit', () => {
  commonSteps.EnterPersonalDetails(claimRef);
  responseSteps.EnterResponseToClaim(claimRef, partAdmit);
  responseSteps.SelectPartAdmitAlreadyPaid('yes');
  responseSteps.EnterPaymentOption(claimRef, immediatePayment);
  responseSteps.CheckAndSubmit(claimRef);
});

Scenario('Response with PartAdmit and Date to PayOn @citizenUI @partAdmit', () => {
  commonSteps.EnterPersonalDetails(claimRef);
  responseSteps.EnterResponseToClaim(claimRef, partAdmit);
  responseSteps.SelectPartAdmitAlreadyPaid('yes');
  responseSteps.EnterPaymentOption(claimRef, bySetDate);
  responseSteps.EnterDateToPayOn();
  commonSteps.EnterFinancialDetails(claimRef);
  responseSteps.CheckAndSubmit(claimRef);
});

Scenario('Response with PartAdmit and Repayment plan @citizenUI @partAdmit', () => {
  commonSteps.EnterPersonalDetails(claimRef);
  responseSteps.EnterResponseToClaim(claimRef, partAdmit);
  responseSteps.SelectPartAdmitAlreadyPaid('yes');
  responseSteps.EnterPaymentOption(claimRef, repaymentPlan);
  commonSteps.EnterFinancialDetails(claimRef);
  responseSteps.EnterRepaymentPlan(claimRef);
  responseSteps.CheckAndSubmit(claimRef);
});
