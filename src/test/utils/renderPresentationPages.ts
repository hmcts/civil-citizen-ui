import path from 'path';
import {renderProductionPage} from './renderProductionPage';
export {configuredProductionEnvironment as configuredPresentationEnvironment} from './renderProductionPage';
import i18next from 'i18next';
import en from '../../main/modules/i18n/locales/en.json';
import cy from '../../main/modules/i18n/locales/cy.json';
import {GenericForm} from 'common/form/models/genericForm';
import {GenericYesNo} from 'common/form/models/genericYesNo';
import {RepaymentPlanForm} from 'common/form/models/repaymentPlan/repaymentPlanForm';
import {getRepaymentScheduleDisplay} from 'common/utils/repaymentUtils';
import {Claim} from 'models/claim';
import {CaseState} from 'form/models/claimDetails';
import {ClaimDetails} from 'form/models/claim/details/claimDetails';
import {Reason} from 'form/models/claim/details/reason';
import {RejectAllOfClaim} from 'form/models/rejectAllOfClaim';
import {Defence} from 'form/models/defence';
import {FlightDetails} from 'models/flightDetails';
import {AirlineList} from 'models/airlines/flights';
import {buildDataList} from 'services/features/claim/delayedFlightService';
import {ClaimBilingualLanguagePreference} from 'models/claimBilingualLanguagePreference';
import {ClaimType} from 'models/eligibility/claimType';
import {ClaimTypeOptions} from 'models/eligibility/claimTypeOptions';
import {UnemploymentCategory} from 'form/models/statementOfMeans/unemployment/unemploymentCategory';
import {UnemploymentDetails} from 'form/models/statementOfMeans/unemployment/unemploymentDetails';
import {OtherDetails} from 'form/models/statementOfMeans/unemployment/otherDetails';
import {NumberOfChildren} from 'form/models/statementOfMeans/dependants/numberOfChildren';
import {InstalmentFirstPaymentDate} from 'models/claimantResponse/ccj/instalmentFirstPaymentDate';
import {getApplyHelpFeeSelectionContents} from 'services/features/caseProgression/hearingFee/applyHelpFeeSelectionContents';
import {getApplyHelpFeeReferenceContents} from 'services/features/caseProgression/hearingFee/applyHelpFeeReferenceContents';
import {getButtonsContents} from 'services/features/caseProgression/hearingFee/applyHelpFeeSelectionButtonContents';
import {getCancelYourUpload as cancelCaseProgression} from 'services/features/caseProgression/cancelDocumentUpload';
import {getCancelYourUpload as cancelMediation} from 'services/features/mediation/uploadDocuments/mediationCancelUploadService';
import {WhatDoYouWantToDo, WhatToDoTypeOption, RadioButtonItems} from 'form/models/queryManagement/queryManagement';
import {formControlTranslate} from './renderFormControls';

export const presentationFormViews = [
  'features/claim/airlines/flight-details.njk',
  'features/claim/claim-bilingual-language-preference.njk',
  'features/claim/interest/claimant-interest-rate.njk',
  'features/claimantResponse/ccj/paid-amount.njk',
  'features/claimantResponse/ccj/repayment-plan-instalments.njk',
  'features/claimantResponse/instalments-plan.njk',
  'features/response/admission/how-much-have-you-paid.njk',
  'features/response/admission/partialAdmission/how-much-do-you-owe.njk',
  'features/response/admission/payment-option.njk',
  'features/response/bilingual-language-preference.njk',
  'features/response/citizenResponseType/citizen-response-type.njk',
  'features/response/eligibility/send-your-response-by-email.njk',
  'features/response/repaymentPlan/repaymentPlan.njk',
  'features/response/responseDeadline/agreed-response-deadline.njk',
  'features/response/statementOfMeans/dependants/dependants.njk',
  'features/response/statementOfMeans/unemployment.njk',
  'features/response/your-defence.njk',
  'features/directionsQuestionnaire/experts/expert-report-details.njk',
  'features/directionsQuestionnaire/experts/sent-expert-reports.njk',
  'features/mediation/company-telephone-number.njk',
  'features/mediation/uploadDocuments/cancel-your-upload.njk',
  'features/caseProgression/cancel-your-upload.njk',
  'features/caseProgression/hearingFee/apply-help-fee-reference.njk',
  'features/caseProgression/hearingFee/apply-help-fee-selection.njk',
  'features/generalApplication/additionalInfoUpload/additional-info.njk',
  'features/generalApplication/additionalInfoUpload/respondToWrittenRepInfo.njk',
  'features/generalApplication/response/respondent-want-to-upload-documents.njk',
  'features/generalApplication/want-to-upload-documents.njk',
  'features/public/eligibility/claim-type.njk',
  'features/queryManagement/qm-questions-template.njk',
];

