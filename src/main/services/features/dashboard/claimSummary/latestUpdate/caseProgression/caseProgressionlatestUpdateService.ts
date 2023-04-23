import {ClaimSummaryContent} from 'form/models/claimSummarySection';
import {Claim} from 'models/claim';
import {
  buildResponseToClaimSectionCaseProgression,
} from 'services/features/dashboard/claimSummary/latestUpdate/caseProgression/latestUpdateContentBuilderCaseProgression';

export const getLatestUpdateContentCaseProgression = (claimId: string, claim: Claim): ClaimSummaryContent[]  => {
  const responseToClaimSection = buildResponseToClaimSectionCaseProgression(claim, claimId);
  return responseToClaimSection.map((sectionContent, index) => ({
    contentSections: sectionContent,
    hasDivider: index < responseToClaimSection.length - 1,
  }));
};
