import { YesNo } from 'common/form/models/yesNo';
import { CcdGeneralApplicationHearingDetails } from 'common/models/ccdGeneralApplication/ccdGeneralApplicationHearingDetails';
import { CcdGeneralApplicationUnavailableHearingDatesElement } from 'common/models/ccdGeneralApplication/ccdGeneralApplicationUnavailableHearingDates';
import { CcdSupportRequirement } from 'common/models/ccdGeneralApplication/ccdSupportRequirement';
import { CCDApplication } from 'common/models/generalApplication/applicationResponse';
import { summaryRow, SummaryRow } from 'common/models/summaryList/summaryList';
import { formatDateToFullDate } from 'common/utils/dateUtils';
import { t } from 'i18next';
import { exhaustiveMatchingGuard } from 'services/genericService';
import { fromCcdHearingType } from 'services/translation/generalApplication/ccdTranslation';

export const buildResponseSummaries = (generalApplication: CCDApplication, lng: string): SummaryRow[] => {
  const responses = generalApplication.respondentsResponses;
  const response = (responses?.length > 0) ? responses[0].value : undefined;

  const gaRespondentDebtorOfferSection = (): SummaryRow[] =>
    [row('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.RESPONSE.DO_YOU_AGREE_WITH_APPLICANT_REQUEST',
      yesNoFormatter(generalApplication.gaRespondentDebtorOffer?.debtorObjections ? YesNo.NO : YesNo.YES))];

  const hearingDetailsSections = (hearingDetails: CcdGeneralApplicationHearingDetails | undefined): SummaryRow[] =>
    [formattedRow('PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.CHOOSE_PREFERRED_TYPE',
      hearingDetails?.HearingPreferencesPreferredType,
      value => t(`PAGES.GENERAL_APPLICATION.APPLICATION_HEARING_ARRANGEMENTS.HEARING_TYPE.${fromCcdHearingType(value)}`, {lng})),
    row('PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.WHY_PREFER',
      hearingDetails?.ReasonForPreferredHearingType),
    row('PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER_RESPONSE.PREFERRED_LOCATION',
      hearingDetails?.HearingPreferredLocation?.value?.label),
    row('PAGES.GENERAL_APPLICATION.HEARING_CONTACT_DETAILS.PREFERRED_TELEPHONE_NUMBER',
      hearingDetails?.HearingDetailsTelephoneNumber),
    row('PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.PREFERRED_EMAIL',
      hearingDetails?.HearingDetailsEmailID),
    row('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.RESPONSE.UNAVAILABLE_DATES',
      unavailableDatesHtml(hearingDetails?.generalAppUnavailableDates)),
    row('PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.NEED_ADJUSTMENTS',
      hearingSupportHtml(hearingDetails?.SupportRequirement))];

  const unavailableDatesHtml = (unavailableDates: CcdGeneralApplicationUnavailableHearingDatesElement[]): string => {
    const formatDate = (unavailableDate: CcdGeneralApplicationUnavailableHearingDatesElement): string =>
      listItem([unavailableDate.value.unavailableTrialDateFrom, unavailableDate.value.unavailableTrialDateTo]
        .filter(date => !!date)
        .map(date => formatDateToFullDate(new Date(date)))
        .join(' - '));

    return (unavailableDates?.length > 0)
      ? `<ul class="no-list-style">${unavailableDates.map(formatDate).join('')}</ul>`
      : undefined;
  };

  const hearingSupportHtml = (supportRequirementItems: CcdSupportRequirement[]): string => {
    const supportCaption = (supportItem: CcdSupportRequirement): string => {
      switch (supportItem) {
        case CcdSupportRequirement.DISABLED_ACCESS: return 'STEP_FREE_ACCESS';
        case CcdSupportRequirement.HEARING_LOOPS: return 'HEARING_LOOP';
        case CcdSupportRequirement.LANGUAGE_INTERPRETER: return 'LANGUAGE_INTERPRETER';
        case CcdSupportRequirement.SIGN_INTERPRETER: return 'SIGN_LANGUAGE_INTERPRETER';
        case CcdSupportRequirement.OTHER_SUPPORT: return 'OTHER';
        default: exhaustiveMatchingGuard(supportItem);
      }
    };

    const html = (): string =>
      supportRequirementItems
        .map(item => listItemCaption(`PAGES.GENERAL_APPLICATION.HEARING_SUPPORT.SUPPORT.${supportCaption(item)}`))
        .join('');

    return (supportRequirementItems?.length > 0)
      ? `<ul class="no-list-style">${html()}</ul>`
      : undefined;
  };

  const row = (title: string, value: string): SummaryRow | undefined => formattedRow(title, value, f => f);

  const formattedRow = <T>(title: string, value: T, formatter: ((v: T) => string)): SummaryRow | undefined =>
    value
      ? summaryRow(t(title, {lng}), formatter(value))
      : undefined;

  const listItem = (value: string) => `<li>${value}</li>`;

  const listItemCaption = (caption: string) => `<li>${t(caption, {lng})}</li>`;

  const yesNoFormatter = (yesNo: YesNo): string => t(`COMMON.VARIATION_2.${yesNo.toUpperCase()}`, {lng});

  return response
    ? [gaRespondentDebtorOfferSection(),
      hearingDetailsSections(response?.gaHearingDetails)]
      .flat(1).filter(row => !!row)
    : undefined;
};
