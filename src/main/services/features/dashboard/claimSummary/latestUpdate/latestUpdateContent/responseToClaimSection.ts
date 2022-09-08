import {ClaimSummarySection, ClaimSummaryType} from '../../../../../../common/form/models/claimSummarySection';
import {Claim} from '../../../../../../common/models/claim';
import {CLAIM_TASK_LIST_URL} from '../../../../../../routes/urls';

export const getResponseNotSubmittedTitle = (): ClaimSummarySection => {
  return ({
    type: ClaimSummaryType.TITLE,
    data: {
      text: 'PAGES.LATEST_UPDATE_CONTENT.YOU_HAVENT_RESPONDED_TO_CLAIM',
    },
  });
};

export const getNotPastResponseDeadlineContent = (claim: Claim): ClaimSummarySection => {
  const responseDeadline = claim.formattedResponseDeadline();
  const remainingDays = claim.getRemainingDays();
  return {
    type: ClaimSummaryType.PARAGRAPH,
    data: {
      text: 'PAGES.LATEST_UPDATE_CONTENT.YOU_NEED_TO_RESPOND_BEFORE_DEADLINE',
      variables:
        {'responseDeadline': responseDeadline, 'remainingDays': remainingDays},
    },
  };
};

export const getPastResponseDeadlineContent = (claim: Claim): ClaimSummarySection[] => {
  const claimantName = claim.getClaimantName();
  return [
    {
      type: ClaimSummaryType.PARAGRAPH,
      data: {
        text: 'PAGES.LATEST_UPDATE_CONTENT.CLAIMANT_CAN_ASK_FOR_CCJ_AGAINST_YOU',
        variables: {claimantName: claimantName},
      },
    },
    {
      type: ClaimSummaryType.PARAGRAPH,
      data: {
        text: 'PAGES.LATEST_UPDATE_CONTENT.CCJ_COULD_SEND_BAILIFFS_TO_YOUR_HOME',
      },
    },
    {
      type: ClaimSummaryType.PARAGRAPH,
      data: {
        text: 'PAGES.LATEST_UPDATE_CONTENT.YOU_CAN_STILL_RESPOND_TO_CLAIM',
      },
    },
  ];
};

export const getRespondToClaimLink = (claimId: string): ClaimSummarySection => {
  return (
    {
      type: ClaimSummaryType.LINK,
      data: {
        text: 'PAGES.LATEST_UPDATE_CONTENT.RESPOND_TO_CLAIM',
        href: CLAIM_TASK_LIST_URL.replace(':id', claimId),
      },
    }
  );
};
