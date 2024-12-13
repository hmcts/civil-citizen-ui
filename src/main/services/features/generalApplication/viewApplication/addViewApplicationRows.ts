import {getLng} from 'common/utils/languageToggleUtils';
import {t} from 'i18next';
import {SummaryRow, summaryRow} from 'models/summaryList/summaryList';
import {YesNoUpperCamelCase, YesNoUpperCase} from 'form/models/yesNo';
import {ApplicationResponse} from 'models/generalApplication/applicationResponse';
import {HearingTypeOptions} from 'models/generalApplication/hearingArrangement';
import {CcdHearingType} from 'models/ccdGeneralApplication/ccdGeneralApplicationHearingDetails';
import {formatDateToFullDate} from 'common/utils/dateUtils';
import {CcdSupportRequirement} from 'models/ccdGeneralApplication/ccdSupportRequirement';
import {debtPaymentOptions} from 'models/generalApplication/debtPaymentOptions';
import {getEvidencePaymentOption} from 'services/features/generalApplication/checkAnswers/addCheckAnswersRows';
import {CASE_DOCUMENT_VIEW_URL} from 'routes/urls';
import {documentIdExtractor} from 'common/utils/stringUtils';

import {
  ApplicationTypeOptionSelection,
  getApplicationTypeOptionByTypeAndDescription,
} from 'models/generalApplication/applicationType';
import {ApplicationState} from 'models/generalApplication/applicationSummary';

export const addApplicationStatus = (
  application: ApplicationResponse,
  lang: string,
): SummaryRow[] => {
  const lng = getLng(lang);
  const rows: SummaryRow[] = [];

  if (application.state === ApplicationState.AWAITING_APPLICATION_PAYMENT) {
    rows.push(
      summaryRow(t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.STATUS.TITLE', {lng}), t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.STATUS.AWAITING_APP_PAYMENT', {lng})),
    );
  } else if (application.state === ApplicationState.AWAITING_RESPONDENT_RESPONSE){
    rows.push(
      summaryRow(t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.STATUS.TITLE', {lng}), t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.STATUS.AWAITING_RESPONSE', {lng})),
    );
  } else if (application.state === ApplicationState.APPLICATION_SUBMITTED_AWAITING_JUDICIAL_DECISION) {
    rows.push(
      summaryRow(t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.STATUS.TITLE', {lng}), t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.STATUS.AWAITING_JUDICIAL_DECISION', {lng})),
    );
  } else if (application.state === ApplicationState.LISTING_FOR_A_HEARING) {
    rows.push(
      summaryRow(t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.STATUS.TITLE', {lng}), t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.STATUS.LISTED_FOR_HEARING', {lng})),
    );
  }else if (application.state === ApplicationState.HEARING_SCHEDULED) {
    rows.push(
      summaryRow(t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.STATUS.TITLE', {lng}), t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.STATUS.HEARING_SCHEDULED', {lng})),
    );
  }else if (application.state === ApplicationState.AWAITING_WRITTEN_REPRESENTATIONS) {
    rows.push(
      summaryRow(t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.STATUS.TITLE', {lng}), t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.STATUS.AWAITING_WRITTEN_REP', {lng})),
    );
  }else if (application.state === ApplicationState.AWAITING_DIRECTIONS_ORDER_DOCS) {
    rows.push(
      summaryRow(t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.STATUS.TITLE', {lng}), t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.STATUS.AWAITING_DIRECTION_DOCS', {lng})),
    );
  }else if (application.state === ApplicationState.AWAITING_ADDITIONAL_INFORMATION) {
    rows.push(
      summaryRow(t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.STATUS.TITLE', {lng}), t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.STATUS.AWAITING_ADDL_INFO', {lng})),
    );
  }else if (application.state === ApplicationState.ORDER_MADE) {
    rows.push(
      summaryRow(t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.STATUS.TITLE', {lng}), t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.STATUS.ORDER_MADE', {lng})),
    );
  }else if (application.state === ApplicationState.APPLICATION_DISMISSED) {
    rows.push(
      summaryRow(t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.STATUS.TITLE', {lng}), t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.STATUS.APPLICATION_DISMISSED', {lng})),
    );
  }else if (application.state === ApplicationState.APPLICATION_CLOSED) {
    rows.push(
      summaryRow(t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.STATUS.TITLE', {lng}), t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.STATUS.APPLICATION_CLOSED', {lng})),
    );
  }else if (application.state === ApplicationState.PROCEEDS_IN_HERITAGE) {
    rows.push(
      summaryRow(t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.STATUS.TITLE', {lng}), t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.STATUS.PROCEEDS_IN_HERITAGE', {lng})),
    );
  }else if (application.state === ApplicationState.APPLICATION_ADD_PAYMENT) {
    rows.push(
      summaryRow(t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.STATUS.TITLE', {lng}), t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.STATUS.AWAITING_ADDL_PAYMENT', {lng})),
    );
  }else if (application.state === ApplicationState.ADDITIONAL_RESPONSE_TIME_EXPIRED) {
    rows.push(
      summaryRow(t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.STATUS.TITLE', {lng}), t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.STATUS.ADDITIONAL_RESPONSE_TIME_EXPIRED', {lng})),
    );
  }else {
    rows.push(
      summaryRow(t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.STATUS.TITLE', {lng}), application.state),
    );
  }
  return rows;
};

