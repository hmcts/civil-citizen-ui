import { Claim } from 'models/claim';
import { getLng } from 'common/utils/languageToggleUtils';
import { t } from 'i18next';
import { SummaryRow, summaryRow } from 'models/summaryList/summaryList';
import {
  APPLICATION_TYPE_URL,
  GA_AGREEMENT_FROM_OTHER_PARTY,
  GA_CLAIM_APPLICATION_COST_URL,
  GA_HEARING_ARRANGEMENT_URL,
  GA_HEARING_CONTACT_DETAILS_URL,
  GA_HEARING_SUPPORT_URL,
  GA_REQUESTING_REASON_URL,
  GA_UNAVAILABLE_HEARING_DATES_URL,
  GA_WANT_TO_UPLOAD_DOCUMENTS,
  INFORM_OTHER_PARTIES,
  ORDER_JUDGE_URL,
} from 'routes/urls';
import { selectedApplicationType } from 'models/generalApplication/applicationType';
import { constructResponseUrlWithIdParams } from 'common/utils/urlFormatter';
import { YesNo, YesNoUpperCase } from 'form/models/yesNo';
import { UnavailableDateType } from 'models/generalApplication/unavailableDatesGaHearing';
import { formatDateToFullDate } from 'common/utils/dateUtils';

export const addApplicationTypesRows = (
  claimId: string,
  claim: Claim,
  lang: string,
): SummaryRow[] => {
  const lng = getLng(lang);
  const changeLabel = (): string =>
    t('COMMON.BUTTONS.CHANGE', { lng });
  const rows: SummaryRow[] = [];
  if (claim.generalApplication?.applicationTypes) {
    claim.generalApplication?.applicationTypes?.forEach(
      (applicationType, index, arr) => {
        const applicationTypeDisplay =
          selectedApplicationType[applicationType.option];
        const href = `${constructResponseUrlWithIdParams(
          claimId,
          APPLICATION_TYPE_URL,
        )}?index=${index}`;
        rows.push(
          summaryRow(
            t('PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.APPLICATION_TYPE', {
              lng,
            }),
            t(applicationTypeDisplay, { lng }),
            href,
            changeLabel(),
            undefined,
            index,
            arr.length,
          ),
        );
      },
    );
  }
  return rows;
};

export const addOtherPartiesAgreedRow = (claimId: string, claim: Claim, lang: string): SummaryRow[] => {
  const lng = getLng(lang);
  const changeLabel = (): string => t('COMMON.BUTTONS.CHANGE', {lng});
  const rows: SummaryRow[] = [];
  if (claim.generalApplication?.agreementFromOtherParty) {
    const partiesAgreed = (claim.generalApplication?.agreementFromOtherParty === YesNo.YES) ? YesNoUpperCase.YES : YesNoUpperCase.NO;
    rows.push(
      summaryRow(t('PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.PARTIES_AGREED', {lng}), t(`COMMON.VARIATION.${partiesAgreed}`, {lng}),
        constructResponseUrlWithIdParams(claimId, GA_AGREEMENT_FROM_OTHER_PARTY), changeLabel()),
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
      summaryRow(t('PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.INFORM_OTHER_PARTIES', {lng}), t(`COMMON.VARIATION.${informOtherParties}`, {lng}),
        constructResponseUrlWithIdParams(claimId, INFORM_OTHER_PARTIES), changeLabel()),
    );
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
      summaryRow(t('PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.ASK_FOR_COSTS', {lng}), t(`COMMON.VARIATION.${askForCosts}`, {lng}),
        constructResponseUrlWithIdParams(claimId, GA_CLAIM_APPLICATION_COST_URL), changeLabel()),
    );
  }
  return rows;
};

export const addOrderJudgeRows = (claimId: string, claim: Claim, lang: string): SummaryRow[] => {
  const lng = getLng(lang);
  const changeLabel = (): string => t('COMMON.BUTTONS.CHANGE', {lng});
  const rows: SummaryRow[] = [];
  if (claim.generalApplication?.orderJudges) {
    claim.generalApplication?.orderJudges?.forEach((orderJudge, index, arr) => {
      const href = `${constructResponseUrlWithIdParams(claimId, ORDER_JUDGE_URL)}?index=${index}`;
      rows.push(
        summaryRow(t('PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.WHAT_ORDER', {lng}), orderJudge.text,
          href, changeLabel(), undefined, index, arr.length),
      );
    });
  }
  return rows;
};

