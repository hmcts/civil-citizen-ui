import { join } from 'path';
import { Express } from 'express';
import { configure } from 'nunjucks';
import { InitOptions } from 'i18next';
import { Paths as AppPaths } from '../../app/paths';
import { NUMBER_FORMAT } from '../../app/utils/numberFormatter';
const numeralFilter = require('nunjucks-numeral-filter');
import * as numeral from 'numeral';
import * as moment from 'moment';

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
  constructor(public developmentMode: boolean, public i18next: any) {
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

    require('numeral/locales/en-gb');
    numeral.locale('en-gb');
    numeral.defaultFormat(NUMBER_FORMAT);

    moment.locale('en-gb');

    nunjucksEnv.addGlobal('asset_paths', appAssetPaths);
    nunjucksEnv.addGlobal('development', this.developmentMode);
    nunjucksEnv.addGlobal('govuk_template_version', packageDotJson.dependencies.govuk_template_jinja);
    nunjucksEnv.addGlobal('t', (key: string, options?: InitOptions): string => this.i18next.t(key, options));
    nunjucksEnv.addFilter('numeral', numeralFilter);
    nunjucksEnv.addGlobal('AppPaths', AppPaths);

    app.use((req, res, next) => {
      res.locals.pagePath = req.path;
      next();
    });
  }
}
