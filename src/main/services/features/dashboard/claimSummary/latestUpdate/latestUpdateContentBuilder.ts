import {Claim} from 'models/claim';
import {ClaimSummarySection} from 'form/models/claimSummarySection';
import {
  getNotPastResponseDeadlineContent,
  getPastResponseDeadlineContent,
  getRespondToClaimLink,
  getResponseNotSubmittedTitle,
} from './latestUpdateContent/responseToClaimSection';
import {getEvidenceUpload} from 'services/features/dashboard/claimSummary/latestUpdate/latestUpdateContent/evidenceUploadContent';

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
  }
  return sectionContent.flat();
};

export const buildEvidenceUploadSection = (claim: Claim): ClaimSummarySection[] => {
  const sectionContent = [];
  sectionContent.push(getEvidenceUpload(claim));
  return sectionContent.flat();
};
