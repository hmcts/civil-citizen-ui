import unauthorisedRoute from './unauthorised';
import dashboardRoute from './features/dashboard/dashboardController';
import responseRoute from './features/response/index';
import phoneDetailsRoute from './features/response/citizenPhoneNumber/citizenPhoneController';
import responseDobRoute from './features/response/citizenDob/citizenDobController';
import ageEligibilityRoute from './features/response/ageEligibility/ageEligibilityController';

export default [
  dashboardRoute,
  unauthorisedRoute,
  responseRoute,
  phoneDetailsRoute,
  responseDobRoute,
  ageEligibilityRoute,
];
