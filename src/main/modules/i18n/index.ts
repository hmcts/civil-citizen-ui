import {Express} from 'express';
import {i18n} from 'i18next';
import {normaliseDetectedLanguage} from './languageService';

const i18next = require('i18next');
const i18nextMiddleware = require('i18next-http-middleware');
const Backend = require('i18next-fs-backend');

const options = {
  backend: {
    loadPath: __dirname + '/locales/{{lng}}.json',
  },
  detection: {
    order: ['querystring', 'cookie'],
    lookupQuerystring: 'lang',
    lookupCookie: 'lang',
    caches: ['cookie'],
    convertDetectedLanguage: normaliseDetectedLanguage,
  },
  fallbackLng: 'en',
  supportedLngs: ['en', 'cy'],
  load: 'languageOnly',
  skipOnVariables: true,
};

export class I18Next {
  static enableFor(app: Express): i18n {
    i18next
      .use(Backend)
      .use(i18nextMiddleware.LanguageDetector)
      .init(options);

    app.use(i18nextMiddleware.handle(i18next));
    return i18next;
  }
}
