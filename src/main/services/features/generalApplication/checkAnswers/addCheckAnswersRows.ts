import { Claim } from 'models/claim';
import { getLng } from 'common/utils/languageToggleUtils';
import { t } from 'i18next';
import { SummaryRow, summaryRow } from 'models/summaryList/summaryList';
import {
  APPLICATION_TYPE_URL,
  GA_AGREEMENT_FROM_OTHER_PARTY_URL,
  GA_CLAIM_APPLICATION_COST_URL,
  GA_HEARING_ARRANGEMENT_URL,
  GA_HEARING_CONTACT_DETAILS_URL,
  GA_HEARING_SUPPORT_URL,
  GA_REQUESTING_REASON_URL,
  GA_UNAVAILABLE_HEARING_DATES_URL,
  GA_WANT_TO_UPLOAD_DOCUMENTS_URL,
  INFORM_OTHER_PARTIES_URL,
  ORDER_JUDGE_URL,
  COSC_FINAL_PAYMENT_DATE_URL,
  GA_DEBT_PAYMENT_EVIDENCE_COSC_URL,
  GA_UPLOAD_DOCUMENTS_COSC_URL,
  GA_ADD_ANOTHER_APPLICATION_URL, GA_UPLOAD_N245_FORM_URL,
} from 'routes/urls';
import { constructResponseUrlWithIdParams } from 'common/utils/urlFormatter';
import { YesNo, YesNoUpperCase } from 'form/models/yesNo';
import { UnavailableDateType } from 'models/generalApplication/unavailableDatesGaHearing';
import { formatDateToFullDate } from 'common/utils/dateUtils';
import {
  ApplicationTypeOptionSelection,
  getApplicationTypeOptionByTypeAndDescription,
} from 'models/generalApplication/applicationType';
import {debtPaymentOptions} from 'models/generalApplication/debtPaymentOptions';
import {getListOfNotAllowedAdditionalAppType} from 'services/features/generalApplication/generalApplicationService';

export const addApplicationTypeRow = (
  claimId: string,
  claim: Claim,
  appTypeIndex: number,
  lang: string,
): SummaryRow[] => {
  const lng = getLng(lang);
  const changeLabel = (): string =>
    t('COMMON.BUTTONS.CHANGE', { lng });
  const rows: SummaryRow[] = [];
  if (claim.generalApplication?.applicationTypes?.length > appTypeIndex) {
    const applicationType = claim.generalApplication.applicationTypes[appTypeIndex];
    const applicationTypeDisplay =
      getApplicationTypeOptionByTypeAndDescription(applicationType.option, ApplicationTypeOptionSelection.BY_APPLICATION_TYPE);
    const href = `${constructResponseUrlWithIdParams(claimId, APPLICATION_TYPE_URL)}?index=${appTypeIndex}`;
    rows.push(summaryRow(
      t('PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.APPLICATION_TYPE', {lng}),
      t(applicationTypeDisplay, {lng}),
      href,
      changeLabel(),
      undefined,
    ));
  }
  return rows;
};

export const addOtherPartiesAgreedRow = (claimId: string, claim: Claim, lang: string): SummaryRow[] => {
  const lng = getLng(lang);
  const changeLabel = (): string => t('COMMON.BUTTONS.CHANGE', {lng});
  const href = `${constructResponseUrlWithIdParams(claimId, GA_AGREEMENT_FROM_OTHER_PARTY_URL)}?changeScreen=true`;
  const rows: SummaryRow[] = [];
  if (claim.generalApplication?.agreementFromOtherParty) {
    const partiesAgreed = (claim.generalApplication?.agreementFromOtherParty === YesNo.YES) ? YesNoUpperCase.YES : YesNoUpperCase.NO;
    rows.push(
      summaryRow(t('PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.PARTIES_AGREED', {lng}), t(`COMMON.VARIATION_5.${partiesAgreed}`, {lng}),
        href, changeLabel()),
    );
  }
  return rows;
};

