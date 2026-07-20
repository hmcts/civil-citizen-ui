import {NextFunction, Request, Response} from 'express';

type SupportedLanguage = 'en' | 'cy';

const getSupportedLanguage = (language: unknown): SupportedLanguage | undefined => {
  const languages = Array.isArray(language) ? language : [language];
  for (const value of languages) {
    if (typeof value === 'string') {
      const match = /^(en|cy)(?:-[a-z0-9]{1,8})*$/i.exec(value);
      if (match) {
        return match[1].toLowerCase() as SupportedLanguage;
      }
    }
  }
};

export const setLanguage = (req: Request, res: Response, next: NextFunction) => {
  const query = req.query;
  const lang = getSupportedLanguage(query.lang) || getSupportedLanguage(req.cookies.lang) || 'en';
  if (Object.prototype.hasOwnProperty.call(query, 'lang')) {
    Object.defineProperty(req, 'query', {
      configurable: true,
      enumerable: true,
      value: {...query, lang},
    });
  }
  req.cookies.lang = lang;
  res.locals.lang = lang;
  res.locals.htmlLang = lang;
  next();
};
