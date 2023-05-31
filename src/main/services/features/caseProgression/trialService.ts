import {ClaimSummaryContent} from 'form/models/claimSummarySection';
import {Claim} from 'models/claim';
import {
  buildTrialCaseSummarySection, buildTrialCostSection,
  buildTrialDocumentarySection, buildTrialLegalSection, buildTrialSkeletonSection,
} from 'services/features/caseProgression/trialContentBuilder';

export const getTrialContent = (claimId: string, claim: Claim): ClaimSummaryContent[] => {
  const sectionContent: any[] = [];

  if(claim.caseProgression?.defendantUploadDocuments?.trial[0]?.selected) {
    const trialCaseSummarySection = buildTrialCaseSummarySection();
    const trialCaseSummaryContent = [trialCaseSummarySection];
    sectionContent.push(trialCaseSummaryContent);
  }

  if(claim.caseProgression?.defendantUploadDocuments?.trial[1]?.selected) {
    const trialSkeletonSection = buildTrialSkeletonSection();
    const trialSkeletonContent = [trialSkeletonSection];
    sectionContent.push(trialSkeletonContent);
  }

  if(claim.caseProgression?.defendantUploadDocuments?.trial[2]?.selected) {
    const trialLegalSection = buildTrialLegalSection();
    const trialLegalContent = [trialLegalSection];
    sectionContent.push(trialLegalContent);
  }

  if(claim.caseProgression?.defendantUploadDocuments?.trial[3]?.selected) {
    const trialCostSection = buildTrialCostSection();
    const trialCostContent = [trialCostSection];
    sectionContent.push(trialCostContent);
  }

  if(claim.caseProgression?.defendantUploadDocuments?.trial[4]?.selected) {
    const trialDocumentarySection = buildTrialDocumentarySection();
    const trialDocumentaryContent = [trialDocumentarySection];
    sectionContent.push(trialDocumentaryContent);
  }

  return sectionContent.flat().map((sectionContent, index) => ({
    contentSections: sectionContent,
    hasDivider: index < sectionContent.length - 1,
  }));
};