export const addInformOtherPartiesRow = (claimId: string, claim: Claim, lang: string): SummaryRow[] => {
  const lng = getLng(lang);
  const changeLabel = (): string => t('COMMON.BUTTONS.CHANGE', {lng});
  const rows: SummaryRow[] = [];
  if (claim.generalApplication?.informOtherParties) {
    const informOtherParties = (claim.generalApplication?.informOtherParties.option === YesNo.YES) ? YesNoUpperCase.YES : YesNoUpperCase.NO;
    rows.push(
      summaryRow(t('PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.INFORM_OTHER_PARTIES', {lng}), t(`COMMON.VARIATION_2.${informOtherParties}`, {lng}),
        constructResponseUrlWithIdParams(claimId, INFORM_OTHER_PARTIES_URL), changeLabel()),
    );
    if (informOtherParties === YesNoUpperCase.NO) {
      rows.push(
        summaryRow(
          t('PAGES.GENERAL_APPLICATION.INFORM_OTHER_PARTIES.WHY_DO_NOT_WANT_COURT', {lng}),
          claim.generalApplication?.informOtherParties.reasonForCourtNotInformingOtherParties,
          constructResponseUrlWithIdParams(claimId, INFORM_OTHER_PARTIES_URL),
          changeLabel(),
        ),
      );
    }
  }
  return rows;
};

export const addAskForCostsRow = (claimId: string, claim: Claim, lang: string): SummaryRow[] => {
  const lng = getLng(lang);
  const changeLabel = (): string => t('COMMON.BUTTONS.CHANGE', {lng});
  const rows: SummaryRow[] = [];
  if (claim.generalApplication?.applicationCosts) {
    const askForCosts = (claim.generalApplication?.applicationCosts === YesNo.YES) ? YesNoUpperCase.YES : YesNoUpperCase.NO;
    rows.push(
      summaryRow(t('PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.ASK_FOR_COSTS', {lng}), t(`COMMON.VARIATION_2.${askForCosts}`, {lng}),
        constructResponseUrlWithIdParams(claimId, GA_CLAIM_APPLICATION_COST_URL), changeLabel()),
    );
  }
  return rows;
};

export const addOrderJudgeRow = (claimId: string, claim: Claim, orderJudgeIndex: number, lang: string): SummaryRow[] => {
  const lng = getLng(lang);
  const changeLabel = (): string => t('COMMON.BUTTONS.CHANGE', {lng});
  const rows: SummaryRow[] = [];
  if (claim.generalApplication?.orderJudges?.length > orderJudgeIndex) {
    const orderJudge = claim.generalApplication.orderJudges[orderJudgeIndex];
    const href = `${constructResponseUrlWithIdParams(claimId, ORDER_JUDGE_URL)}?index=${orderJudgeIndex}`;
    rows.push(
      summaryRow(t('PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.WHAT_ORDER', {lng}), orderJudge.text,
        href, changeLabel(), undefined),
    );
  }
  return rows;
};

export const addRequestingReasonRow = (claimId: string, claim: Claim, requestingReasonIndex: number, lang: string): SummaryRow[] => {
  const lng = getLng(lang);
  const changeLabel = (): string => t('COMMON.BUTTONS.CHANGE', {lng});
  const rows: SummaryRow[] = [];
  if (claim.generalApplication?.requestingReasons?.length > requestingReasonIndex) {
    const requestingReason = claim.generalApplication.requestingReasons[requestingReasonIndex];
    const href = `${constructResponseUrlWithIdParams(claimId, GA_REQUESTING_REASON_URL)}?index=${requestingReasonIndex}`;
    rows.push(
      summaryRow(t('PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.WHY_REQUESTING', {lng}), requestingReason.text,
        href, changeLabel(), undefined),
    );
  }
  return rows;
};

export const addAddAnotherApplicationRow = (claimId: string, claim: Claim, lang: string): SummaryRow[] => {
  const lng = getLng(lang);
  const changeLabel = (): string => t('COMMON.BUTTONS.CHANGE', {lng});
  const rows: SummaryRow[] = [];
  if (claim.generalApplication?.applicationTypes
    && !getListOfNotAllowedAdditionalAppType().includes(claim.generalApplication.applicationTypes[0].option)) {
    const addAnotherApp = (claim.generalApplication?.applicationTypes.length > 1) ? YesNoUpperCase.YES : YesNoUpperCase.NO;
    rows.push(
      summaryRow(t('PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.ADD_ANOTHER_APPLICATION', {lng}), t(`COMMON.VARIATION_2.${addAnotherApp}`, {lng}),
        constructResponseUrlWithIdParams(claimId, GA_ADD_ANOTHER_APPLICATION_URL)+'?changeScreen=true', changeLabel()),
    );
  }
  return rows;
};