const controllerPageTitles: Record<string, string> = {
  'features/claim/airlines/flight-details.njk': 'PAGES.FLIGHT_DETAILS.FLIGHT_DETAILS',
  'features/claim/claim-bilingual-language-preference.njk': 'PAGES.CLAIM_BILINGUAL_LANGUAGE_PREFERENCE.PAGE_TITLE',
  'features/claim/interest/claimant-interest-rate.njk': 'PAGES.CLAIMANT_INTEREST_RATE.PAGE_TITLE',
  'features/claimantResponse/ccj/paid-amount.njk': 'PAGES.CCJ_PAID_AMOUNT.PAGE_TITLE',
  'features/claimantResponse/ccj/repayment-plan-instalments.njk': 'PAGES.CCJ_REPAYMENT_PLAN_INSTALMENTS.PAGE_TITLE',
  'features/claimantResponse/instalments-plan.njk': 'PAGES.CCJ_REPAYMENT_PLAN_INSTALMENTS.TITLE',
  'features/directionsQuestionnaire/experts/expert-report-details.njk': 'PAGES.EXPERT_REPORT_DETAILS.PAGE_TITLE',
  'features/directionsQuestionnaire/experts/sent-expert-reports.njk': 'PAGES.SENT_EXPERT_REPORTS.PAGE_TITLE',
  'features/mediation/company-telephone-number.njk': 'PAGES.MEDIATION_COMPANY_PHONE.PAGE_TITLE',
  'features/public/eligibility/claim-type.njk': 'PAGES.ELIGIBILITY_CLAIM_TYPE.TITLE',
  'features/queryManagement/qm-questions-template.njk': 'PAGES.QM.WHAT_DO_YOU_WANT_TODO_TITLE',
};

const modelTypes: Record<string, [string, string]> = {
  'flight-details': ['models/flightDetails', 'FlightDetails'],
  'claimant-interest-rate': ['form/models/claim/interest/claimantInterestRate', 'ClaimantInterestRate'],
  'paid-amount': ['models/claimantResponse/ccj/paidAmount', 'PaidAmount'],
  'repayment-plan-instalments': ['models/claimantResponse/ccj/repaymentPlanInstalments', 'RepaymentPlanInstalments'],
  'how-much-have-you-paid': ['form/models/admission/howMuchHaveYouPaid', 'HowMuchHaveYouPaid'],
  'how-much-do-you-owe': ['form/models/admission/partialAdmission/howMuchDoYouOwe', 'HowMuchDoYouOwe'],
  'payment-option': ['form/models/admission/paymentOption/paymentOption', 'PaymentOption'],
  'citizen-response-type': ['form/models/citizenResponseType', 'CitizenResponseType'],
  'agreed-response-deadline': ['form/models/agreedResponseDeadline', 'AgreedResponseDeadline'],
  'dependants': ['form/models/statementOfMeans/dependants/dependants', 'Dependants'],
  'unemployment': ['form/models/statementOfMeans/unemployment/unemployment', 'Unemployment'],
  'your-defence': ['form/models/defence', 'Defence'],
  'sent-expert-reports': ['models/directionsQuestionnaire/experts/sentExpertReports', 'SentExpertReports'],
  'company-telephone-number': ['form/models/mediation/companyTelephoneNumber', 'CompanyTelephoneNumber'],
  'additional-info': ['models/generalApplication/response/respondAddInfo', 'RespondAddInfo'],
  'respondToWrittenRepInfo': ['models/generalApplication/response/respondAddInfo', 'RespondAddInfo'],
  'claim-type': ['models/eligibility/claimType', 'ClaimType'],
  'apply-help-fee-reference': ['form/models/caseProgression/hearingFee/applyHelpFeesReferenceForm', 'ApplyHelpFeesReferenceForm'],
  'cancel-your-upload': ['models/caseProgression/cancelDocuments', 'CancelDocuments'],
};
const genericYesNoPostMessages: Record<string, string> = {
  'claim-bilingual-language-preference': 'ERRORS.CLAIM_LANGUAGE_REQUIRED',
  'bilingual-language-preference': 'ERRORS.RESPONSE_LANGUAGE_REQUIRED',
  'want-to-upload-documents': 'ERRORS.GENERAL_APPLICATION.WANT_TO_UPLOAD_DOCUMENTS_YES_NO_SELECTION',
  'respondent-want-to-upload-documents': 'ERRORS.GENERAL_APPLICATION.RESPONDENT_WANT_TO_UPLOAD_DOC_YES_NO_SELECTION',
};

