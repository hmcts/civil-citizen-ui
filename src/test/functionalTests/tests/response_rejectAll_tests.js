// import {config} from '../../config';
// import { ResponseSteps } from '../features/response/steps/prepareYourResponseSteps';
// import { CommonSteps } from '../features/response/steps/commonSteps';
// import { LoginSteps} from '../features/home/steps/login';

const {config} =  require('../../config');
const { ResponseSteps } =  require('../features/response/steps/prepareYourResponseSteps');
const { CommonSteps } =  require('../features/response/steps/commonSteps');
const { LoginSteps} =  require('../features/home/steps/login');

// const responseSteps = new ResponseSteps();
// const commonSteps = new CommonSteps();
// const loginSteps = new LoginSteps();
const partAdmit = 'partAdmit';
const rejectAll = 'rejectAll';
const immediatePayment = 'immediate';
const bySetDate = 'bySetDate';
const repaymentPlan = 'repaymentPlan';

let claimRef;

Feature('Response with RejectAll');

Before(async ({api}) => {
  claimRef = await api.createSpecifiedClaim(config.applicantSolicitorUser);
  LoginSteps.EnterUserCredentials(config.Username, config.Password);
});

Scenario('Response with RejectAll and Immediate payment @citizenUI @rejectAll', () => {
  CommonSteps.EnterPersonalDetails(claimRef);
  ResponseSteps.EnterResponseToClaim(claimRef, rejectAll);
  ResponseSteps.SelectOptionInRejectAllClaim('alreadyPaid');
  ResponseSteps.EnterPaymentOption(claimRef, immediatePayment);
  ResponseSteps.CheckAndSubmit(claimRef);
});

Scenario('Response with RejectAll and Date to PayOn @citizenUI @rejectAll', () => {
  CommonSteps.EnterPersonalDetails(claimRef);
  ResponseSteps.EnterResponseToClaim(claimRef, partAdmit);
  ResponseSteps.SelectOptionInRejectAllClaim('alreadyPaid');
  ResponseSteps.EnterPaymentOption(claimRef, bySetDate);
  ResponseSteps.EnterDateToPayOn();
  CommonSteps.EnterFinancialDetails(claimRef);
  ResponseSteps.CheckAndSubmit(claimRef);
});

Scenario('Response with RejectAll and Repayment plan @citizenUI @rejectAll', () => {
  CommonSteps.EnterPersonalDetails(claimRef);
  ResponseSteps.EnterResponseToClaim(claimRef, partAdmit);
  ResponseSteps.SelectOptionInRejectAllClaim('alreadyPaid');
  ResponseSteps.EnterPaymentOption(claimRef, repaymentPlan);
  CommonSteps.EnterFinancialDetails(claimRef);
  ResponseSteps.EnterRepaymentPlan(claimRef);
  ResponseSteps.CheckAndSubmit(claimRef);
});
