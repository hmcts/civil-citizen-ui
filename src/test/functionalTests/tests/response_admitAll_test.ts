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
const bySetDate = 'bySetDate';
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

Scenario('Response with AdmitAll and Date to PayOn @citizenUI', () => {
  responseSteps.VerifyResponsePageContent(claimRef);
  responseSteps.EnterNameAndAddressDetails(claimRef);
  responseSteps.EnterDateOfBirth(claimRef);
  responseSteps.EnterContactNumber(claimRef);
  responseSteps.EnterResponseToClaim(claimRef, admitAll);
  responseSteps.EnterPaymentOption(claimRef, bySetDate);
  responseSteps.EnterDateToPayOn();
  responseSteps.ShareYourFinancialDetailsIntro(claimRef);
  responseSteps.EnterBankAccountDetails();
  responseSteps.SelectDisabilityDetails('yes', 'yes');
  responseSteps.SelectResidenceDetails('ownHome');
  responseSteps.SelectPartnerDetails('yes');
  responseSteps.SelectPartnerAge('yes');
  responseSteps.SelectPartnerPension('yes');
  responseSteps.SelectPartnerDisability('no');
  responseSteps.SelectDependantDetails('yes');
  responseSteps.SelectOtherDependantDetails('yes');
  responseSteps.SelectEmploymentDetails('yes');
  responseSteps.EnterEmployerDetails();
  responseSteps.EnterSelfEmploymentDetails();
  responseSteps.EnterSelfEmploymentTaxDetails();
  responseSteps.EnterCourtOrderDetails(claimRef);

  // responseSteps.CheckAndSubmit(claimRef);
});