export function presentationFormContext(view: string, language = 'en', state = 'saved', options: {claimState?: CaseState} = {}) {
  const saved = state === 'saved';
  const key = path.basename(view, '.njk');
  const translate = formControlTranslate(language);
  const claim = Object.assign(new Claim(), {ccdState: options.claimState, totalClaimAmount: 100, legacyCaseReference: '000MC001', applicant1: {type: 'INDIVIDUAL', partyDetails: {firstName: 'Alex', lastName: 'Example'}}, respondent1: {type: 'INDIVIDUAL', partyDetails: {firstName: 'Morgan', lastName: 'Example'}}});
  const type = modelTypes[key];
  const Model = type ? require(type[0])[type[1]] : GenericYesNo;
  let model;
  if (key === 'claim-type') {
    model = new ClaimType(undefined, state === 'error' ? 'ERRORS.CLAIM_TYPE_REQUIRED' : undefined);
  } else if (state === 'error' && (genericYesNoPostMessages[key] || key === 'expert-report-details' || key === 'apply-help-fee-selection')) {
    // These POST callers supply messages that differ from GenericYesNo's default.
    let message = genericYesNoPostMessages[key];
    if (key === 'expert-report-details') {
      message = claim.isClaimantIntentionPending() ? 'ERRORS.EXPERT_REPORT_DETAILS_REQUIRED_CLAIMANT' : 'ERRORS.EXPERT_REPORT_DETAILS_REQUIRED';
    } else if (key === 'apply-help-fee-selection') {
      // The hearing-fee controller translates before constructing the model.
      message = translate('ERRORS.VALID_YES_NO_SELECTION_UPPER');
    }
    model = new GenericYesNo(undefined, message);
  } else {
    model = /(?:instalments-plan|repaymentPlan)\.njk$/.test(view) ? new RepaymentPlanForm(100, saved ? 25 : undefined, saved ? 'MONTH' : undefined, saved ? '2027' : '', saved ? '6' : '', saved ? '12' : '') : new Model();
  }
  model.totalClaimAmount = 100;
  if (saved) Object.assign(model, {
    option: 'yes', amount: 25, totalAmount: 100, paymentType: 'IMMEDIATELY', responseType: 'FULL_ADMISSION',
    sameRateInterestType: 'SAME_RATE_INTEREST_8_PC', differentRate: 4, reason: 'Saved reason & details',
    day: 12, month: 6, year: 2027, flightNumber: 'AB123', airline: 'Air Example',
    text: 'Saved defence & details', additionalText: 'Saved additional text', writtenRepText: 'Saved written text', referenceNumber: 'HWF-ABC-123',
    mediationPhoneNumber: '07700900123', mediationPhoneNumberConfirmation: '07700900123', mediationContactPerson: 'Alex',
    details: 'Saved details',
  });
  if (saved) {
    if (key.includes('bilingual-language-preference')) model.option = ClaimBilingualLanguagePreference.WELSH_AND_ENGLISH;
    if (key === 'claim-type') model.option = ClaimTypeOptions.JUST_MYSELF;
    if (key === 'unemployment') model.option = UnemploymentCategory.UNEMPLOYED;
    if (key === 'dependants') model.declared = true;
  }
  // GET retains the saved response type; invalid POST supplies an unanswered model.
  if (key === 'citizen-response-type') model.messageName = 'ERRORS.RESPONSE_TYPE_REQUIRED';
  if (key === 'your-defence' && state === 'error') model.text = '';
  if (key === 'flight-details' && saved) Object.assign(model, new FlightDetails('Air Example', 'AB123', '2025', '6', '12'));
  // Preserve the production nested validation contracts, including blank and saved values.
  model.numberOfChildren = new NumberOfChildren(saved ? 1 : undefined, saved ? 2 : undefined, saved ? 0 : undefined);
  model.unemploymentDetails = new UnemploymentDetails(saved ? '2' : undefined, saved ? '4' : undefined);
  model.otherDetails = new OtherDetails(saved ? 'Other details' : '');
  model.firstPaymentDate = new InstalmentFirstPaymentDate({day: saved ? '12' : '', month: saved ? '6' : '', year: saved ? '2027' : ''});
  const queryOptions = Object.values(WhatToDoTypeOption).map(value => new RadioButtonItems(value, translate(`PAGES.QM.OPTIONS.${value}.TEXT`), null, saved && value === WhatToDoTypeOption.SEND_DOCUMENTS));
  if (key === 'your-defence') {
    claim.claimDetails = new ClaimDetails(new Reason('Saved claimant reason & details'));
    claim.rejectAllOfClaim = new RejectAllOfClaim(undefined, undefined, undefined, new Defence(saved ? model.text : undefined));
  }
  // Defence GET renders the stored Claim; its invalid POST renders the submitted Defence.
  const formModel = key === 'your-defence' && state !== 'error' ? claim : model;
  const form = new GenericForm(key === 'qm-questions-template' ? new WhatDoYouWantToDo(saved ? WhatToDoTypeOption.SEND_DOCUMENTS : undefined, queryOptions) : formModel);
  if (state === 'error') form.validateSync();
  const airlines: AirlineList[] = key === 'flight-details' ? [{airline: 'Air Example', epimsID: 'fixture-airline'}, {airline: 'OTHER', epimsID: 'fixture-other'}] : [];
  // The production datalist builder uses the shared translator, not the page's t local.
  if (key === 'flight-details' && !i18next.isInitialized) {
    i18next.init({lng: language, fallbackLng: 'en', initAsync: false, resources: {en: {translation: en}, cy: {translation: cy}}});
  }
  const datalist = key === 'flight-details' ? buildDataList(airlines, form.hasFieldError('airline'), model.airline, language) : '';
  const repaymentSchedule = getRepaymentScheduleDisplay(model.totalClaimAmount, model.paymentAmount, model.repaymentFrequency);
  return {t: formControlTranslate(language), lang: language, htmlLang: language, form: key === 'send-your-response-by-email' ? claim : form, claim, repaymentSchedule,
    csrf: 'fixture-csrf', currentUrl: '/case/1/current?index=2', cancelUrl: '/cancel', backLinkUrl: '/back', dashboardUrl: '/dashboard',
    pageTitle: controllerPageTitles[view], applicationType: 'COMMON.GENERAL_APPLICATION', headerCaption: 'COMMON.GENERAL_APPLICATION',
    totalClaimAmount: 100, totalAmount: 100, contactPerson: 'Alex', claimantName: claim.getClaimantFullName(), claimantFullName: 'Alex Example', defendantFullName: 'Morgan Example',
    lastMonth: new Date(2026, 8, 19), exampleDate: new Date(2026, 9, 19), nextMonth: new Date(2026, 10, 19), today: new Date(2026, 9, 19),
    firstPaymentDate: '19 November 2026', paymentExampleDate: '19/11/2026', originalResponseDeadline: new Date(2026, 10, 1),
    responseDeadline: '1 November 2026', componentDetailItemsList: [] as unknown[], airlines, datalist, welshEnabled: true,
    fees: [] as unknown[], signPosting: false, financialDetails: [] as unknown[], applicationFee: 123, title: 'PAGES.QM.WHAT_DO_YOU_WANT_TODO_TITLE', caption: 'PAGES.QM.LEVEL_0.CAPTION',
    applyHelpFeeReferenceContents: getApplyHelpFeeReferenceContents('1645882162449409', 100), applyHelpFeeReferenceButtonContents: getButtonsContents('1645882162449409'), applyHelpFeeSelectionContents: getApplyHelpFeeSelectionContents(language, '1645882162449409', 100), applyHelpFeeSelectionButtonContents: getButtonsContents('1645882162449409'),
    cancelYourUploadContents: view.includes('mediation/') ? cancelMediation('1645882162449409', claim) : cancelCaseProgression('1645882162449409', claim), docUrl: '/document/one', claimId: '1', claimIdPrettified: '0000 0000 0000 0001', nonceValue: 'fixture-nonce', nonceDataLayer: 'fixture-data-nonce'};
}
/** Uses production Nunjucks registration and the real page shell, without application startup.
 * Authentication, middleware locals and service boundaries are not exercised by this helper.
 */
export function renderPresentation(view: string, locals: Record<string, unknown> = {}, language = 'en', viewsDirectory?: string) {
  return renderProductionPage(view, locals, language, viewsDirectory);
}
