import {config} from '../../config';
import { ResponseSteps } from '../features/response/steps/prepareYourResponseSteps';
import { CommonSteps } from '../features/response/steps/commonSteps';
import { LoginSteps} from '../features/home/steps/login';

const responseSteps: ResponseSteps = new ResponseSteps();
const commonSteps: CommonSteps = new CommonSteps();
const loginSteps: LoginSteps = new LoginSteps();
const claimRef = '1645882162449409';
const partAdmit = 'partAdmit';
const immediatePayment = 'immediate';
const bySetDate = 'bySetDate';
const repaymentPlan = 'repaymentPlan';

Feature('Response with PartAdmit');

Before(() => {
  if(config.env == 'demo'){
    loginSteps.EnterHmctsCredentails(config.hmctsUsername, config.hmctsPassword);
    loginSteps.EnterUserCredentials(config.username, config.password);
  }else if(config.env == 'aat'){
    loginSteps.EnterUserCredentials(config.PRusername, config.PRpassword);
  }else {
    loginSteps.EnterUserCredentials(config.username, config.password);
  }
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