export const addDocumentUploadRow = (claimId: string, claim: Claim, lang: string): SummaryRow[] => {
  const lng = getLng(lang);
  const changeLabel = (): string => t('COMMON.BUTTONS.CHANGE', {lng});
  const rows: SummaryRow[] = [];
  if (claim.generalApplication?.wantToUploadDocuments) {
    const href = `${constructResponseUrlWithIdParams(claimId, GA_WANT_TO_UPLOAD_DOCUMENTS_URL)}`;
    let rowValue: string;
    if (claim.generalApplication.wantToUploadDocuments === YesNo.YES) {
      rowValue = `<p class="govuk-border-colour-border-bottom-1 govuk-!-padding-bottom-2 govuk-!-margin-top-0">${t('COMMON.VARIATION_2.YES', {lng})}</p>`;
      rowValue += '<ul class="no-list-style">';
      claim.generalApplication.uploadEvidenceForApplication.forEach(uploadGAFile => {
        rowValue += `<li>${uploadGAFile.caseDocument.documentName}</li>`;
      });
      rowValue += '</ul>';
    } else {
      rowValue = t('COMMON.VARIATION_2.NO', {lng});
    }
    rows.push(
      summaryRow(t('PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.UPLOAD_DOCUMENTS', {lng}), rowValue, href, changeLabel()),
    );
  }
  return rows;
};

export const addHearingArrangementsRows = (claimId: string, claim: Claim, lang: string): SummaryRow[] => {
  const lng = getLng(lang);
  const changeLabel = (): string => t('COMMON.BUTTONS.CHANGE', {lng});
  const rows: SummaryRow[] = [];
  if (claim.generalApplication?.hearingArrangement) {
    const hearingPreferredType = claim.generalApplication.hearingArrangement.option;
    rows.push(
      summaryRow(t('PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.CHOOSE_PREFERRED_TYPE', {lng}),
        t(`PAGES.GENERAL_APPLICATION.APPLICATION_HEARING_ARRANGEMENTS.HEARING_TYPE.${hearingPreferredType}`, {lng}),
        constructResponseUrlWithIdParams(claimId, GA_HEARING_ARRANGEMENT_URL), changeLabel()),
    );
    rows.push(
      summaryRow(t('PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.WHY_PREFER', {lng}),
        claim.generalApplication.hearingArrangement.reasonForPreferredHearingType,
        constructResponseUrlWithIdParams(claimId, GA_HEARING_ARRANGEMENT_URL), changeLabel()),
    );
    const courtLocationText = claim.generalApplication.hearingArrangement.courtLocation
      ? claim.generalApplication.hearingArrangement.courtLocation.slice(0, claim.generalApplication.hearingArrangement.courtLocation.indexOf(' - '))
      : t('PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.NONE', {lng});
    rows.push(
      summaryRow(t('PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.PREFERRED_COURT_LOCATION', {lng}),
        courtLocationText,
        constructResponseUrlWithIdParams(claimId, GA_HEARING_ARRANGEMENT_URL), changeLabel()),
    );
  }
  return rows;
};

export const addHearingContactDetailsRows = (claimId: string, claim: Claim, lang: string): SummaryRow[] => {
  const lng = getLng(lang);
  const changeLabel = (): string => t('COMMON.BUTTONS.CHANGE', {lng});
  const rows: SummaryRow[] = [];
  if (claim.generalApplication?.hearingContactDetails) {
    rows.push(
      summaryRow(t('PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.PREFERRED_TELEPHONE', {lng}),
        claim.generalApplication.hearingContactDetails.telephoneNumber,
        constructResponseUrlWithIdParams(claimId, GA_HEARING_CONTACT_DETAILS_URL), changeLabel()),
    );
    rows.push(
      summaryRow(t('PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.PREFERRED_EMAIL', {lng}),
        claim.generalApplication.hearingContactDetails.emailAddress,
        constructResponseUrlWithIdParams(claimId, GA_HEARING_CONTACT_DETAILS_URL), changeLabel()),
    );
  }
  return rows;
};