export const addApplicationTypeRow = (
  application: ApplicationResponse,
  index: number,
  lang: string,
): SummaryRow[] => {
  const lng = getLng(lang);

  const rows: SummaryRow[] = [];
  if (application.case_data.generalAppType.types) {
    const applicationType = application.case_data.generalAppType.types[index];
    const applicationTypeDisplay =
      getApplicationTypeOptionByTypeAndDescription(applicationType, ApplicationTypeOptionSelection.BY_APPLICATION_TYPE);

    rows.push(
      summaryRow(
        t('PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.APPLICATION_TYPE', {
          lng,
        }),
        t(applicationTypeDisplay, { lng }),
        null,
        null,
        undefined,
      ),
    );
  }
  return rows;
};

export const addApplicationTypesAndDescriptionRows = (
  application: ApplicationResponse,
  lang: string,
): SummaryRow[] => {
  const lng = getLng(lang);

  const rows: SummaryRow[] = [];
  if (application.case_data.generalAppType.types) {
    application.case_data.generalAppType?.types?.forEach(
      (applicationType, index, arr) => {
        const applicationTypeDisplay =
            getApplicationTypeOptionByTypeAndDescription(applicationType, ApplicationTypeOptionSelection.BY_APPLICATION_TYPE);
        const applicationTypeDescription = getApplicationTypeOptionByTypeAndDescription(applicationType, ApplicationTypeOptionSelection.BY_APPLICATION_TYPE_DESCRIPTION);

        rows.push(
          summaryRow(
            t('PAGES.GENERAL_APPLICATION.RESPONDENT_VIEW_APPLICATION.APPLICATION_TYPE_AND_DESC', {
              lng,
            }),
            t(applicationTypeDisplay, { lng }) + '.</br>' + t(applicationTypeDescription, {lng}),
            null,
            null,
            undefined,
          ),
        );
      },
    );
  }
  return rows;
};

export const addAnotherApplicationRow = (application: ApplicationResponse, lang: string): SummaryRow[] => {
  const lng = getLng(lang);
  const rows: SummaryRow[] = [];
  if (application.case_data.applicationTypes) {
    const addAnotherApplication = (application.case_data.generalAppType.types.length > 1) ? YesNoUpperCase.YES : YesNoUpperCase.NO;
    rows.push(
      summaryRow(t('PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.ADD_ANOTHER_APPLICATION', {lng}), t(`COMMON.VARIATION_2.${addAnotherApplication}`, {lng})),
    );
  }
  return rows;
};

export const addOtherPartiesAgreedRow = (application: ApplicationResponse, lang: string): SummaryRow[] => {
  const lng = getLng(lang);
  const rows: SummaryRow[] = [];
  if (application.case_data.generalAppRespondentAgreement) {
    const partiesAgreed = otherPartiesAgreed(application) ? YesNoUpperCase.YES : YesNoUpperCase.NO;
    rows.push(
      summaryRow(t('PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.PARTIES_AGREED', {lng}), t(`COMMON.VARIATION_5.${partiesAgreed}`, {lng})),
    );
  }
  return rows;
};

