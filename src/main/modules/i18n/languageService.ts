import {NextFunction, Request, Response} from 'express';
export const setLanguage = (req: Request, res: Response, next: NextFunction) => {
  const selectedLanguage = req.query.lang || req.cookies.lang || 'en';
  res.locals.lang = selectedLanguage;
  // Keep both conventions for legacy and govuk-frontend templates.
  res.locals.htmlLang = selectedLanguage;
  res.locals.html_lang = selectedLanguage;
  next();
};
