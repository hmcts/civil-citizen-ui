import {NextFunction, Request, Response} from 'express';
export const setLanguage = (req: Request, res: Response, next: NextFunction) => {
  const lang = req.query.lang || req.cookies.lang || 'en';
  res.locals.lang = lang;
  res.locals.htmlLang = lang === 'cy' ? 'cy' : 'en';
  next();
};
