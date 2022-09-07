import {ClaimSummarySection, ClaimSummaryType} from '../../../common/form/models/claimSummarySection';
import {feesHelpUri} from '../../../../test/utils/externalURLs';
import {t} from 'i18next';
import {ELIGIBILITY_HWF_ELIGIBLE_URL, ELIGIBILITY_HWF_ELIGIBLE_REFERENCE_URL, ELIGIBLE_FOR_THIS_SERVICE_URL} from '../../../routes/urls';

export const getYouCanUseContent = (url: string, lang: string): ClaimSummarySection[] => {
  switch (url){
    case ELIGIBILITY_HWF_ELIGIBLE_URL:{
      return getYouCanUseHWFEligible(lang);
    }
    case ELIGIBILITY_HWF_ELIGIBLE_REFERENCE_URL:{
      return getYouCanUseHWFEligibleReference();
    }
    case ELIGIBLE_FOR_THIS_SERVICE_URL:{
      return [];
    }
    default:{
      return [];
    }
  }
};

export function getYouCanUseHWFEligible(lang: string): ClaimSummarySection[] {
  return [
    {
      type: ClaimSummaryType.LINK,
      data: {
        href: feesHelpUri,
        textBefore: t('PAGES.YOU_CAN_USE.HWF_ELIGIBLE.PAY_COURT', {lng: lang}),
        text: t('PAGES.YOU_CAN_USE.HWF_ELIGIBLE.HELP_WITH_FEES', {lng: lang}),
        textAfter : '.',
      },
    },
  ];
}

export function getYouCanUseHWFEligibleReference(): ClaimSummarySection[] {
  return [
    {
      type: ClaimSummaryType.PARAGRAPH,
      data: {
        text: 'PAGES.YOU_CAN_USE.HWF_ELIGIBLE_REFERENCE.REMEMBER',
      },
    },
  ];
}

