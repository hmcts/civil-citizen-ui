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
const immediatePayment = 'immediate';
const bySetDate = 'bySetDate';
const repaymentPlan = 'repaymentPlan';

let claimRef;

Feature('Response with PartAdmit');

Before(async ({api}) => {
  claimRef = await api.createSpecifiedClaim(config.applicantSolicitorUser);
  LoginSteps.EnterUserCredentials(config.Username, config.Password);
});

Scenario('Response with PartAdmit and Immediate payment @citizenUI @partAdmit', () => {
  CommonSteps.EnterPersonalDetails(claimRef);
  ResponseSteps.EnterResponseToClaim(claimRef, partAdmit);
  ResponseSteps.SelectPartAdmitAlreadyPaid('yes');
  ResponseSteps.EnterPaymentOption(claimRef, immediatePayment);
  ResponseSteps.CheckAndSubmit(claimRef);
});

Scenario('Response with PartAdmit and Date to PayOn @citizenUI @partAdmit', () => {
  CommonSteps.EnterPersonalDetails(claimRef);
  ResponseSteps.EnterResponseToClaim(claimRef, partAdmit);
  ResponseSteps.SelectPartAdmitAlreadyPaid('yes');
  ResponseSteps.EnterPaymentOption(claimRef, bySetDate);
  ResponseSteps.EnterDateToPayOn();
  CommonSteps.EnterFinancialDetails(claimRef);
  ResponseSteps.CheckAndSubmit(claimRef);
});

Scenario('Response with PartAdmit and Repayment plan @citizenUI @partAdmit', () => {
  CommonSteps.EnterPersonalDetails(claimRef);
  ResponseSteps.EnterResponseToClaim(claimRef, partAdmit);
  ResponseSteps.SelectPartAdmitAlreadyPaid('yes');
  ResponseSteps.EnterPaymentOption(claimRef, repaymentPlan);
  CommonSteps.EnterFinancialDetails(claimRef);
  ResponseSteps.EnterRepaymentPlan(claimRef);
  ResponseSteps.CheckAndSubmit(claimRef);
});
