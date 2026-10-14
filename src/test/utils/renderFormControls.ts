import path from 'path';
import {createInstance} from 'i18next';
import {ValidationError} from 'class-validator';
import {GenericForm} from 'common/form/models/genericForm';
import {GenericYesNo} from 'common/form/models/genericYesNo';
import {YesNo} from 'common/form/models/yesNo';
import {CaseState} from 'common/form/models/claimDetails';
import {ClaimSummaryType} from 'common/form/models/claimSummarySection';
import {ProposedPaymentPlanOption} from 'common/models/generalApplication/response/acceptDefendantOffer';
import {addDaysFilterTranslated} from 'modules/nunjucks/filters/dateFilter';
import en from '../../main/modules/i18n/locales/en.json';
import cy from '../../main/modules/i18n/locales/cy.json';

const nunjucks = require('nunjucks');

// Only the page shell is substituted. The actual caller, shared macros,
// conditionals, translations and locked GOV.UK controls are rendered unchanged.
class FormShellLoader extends nunjucks.Loader {
  getSource(name: string) {
    if (name.endsWith('claim-details-tpl.njk') || name.endsWith('claim-details-tpl-dashboard.njk')) {
      return {src: '{% from "macro/page-title.njk" import setPageTitle %}<!doctype html><html lang="{{ lang }}"><head><title>{% block pageTitle %}{% endblock %}</title></head><body class="govuk-template__body"><div class="govuk-width-container"><main class="govuk-main-wrapper">{% block content %}{% endblock %}{% block nestedContent %}{% endblock %}</main></div></body></html>', path: name, noCache: true};
    }
    return null;
  }
}

export function formControlTranslate(language = 'en') {
  const instance = createInstance();
  instance.init({lng: language, fallbackLng: 'en', initImmediate: false, resources: {en: {translation: en}, cy: {translation: cy}}, interpolation: {escapeValue: false}});
  return (key: string, values: Record<string, unknown> = {}) => key ? String(instance.t(key, values)) : '';
}

export function formControlsEnvironment(viewsDirectory?: string) {
  const root = path.resolve(__dirname, '../../..');
  const env = new nunjucks.Environment([new FormShellLoader(), new nunjucks.FileSystemLoader([viewsDirectory || path.join(root, 'src/main/views'), path.join(root, 'node_modules/govuk-frontend/dist')])], {autoescape: true});
  env.addGlobal('YesNo', YesNo);
  env.addGlobal('CaseState', CaseState);
  env.addGlobal('ClaimSummaryType', ClaimSummaryType);
  env.addGlobal('ProposedPaymentPlanOption', ProposedPaymentPlanOption);
  // Match production's translation/replacement logic without importing app startup.
  env.addGlobal('translateErrors', (errors: {text: string}[], t: (key: string) => string, formats?: {keyError: string; keyToReplace: string; valueToReplace: string}[]) => errors.filter(error => error?.text).map(error => {
    const format = formats?.find(value => value.keyError === error.text);
    return {...error, text: format ? t(error.text).replace(format.keyToReplace, format.valueToReplace) : t(error.text)};
  }));
  env.addFilter('addDaysTranslated', addDaysFilterTranslated);
  return env;
}

export function formControlForm(model: Record<string, unknown> = {}, errors: Record<string, string> = {}) {
  const actualModel = Object.assign(new GenericYesNo(), model);
  const validationErrors: ValidationError[] = Object.entries(errors).map(([property, text]) => ({property, constraints: {fixture: text}, children: [] as ValidationError[]}));
  return new GenericForm(actualModel, validationErrors);
}

