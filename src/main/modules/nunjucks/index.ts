import * as path from 'path';
import {join} from 'path';
import {Express} from 'express';
import {configure} from 'nunjucks';
import * as numeral from '../../common/utils/currencyFormat';
import {i18n, TOptions} from 'i18next';
import {ResponseType} from '../../common/form/models/responseType';
import {YesNo} from '../../common/form/models/yesNo';
import {ResidenceType} from '../../common/form/models/statementOfMeans/residenceType';
import {CounterpartyType} from '../../common/models/counterpartyType';
import {UnemploymentCategory} from '../../common/form/models/statementOfMeans/unemployment/unemploymentCategory';
import { TransactionSchedule } from '../../common/form/models/statementOfMeans/expensesAndIncome/transactionSchedule';
import {EvidenceType} from '../../common/models/evidence/evidenceType';
import {EvidenceDetails} from '../../common/models/evidence/evidenceDetails';
import {addDaysFilter, dateFilter} from './filters/dateFilter';
import {SignatureType} from '../../common/models/signatureType';
import {convertToPoundsFilter} from '../../common/utils/currencyFormat';

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
  constructor(public developmentMode: boolean, public i18next: i18n) {
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
    const mojFrontendPath = join(
      __dirname,
      '..',
      '..',
      '..',
      '..',
      'node_modules',
      '@ministryofjustice',
      'frontend',
    );
    const nunjucksEnv = configure([path.join(__dirname, '..', '..', 'views'), govUkFrontendPath, mojFrontendPath], {
      autoescape: true,
      watch: this.developmentMode,
      express: app,
    });

    const currencyFormat = (value: number) => numeral.default(value);

    nunjucksEnv.addGlobal('asset_paths', appAssetPaths);
    nunjucksEnv.addGlobal('development', this.developmentMode);
    nunjucksEnv.addGlobal('govuk_template_version', packageDotJson.dependencies.govuk_template_jinja);
    nunjucksEnv.addFilter('currencyFormat', currencyFormat);
    nunjucksEnv.addFilter('addDays', addDaysFilter);
    nunjucksEnv.addFilter('date', dateFilter);
    nunjucksEnv.addGlobal('t', (key: string, options?: TOptions): string => this.i18next.t(key, options));
    nunjucksEnv.addGlobal('ResponseType', ResponseType);
    nunjucksEnv.addGlobal('YesNo', YesNo);
    nunjucksEnv.addGlobal('ResidenceType', ResidenceType);
    nunjucksEnv.addGlobal('CounterpartyType', CounterpartyType);
    nunjucksEnv.addGlobal('UnemploymentCategory', UnemploymentCategory);
    nunjucksEnv.addGlobal('TransactionSchedule', TransactionSchedule);
    nunjucksEnv.addGlobal('EvidenceType', EvidenceType);
    nunjucksEnv.addGlobal('EvidenceDetails', EvidenceDetails);
    nunjucksEnv.addFilter('pennies2pounds', convertToPoundsFilter);
    nunjucksEnv.addGlobal('SignatureType', SignatureType);

    app.use((req, res, next) => {
      res.locals.pagePath = req.path;
      next();
    });
  }
}
