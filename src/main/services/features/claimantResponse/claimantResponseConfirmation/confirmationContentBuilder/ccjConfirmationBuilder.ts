import {Claim} from 'models/claim';
import {ClaimSummaryType} from 'form/models/claimSummarySection';
import {t} from 'i18next';
import {PageSectionBuilder} from 'common/utils/pageSectionBuilder';

export const getCCJNextSteps = (claim: Claim, lang: string) => {
  const defendantName = claim.getDefendantFullName();
  return [
    {
      type: ClaimSummaryType.TITLE,
      data: {
        text: t('PAGES.SUBMIT_CONFIRMATION.WHAT_HAPPENS_NEXT', {lng: lang}),
      },
    },
    {
      type: ClaimSummaryType.PARAGRAPH,
      data: {
        text: t('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.CCJ.CCJ_NEXT_STEP_MSG1', {lgn: lang}),
      },
    },
    {
      type: ClaimSummaryType.PARAGRAPH,
      data: {
        text: t('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.CCJ.CCJ_NEXT_STEP_MSG2', {defendantName, lgn: lang}),
      },
    },
  ];
};

export const getCCJNextStepsForRejectedRepaymentPlan = (claim: Claim, lang: string) => {
  const defendantName = claim.getDefendantFullName();
  return new PageSectionBuilder()
    .addTitle('PAGES.SUBMIT_CONFIRMATION.WHAT_HAPPENS_NEXT', { lang })
    .addParagraph('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.CCJ.CCJ_NEXT_STEP_MSG3', { lang })
    .addParagraph('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.CCJ.CCJ_NEXT_STEP_MSG2', { defendantName, lang })
    .build();
};
