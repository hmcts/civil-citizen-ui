import {ClaimSummaryContent} from 'form/models/claimSummarySection';
import {Claim} from 'models/claim';
import {buildEvidenceUploadSection, buildResponseToClaimSection,} from './latestUpdate/latestUpdateContentBuilder';

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

export const getEvidenceUploadLatestUpdateContent = (claimId: string, claim: Claim): ClaimSummaryContent[] => {
  const evidenceUploadSection = buildEvidenceUploadSection(claim);
  const latestUpdateContent = [evidenceUploadSection];
  return latestUpdateContent.map((sectionContent, index) => ({
    contentSections: sectionContent,
    hasDivider: index < evidenceUploadSection.length - 1,
  }));
};
