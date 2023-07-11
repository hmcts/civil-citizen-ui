import {ClaimSummarySection, ClaimSummaryType} from 'form/models/claimSummarySection';
import {t} from 'i18next';
import {Claim} from 'models/claim';
import {DEFENDANT_DOCUMENTS_URL} from 'routes/urls';

export function getNextStepsTitle(lang: string): ClaimSummarySection[] {
  return [
    {
      type: ClaimSummaryType.TITLE,
      data: {
        text: t('PAGES.FINALISE_TRIAL_ARRANGEMENTS.CONFIRMATION.WHAT_HAPPENS_NEXT', {lng: lang}),
      },
    },
  ];
}

export function buildNextStepsSection(claimId: string, claim: Claim, lng: string, readyForTrialOrHearing: boolean): ClaimSummarySection[] {
  if (readyForTrialOrHearing) {
    // TODO: build next steps section for CIV-9204
  } else {
    return [
      {
        type: ClaimSummaryType.PARAGRAPH,
        data: {
          text: t('PAGES.FINALISE_TRIAL_ARRANGEMENTS.CONFIRMATION.YOU_WILL_NEED_TO_CALL', {lng}),
        },
      },
      {
        type: ClaimSummaryType.LINK,
        data: {
          text: t('PAGES.FINALISE_TRIAL_ARRANGEMENTS.CONFIRMATION.NOTICES_AND_ORDERS', {lng}),
          href: DEFENDANT_DOCUMENTS_URL.replace(':id', claimId),
          textBefore: t('PAGES.FINALISE_TRIAL_ARRANGEMENTS.CONFIRMATION.YOU_CAN_VIEW_TRIAL_ARRANGEMENTS', {lng}),
          textAfter: t('PAGES.FINALISE_TRIAL_ARRANGEMENTS.CONFIRMATION.IN_THE_CASE_DETAILS', {lng}),
        },
      },
    ];
  }
}
