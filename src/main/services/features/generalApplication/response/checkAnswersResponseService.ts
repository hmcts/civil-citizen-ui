import {YesNo, YesNoUpperCamelCase} from 'common/form/models/yesNo';
import { HearingSupport, SupportType } from 'common/models/generalApplication/hearingSupport';
import { ProposedPaymentPlanOption } from 'common/models/generalApplication/response/acceptDefendantOffer';
import { GaResponse } from 'common/models/generalApplication/response/gaResponse';
import { UnavailableDateType } from 'common/models/generalApplication/unavailableDatesGaHearing';
import { CSS_CLASS_SUMMARY_LIST_KEY, SummaryRow, summaryRow } from 'common/models/summaryList/summaryList';
import { formatDateSlash, formatDateToFullDate } from 'common/utils/dateUtils';
import {constructResponseUrlWithIdAndAppIdParams} from 'common/utils/urlFormatter';
import { t } from 'i18next';
import {
  GA_ACCEPT_DEFENDANT_OFFER_URL,
  GA_AGREE_TO_ORDER_URL,
  GA_RESPONDENT_AGREEMENT_URL, GA_RESPONDENT_WANT_TO_UPLOAD_DOCUMENT_URL,
  GA_RESPONSE_HEARING_ARRANGEMENT_URL,
  GA_RESPONSE_HEARING_CONTACT_DETAILS_URL,
  GA_RESPONSE_HEARING_SUPPORT_URL,
  GA_RESPONSE_UNAVAILABLE_HEARING_DATES_URL,
} from 'routes/urls';
import { exhaustiveMatchingGuard } from 'services/genericService';

