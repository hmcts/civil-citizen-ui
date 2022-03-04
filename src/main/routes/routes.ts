import homeRoute from './home';
import unauthorisedRoute from './unauthorised';
import dashboardRoute from './features/dashboard/index';
import responseRoute from './features/response/index';
import phoneDetailsRoute from './features/response/citizenPhoneNumber/citizenPhoneController';
import responseDobRoute from './features/response/citizenDob/citizenDobController';
import ageEligibilityRoute from './features/response/ageEligibility/ageEligibilityController';
import citizenResponseType from './features/response/responseType/citizenResponseType';
import citizenDisability from './features/response/statement-of-means/disabilityController';

export default [
  homeRoute,
  dashboardRoute,
  unauthorisedRoute,
  responseRoute,
  phoneDetailsRoute,
  responseDobRoute,
  ageEligibilityRoute,
  citizenResponseType,
  citizenDisability,
];
