import {NextFunction, Response} from 'express';
import {AppRequest} from 'models/AppRequest';
import {BACK_URL} from 'routes/urls';

export const trackHistory =async (req: AppRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if(req.originalUrl !== BACK_URL){
      if (!req.session.history) {
        req.session.history = [];
      }

      if (req.session.history.length === 0 || req.session.history[req.session.history.length - 1] !== req.originalUrl) {
        req.session.history.push(req.originalUrl);
      }
    }
    next();
  } catch (error) {
    next(error);
  }
};
