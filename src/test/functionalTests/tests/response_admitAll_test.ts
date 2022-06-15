import I = CodeceptJS.I
import {config} from '../../config';
import { ResponseSteps } from '../features/response/steps/prepareYourResponse';
import { LoginSteps} from '../features/home/steps/login';

const responseSteps: ResponseSteps = new ResponseSteps();
const loginSteps: LoginSteps = new LoginSteps();
const claimRef = '1645882162449409';
const admitAll = 'admitAll';
const partAdmit = 'partAdmit';
const rejectAll = 'rejectAll';
const immediatePayment = 'immediate';
const setByDate = 'bySetDate';
const repaymentPlan = 'repaymentPlan';

Feature('Response with AdmitAll');

Before(() => {
  if(config.env == 'demo'){
    loginSteps.EnterHmctsCredentails(config.hmctsUsername, config.hmctsPassword);
  }
  loginSteps.EnterUserCredentials(config.username, config.password);
});

Scenario('Response with AdmitAll and Immediate payment @citizenUI', () => {
  responseSteps.VerifyResponsePageContent(claimRef);
  responseSteps.EnterNameAndAddressDetails(claimRef);
  responseSteps.EnterDateOfBirth(claimRef);
  responseSteps.EnterContactNumber(claimRef);
  responseSteps.EnterResponseToClaim(claimRef, admitAll);
  responseSteps.EnterPaymentOption(claimRef, immediatePayment);
  responseSteps.CheckAndSubmit(claimRef);
});


