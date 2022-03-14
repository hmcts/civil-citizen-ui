import homeRoute from './home';
import unauthorisedRoute from './unauthorised';
import dashboardRoute from './features/dashboard/dashboardController';
import phoneDetailsRoute from './features/response/citizenPhoneNumber/citizenPhoneController';
import responseDobRoute from './features/response/citizenDob/citizenDobController';
import ageEligibilityRoute from './features/response/ageEligibility/ageEligibilityController';
import responseDetailsRoute from './features/response/citizenDetails/citizenDetailsController';
import claimDetailsRoute from './features/response/claimDetails/claimDetailsController';
import responsePostcodeLookupRoute from './features/response/citizenDetails/postcodeLookupController';
import citizenResponseType from './features/response/responseType/citizenResponseType';
import citizenPartnerAgeController from './features/response/statementOfMeans/partnerAgeController';

export default [
  homeRoute,
  dashboardRoute,
  unauthorisedRoute,
  responseDetailsRoute,
  phoneDetailsRoute,
  responseDobRoute,
  claimDetailsRoute,
  ageEligibilityRoute,
  responsePostcodeLookupRoute,
  citizenResponseType,
  citizenPartnerAgeController,
];
