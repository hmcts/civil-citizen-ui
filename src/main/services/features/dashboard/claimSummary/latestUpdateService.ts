import {ClaimSummaryContent} from 'form/models/claimSummarySection';
import {Claim} from 'models/claim';
import {
  buildResponseToClaimSection,
} from './latestUpdate/latestUpdateContentBuilder';

export const getLatestUpdateContent = (claimId: string, claim: Claim): ClaimSummaryContent[] => {
  const responseToClaimSection = buildResponseToClaimSection(claim, claimId);
  const latestUpdateContent = [responseToClaimSection];

  const filteredLatestUpdateContent = latestUpdateContent.filter(sectionContent => sectionContent.length);
  return filteredLatestUpdateContent.map((sectionContent, index) => {
    return ({
      contentSections: sectionContent,
      hasDivider: index < filteredLatestUpdateContent.length - 1,
    });
  });
};
