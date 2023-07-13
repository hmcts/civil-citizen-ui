import {Claim} from 'models/claim';
import {ClaimSummaryContent, ClaimSummarySection} from 'form/models/claimSummarySection';
import {
  buildEvidenceUploadSection, buildFinaliseTrialArrangements, buildHearingTrialLatestUploadSection,
} from 'services/features/dashboard/claimSummary/latestUpdate/caseProgression/latestUpdateContentBuilderCaseProgression';

export const getCaseProgressionLatestUpdates = (claim: Claim, lang: string) : ClaimSummaryContent[] => {
  const sectionContent = [];
  if(claim.hasCaseProgressionHearingDocuments()){
    sectionContent.push(getHearingTrialUploadLatestUpdateContent(claim, lang));
    sectionContent.push(getEvidenceUploadLatestUpdateContent(claim.id, claim));
    sectionContent.push(getFinaliseTrialArrangementContent(claim));
  }
  return getClaimSummaryContent(sectionContent.flat());
};

export const getEvidenceUploadLatestUpdateContent = (claimId: string, claim: Claim): ClaimSummarySection[][] => {
  return buildEvidenceUploadSection(claim);
};

export const getHearingTrialUploadLatestUpdateContent = (claim: Claim, lang: string): ClaimSummarySection[][] => {
  return buildHearingTrialLatestUploadSection(claim, lang);
};

export const getClaimSummaryContent = (section: ClaimSummarySection[][]) : ClaimSummaryContent[] => {
  return section.map((sectionContent, index) => ({
    contentSections: sectionContent,
    hasDivider: index < section.length - 1,
  }));
};

export const getFinaliseTrialArrangementContent = (claim: Claim): ClaimSummarySection[][] => {
  return buildFinaliseTrialArrangements(claim);
};
