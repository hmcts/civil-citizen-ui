import path from 'path';
import i18next from 'i18next';
import postProcessor from 'i18next-sprintf-postprocessor';
import {  LanguageDetector, handle } from 'i18next-http-middleware';
import express from 'express';

import { Backend } from './backend';

/**
 * Module that enables i18n support for Express.js applications
 */
export class I18Next {

  static enableFor(app: express.Express) {
    // eslint-disable-next-line import/no-named-as-default-member
    i18next
      .use(Backend)
      .use(postProcessor)
      .use(LanguageDetector)
      .init({
        backend: {
          loadPath: path.join(__dirname, '../../locales/{{lng}}/{{ns}}.po'),
        },
        detection: {
          order: ['querystring', 'cookie'],
          lookupQuerystring: 'lang',
          lookupCookie: 'lang',
          caches: ['cookie'],
        },
        interpolation: {
          escapeValue: false, // Escaping is already handled by Nunjucks
        },
        supportedLngs: ['en', 'cy'],
        fallbackLng: 'en',
        nsSeparator: false,
        keySeparator: false,
      });

    app.use(handle(i18next));
    return i18next;
  }
}
