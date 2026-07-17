import {NextFunction, Request, Response} from 'express';

type SupportedLanguage = 'en' | 'cy';
const unsupportedLanguage = 'unsupported';

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

export const normaliseDetectedLanguage = (language: string): string => {
  return getSupportedLanguage(language) ?? (/^(en|cy)(?:-|$)/i.test(language) ? unsupportedLanguage : language);
};

export const setLanguage = (req: Request, res: Response, next: NextFunction) => {
  const lang = getSupportedLanguage(req.query.lang) || getSupportedLanguage(req.cookies.lang) || 'en';
  res.locals.lang = lang;
  res.locals.htmlLang = lang;
  next();
};
