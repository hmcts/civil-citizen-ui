import {ClaimSummarySection, ClaimSummaryType} from 'form/models/claimSummarySection';
import {t} from 'i18next';

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

export function buildNextStepsSection(readyForTrialOrHearing: boolean, lng: string): ClaimSummarySection[] {
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
    ];
  }
}
