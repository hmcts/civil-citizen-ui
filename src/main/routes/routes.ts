import homeRoute from './home';
import unauthorisedRoute from './unauthorised';
import dashboardRoute from './features/dashboard/index';
import responseRoute from './features/response/index';
import responseYourRoute from './features/response/dateOfBirth-details';

export default [
  homeRoute,
  dashboardRoute,
  unauthorisedRoute,
  responseRoute,
  responseYourRoute,
];
