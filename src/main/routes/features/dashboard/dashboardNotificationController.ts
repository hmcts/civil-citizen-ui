import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import {NOTIFICATION_URL} from '../../urls';
import {testUrl} from '../../../../test/utils/externalURLs';

const dashboardNotificationController = Router();

dashboardNotificationController.get(NOTIFICATION_URL, (async (req: Request, res: Response, next: NextFunction) => {
  try {
    //TODO save the notification action
    console.log('dashboardNotificationController ---- Saving Notification user data');
    res.redirect(testUrl);

  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default dashboardNotificationController;