export const addInformOtherPartiesRow = (application: ApplicationResponse, lang: string): SummaryRow[] => {
  const lng = getLng(lang);
  const rows: SummaryRow[] = [];
  if (application.case_data.generalAppInformOtherParty && !otherPartiesAgreed(application)) {
    const informOtherParties = (application.case_data.generalAppInformOtherParty.isWithNotice === YesNoUpperCamelCase.YES) ? YesNoUpperCase.YES : YesNoUpperCase.NO;
    rows.push(
      summaryRow(t('PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.INFORM_OTHER_PARTIES', {lng}), t(`COMMON.VARIATION_2.${informOtherParties}`, {lng})),
    );
    if (application.case_data.generalAppInformOtherParty?.isWithNotice === YesNoUpperCamelCase.NO) {
      rows.push(
        summaryRow(
          t('PAGES.GENERAL_APPLICATION.INFORM_OTHER_PARTIES.WHY_DO_NOT_WANT_COURT', {lng}),
          application.case_data.generalAppInformOtherParty?.reasonsForWithoutNotice,
        ),
      );
    }
  }
  return rows;
};

export const addOrderJudgeRow = (application: ApplicationResponse, index: number, lang: string): SummaryRow[] => {
  const lng = getLng(lang);
  const rows: SummaryRow[] = [];
  if (application.case_data.generalAppDetailsOfOrderColl?.[index]) {
    const orderForCost = application.case_data.generalAppAskForCosts === YesNoUpperCamelCase.YES ? 'PAGES.GENERAL_APPLICATION.ORDER_FOR_COSTS' : '';
    const html = `<p class="govuk-body">${application.case_data.generalAppDetailsOfOrderColl[index].value} <br> ${t(orderForCost, {lng})}</p>`;
    rows.push(
      summaryRow(t('PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.WHAT_ORDER', {lng}), html),
    );
  }
  return rows;
};

export const addRequestingReasonRow = (application: ApplicationResponse, index: number, lang: string): SummaryRow[] => {
  const lng = getLng(lang);
  const rows: SummaryRow[] = [];
  if (application.case_data.generalAppReasonsOfOrderColl?.[index]) {
    rows.push(
      summaryRow(t('PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.WHY_REQUESTING', {lng}), application.case_data.generalAppReasonsOfOrderColl[index].value),
    );
  }
  return rows;
};

export const addDocumentUploadRow = (application: ApplicationResponse, lang: string): SummaryRow[] => {
  const lng = getLng(lang);
  const rows: SummaryRow[] = [];
  let rowValue: string;
  if (application.case_data.gaAddlDoc) {
    rowValue = `<p class="govuk-border-colour-border-bottom-1 govuk-!-padding-bottom-2 govuk-!-margin-top-0">${t('COMMON.VARIATION_2.YES', {lng})}</p>`;
    rowValue += '<ul class="no-list-style">';
    application.case_data.gaAddlDoc.forEach(uploadGAFile => {
      rowValue += `<li><a href=${CASE_DOCUMENT_VIEW_URL.replace(':id', application.id).replace(':documentId', documentIdExtractor(uploadGAFile?.value?.documentLink.document_binary_url))} target="_blank" rel="noopener noreferrer" class="govuk-link">${uploadGAFile.value.documentLink.document_filename}</a></li>`;

    });
    rowValue += '</ul>';

  } else {
    rowValue = t('COMMON.VARIATION_2.NO', {lng});
  }
  rows.push(
    summaryRow(t('PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.UPLOAD_DOCUMENTS', {lng}), rowValue),
  );
  return rows;
};

