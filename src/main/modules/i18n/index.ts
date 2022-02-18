import {Express} from 'express';
import {i18n} from 'i18next';

const i18next = require('i18next');
const i18nextMiddleware = require('i18next-http-middleware');
const Backend = require('i18next-fs-backend');

export class I18Next {

  static enableFor(app: Express): i18n {

    i18next
      .use(Backend)
      .use(i18nextMiddleware.LanguageDetector)
      .init({
        backend: {
          loadPath: __dirname + '/locales/{{lng}}/{{ns}}.json',
        },
        detection: {
          order: ['querystring', 'cookie'],
          lookupQuerystring: 'lang',
          lookupCookie: 'lang',
          caches: ['cookie'],
        },
        fallbackLng: 'en',
        supportedLngs: ['en', 'cy'],
        load: 'languageOnly',
        skipOnVariables: true,
      });

    app.use(i18nextMiddleware.handle(i18next));

    return i18next;
  }
}
