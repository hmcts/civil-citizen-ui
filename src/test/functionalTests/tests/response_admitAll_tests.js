import {config} from '../../config';
import { ResponseSteps } from '../features/response/steps/prepareYourResponseSteps';
import { CommonSteps } from '../features/response/steps/commonSteps';
import { LoginSteps} from '../features/home/steps/login';

const responseSteps = new ResponseSteps();
const commonSteps = new CommonSteps();
const loginSteps = new LoginSteps();
const admitAll = 'admitAll';
const immediatePayment = 'immediate';
const bySetDate = 'bySetDate';
const repaymentPlan = 'repaymentPlan';

let claimRef;

Feature('Response with AdmitAll');

Before(async ({api}) => {
  claimRef = await api.createSpecifiedClaim(config.applicantSolicitorUser);
  loginSteps.EnterUserCredentials(config.Username, config.Password);
});

Scenario('Response with AdmitAll and Immediate payment @citizenUI @admitAll', () => {
  commonSteps.EnterPersonalDetails(claimRef);
  responseSteps.EnterResponseToClaim(claimRef, admitAll);
  responseSteps.EnterPaymentOption(claimRef, immediatePayment);
  responseSteps.CheckAndSubmit(claimRef);
});

Scenario('Response with AdmitAll and Date to PayOn @citizenUI @admitAll', () => {
  commonSteps.EnterPersonalDetails(claimRef);
  responseSteps.EnterResponseToClaim(claimRef, admitAll);
  responseSteps.EnterPaymentOption(claimRef, bySetDate);
  responseSteps.EnterDateToPayOn();
  commonSteps.EnterFinancialDetails(claimRef);
  responseSteps.CheckAndSubmit(claimRef);
});

Scenario('Response with AdmitAll and Repayment plan @citizenUI @admitAll', () => {
  commonSteps.EnterPersonalDetails(claimRef);
  responseSteps.EnterResponseToClaim(claimRef, admitAll);
  responseSteps.EnterPaymentOption(claimRef, repaymentPlan);
  commonSteps.EnterFinancialDetails(claimRef);
  responseSteps.EnterRepaymentPlan(claimRef);
  responseSteps.CheckAndSubmit(claimRef);
});