export const addHearingArrangementsRows = (application: ApplicationResponse, lang: string): SummaryRow[] => {
  const lng = getLng(lang);
  const rows: SummaryRow[] = [];
  if (application.case_data.generalAppHearingDetails) {
    const hearingPreferredType = toCUIHearingPreferencesPreferredType(application.case_data.generalAppHearingDetails.HearingPreferencesPreferredType);
    rows.push(
      summaryRow(t('PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.CHOOSE_PREFERRED_TYPE', {lng}),
        t(`PAGES.GENERAL_APPLICATION.APPLICATION_HEARING_ARRANGEMENTS.HEARING_TYPE_VIEW_APPLICATION.${hearingPreferredType}`, {lng})),
    );
    rows.push(
      summaryRow(t('PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.WHY_PREFER', {lng}),
        application.case_data.generalAppHearingDetails.ReasonForPreferredHearingType),
    );
    const courtLocationText = application.case_data.generalAppHearingDetails.HearingPreferredLocation
      ? application.case_data.generalAppHearingDetails.HearingPreferredLocation.value.label.slice(0, application.case_data.generalAppHearingDetails.HearingPreferredLocation.value.label.indexOf(' - '))
      : t('PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.NONE', {lng});
    rows.push(
      summaryRow(t('PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.PREFERRED_COURT_LOCATION', {lng}),courtLocationText),
    );
  }
  return rows;
};

export const addHearingContactDetailsRows = (application: ApplicationResponse, lang: string): SummaryRow[] => {
  const lng = getLng(lang);
  const rows: SummaryRow[] = [];
  if (application.case_data.generalAppHearingDetails.HearingDetailsTelephoneNumber) {
    rows.push(
      summaryRow(t('PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.PREFERRED_TELEPHONE', {lng}),
        application.case_data.generalAppHearingDetails.HearingDetailsTelephoneNumber),
    );
    rows.push(
      summaryRow(t('PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.PREFERRED_EMAIL', {lng}),
        application.case_data.generalAppHearingDetails.HearingDetailsEmailID),
    );
  }
  return rows;
};

export const addUnavailableDatesRows = (application: ApplicationResponse, lang: string): SummaryRow[] => {
  const lng = getLng(lang);
  const rows: SummaryRow[] = [];
  if (application.case_data.generalAppHearingDetails.generalAppUnavailableDates) {
    let unavailableDatesHtml = '<ul class="no-list-style">';
    application.case_data.generalAppHearingDetails.generalAppUnavailableDates.forEach((value) => {
      if (value.value.unavailableTrialDateTo === undefined) {
        unavailableDatesHtml += `<li>${formatDateToFullDate(new Date(value.value.unavailableTrialDateFrom), lang)}</li>`;
      } else{
        unavailableDatesHtml += `<li>${formatDateToFullDate(new Date(value.value.unavailableTrialDateFrom), lang)} - ${formatDateToFullDate(new Date(value.value.unavailableTrialDateTo), lang)}</li>`;
      }
    });
    unavailableDatesHtml += '</ul>';
    rows.push(
      summaryRow(t('PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.DATES_CANNOT_ATTEND', {lng}),
        unavailableDatesHtml.length > 0 ? unavailableDatesHtml : t('COMMON.NO', {lng})),
    );
  }
  return rows;
};

export const addHearingSupportRows = (application: ApplicationResponse, lang: string): SummaryRow[] => {
  const lng = getLng(lang);
  const rows: SummaryRow[] = [];
  if (application.case_data.generalAppHearingDetails.SupportRequirement) {
    let supportHtml = '<ul class="no-list-style">';
    if (application.case_data.generalAppHearingDetails.SupportRequirement.includes(CcdSupportRequirement.DISABLED_ACCESS)) {
      supportHtml += `<li>${t('PAGES.GENERAL_APPLICATION.HEARING_SUPPORT.SUPPORT.STEP_FREE_ACCESS', {lng})}</li>`;
    }
    if (application.case_data.generalAppHearingDetails.SupportRequirement.includes(CcdSupportRequirement.HEARING_LOOPS)) {
      supportHtml += `<li>${t('PAGES.GENERAL_APPLICATION.HEARING_SUPPORT.SUPPORT.HEARING_LOOP', {lng})}</li>`;
    }
    if (application.case_data.generalAppHearingDetails.SupportRequirement.includes(CcdSupportRequirement.SIGN_INTERPRETER)) {
      supportHtml += `<li>${t('PAGES.GENERAL_APPLICATION.HEARING_SUPPORT.SUPPORT.SIGN_LANGUAGE_INTERPRETER', {lng})} - '${application.case_data.generalAppHearingDetails.SupportRequirementSignLanguage}'</li>`;
    }
    if (application.case_data.generalAppHearingDetails.SupportRequirement.includes(CcdSupportRequirement.LANGUAGE_INTERPRETER)) {
      supportHtml += `<li>${t('PAGES.GENERAL_APPLICATION.HEARING_SUPPORT.SUPPORT.LANGUAGE_INTERPRETER', {lng})} - '${application.case_data.generalAppHearingDetails.SupportRequirementLanguageInterpreter}'</li>`;
    }
    if (application.case_data.generalAppHearingDetails.SupportRequirement.includes(CcdSupportRequirement.OTHER_SUPPORT)) {
      supportHtml += `<li>${t('PAGES.GENERAL_APPLICATION.HEARING_SUPPORT.SUPPORT.OTHER', {lng})} - '${application.case_data.generalAppHearingDetails.SupportRequirementOther}'</li>`;
    }
    supportHtml += '</ul>';
    rows.push(
      summaryRow(t('PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.NEED_ADJUSTMENTS', {lng}),
        supportHtml.includes('<li>') ? supportHtml : t('COMMON.NO', {lng})),
    );
  }
  return rows;
};