export const addUnavailableDatesRows = (claimId: string, claim: Claim, lang: string): SummaryRow[] => {
  const lng = getLng(lang);
  const changeLabel = (): string => t('COMMON.BUTTONS.CHANGE', {lng});
  const rows: SummaryRow[] = [];
  if (claim.generalApplication?.unavailableDatesHearing) {
    let unavailableDatesHtml = '<ul class="no-list-style">';
    claim.generalApplication.unavailableDatesHearing.items.forEach((value, index) => {
      if (value.type === UnavailableDateType.SINGLE_DATE) {
        unavailableDatesHtml += `<li>${formatDateToFullDate(value.from, lang)}</li>`;
      } else if (value.type === UnavailableDateType.LONGER_PERIOD) {
        unavailableDatesHtml += `<li>${formatDateToFullDate(value.from, lang)} - ${formatDateToFullDate(value.until, lang)}</li>`;
      }
    });
    unavailableDatesHtml += '</ul>';
    rows.push(
      summaryRow(t('PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.DATES_CANNOT_ATTEND', {lng}),
        unavailableDatesHtml.length > 0 ? unavailableDatesHtml : t('COMMON.NO', {lng}),
        constructResponseUrlWithIdParams(claimId, GA_UNAVAILABLE_HEARING_DATES_URL), changeLabel()),
    );
  }
  return rows;
};

export const addHearingSupportRows = (claimId: string, claim: Claim, lang: string): SummaryRow[] => {
  const lng = getLng(lang);
  const changeLabel = (): string => t('COMMON.BUTTONS.CHANGE', {lng});
  const rows: SummaryRow[] = [];
  if (claim.generalApplication?.hearingSupport) {
    let supportHtml = '<ul class="no-list-style">';
    if (claim.generalApplication.hearingSupport.stepFreeAccess?.selected) {
      supportHtml += `<li>${t('PAGES.GENERAL_APPLICATION.HEARING_SUPPORT.SUPPORT.STEP_FREE_ACCESS', {lng})}</li>`;
    }
    if (claim.generalApplication.hearingSupport.hearingLoop?.selected) {
      supportHtml += `<li>${t('PAGES.GENERAL_APPLICATION.HEARING_SUPPORT.SUPPORT.HEARING_LOOP', {lng})}</li>`;
    }
    if (claim.generalApplication.hearingSupport.signLanguageInterpreter?.selected) {
      supportHtml += `<li>${t('PAGES.GENERAL_APPLICATION.HEARING_SUPPORT.SUPPORT.SIGN_LANGUAGE_INTERPRETER', {lng})} - '${claim.generalApplication.hearingSupport.signLanguageInterpreter.content}'</li>`;
    }
    if (claim.generalApplication.hearingSupport.languageInterpreter?.selected) {
      supportHtml += `<li>${t('PAGES.GENERAL_APPLICATION.HEARING_SUPPORT.SUPPORT.LANGUAGE_INTERPRETER', {lng})} - '${claim.generalApplication.hearingSupport.languageInterpreter.content}'</li>`;
    }
    if (claim.generalApplication.hearingSupport.otherSupport?.selected) {
      supportHtml += `<li>${t('PAGES.GENERAL_APPLICATION.HEARING_SUPPORT.SUPPORT.OTHER', {lng})} - '${claim.generalApplication.hearingSupport.otherSupport.content}'</li>`;
    }
    supportHtml += '</ul>';
    rows.push(
      summaryRow(t('PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.NEED_ADJUSTMENTS', {lng}),
        supportHtml.includes('<li>') ? supportHtml : t('COMMON.NO', {lng}),
        constructResponseUrlWithIdParams(claimId, GA_HEARING_SUPPORT_URL), changeLabel()),
    );
  }
  return rows;
};

export const addFinalPaymentDateRows = (claimId: string, claim: Claim, lang: string): SummaryRow[] => {
  const lng = getLng(lang);
  const changeLabel = (): string => t('COMMON.BUTTONS.CHANGE', {lng});
  const rows: SummaryRow[] = [];
  if (claim.generalApplication.certificateOfSatisfactionOrCancellation?.defendantFinalPaymentDate) {
    rows.push(
      summaryRow(t('PAGES.GENERAL_APPLICATION.FINAL_DEFENDANT_PAYMENT_DATE.FORM_HEADER_1', {lng}),
        formatDateToFullDate(claim.generalApplication.certificateOfSatisfactionOrCancellation.defendantFinalPaymentDate.date, lng),
        constructResponseUrlWithIdParams(claimId, COSC_FINAL_PAYMENT_DATE_URL), changeLabel()),
    );
  }
  return rows;
};

