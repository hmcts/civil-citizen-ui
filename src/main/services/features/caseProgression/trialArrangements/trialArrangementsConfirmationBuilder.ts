import {ClaimSummarySection, ClaimSummaryType} from 'form/models/claimSummarySection';
import {t} from 'i18next';
import {Claim} from 'models/claim';

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
    const claimantName = claim.getClaimantFullName();

    return [
      {
        type: ClaimSummaryType.PARAGRAPH,
        data: {
          text: t('PAGES.FINALISE_TRIAL_ARRANGEMENTS.CONFIRMATION.YOU_WILL_NEED_TO_CALL', {claimantName, lng}),
        },
      },
    ];
  }
}
