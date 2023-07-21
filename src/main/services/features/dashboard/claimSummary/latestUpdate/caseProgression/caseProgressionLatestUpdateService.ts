import {Claim} from 'models/claim';
import {ClaimSummaryContent, ClaimSummarySection} from 'form/models/claimSummarySection';
import {
  buildEvidenceUploadSection,
  buildNewUploadSection,
  buildHearingTrialLatestUploadSection,
  buildViewTrialArrangementsSection,
} from 'services/features/dashboard/claimSummary/latestUpdate/caseProgression/latestUpdateContentBuilderCaseProgression';
import {checkEvidenceUploadTime} from 'common/utils/dateUtils';
import {YesNoUpperCamelCase} from 'form/models/yesNo';

export const getCaseProgressionLatestUpdates = (claim: Claim, lang: string) : ClaimSummaryContent[] => {
  const areTrialArrangementsFinalised = claim.caseProgression.defendantTrialArrangements.trialArrangementsReady === YesNoUpperCamelCase.YES; //TODO: get the correct value once the logged in user is known
  const areOtherPartyTrialArrangementsFinalised = claim.caseProgression.claimantTrialArrangements.trialArrangementsReady === YesNoUpperCamelCase.YES; //TODO: get the correct value once the logged in user is known
  const sectionContent = [];
  if(checkEvidenceUploaded(claim, false)){
    sectionContent.push(getNewUploadLatestUpdateContent(claim));
  }
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

export const checkEvidenceUploaded = (claim: Claim, isClaimant: boolean): boolean => {
  if(isClaimant){
    return checkEvidenceUploadTime(claim.caseProgression?.defendantLastUploadDate);
  }else {
    return checkEvidenceUploadTime(claim.caseProgression?.claimantLastUploadDate);
  }
};

export const getNewUploadLatestUpdateContent = (claim: Claim): ClaimSummarySection[][] => {
  return buildNewUploadSection(claim);
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
  return buildViewTrialArrangementsSection(isOtherParty);
};
