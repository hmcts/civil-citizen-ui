import {
  ClaimSummarySection,
  ClaimSummaryType,
} from 'form/models/claimSummarySection';
import { t } from 'i18next';
import {Claim} from 'models/claim';
import {BILINGUAL_LANGUAGE_PREFERENCE_URL, CLAIMANT_RESPONSE_TASK_LIST_URL} from 'routes/urls';

export const getResponseNotSubmittedTitle = (isResponseDeadlineExtended: boolean, lang : string): ClaimSummarySection => {
  return isResponseDeadlineExtended ? ({
    type: ClaimSummaryType.TITLE,
    data: {
      text: t('PAGES.LATEST_UPDATE_CONTENT.MORE_TIME_REQUESTED', {lng : lang}),
    },
  }) : ({
    type: ClaimSummaryType.TITLE,
    data: {
      text: t('PAGES.LATEST_UPDATE_CONTENT.YOU_HAVENT_RESPONDED_TO_CLAIM', {lng : lang}),
    },
  });
};

export const getNotPastResponseDeadlineContent = (claim: Claim, lang: string): ClaimSummarySection => {
  const responseDeadline = claim.formattedResponseDeadline(lang);
  const remainingDays = claim.getRemainingDays();
  return {
    type: ClaimSummaryType.PARAGRAPH,
    data: {
      text: t('PAGES.LATEST_UPDATE_CONTENT.YOU_NEED_TO_RESPOND_BEFORE_DEADLINE', {lng : lang}),
      variables:
        {'responseDeadline': responseDeadline, 'remainingDays': remainingDays},
    },
  };
};

export const getPastResponseDeadlineContent = (claim: Claim, lang: string): ClaimSummarySection[] => {
  const claimantName = claim.getClaimantFullName();
  return [
    {
      type: ClaimSummaryType.PARAGRAPH,
      data: {
        text: t('PAGES.LATEST_UPDATE_CONTENT.CLAIMANT_CAN_ASK_FOR_CCJ_AGAINST_YOU', {lng : lang}),
        variables: {claimantName: claimantName},
      },
    },
    {
      type: ClaimSummaryType.PARAGRAPH,
      data: {
        text: t('PAGES.LATEST_UPDATE_CONTENT.CCJ_COULD_SEND_BAILIFFS_TO_YOUR_HOME', {lng : lang}),
      },
    },
    {
      type: ClaimSummaryType.PARAGRAPH,
      data: {
        text: t('PAGES.LATEST_UPDATE_CONTENT.YOU_CAN_STILL_RESPOND_TO_CLAIM', {lng : lang}),
      },
    },
  ];
};

export const getRespondToClaimLink = (claimId: string, lang: string): ClaimSummarySection => {
  return (
    {
      type: ClaimSummaryType.LINK,
      data: {
        text: t('COMMON.BUTTONS.RESPOND_TO_CLAIM', {lng : lang}),
        href: BILINGUAL_LANGUAGE_PREFERENCE_URL.replace(':id', claimId),
      },
    }
  );
};

export const getClaimantRespondToClaimLink = (claim: Claim, claimId: string, lang: string): ClaimSummarySection => {
  if (!claim.isFAPaymentOptionPayImmediately()) {
    return (
      {
        type: ClaimSummaryType.LINK,
        data: {
          text: t('COMMON.BUTTONS.RESPOND_TO_CLAIM', {lng: lang}),
          href: CLAIMANT_RESPONSE_TASK_LIST_URL.replace(':id', claimId),
        },
      }
    );
  }  
};
