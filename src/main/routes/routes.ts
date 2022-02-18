import homeRoute from './home';
import unauthorisedRoute from './unauthorised';
import dashboardRoute from './features/dashboard/index';
import responseRoute from './features/response/index';
import phoneDetailsRoute from './features/response/phone-details';
import responseDobRoute from './features/response/yourDob/index';

export default [
  homeRoute,
  dashboardRoute,
  unauthorisedRoute,
  responseRoute,
  phoneDetailsRoute,
  responseDobRoute,
];