export type FormControlState = 'blank' | 'yes' | 'no' | 'error';
export function formControlContext(view: string, language = 'en', state: FormControlState = 'blank', extra: Record<string, unknown> = {}) {
  const t = formControlTranslate(language);
  const saved = state !== 'blank';
  const model = {option: state === 'no' ? 'no' : saved ? 'yes' : undefined, day: saved ? 12 : undefined, month: saved ? 6 : undefined, year: saved ? 1980 : undefined,
    dob: {day: saved ? 12 : undefined, month: saved ? 6 : undefined, year: saved ? 1980 : undefined},
    details: saved ? 'Saved details' : '', vulnerabilityDetails: saved ? 'Saved support' : '', reasonForHearing: saved ? 'Saved hearing reason' : '',
    referenceNumber: saved ? 'HWF-ABC-123' : '', reasonForDisagreement: saved ? 'Saved disagreement' : '', textArea: saved ? 'Saved changes' : '', mediationPhoneNumber: '07700900123', amountPerMonth: 25,
    type: ProposedPaymentPlanOption.PROPOSE_BY_SET_DATE, reasonProposedInstalment: 'Saved instalments', reasonProposedSetDate: 'Saved date reason'};
  const isDate = /citizen-dob|date-paid|defendant-dob|payment-date|accept-defendant-offer/.test(view);
  const field = isDate ? view.includes('defendant-dob') ? 'dob[day]' : 'day' : 'option';
  const form = formControlForm(model, state === 'error' ? {[field]: isDate ? 'ERRORS.VALID_DAY' : 'ERRORS.VALID_YES_NO_OPTION'} : {});
  const titleKey = view.includes('subject-to-frc') ? 'PAGES.SUBJECT_TO_FRC.TITLE' : view.includes('frc-band-agreed') ? 'PAGES.FRC_BAND_AGREED.TITLE' : view.includes('expert-evidence') ? 'PAGES.DEFENDANT_EXPERT_EVIDENCE.TITLE' : view.includes('request-extra') ? 'PAGES.REQUEST_EXTRA_4WEEKS.PAGE_TITLE' : 'PAGES.ADMISSION_PAYMENT_DATE.TITLE';
  const content = (text: string) => [{type: ClaimSummaryType.MAINTITLE, data: {text}}];
  return {t, lang: language, form, csrf: 'fixture-csrf', pageTitle: titleKey, title: view.includes('request-extra') || view.includes('expert-evidence') ? t(titleKey) : titleKey,
    buttonTitle: titleKey.replace(/TITLE$/, 'BUTTON_TITLE'), componentText: 'PAGES.CONSIDER_CLAIMANT_DOCUMENTS.TITLE', nextMonth: new Date(2027, 5, 12), today: new Date(2026, 9, 14), maxDateForAge18: new Date(2008, 9, 14),
    claimantView: false, claimStatus: CaseState.AWAITING_APPLICANT_INTENTION, respondentTelNumber: '07700900123', isPaidInFull: false, admittedAmount: '125.00', paidAmount: '25.00',
    caption: 'COMMON.GENERAL_APPLICATION', applicationType: 'COMMON.GENERAL_APPLICATION', cancelUrl: '/cancel', data: {claimant: 'Alex', defendant: 'Morgan', agreementText: 'Pay in full', completionDateText: '12 June 2027'},
    applyHelpWithFeesContent: content('PAGES.APPLY_HELP_WITH_FEES.START.TITLE'), applyHelpWithFeeSelectionContents: content('PAGES.GENERAL_APPLICATION.APPLY_HELP_WITH_FEE.WANT_TO_APPLY_HWF_PAGE_TITLE'),
    applyHelpWithFeeReferenceContents: content('PAGES.GENERAL_APPLICATION.APPLY_HELP_WITH_FEE.REFERENCE_NUMBER.PAGE_TITLE'),
    applyHelpWithFeeSelectionButtonContents: [{type: ClaimSummaryType.BUTTON, data: {text: 'COMMON.BUTTONS.CONTINUE'}}],
    applyHelpWithFeeReferenceButtonContents: [{type: ClaimSummaryType.BUTTON, data: {text: 'COMMON.BUTTONS.CONTINUE'}}],
    hasAnythingChangedContents: content('PAGES.HAS_ANYTHING_CHANGED.PAGE_TITLE'), isCaseReadyContents: content('PAGES.IS_CASE_READY.PAGE_TITLE'), ...extra};
}