export const addRequestingReasonRows = (claimId: string, claim: Claim, lang: string): SummaryRow[] => {
  const lng = getLng(lang);
  const changeLabel = (): string => t('COMMON.BUTTONS.CHANGE', {lng});
  const rows: SummaryRow[] = [];
  if (claim.generalApplication?.requestingReasons) {
    claim.generalApplication?.requestingReasons?.forEach((requestingReason, index, arr) => {
      const href = `${constructResponseUrlWithIdParams(claimId, GA_REQUESTING_REASON_URL)}?index=${index}`;
      rows.push(
        summaryRow(t('PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.WHY_REQUESTING', {lng}), requestingReason.text,
          href, changeLabel(), undefined, index, arr.length),
      );
    });
  }
  return rows;
};

export const addDocumentUploadRow = (claimId: string, claim: Claim, lang: string): SummaryRow[] => {
  const lng = getLng(lang);
  const changeLabel = (): string => t('COMMON.BUTTONS.CHANGE', {lng});
  const rows: SummaryRow[] = [];
  if (claim.generalApplication?.wantToUploadDocuments) {
    const href = `${constructResponseUrlWithIdParams(claimId, GA_WANT_TO_UPLOAD_DOCUMENTS)}`;
    let rowValue: string;
    if (claim.generalApplication.wantToUploadDocuments === YesNo.YES) {
      rowValue = `<p class="govuk-border-colour-border-bottom-1 govuk-!-padding-bottom-2 govuk-!-margin-top-0">${t('COMMON.VARIATION.YES', {lng})}</p>`;
      rowValue += '<ul class="no-list-style">';
      claim.generalApplication.uploadEvidenceForApplication.forEach(uploadGAFile => {
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
    let unavailableDatesHtml = '';
    claim.generalApplication.unavailableDatesHearing.items.forEach((value, index) => {
      if (index > 0) {
        unavailableDatesHtml += '<br>';
      }
      if (value.type === UnavailableDateType.SINGLE_DATE) {
        unavailableDatesHtml += formatDateToFullDate(value.from, lang);
      } else if (value.type === UnavailableDateType.LONGER_PERIOD) {
        unavailableDatesHtml += formatDateToFullDate(value.from, lang) + ' - ' + formatDateToFullDate(value.until, lang);
      }
    });
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
    let supportHtml = '';
    if (claim.generalApplication.hearingSupport.stepFreeAccess?.selected) {
      supportHtml += t('PAGES.GENERAL_APPLICATION.HEARING_SUPPORT.SUPPORT.STEP_FREE_ACCESS', {lng});
    }
    if (claim.generalApplication.hearingSupport.hearingLoop?.selected) {
      if (supportHtml.length > 0) {
        supportHtml += '<br>';
      }
      supportHtml += t('PAGES.GENERAL_APPLICATION.HEARING_SUPPORT.SUPPORT.HEARING_LOOP', {lng});
    }
    if (claim.generalApplication.hearingSupport.signLanguageInterpreter?.selected) {
      if (supportHtml.length > 0) {
        supportHtml += '<br>';
      }
      supportHtml += t('PAGES.GENERAL_APPLICATION.HEARING_SUPPORT.SUPPORT.SIGN_LANGUAGE_INTERPRETER', {lng});
    }
    if (claim.generalApplication.hearingSupport.languageInterpreter?.selected) {
      if (supportHtml.length > 0) {
        supportHtml += '<br>';
      }
      supportHtml += t('PAGES.GENERAL_APPLICATION.HEARING_SUPPORT.SUPPORT.LANGUAGE_INTERPRETER', {lng});
    }
    if (claim.generalApplication.hearingSupport.otherSupport?.selected) {
      if (supportHtml.length > 0) {
        supportHtml += '<br>';
      }
      supportHtml += t('PAGES.GENERAL_APPLICATION.HEARING_SUPPORT.SUPPORT.OTHER', {lng});
    }
    rows.push(
      summaryRow(t('PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.NEED_ADJUSTMENTS', {lng}),
        supportHtml.length > 0 ? supportHtml : t('COMMON.NO', {lng}),
        constructResponseUrlWithIdParams(claimId, GA_HEARING_SUPPORT_URL), changeLabel()),
    );
  }
  return rows;
};
