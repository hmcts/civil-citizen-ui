import {Claim} from 'models/claim';
import {ClaimSummarySection, ClaimSummaryType} from 'form/models/claimSummarySection';
import {
  getNotPastResponseDeadlineContent,
  getPastResponseDeadlineContent,
  getRespondToClaimLink,
  getResponseNotSubmittedTitle,
} from './latestUpdateContent/responseToClaimSection';
import {CASE_DOCUMENT_DOWNLOAD_URL} from 'routes/urls';
import {DocumentUri} from 'models/document/documentType';

const PAGES_LATEST_UPDATE_CONTENT = 'PAGES.LATEST_UPDATE_CONTENT';

function getLastUpdateSdo(claimId: string) {
  return [
    {
      type: ClaimSummaryType.TITLE,
      data: {
        text: `${PAGES_LATEST_UPDATE_CONTENT}.SDO_AN_ORDER_HAS_BEEN_ISSUED_BY_THE_COURT`,
      },
    },
    {
      type: ClaimSummaryType.PARAGRAPH,
      data: {
        text: `${PAGES_LATEST_UPDATE_CONTENT}.SDO_PLEASE_FOLLOW_THE_INSTRUCTIONS_IN_THE_ORDER`,
      },
    },
    {
      type: ClaimSummaryType.PARAGRAPH,
      data: {
        text: `${PAGES_LATEST_UPDATE_CONTENT}.SDO_THIS_CLAIM_WILL_NO_PROCEED_OFFLINE`,
      },
    },
    {
      type: ClaimSummaryType.LINK,
      data: {
        text: `${PAGES_LATEST_UPDATE_CONTENT}.SDO_DOWNLOAD_THE_COURTS_ORDER`,
        href: CASE_DOCUMENT_DOWNLOAD_URL.replace(':id', claimId).replace(':documentType', DocumentUri.SDO_ORDER),
        textAfter: `${PAGES_LATEST_UPDATE_CONTENT}.SDO_TO_FIND_OUT_THE_DETAILS`,
      },
    },
  ];
}

export const buildResponseToClaimSection = (claim: Claim, claimId: string): ClaimSummarySection[] => {
  const sectionContent = [];
  const responseNotSubmittedTitle = getResponseNotSubmittedTitle(claim.isDeadlineExtended());
  const responseDeadlineNotPassedContent = getNotPastResponseDeadlineContent(claim);
  const responseDeadlinePassedContent = getPastResponseDeadlineContent(claim);
  const respondToClaimLink = getRespondToClaimLink(claimId);
  if (claim.isDefendantNotResponded()) {
    sectionContent.push(responseNotSubmittedTitle);
    if (claim.isDeadLinePassed()) {
      sectionContent.push(responseDeadlinePassedContent);
    } else {
      sectionContent.push(responseDeadlineNotPassedContent);
    }
    sectionContent.push(respondToClaimLink);
  } else if (claim.hasSdoOrderDocument()) {
    sectionContent.push(getLastUpdateSdo(claimId));
  }
  return sectionContent.flat();
};
