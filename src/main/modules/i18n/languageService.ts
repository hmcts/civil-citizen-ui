import {app} from '../../app';
import {Request, Response, NextFunction} from 'express';

export const setLanguage = (req: Request, res: Response, next: NextFunction) => {
  app.locals.lang = req.query.lang ? req.query.lang : req.cookies.lang;
  next();
};

export const getLanguage = () => {
  return app.locals.lang;
};
