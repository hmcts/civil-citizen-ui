import config from 'config';
import {CivilServiceClient} from 'client/civilServiceClient';
import {RequestHandler, Router} from 'express';
import {DASHBOARD_NOTIFICATION_REDIRECT} from 'routes/urls';
import {AppRequest} from 'models/AppRequest';

const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

const notificationRedirectController = Router();

notificationRedirectController.get(DASHBOARD_NOTIFICATION_REDIRECT, (async function(req, res, next){
  const appRequest = <AppRequest> req;
  const claimId = req.params.id;

  await civilServiceClient.recordClick(req.params.notificationId, appRequest);
  const redirectUrl = await getDashboardNotificationRedirectUrl(req.params.locationName, claimId, <AppRequest>req);

  res.redirect(redirectUrl);

}) as RequestHandler);

async function getDashboardNotificationRedirectUrl(locationName: string, claimId: string, req: AppRequest) : Promise<string> {

  let redirectUrl;

  switch(locationName) {
    case 'VIEW_BUNDLE':
      redirectUrl = '/#';
      break;
    case 'VIEW_ORDERS_AND_NOTICES':
      redirectUrl = '/#';
      break;
  }

  return redirectUrl;
}
export default notificationRedirectController;
