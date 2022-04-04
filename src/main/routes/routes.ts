import homeController from './home';
import unauthorisedController from './unauthorised';
import dashboardController from './features/dashboard/dashboardController';
import phoneDetailsController from './features/response/citizenPhoneNumber/citizenPhoneController';
import responseDobController from './features/response/citizenDob/citizenDobController';
import ageEligibilityController from './features/response/ageEligibility/ageEligibilityController';
import responseDetailsController from './features/response/citizenDetails/citizenDetailsController';
import claimDetailsController from './features/response/claimDetails/claimDetailsController';
import responsePostcodeLookupController from './features/response/citizenDetails/postcodeLookupController';
import citizenResponseTypeController from './features/response/responseType/citizenResponseTypeController';
import citizenPartnerAgeController from './features/response/statementOfMeans/partner/partnerAgeController';
import citizenDisabilityController from './features/response/statementOfMeans/disabilityController';
import citizenSevereDisabilityController from './features/response/statementOfMeans/severeDisabilityController';
import bankAccountsController from './features/response/statementOfMeans/bankAccounts/bankAccountsController';
import partnerController from './features/response/statementOfMeans/partner/partnerController';
import partnerDisabilityController from './features/response/statementOfMeans/partner/partnerDisabilityController';
import partnerSevereDisabilityController from './features/response/statementOfMeans/partner/partnerSevereDisabilityController';
import employmentStatusController from './features/response/statementOfMeans/employment/employmentStatusController';
import residenceController from './features/response/statementOfMeans/residenceController';
import financialDetailsController from './features/response/financialDetails/financialDetailsController';
import otherDependantsController from './features/response/statementOfMeans/otherDependants/otherDependantsController';
import partnerPensionController from './features/response/statementOfMeans/partner/partnerPensionController';
import paymentOptionController from './features/response/admision/fullAdmission/paymentOption/paymentOptionController';
import betweenSixteenAndNineteenController
  from './features/response/statementOfMeans/dependants/betweenSixteenAndNineteenController';
import dependantsController from './features/response/statementOfMeans/dependants/dependantsController';
import selfEmployedAsController from './features/response/statementOfMeans/employment/selfEmployed/selfEmployedAsController';

export default [
  homeController,
  dashboardController,
  unauthorisedController,
  responseDetailsController,
  phoneDetailsController,
  responseDobController,
  claimDetailsController,
  ageEligibilityController,
  responsePostcodeLookupController,
  citizenResponseTypeController,
  citizenPartnerAgeController,
  partnerDisabilityController,
  citizenDisabilityController,
  citizenSevereDisabilityController,
  bankAccountsController,
  partnerController,
  partnerSevereDisabilityController,
  residenceController,
  employmentStatusController,
  financialDetailsController,
  otherDependantsController,
  partnerPensionController,
  paymentOptionController,
  betweenSixteenAndNineteenController,
  dependantsController,
  selfEmployedAsController,
];
