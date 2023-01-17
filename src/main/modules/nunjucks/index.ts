import * as path from 'path';
import {join} from 'path';
import {Express} from 'express';
import {configure} from 'nunjucks';
import * as numeral from 'common/utils/currencyFormat';
import {convertToPoundsFilter} from 'common/utils/currencyFormat';
import {t} from 'i18next';
import {ResponseType} from 'common/form/models/responseType';
import {YesNo, YesNoNotReceived} from 'common/form/models/yesNo';
import {ResidenceType} from 'common/form/models/statementOfMeans/residence/residenceType';
import {PartyType} from 'common/models/partyType';
import {UnemploymentCategory} from 'common/form/models/statementOfMeans/unemployment/unemploymentCategory';
import {TransactionSchedule} from 'common/form/models/statementOfMeans/expensesAndIncome/transactionSchedule';
import {EvidenceType} from 'common/models/evidence/evidenceType';
import {addDaysFilter, dateFilter, formatDate, addDaysFilterTranslated} from './filters/dateFilter';
import {SignatureType} from '../../common/models/signatureType';
import {ClaimSummaryType} from '../../common/form/models/claimSummarySection';
import {FormValidationError} from '../../common/form/validationErrors/formValidationError';
import {NotEligibleReason} from '../../common/form/models/eligibility/NotEligibleReason';
import {TotalAmountOptions} from '../../common/models/eligibility/totalAmountOptions';
import {ClaimTypeOptions} from '../../common/models/eligibility/claimTypeOptions';
import {AgeEligibilityOptions} from '../../common/form/models/eligibility/defendant/AgeEligibilityOptions';
import {LanguageOptions} from '../../common/models/directionsQuestionnaire/languageOptions';
import {CaseState, SameRateInterestType} from '../../common/form/models/claimDetails';
import {InterestClaimFromType} from '../../common/form/models/claimDetails';
import {InterestEndDateType} from '../../common/form/models/claimDetails';
import * as urls from '../../routes/urls';
import {InterestClaimOptionsType} from '../../common/form/models/claim/interest/interestClaimOptionsType';
import {ClaimBilingualLanguagePreference} from 'common/models/claimBilingualLanguagePreference';
import {CourtProposedPlanOptions} from 'common/form/models/claimantResponse/courtProposedPlan';
import {ClaimResponseStatus} from 'common/models/claimResponseStatus';

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
  constructor(public developmentMode: boolean) {
    this.developmentMode = developmentMode;
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

    const translateErrors = (keys: FormValidationError[], t: (key:string) => string, formatValues: { keyError: string,keyToReplace: string, valueToReplace: string }[]) => {
      return keys.map((key) => {
        if(formatValues){
          const formatValue = formatValues.find(v => v.keyError === key.text);
          if(formatValue){
            const translation = t(key.text);
            const replaced = translation.replace(formatValue.keyToReplace, formatValue.valueToReplace);
            return ({...key, text: replaced});
          }
        }
        return ({...key, text: t(key?.text)});
      });
    };

    nunjucksEnv.addGlobal('asset_paths', appAssetPaths);
    nunjucksEnv.addGlobal('development', this.developmentMode);
    nunjucksEnv.addGlobal('govuk_template_version', packageDotJson.dependencies.govuk_template_jinja);
    nunjucksEnv.addFilter('currencyFormat', currencyFormat);
    nunjucksEnv.addFilter('addDays', addDaysFilter);
    nunjucksEnv.addFilter('addDaysTranslated', addDaysFilterTranslated);
    nunjucksEnv.addFilter('date', dateFilter);
    nunjucksEnv.addFilter('formatDate', formatDate);
    nunjucksEnv.addGlobal('t', t);
    nunjucksEnv.addGlobal('translateErrors', translateErrors);
    nunjucksEnv.addGlobal('ResponseType', ResponseType);
    nunjucksEnv.addGlobal('YesNo', YesNo);
    nunjucksEnv.addGlobal('ResidenceType', ResidenceType);
    nunjucksEnv.addGlobal('partyType', PartyType);
    nunjucksEnv.addGlobal('UnemploymentCategory', UnemploymentCategory);
    nunjucksEnv.addGlobal('TransactionSchedule', TransactionSchedule);
    nunjucksEnv.addGlobal('EvidenceType', EvidenceType);
    nunjucksEnv.addFilter('pennies2pounds', convertToPoundsFilter);
    nunjucksEnv.addGlobal('SignatureType', SignatureType);
    nunjucksEnv.addGlobal('ClaimSummaryType', ClaimSummaryType);
    nunjucksEnv.addGlobal('NotEligibleReason', NotEligibleReason);
    nunjucksEnv.addGlobal('AgeEligibilityOptions', AgeEligibilityOptions);
    nunjucksEnv.addGlobal('TotalAmountOptions', TotalAmountOptions);
    nunjucksEnv.addGlobal('ClaimTypeOptions', ClaimTypeOptions);
    nunjucksEnv.addGlobal('YesNoNotReceived', YesNoNotReceived);
    nunjucksEnv.addGlobal('LanguageOptions', LanguageOptions);
    nunjucksEnv.addGlobal('SameRateInterestType', SameRateInterestType);
    nunjucksEnv.addGlobal('InterestClaimFromType', InterestClaimFromType);
    nunjucksEnv.addGlobal('InterestEndDateType', InterestEndDateType);
    nunjucksEnv.addGlobal('urls', urls);
    nunjucksEnv.addGlobal('InterestClaimOptionsType', InterestClaimOptionsType);
    nunjucksEnv.addGlobal('ClaimBilingualLanguagePreference', ClaimBilingualLanguagePreference);
    nunjucksEnv.addGlobal('CourtProposedPlanOptions', CourtProposedPlanOptions);
    nunjucksEnv.addGlobal('CaseState', CaseState);
    nunjucksEnv.addGlobal('ClaimResponseStatus', ClaimResponseStatus);

    app.use((req, res, next) => {
      res.locals.pagePath = req.path;
      next();
    });
  }
}
