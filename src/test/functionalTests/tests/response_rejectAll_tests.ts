import {config} from '../../config';
import { ResponseSteps } from '../features/response/steps/prepareYourResponseSteps';
import { CommonSteps } from '../features/response/steps/commonSteps';
import { LoginSteps} from '../features/home/steps/login';

const responseSteps: ResponseSteps = new ResponseSteps();
const commonSteps: CommonSteps = new CommonSteps();
const loginSteps: LoginSteps = new LoginSteps();
const claimRef = '1645882162449409';
const partAdmit = 'partAdmit';
const rejectAll = 'rejectAll';
const immediatePayment = 'immediate';
const bySetDate = 'bySetDate';
const repaymentPlan = 'repaymentPlan';

Feature('Response with RejectAll');

Before(() => {
  if(config.env == 'demo'){
    loginSteps.EnterHmctsCredentails(config.hmctsUsername, config.hmctsPassword);
  }
  loginSteps.EnterUserCredentials(config.username, config.password);
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


