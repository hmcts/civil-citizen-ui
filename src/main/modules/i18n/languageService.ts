import {NextFunction, Request, Response} from 'express';

type SupportedLanguage = 'en' | 'cy';
type RequestLanguage = SupportedLanguage | 'cimode';

const getRequestLanguage = (language: unknown): RequestLanguage | undefined => {
  const languages = Array.isArray(language) ? language : [language];
  for (const value of languages) {
    if (typeof value === 'string') {
      if (value.toLowerCase() === 'cimode') {
        return 'cimode';
      }
      const match = /^(en|cy)(?:-[a-z0-9]{1,8})*$/i.exec(value);
      if (match) {
        return match[1].toLowerCase() as SupportedLanguage;
      }
    }
  }
};

export const setLanguage = (req: Request, res: Response, next: NextFunction) => {
  const query = req.query;
  const lang = getRequestLanguage(query.lang) || getRequestLanguage(req.cookies.lang) || 'en';
  if (Object.prototype.hasOwnProperty.call(query, 'lang')) {
    Object.defineProperty(req, 'query', {
      configurable: true,
      enumerable: true,
      value: {...query, lang},
    });
  }
  if (Object.prototype.hasOwnProperty.call(req.cookies, 'lang')) {
    req.cookies.lang = lang;
  }
  res.locals.lang = lang;
  res.locals.htmlLang = lang === 'cimode' ? 'en' : lang;
  next();
};
