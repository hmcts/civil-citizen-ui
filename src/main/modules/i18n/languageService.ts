import {NextFunction, Request, Response} from 'express';
export const setLanguage = (req: Request, res: Response, next: NextFunction) => {
  res.locals.lang = req.query.lang || req.cookies.lang || 'en';
  next();
};
