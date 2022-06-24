import I = CodeceptJS.I
import {config} from '../../config';
import { ResponseSteps } from '../features/response/steps/prepareYourResponseSteps';
import { CommonSteps } from '../features/response/steps/commonSteps';
import { LoginSteps} from '../features/home/steps/login';

const responseSteps: ResponseSteps = new ResponseSteps();
const commonSteps: CommonSteps = new CommonSteps();
const loginSteps: LoginSteps = new LoginSteps();
const claimRef = '1645882162449409';
const admitAll = 'admitAll';
const immediatePayment = 'immediate';
const bySetDate = 'bySetDate';
const repaymentPlan = 'repaymentPlan';

Feature('Response with AdmitAll');

Before(() => {
  if(config.env == 'demo'){
    loginSteps.EnterHmctsCredentails(config.hmctsUsername, config.hmctsPassword);
  }
  loginSteps.EnterUserCredentials(config.username, config.password);
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


