import {NextFunction, Request, Response} from 'express';

const supportedLanguages = ['en', 'cy'] as const;
type SupportedLanguage = typeof supportedLanguages[number];

const normaliseLanguage = (language: unknown): SupportedLanguage => {
  return typeof language === 'string' && supportedLanguages.includes(language as SupportedLanguage)
    ? language as SupportedLanguage
    : 'en';
};

export const setLanguage = (req: Request, res: Response, next: NextFunction) => {
  const lang = normaliseLanguage(req.query.lang || req.cookies.lang);
  res.locals.lang = lang;
  res.locals.htmlLang = lang;
  next();
};
