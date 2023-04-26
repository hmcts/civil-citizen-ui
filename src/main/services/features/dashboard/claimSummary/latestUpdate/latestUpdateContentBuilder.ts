import {Claim} from 'models/claim';
import {ClaimSummarySection} from 'form/models/claimSummarySection';
import {
  getNotPastResponseDeadlineContent,
  getPastResponseDeadlineContent,
  getRespondToClaimLink,
  getResponseNotSubmittedTitle,
} from './latestUpdateContent/responseToClaimSection';
import {LatestUpdateSectionBuilder} from 'models/LatestUpdateSectionBuilder/latestUpdateSectionBuilder';
import {DocumentUri} from 'models/document/documentType';

const PAGES_LATEST_UPDATE_CONTENT = 'PAGES.LATEST_UPDATE_CONTENT';

const getLastUpdateSdoDocument = (claimId: string) => {
  return new LatestUpdateSectionBuilder()
    .addTitle(`${PAGES_LATEST_UPDATE_CONTENT}.SDO_AN_ORDER_HAS_BEEN_ISSUED_BY_THE_COURT`)
    .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}.SDO_PLEASE_FOLLOW_THE_INSTRUCTIONS_IN_THE_ORDER`)
    .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}.SDO_THIS_CLAIM_WILL_NO_PROCEED_OFFLINE`)
    .addResponseDocumentLink(`${PAGES_LATEST_UPDATE_CONTENT}.SDO_DOWNLOAD_THE_COURTS_ORDER`, claimId,  DocumentUri.SDO_ORDER, null,`${PAGES_LATEST_UPDATE_CONTENT}.SDO_TO_FIND_OUT_THE_DETAILS`)
    .build();
};

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
    sectionContent.push(getLastUpdateSdoDocument(claimId));
  }
  return sectionContent.flat();
};
