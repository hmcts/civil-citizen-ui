import {ClaimSummarySection, ClaimSummaryType} from '../../../../common/form/models/claimSummarySection';
import {feesHelpUri} from '../../../../../test/utils/externalURLs';
import {t} from 'i18next';
import {YouCanUseReason} from 'common/form/models/eligibility/YouCanUseReason';

export const getYouCanUseContent = (reason: YouCanUseReason, lang: string): ClaimSummarySection[] => {
  switch (reason){
    case YouCanUseReason.HWF_ELIGIBLE:{
      return getYouCanUseHWFEligible(lang);
    }
  }
};

export function getYouCanUseHWFEligible(lang: string): ClaimSummarySection[] {
  return [
    {
      type: ClaimSummaryType.LINK,
      data: {
        href: feesHelpUri,
        textBefore: t('PAGES.YOU_CAN_USE.HWF_ELIGIBLE.PAY_COURT'),
        text: t('PAGES.YOU_CAN_USE.HWF_ELIGIBLE.HELP_WITH_FEES', {lng: lang}),
        textAfter : '.',
      },
    },
  ];
}