export const addFinalPaymentDateDetails = (application: ApplicationResponse, lang: string): SummaryRow[] => {
  const lng = getLng(lang);
  const rows: SummaryRow[] = [];
  if (application.case_data.certOfSC) {
    const finalPaymentDate = formatDateToFullDate(application.case_data.certOfSC.defendantFinalPaymentDate, lang);
    rows.push(
      summaryRow(t('PAGES.GENERAL_APPLICATION.FINAL_DEFENDANT_PAYMENT_DATE.FORM_HEADER_1', {lng}), finalPaymentDate),
    );
  }
  return rows;
};

export const addEvidenceOfDebtPaymentRow = (application: ApplicationResponse, lang: string): SummaryRow[] => {
  const lng = getLng(lang);
  let rowValue: string;
  const rows: SummaryRow[] = [];
  if (application.case_data.certOfSC) {
    const evidenceOption = application.case_data.certOfSC.debtPaymentEvidence.debtPaymentOption;
    if (evidenceOption === debtPaymentOptions.UNABLE_TO_PROVIDE_EVIDENCE_OF_FULL_PAYMENT) {
      rowValue = `<p class="govuk-border-colour-border-bottom-1 govuk-!-padding-bottom-2 govuk-!-margin-top-0">
                        ${t('PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.COSC.UPLOAD_EVIDENCE_PAID_IN_FULL_NO', {lng})}</p>`;

      rowValue += `<p class="govuk-!-padding-bottom-2 govuk-!-margin-top-0">
        ${application.case_data.certOfSC.debtPaymentEvidence.provideDetails}</p>`;
      rows.push(
        summaryRow(t('PAGES.GENERAL_APPLICATION.DEBT_PAYMENT.DO_YOU_WANT_PROVIDE_EVIDENCE', {lng}), t(rowValue, {lng})));
    } else {
      const evidenceDetails = getEvidencePaymentOption(application.case_data.certOfSC.debtPaymentEvidence.debtPaymentOption);
      rows.push(
        summaryRow(t('PAGES.GENERAL_APPLICATION.DEBT_PAYMENT.DO_YOU_WANT_PROVIDE_EVIDENCE', {lng}), t(evidenceDetails, {lng})),
      );
    }
  }
  return rows;
};

const toCUIHearingPreferencesPreferredType = (hearingTypeOption: CcdHearingType): HearingTypeOptions => {
  switch (hearingTypeOption) {
    case CcdHearingType.IN_PERSON:
      return HearingTypeOptions.PERSON_AT_COURT;
    case CcdHearingType.TELEPHONE:
      return HearingTypeOptions.TELEPHONE;
    case CcdHearingType.VIDEO:
      return HearingTypeOptions.VIDEO_CONFERENCE;
    default:
      return undefined;
  }
};

const otherPartiesAgreed = (application: ApplicationResponse): boolean =>
  application.case_data.generalAppRespondentAgreement?.hasAgreed === YesNoUpperCamelCase.YES;
