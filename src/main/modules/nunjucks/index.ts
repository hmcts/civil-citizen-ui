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
import {ChooseHowProceed} from 'common/models/chooseHowProceed';
import {UnemploymentCategory} from 'common/form/models/statementOfMeans/unemployment/unemploymentCategory';
import {TransactionSchedule} from 'common/form/models/statementOfMeans/expensesAndIncome/transactionSchedule';
import {EvidenceType} from 'common/models/evidence/evidenceType';
import {addDaysFilter, addDaysFilterTranslated, dateFilter, formatDate} from './filters/dateFilter';
import {SignatureType} from 'common/models/signatureType';
import {ClaimSummaryType} from 'common/form/models/claimSummarySection';
import {FormValidationError} from 'common/form/validationErrors/formValidationError';
import {NotEligibleReason} from 'common/form/models/eligibility/NotEligibleReason';
import {TotalAmountOptions} from 'common/models/eligibility/totalAmountOptions';
import {ClaimTypeOptions} from 'common/models/eligibility/claimTypeOptions';
import {AgeEligibilityOptions} from 'common/form/models/eligibility/defendant/AgeEligibilityOptions';
import {LanguageOptions} from 'common/models/directionsQuestionnaire/languageOptions';
import {
  CaseState,
  InterestClaimFromType,
  InterestEndDateType,
  SameRateInterestType,
} from 'common/form/models/claimDetails';
import * as urls from '../../routes/urls';
import {InterestClaimOptionsType} from 'common/form/models/claim/interest/interestClaimOptionsType';
import {ClaimBilingualLanguagePreference} from 'common/models/claimBilingualLanguagePreference';
import {CourtProposedDateOptions} from 'common/form/models/claimantResponse/courtProposedDate';
import {CourtProposedPlanOptions} from 'common/form/models/claimantResponse/courtProposedPlan';
import {ClaimResponseStatus} from 'common/models/claimResponseStatus';
import {UnavailableDateType} from 'common/models/directionsQuestionnaire/hearing/unavailableDates';
import {PaymentOptionType} from 'common/form/models/admission/paymentOption/paymentOptionType';
import config from 'config';
import crypto from 'crypto';
import {TaskStatus} from 'models/taskList/TaskStatus';
import {AppRequest} from 'models/AppRequest';
import {ApplicationTypeOption} from 'common/models/generalApplication/applicationType';
import {HearingTypeOptions} from 'common/models/generalApplication/hearingArrangement';
import { ProposedPaymentPlanOption } from 'common/models/generalApplication/response/acceptDefendantOffer';
import {getLanguage} from 'modules/i18n/languageService';

const packageDotJson = require('../../../../package.json');

const dynatraceUrl = config.get<string>('services.dynatrace.url');

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
      'govuk-frontend/dist',
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

    const translateErrors = (keys: FormValidationError[], t: (key: string) => string, formatValues: { keyError: string, keyToReplace: string, valueToReplace: string }[]) => {
      return keys.map((key) => {
        if (formatValues) {
          const formatValue = formatValues.find(v => v.keyError === key.text);
          if (formatValue) {
            const translation = t(key.text);
            const replaced = translation.replace(formatValue.keyToReplace, formatValue.valueToReplace);
            return ({...key, text: replaced});
          }
        }
        if(key?.text)
          return ({...key, text: t(key?.text)});
      }).filter(item => item);
    };

    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    const nonceValue = crypto.randomBytes(16).toString('base64');
    const nonceDataLayer = crypto.randomBytes(16).toString('base64');

    nunjucksEnv.addGlobal('asset_paths', appAssetPaths);
    nunjucksEnv.addGlobal('development', this.developmentMode);
    nunjucksEnv.addGlobal('govuk_template_version', packageDotJson.dependencies.govuk_template_jinja);
    nunjucksEnv.addFilter('currencyFormat', currencyFormat);
    nunjucksEnv.addFilter('addDays', addDaysFilter);
    nunjucksEnv.addFilter('addDaysTranslated', addDaysFilterTranslated);
    nunjucksEnv.addFilter('date', dateFilter);
    nunjucksEnv.addFilter('formatDate', formatDate);
    nunjucksEnv.addFilter('replaceSpaces', replaceSpace);
    nunjucksEnv.addGlobal('t', t);
    nunjucksEnv.addGlobal('getLanguage', getLanguage);
    nunjucksEnv.addGlobal('translateErrors', translateErrors);
    nunjucksEnv.addGlobal('ResponseType', ResponseType);
    nunjucksEnv.addGlobal('YesNo', YesNo);
    nunjucksEnv.addGlobal('ResidenceType', ResidenceType);
    nunjucksEnv.addGlobal('partyType', PartyType);
    nunjucksEnv.addGlobal('chooseHowProceed', ChooseHowProceed);
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
    nunjucksEnv.addGlobal('CourtProposedDateOptions', CourtProposedDateOptions);
    nunjucksEnv.addGlobal('CourtProposedPlanOptions', CourtProposedPlanOptions);
    nunjucksEnv.addGlobal('CaseState', CaseState);
    nunjucksEnv.addGlobal('ClaimResponseStatus', ClaimResponseStatus);
    nunjucksEnv.addGlobal('UnavailableDateType', UnavailableDateType);
    nunjucksEnv.addGlobal('today', new Date());
    nunjucksEnv.addGlobal('nextMonth', nextMonth);
    nunjucksEnv.addGlobal('PaymentOptionType', PaymentOptionType);
    nunjucksEnv.addGlobal('TestingSupportUrl', '/testing-support/create-draft-claim');
    nunjucksEnv.addGlobal('developmentMode', this.developmentMode);
    nunjucksEnv.addGlobal('nonceValue', nonceValue);
    nunjucksEnv.addGlobal('nonceDataLayer', nonceDataLayer);
    nunjucksEnv.addGlobal('TaskStatus', TaskStatus);
    nunjucksEnv.addGlobal('ApplicationTypeOption', ApplicationTypeOption);
    nunjucksEnv.addGlobal('HearingTypeOptions', HearingTypeOptions);
    nunjucksEnv.addGlobal('ProposedPaymentPlanOption', ProposedPaymentPlanOption);
    // TODO : 'GTM-PBT2TQ2D' is test GTM id for integration to the Google Tag Manager for Google Analytics, it should be replaced with production GTM id when it's provided by HMCTS User experience team
    nunjucksEnv.addGlobal('gtmScriptId', 'GTM-PBT2TQ2D');
    nunjucksEnv.addGlobal('dynatraceUrl', dynatraceUrl);

    app.use((req:AppRequest, res, next) => {
      res.locals.pagePath = req.path;
      req.cookies.nonceValue = nonceValue;
      req.cookies.nonceDataLayer = nonceDataLayer;
      res.locals.user=req.session.user;
      next();
    });
  }
}

const replaceSpace = (title: string): string => {
  return title.replace(/ /g, '_').replace('\'','');
};
