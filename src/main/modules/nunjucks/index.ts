import { join } from 'path';
import { Express } from 'express';
import { configure } from 'nunjucks';
import * as numeral from '../../common/utils/currencyFormat';
import { i18n, TOptions } from 'i18next';

const packageDotJson = require('../../../../package.json');

const appAssetPaths = {
  js: '/js',
  jsVendor: '/js/lib',
  webchat: '/webchat',
  style: '/stylesheets',
  styleVendor: '/stylesheets/lib',
  images: '/img',
  imagesVendor: '/img/lib',
  pdf: '/pdf',
};

export class Nunjucks {
  constructor(public developmentMode: boolean, public i18next : i18n) {
    this.developmentMode = developmentMode;
    this.i18next = i18next;
  }

  enableFor(app: Express): void {
    app.set('view engine', 'njk');
    const govUkFrontendPath = join(
      __dirname,
      '..',
      '..',
      '..',
      '..',
      'node_modules',
      'govuk-frontend',
    );
    const nunjucksEnv = configure(
      [join(__dirname, '..', '..', 'views'),
        join(__dirname, '..', '..', 'common'),
        join(__dirname, '..', '..', 'features'),
        join(__dirname, '..', '..', 'views', 'macro'),
        join(__dirname, '..', '..', 'views', 'includes'),
        join(__dirname, '..', '..', 'views', 'macro', 'back-link'),
        govUkFrontendPath,
        join(__dirname, '..', '..', '..', '..', 'node_modules', '@hmcts', 'civil-citizen-ui', 'macros'),
      ],
      {
        autoescape: true,
        watch: this.developmentMode,
        express: app,
      },
    );

    const currencyFormat = (value: any) => numeral.default(value);

    nunjucksEnv.addGlobal('asset_paths', appAssetPaths);
    nunjucksEnv.addGlobal('development', this.developmentMode);
    nunjucksEnv.addGlobal('govuk_template_version', packageDotJson.dependencies.govuk_template_jinja);
    nunjucksEnv.addFilter('currencyFormat', currencyFormat);
    nunjucksEnv.addGlobal('t', (key: string, options?: TOptions): string => this.i18next.t(key, options));

    app.use((req, res, next) => {
      res.locals.pagePath = req.path;
      next();
    });
  }
}
