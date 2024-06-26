import {ClaimSummaryType} from 'form/models/claimSummarySection';
import {t} from 'i18next';

export const getMediationCarmNextSteps = (lang: string) => {
  return [
    {
      type: ClaimSummaryType.PARAGRAPH,
      data: {
        text: t('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.MEDIATION.WHAT_HAPPENS_NEXT_TEXT_PARA_1', {lng: lang}),
      },
    },
    {
      type: ClaimSummaryType.TITLE,
      data: {
        text: t('PAGES.SUBMIT_CONFIRMATION.WHAT_HAPPENS_NEXT', {lng: lang}),
      },
    },
    {
      type: ClaimSummaryType.PARAGRAPH,
      data: {
        text: t('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.MEDIATION.WHAT_HAPPENS_NEXT_TEXT_PARA_2', {lng: lang}),
      },
    },
    {
      type: ClaimSummaryType.PARAGRAPH,
      data: {
        text: t('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.MEDIATION.WHAT_HAPPENS_NEXT_TEXT_PARA_3', {lng: lang}),
      },
    },
    {
      type: ClaimSummaryType.PARAGRAPH,
      data: {
        text: t('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.MEDIATION.WHAT_HAPPENS_NEXT_TEXT_PARA_4', {lng: lang}),
      },
    },
  ];
};