export const getSummarySections = (claimId: string, appId: string, gaResponse: GaResponse, lng: string): SummaryRow[] => {

  const acceptOfferSection = (): SummaryRow[] => {

    const acceptOffer = gaResponse?.acceptDefendantOffer;

    const proposedInstallmentsHtml = (): string =>
      [listItemCaption('PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER_RESPONSE.PROPOSED_INSTALMENTS', CSS_CLASS_SUMMARY_LIST_KEY),
        listItem(`£${acceptOffer?.amountPerMonth}`),
        listItemCaption('PAGES.GENERAL_APPLICATION.ACCEPT_DEFENDANT_OFFER.WHY_NOT_ACCEPT', CSS_CLASS_SUMMARY_LIST_KEY),
        listItem(acceptOffer?.reasonProposedInstalment),
      ].join('');

    const proposedBySetDateHtml = (): string =>
      [listItemCaption('PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER_RESPONSE.PROPOSED_SET_DATE', CSS_CLASS_SUMMARY_LIST_KEY),
        listItem(formatDateSlash(acceptOffer?.proposedSetDate)),
        listItemCaption('PAGES.GENERAL_APPLICATION.ACCEPT_DEFENDANT_OFFER.WHY_NOT_ACCEPT', CSS_CLASS_SUMMARY_LIST_KEY),
        listItem(acceptOffer?.reasonProposedSetDate),
      ].join('');

    const proposedPaymentPlanHtml = (): string =>
      (acceptOffer?.type === ProposedPaymentPlanOption.ACCEPT_INSTALMENTS) ? proposedInstallmentsHtml() : proposedBySetDateHtml();

    return [
      formattedRow('PAGES.GENERAL_APPLICATION.ACCEPT_DEFENDANT_OFFER.TITLE',
        acceptOffer?.option,
        yesNoFormatter,
        constructResponseUrlWithIdAndAppIdParams(claimId, appId, GA_ACCEPT_DEFENDANT_OFFER_URL)),
      (acceptOffer?.option === YesNo.NO)
        ? row('PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER_RESPONSE.PROPOSED_PAYMENT_PLAN',
          `<ul class="no-list-style">${proposedPaymentPlanHtml()}</ul>`,
          constructResponseUrlWithIdAndAppIdParams(claimId, appId, GA_ACCEPT_DEFENDANT_OFFER_URL))
        : undefined,
    ];
  };

  const agreeToOrderSection = (): SummaryRow[] =>
    [formattedRow('PAGES.GENERAL_APPLICATION.AGREE_TO_ORDER.TITLE',
      gaResponse?.agreeToOrder,
      yesNoFormatter,
      constructResponseUrlWithIdAndAppIdParams(claimId, appId, GA_AGREE_TO_ORDER_URL))];

  const respondentAgreementSection = (): SummaryRow[] =>
    [formattedRow('PAGES.GENERAL_APPLICATION.RESPONDENT_AGREEMENT.TITLE',
      gaResponse?.respondentAgreement,
      ra => (ra?.option === YesNo.YES)
        ? yesNoFormatter(ra?.option as YesNo)
        : `${yesNoFormatter(ra?.option as YesNo)}<br/>${ra?.reasonForDisagreement}`,
      constructResponseUrlWithIdAndAppIdParams(claimId, appId, GA_RESPONDENT_AGREEMENT_URL))];

  const hearingArrangementSections = (): SummaryRow[] => {
    const hearingArrangement = gaResponse?.hearingArrangement;
    const hearingArrangementUrl = constructResponseUrlWithIdAndAppIdParams(claimId, appId, GA_RESPONSE_HEARING_ARRANGEMENT_URL);
    return [
      formattedRow('PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.CHOOSE_PREFERRED_TYPE',
        hearingArrangement?.option,
        value => t(`PAGES.GENERAL_APPLICATION.APPLICATION_HEARING_ARRANGEMENTS.HEARING_TYPE.${value}`, {lng}),
        hearingArrangementUrl),
      row('PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.WHY_PREFER',
        hearingArrangement?.reasonForPreferredHearingType,
        hearingArrangementUrl),
      formattedRow('PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER_RESPONSE.PREFERRED_LOCATION',
        hearingArrangement?.courtLocation,
        location => location.split(' - ')[0],
        hearingArrangementUrl),
    ];
  };
  const addDocumentUploadRow = (): SummaryRow[] => {
    const wantToUploadDocuments = gaResponse?.wantToUploadDocuments;
    const changeLabel = (): string => t('COMMON.BUTTONS.CHANGE', {lng});
    const rows: SummaryRow[] = [];
    if (wantToUploadDocuments) {
      const href = `${constructResponseUrlWithIdAndAppIdParams(claimId, appId, GA_RESPONDENT_WANT_TO_UPLOAD_DOCUMENT_URL)}`;
      let rowValue: string;
      if (wantToUploadDocuments === YesNo.YES) {
        rowValue = `<p class="govuk-border-colour-border-bottom-1 govuk-!-padding-bottom-2 govuk-!-margin-top-0">${t('COMMON.VARIATION.YES', {lng})}</p>`;
        rowValue += '<ul class="no-list-style">';
        gaResponse.uploadEvidenceDocuments.forEach(uploadGAFile => {
          rowValue += `<li>${uploadGAFile.caseDocument.documentName}</li>`;
        });
        rowValue += '</ul>';
      } else {
        rowValue = t('COMMON.VARIATION.NO', {lng});
      }
      rows.push(
        summaryRow(t('PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.UPLOAD_DOCUMENTS', {lng}), rowValue, href, changeLabel()),
      );
    }
    return rows;
  };

  const contactDetailsSections = (): SummaryRow[] => {
    const contactDetails = gaResponse?.hearingContactDetails;
    return [
      row('PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.PREFERRED_TELEPHONE',
        contactDetails?.telephoneNumber,
        GA_RESPONSE_HEARING_CONTACT_DETAILS_URL),
      row('PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.PREFERRED_EMAIL',
        contactDetails?.emailAddress,
        constructResponseUrlWithIdAndAppIdParams(claimId, appId, GA_RESPONSE_HEARING_CONTACT_DETAILS_URL)),
    ];
  };

  const unavailableDatesSection = (): SummaryRow[] => {
    const unavailableDates = gaResponse?.unavailableDatesHearing?.items;
    if (unavailableDates?.length > 0) {
      const unavailableDatesHtml = unavailableDates
        .map(({type, from, until}) => (type === UnavailableDateType.SINGLE_DATE)
          ? listItem(formatDateToFullDate(from, lng))
          : listItem(`${formatDateToFullDate(from, lng)} - ${formatDateToFullDate(until, lng)}`))
        .join('');
      return [row('PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER_RESPONSE.UNAVAILABLE_DATES',
        `<ul class="no-list-style">${unavailableDatesHtml}</ul>`,
        GA_RESPONSE_UNAVAILABLE_HEARING_DATES_URL,
      )];
    } else {
      return [row('PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER_RESPONSE.UNAVAILABLE_DATES',
        ' ',
        GA_RESPONSE_UNAVAILABLE_HEARING_DATES_URL,
      )];
    }
  };

  const hearingSupportSection = (): SummaryRow[] => {

    const getCaption = (supportType: SupportType): string => {
      switch (supportType) {
        case SupportType.HEARING_LOOP: return 'HEARING_LOOP';
        case SupportType.LANGUAGE_INTERPRETER: return 'LANGUAGE_INTERPRETER';
        case SupportType.OTHER_SUPPORT: return 'OTHER';
        case SupportType.SIGN_LANGUAGE_INTERPRETER: return 'SIGN_LANGUAGE_INTERPRETER';
        case SupportType.STEP_FREE_ACCESS: return 'STEP_FREE_ACCESS';
        default: exhaustiveMatchingGuard(supportType);
      }
    };

    const hearingSupport = gaResponse?.hearingSupport;
    if (hearingSupport) {
      const selectedHtml = Object.keys(hearingSupport)
        .filter((key: keyof HearingSupport) => !!hearingSupport[key].selected)
        .map(key => listItemCaption(`PAGES.GENERAL_APPLICATION.HEARING_SUPPORT.SUPPORT.${getCaption(key as SupportType)}`))
        .join('');
      return selectedHtml
        ? [row(
          'PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.NEED_ADJUSTMENTS',
          `<ul class="no-list-style">${selectedHtml}</ul>`,
          GA_RESPONSE_HEARING_SUPPORT_URL)]
        : [row(
          'PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.NEED_ADJUSTMENTS',
          YesNoUpperCamelCase.NO,
          GA_RESPONSE_HEARING_SUPPORT_URL)];
    } else {
      return [];
    }
  };

  const row = (title: string, value: string, url: string): SummaryRow | undefined => formattedRow(title, value, f => f, url);

  const formattedRow = <T>(title: string, value: T, formatter: ((v: T) => string), url: string): SummaryRow | undefined =>
    value
      ? summaryRow(
        t(title, {lng}),
        formatter(value),
        constructResponseUrlWithIdAndAppIdParams(claimId, appId, url),
        t('COMMON.BUTTONS.CHANGE', {lng}))
      : undefined;

  const listItem = (value: string) => `<li>${value}</li>`;

  const listItemCaption = (caption: string, cssClass?: string) =>
    `<li${cssClass ? ` class="${cssClass}"` : ''}>${t(caption, {lng})}</li>`;

  const yesNoFormatter = (yesNo: YesNo): string => t(`COMMON.VARIATION.${yesNo.toUpperCase()}`, {lng});

  return [
    agreeToOrderSection,
    acceptOfferSection,
    respondentAgreementSection,
    addDocumentUploadRow,
    hearingArrangementSections,
    contactDetailsSections,
    unavailableDatesSection,
    hearingSupportSection,
  ].flatMap(f => f())
    .filter(s => !!s);
};

