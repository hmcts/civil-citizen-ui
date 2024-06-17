import { Claim } from 'common/models/claim';
import { HearingSupport, SupportType } from 'common/models/generalApplication/hearingSupport';
import { UnavailableDateType } from 'common/models/generalApplication/unavailableDatesGaHearing';
import { SummaryRow, summaryRow } from 'common/models/summaryList/summaryList';
import { formatDateToFullDate } from 'common/utils/dateUtils';
import { constructResponseUrlWithIdParams } from 'common/utils/urlFormatter';
import { t } from 'i18next';
import {
  GA_RESPONDENT_AGREEMENT_URL,
  GA_RESPONSE_HEARING_ARRANGEMENT_URL,
  GA_RESPONSE_HEARING_CONTACT_DETAILS_URL,
  GA_RESPONSE_HEARING_SUPPORT_URL,
  GA_RESPONSE_UNAVAILABLE_HEARING_DATES_URL,
} from 'routes/urls';
import { exhaustiveMatchingGuard } from 'services/genericService';

export const getSummarySections = (claimId: string, claim: Claim, lng: string ): SummaryRow[] => {

  const respondentAgreementSection = (): SummaryRow[] =>
    [formattedRow('PAGES.GENERAL_APPLICATION.RESPONDENT_AGREEMENT.TITLE',
      claim.generalApplication?.response?.respondentAgreement?.option,
      value => t(`COMMON.VARIATION.${value.toUpperCase()}`, {lng}),
      GA_RESPONDENT_AGREEMENT_URL)];

  const hearingArrangementSections = (): SummaryRow[] => {
    const hearingArrangement = claim.generalApplication?.response?.hearingArrangement;
    const hearingArrangementUrl = constructResponseUrlWithIdParams(claimId, GA_RESPONSE_HEARING_ARRANGEMENT_URL);
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

  const contactDetailsSections = (): SummaryRow[] => {
    const contactDetails = claim.generalApplication?.response?.hearingContactDetails;
    return [
      row('PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.PREFERRED_TELEPHONE',
        contactDetails?.telephoneNumber,
        GA_RESPONSE_HEARING_CONTACT_DETAILS_URL),
      row('PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.PREFERRED_EMAIL',
        contactDetails?.emailAddress,
        GA_RESPONSE_HEARING_CONTACT_DETAILS_URL),
    ];
  };

  const unavailableDatesSection = (): SummaryRow[] => {
    const unavailableDates = claim.generalApplication?.response?.unavailableDatesHearing?.items;
    if (unavailableDates?.length > 0) {
      const unavailableDatesHtml = unavailableDates
        .map(({type, from, until}) => (type === UnavailableDateType.SINGLE_DATE)
          ? `<li>${formatDateToFullDate(from, lng)}</li>`
          : `<li>${formatDateToFullDate(from, lng)} - ${formatDateToFullDate(until, lng)}</li>`)
        .join('');
      return [row('PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER_RESPONSE.UNAVAILABLE_DATES',
        `<ul class="no-list-style">${unavailableDatesHtml}</ul>`,
        GA_RESPONSE_UNAVAILABLE_HEARING_DATES_URL,
      )];
    } else {
      return [];
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

    const hearingSupport = claim.generalApplication?.response?.hearingSupport;
    if (hearingSupport) {
      const selectedHtml = Object.keys(hearingSupport)
        .filter((key: keyof HearingSupport) => !!hearingSupport[key].selected)
        .map(key => {
          const caption = t(`PAGES.GENERAL_APPLICATION.HEARING_SUPPORT.SUPPORT.${getCaption(key as SupportType)}`, {lng});
          return `<li>${caption}</li>`;})
        .join('');
      return [row(
        'PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.NEED_ADJUSTMENTS',
        `<ul class="no-list-style">${selectedHtml}</ul>`,
        GA_RESPONSE_HEARING_SUPPORT_URL,
      )];
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
        constructResponseUrlWithIdParams(claimId, url),
        t('COMMON.BUTTONS.CHANGE', {lng}))
      : undefined;
  
  return [
    respondentAgreementSection, 
    hearingArrangementSections,
    contactDetailsSections,
    unavailableDatesSection,
    hearingSupportSection,
  ].flatMap(f => f())
    .filter(s => !!s);
};

