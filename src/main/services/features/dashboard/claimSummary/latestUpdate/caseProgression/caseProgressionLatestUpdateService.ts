import {Claim} from 'models/claim';
import {ClaimSummaryContent, ClaimSummarySection} from 'form/models/claimSummarySection';
import {
  buildEvidenceUploadSection, buildHearingTrialLatestUploadSection, buildViewTrialArrangements,
} from 'services/features/dashboard/claimSummary/latestUpdate/caseProgression/latestUpdateContentBuilderCaseProgression';

export const getCaseProgressionLatestUpdates = (claim: Claim, lang: string) : ClaimSummaryContent[] => {
  const areTrialArrangementsFinalised = true; //TODO: get the actual value
  const areOtherPartyTrialArrangementsFinalised = true; //TODO: get the actual value
  const sectionContent = [];
  if(claim.hasCaseProgressionHearingDocuments()){
    sectionContent.push(getHearingTrialUploadLatestUpdateContent(claim, lang));
    if (areOtherPartyTrialArrangementsFinalised) {
      sectionContent.push(getViewTrialArrangementsContent(true));
    }
    if (areTrialArrangementsFinalised) {
      sectionContent.push(getViewTrialArrangementsContent(false));
    }
    sectionContent.push(getEvidenceUploadLatestUpdateContent(claim.id, claim));
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

export const getViewTrialArrangementsContent = (isOtherParty: boolean) : ClaimSummarySection[][] => {
  return buildViewTrialArrangements(isOtherParty);
};
