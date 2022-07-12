import {t} from 'i18next';
import {ClaimSummaryType, ClaimSummarySection} from '../../../../../../common/form/models/claimSummarySection';
import {getLng} from '../../../../../../common/utils/languageToggleUtils';
import {Claim} from '../../../../../../common/models/claim';
import {CLAIM_TASK_LIST_URL} from '../../../../../../routes/urls';

export const getResponseNotSubmittedTitle = (lang: string): ClaimSummarySection => {
  return ({
    type: ClaimSummaryType.TITLE,
    data: {
      text: t('PAGES.LATEST_UPDATE_CONTENT.YOU_HAVENT_RESPONDED_TO_CLAIM', {lng: getLng(lang)}),
    },
  });
};

export const getNotPastResponseDeadlineContent = (claim: Claim, lang: string): ClaimSummarySection => {
  const responseDeadline = claim.formattedResponseDeadline();
  const remainingDays = claim.getRemainingDays();
  return {
    type: ClaimSummaryType.PARAGRAPH,
    data: {
      text: t('PAGES.LATEST_UPDATE_CONTENT.YOU_NEED_TO_RESPOND_BEFORE_DEADLINE', {responseDeadline: responseDeadline, remainingDays: remainingDays, lng: getLng(lang)}),
    },
  };
};

export const getPastResponseDeadlineContent = (claim: Claim, lang: string): ClaimSummarySection[] => {
  const claimantName = claim.getClaimantName();
  return [
    {
      type: ClaimSummaryType.PARAGRAPH,
      data: {
        text: t('PAGES.LATEST_UPDATE_CONTENT.CLAIMANT_CAN_ASK_FOR_CCJ_AGAINST_YOU', {claimantName: claimantName, lng: getLng(lang)}),
      },
    },
    {
      type: ClaimSummaryType.PARAGRAPH,
      data: {
        text: t('PAGES.LATEST_UPDATE_CONTENT.CCJ_COULD_SEND_BAILIFFS_TO_YOUR_HOME', {lng: getLng(lang)}),
      },
    },
    {
      type: ClaimSummaryType.PARAGRAPH,
      data: {
        text: t('PAGES.LATEST_UPDATE_CONTENT.YOU_CAN_STILL_RESPOND_TO_CLAIM', {lng: getLng(lang)}),
      },
    },
  ];
};

export const getRespondToClaimLink = (claimId: string, lang: string): ClaimSummarySection => {
  return (
    {
      type: ClaimSummaryType.LINK,
      data: {
        text: t('PAGES.LATEST_UPDATE_CONTENT.RESPOND_TO_CLAIM', {lng: getLng(lang)}),
        href: CLAIM_TASK_LIST_URL.replace(':id', claimId),
      },
    }
  );
};
