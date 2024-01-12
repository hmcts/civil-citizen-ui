import {ClaimSummaryContent} from 'form/models/claimSummarySection';
import {Claim} from 'models/claim';
import {
  buildResponseToClaimSection, buildResponseToClaimSectionForClaimant,
} from './latestUpdate/latestUpdateContentBuilder';
export const getLatestUpdateContent = (claimId: string, claim: Claim, lng: string, respondentPaymentDeadline?: Date): ClaimSummaryContent[] => {
  const responseToClaimSection = buildResponseToClaimSection(claim, claimId, lng, respondentPaymentDeadline);
  const latestUpdateContent = [responseToClaimSection];

  const filteredLatestUpdateContent = latestUpdateContent.filter(sectionContent => sectionContent.length);
  return filteredLatestUpdateContent.map((sectionContent, index) => {
    return ({
      contentSections: sectionContent,
      hasDivider: index < filteredLatestUpdateContent.length - 1,
    });
  });
};

export const getLatestUpdateContentForClaimant = (claimId: string, claim: Claim, lng: string): ClaimSummaryContent[] => {
  const responseToClaimSectionForClaimant = buildResponseToClaimSectionForClaimant(claim, claimId, lng);
  const latestUpdateContent = [responseToClaimSectionForClaimant];

  const filteredLatestUpdateContent = latestUpdateContent.filter(sectionContent => sectionContent.length);
  return filteredLatestUpdateContent.map((sectionContent, index) => {
    return ({
      contentSections: sectionContent,
      hasDivider: index < filteredLatestUpdateContent.length - 1,
    });
  });
};