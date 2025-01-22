import {NextFunction, Response} from 'express';
import {AppRequest} from 'models/AppRequest';
import {BACK_URL} from 'routes/urls';

export const GaTrackHistory = async (req: AppRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if(req.originalUrl !== BACK_URL && req.originalUrl){
      if (!req.session.history) {
        req.session.history = [];
      }
      const lastHistory = req.session.history[req.session.history.length - 1];
      // Compare last item current url without query params.  Ensures file upload pages are not duplicated in history
      if (req.session.history.length === 0 || lastHistory?.replace(/\?.*$/, '') !== req.originalUrl.replace(/\?.*$/, '')) {
        req.session.history.push(req.originalUrl);
      }
    }
    next();
  } catch (error) {
    next(error);
  }
};
