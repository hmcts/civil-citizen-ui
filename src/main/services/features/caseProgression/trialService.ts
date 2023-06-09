import {ClaimSummaryContent} from 'form/models/claimSummarySection';
import {Claim} from 'models/claim';
import {
  buildTrialCaseSummarySection, buildTrialCostSection,
  buildTrialDocumentarySection, buildTrialLegalSection, buildTrialSkeletonSection,
} from 'services/features/caseProgression/trialContentBuilder';

export const getTrialContent = (claimId: string, claim: Claim): ClaimSummaryContent[] => {
  const sectionContent: any[] = [];

  if(claim.caseProgression?.defendantUploadDocuments?.trial[0]?.selected) {
    sectionContent.push([buildTrialCaseSummarySection()]);
  }

  if(claim.caseProgression?.defendantUploadDocuments?.trial[1]?.selected) {
    sectionContent.push([buildTrialSkeletonSection()]);
  }

  if(claim.caseProgression?.defendantUploadDocuments?.trial[2]?.selected) {
    sectionContent.push([buildTrialLegalSection()]);
  }

  if(claim.caseProgression?.defendantUploadDocuments?.trial[3]?.selected) {
    sectionContent.push([buildTrialCostSection()]);
  }

  if(claim.caseProgression?.defendantUploadDocuments?.trial[4]?.selected) {
    sectionContent.push([buildTrialDocumentarySection()]);
  }

  return sectionContent.flat().map((sectionContent, index) => ({
    contentSections: sectionContent,
    hasDivider: index < sectionContent.length - 1,
  }));
};
