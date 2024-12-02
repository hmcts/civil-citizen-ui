import {NextFunction, Response} from 'express';
import {AppRequest} from 'models/AppRequest';
import {BACK_URL} from 'routes/urls';

export const GaTrackHistory = async (req: AppRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if(req.originalUrl !== BACK_URL && req.originalUrl){
      if (!req.session.history) {
        req.session.history = [];
      }
      //removing lang from originalUrl
      const cleanUrl = req.originalUrl;
      if (req.session.history.length === 0 || req.session.history[req.session.history.length - 1] !== cleanUrl) {
        req.session.history.push(req.originalUrl);
      }
    }
    next();
  } catch (error) {
    next(error);
  }
};