export function renderFormControlPage(view: string, language = 'en', state: FormControlState = 'blank', extra: Record<string, unknown> = {}, viewsDirectory?: string): string {
  return formControlsEnvironment(viewsDirectory).render(view, formControlContext(view, language, state, extra));
}
export const formControlPages = [
  'features/settlementAgreement/respond-settlement-agreement.njk',
  'features/response/admission/payment-date.njk',
  'features/response/admission/partialAdmission/already-paid.njk',
  'features/response/citizenDob/citizen-dob.njk',
  'features/helpWithFees/help-fees-start.njk',
  'features/directionsQuestionnaire/tried-to-settle-claim.njk',
  'features/directionsQuestionnaire/defendant-yourself-evidence.njk',
  'features/directionsQuestionnaire/consider-claimant-documents.njk',
  'features/directionsQuestionnaire/request-extra-4weeks.njk',
  'features/directionsQuestionnaire/hearing/cant-attend-hearing-in-next-12-months.njk',
  'features/directionsQuestionnaire/hearing/determination-without-hearing.njk',
  'features/directionsQuestionnaire/hearing/phone-or-video-hearing.njk',
  'features/directionsQuestionnaire/mintiMultiTrack/claimant-documents-to-be-considered.njk',
  'features/directionsQuestionnaire/experts/permission-for-expert.njk',
  'features/directionsQuestionnaire/experts/expert-evidence.njk',
  'features/directionsQuestionnaire/experts/shared-expert.njk',
  'features/directionsQuestionnaire/vulnerabilityQuestions/vulnerability.njk',
  'features/directionsQuestionnaire/fixedRecoverableCosts/subject-to-frc.njk',
  'features/directionsQuestionnaire/fixedRecoverableCosts/frc-band-agreed.njk',
  'features/mediation/can-we-use.njk',
  'features/mediation/mediation-disagreement.njk',
  'features/claimantResponse/settle-admitted.njk',
  'features/claimantResponse/claimant-intention-to-proceed.njk',
  'features/claimantResponse/part-payment-received.njk',
  'features/claimantResponse/settle-claim.njk',
  'features/claimantResponse/ccj/defendant-dob.njk',
  'features/claimantResponse/paidInFull/date-paid.njk',
  'features/public/eligibility/help-with-fees-reference.njk',
  'features/public/eligibility/claimant-address-eligibility.njk',
  'features/public/eligibility/claim-against-government.njk',
  'features/public/eligibility/tenancy-deposit.njk',
  'features/public/eligibility/over-18.njk',
  'features/public/eligibility/defendant-eligible-address.njk',
  'features/public/eligibility/known-claim-amount.njk',
  'features/public/eligibility/some-useful-info-fees.njk',
  'features/public/eligibility/single-defendant.njk',
  'features/public/eligibility/help-with-fees.njk',
  'features/caseProgression/trialArrangements/has-anything-changed.njk',
  'features/caseProgression/trialArrangements/is-case-ready.njk',
  'features/generalApplication/respondent-agreement.njk',
  'features/generalApplication/agree-to-order.njk',
  'features/generalApplication/unavailable-dates-confirmation.njk',
  'features/generalApplication/additionalFee/help-with-additional-fee.njk',
  'features/generalApplication/response/accept-defendant-offer.njk',
  'features/generalApplication/certOfSorC/final-payment-date.njk',
  'features/generalApplication/applicationFee/help-with-application-fee.njk',
  'features/generalApplication/applicationFee/help-with-application-fee-reference.njk',
  'features/claim/interest/claim-interest.njk',
  'features/claim/interest/continue-claiming-interest.njk',
  'features/claim/details/help-with-fees.njk',
  'features/claim/airlines/delayed-flight.njk',
];
