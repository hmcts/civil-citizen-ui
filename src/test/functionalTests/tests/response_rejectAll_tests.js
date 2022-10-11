import {config} from '../../config';
import { ResponseSteps } from '../features/response/steps/prepareYourResponseSteps';
import { CommonSteps } from '../features/response/steps/commonSteps';
import { LoginSteps} from '../features/home/steps/login';

const responseSteps = new ResponseSteps();
const commonSteps = new CommonSteps();
const loginSteps = new LoginSteps();
const partAdmit = 'partAdmit';
const rejectAll = 'rejectAll';
const immediatePayment = 'immediate';
const bySetDate = 'bySetDate';
const repaymentPlan = 'repaymentPlan';

let claimRef;

Feature('Response with RejectAll');

Before(async ({api}) => {
  claimRef = await api.createSpecifiedClaim(config.applicantSolicitorUser);
  loginSteps.EnterUserCredentials(config.Username, config.Password);
});

Scenario('Response with RejectAll and Immediate payment @citizenUI @rejectAll', () => {
  commonSteps.EnterPersonalDetails(claimRef);
  responseSteps.EnterResponseToClaim(claimRef, rejectAll);
  responseSteps.SelectOptionInRejectAllClaim('alreadyPaid');
  responseSteps.EnterPaymentOption(claimRef, immediatePayment);
  responseSteps.CheckAndSubmit(claimRef);
});

Scenario('Response with RejectAll and Date to PayOn @citizenUI @rejectAll', () => {
  commonSteps.EnterPersonalDetails(claimRef);
  responseSteps.EnterResponseToClaim(claimRef, partAdmit);
  responseSteps.SelectOptionInRejectAllClaim('alreadyPaid');
  responseSteps.EnterPaymentOption(claimRef, bySetDate);
  responseSteps.EnterDateToPayOn();
  commonSteps.EnterFinancialDetails(claimRef);
  responseSteps.CheckAndSubmit(claimRef);
});

Scenario('Response with RejectAll and Repayment plan @citizenUI @rejectAll', () => {
  commonSteps.EnterPersonalDetails(claimRef);
  responseSteps.EnterResponseToClaim(claimRef, partAdmit);
  responseSteps.SelectOptionInRejectAllClaim('alreadyPaid');
  responseSteps.EnterPaymentOption(claimRef, repaymentPlan);
  commonSteps.EnterFinancialDetails(claimRef);
  responseSteps.EnterRepaymentPlan(claimRef);
  responseSteps.CheckAndSubmit(claimRef);
});