export const addCoScDocumentUploadRow = (claimId: string, claim: Claim, lang: string): SummaryRow[] => {
  const lng = getLng(lang);
  const changeLabel = (): string => t('COMMON.BUTTONS.CHANGE', {lng});
  const rows: SummaryRow[] = [];
  const href = `${constructResponseUrlWithIdParams(claimId, GA_UPLOAD_DOCUMENTS_COSC_URL)}`;
  let rowValue: string;
  if(getEvidencePaymentOption(claim.generalApplication.certificateOfSatisfactionOrCancellation?.debtPaymentEvidence?.debtPaymentOption) !== undefined) {
    rowValue = '<ul class="no-list-style">';
    claim.generalApplication.uploadEvidenceForApplication.forEach(uploadGAFile => {
      rowValue += `<li>${uploadGAFile.caseDocument.documentName}</li>`;
    });
    rowValue += '</ul>';
    rows.push(
      summaryRow(t('PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.COSC.UPLOAD_DOCUMENTS', {lng}), rowValue, href, changeLabel()),
    );
  }
  return rows;
};

export const addHasEvidenceOfDebtPaymentRow = (claimId: string, claim: Claim, lang: string): SummaryRow[] => {
  const lng = getLng(lang);
  const changeLabel = (): string => t('COMMON.BUTTONS.CHANGE', {lng});
  const rows: SummaryRow[] = [];
  const href = `${constructResponseUrlWithIdParams(claimId, GA_DEBT_PAYMENT_EVIDENCE_COSC_URL)}`;
  let rowValue: string;
  if(claim.generalApplication.certificateOfSatisfactionOrCancellation?.debtPaymentEvidence) {
    const evidenceOption = claim.generalApplication.certificateOfSatisfactionOrCancellation.debtPaymentEvidence.debtPaymentOption;
    if(evidenceOption === debtPaymentOptions.UNABLE_TO_PROVIDE_EVIDENCE_OF_FULL_PAYMENT) {
      rowValue = `<p class="govuk-border-colour-border-bottom-1 govuk-!-padding-bottom-2 govuk-!-margin-top-0">
                        ${t('PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.COSC.UPLOAD_EVIDENCE_PAID_IN_FULL_NO', {lng})}</p>`;

      rowValue += `<p class="govuk-!-padding-bottom-2 govuk-!-margin-top-0">
        ${claim.generalApplication.certificateOfSatisfactionOrCancellation.debtPaymentEvidence.provideDetails}</p>`;
      rows.push(
        summaryRow(t('PAGES.GENERAL_APPLICATION.DEBT_PAYMENT.DO_YOU_WANT_PROVIDE_EVIDENCE', {lng}), rowValue, href, changeLabel()));
    }
    else {
      rows.push(
        summaryRow(t('PAGES.GENERAL_APPLICATION.DEBT_PAYMENT.DO_YOU_WANT_PROVIDE_EVIDENCE', {lng}),
          t(getEvidencePaymentOption(evidenceOption), {lng}),href, changeLabel()));
    }
  }
  return rows;
};

export function getEvidencePaymentOption(evidenceOption: string) : string {
  switch(evidenceOption) {
    case debtPaymentOptions.UPLOAD_EVIDENCE_DEBT_PAID_IN_FULL :
      return 'PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.COSC.UPLOAD_EVIDENCE_PAID_IN_FULL';
    case debtPaymentOptions.MADE_FULL_PAYMENT_TO_COURT :
      return 'PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.COSC.HAS_DEBT_BEEN_PAID_TO_COURT';
    default: return undefined;
  }
}

export const addN245Row = (claimId: string, claim: Claim, lang: string): SummaryRow[] => {
  const lng = getLng(lang);
  const changeLabel = (): string => t('COMMON.BUTTONS.CHANGE', {lng});
  const rows: SummaryRow[] = [];
  const href = `${constructResponseUrlWithIdParams(claimId, GA_UPLOAD_N245_FORM_URL)}`;
  if(claim.generalApplication?.uploadN245Form) {
    let rowValue = '<ul class="no-list-style">';
    rowValue += `<li>${claim.generalApplication?.uploadN245Form.caseDocument.documentName}</li>`;
    rowValue += '</ul>';
    rows.push(
      summaryRow(t('PAGES.GENERAL_APPLICATION.UPLOAD_N245_FORM.TITLE', {lng}), rowValue, href, changeLabel()),
    );
  }
  return rows;
};
