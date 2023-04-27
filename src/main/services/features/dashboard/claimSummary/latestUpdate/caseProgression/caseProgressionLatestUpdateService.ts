import {Claim} from 'models/claim';
import {ClaimSummaryContent, ClaimSummarySection} from 'form/models/claimSummarySection';
import {
  buildEvidenceUploadSection, buildHearingTrialLatestUploadSection,
} from 'services/features/dashboard/claimSummary/latestUpdate/caseProgression/latestUpdateContentBuilderCaseProgression';

export const getEvidenceUploadLatestUpdateContent = (claimId: string, claim: Claim): ClaimSummaryContent[] => {
  return getClaimSummaryContent(buildEvidenceUploadSection(claim));
};
export const getHearingTrialUploadLatestUpdateContent = (claim: Claim): ClaimSummaryContent[] => {
  return getClaimSummaryContent(buildHearingTrialLatestUploadSection(claim));
};

export const getClaimSummaryContent = (section: ClaimSummarySection[]) : ClaimSummaryContent[] => {
  const latestUpdateContent = [section];
  return latestUpdateContent.map((sectionContent, index) => ({
    contentSections: sectionContent,
    hasDivider: index < section.length - 1,
  }));
};
