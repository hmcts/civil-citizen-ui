import {Claim} from 'models/claim';
import {ClaimSummaryContent, ClaimSummarySection} from 'form/models/claimSummarySection';
import {
  buildEvidenceUploadSection,
  buildHearingTrialLatestUploadSection,
  buildNewUploadSection,
  buildFinaliseTrialArrangements,
  buildViewBundleSection,
  buildClaimDismissedHearingDueDateUpdateContent,
} from 'services/features/dashboard/claimSummary/latestUpdate/caseProgression/latestUpdateContentBuilderCaseProgression';
import {checkEvidenceUploadTime} from 'common/utils/dateUtils';

export const getCaseProgressionLatestUpdates = (claim: Claim, lang: string) : ClaimSummaryContent[] => {
  const sectionContent = [];

  if (claim.isBundleStitched()) {
    sectionContent.push(getViewBundleLatestUpdateContent(claim));
  }
  if (checkClaimDismissedHearingDueDate(claim)) {
    sectionContent.push(getClaimDismissedHearingDueDateUpdateContent(claim, lang, false));
    return getClaimSummaryContent(sectionContent.flat());
  }
  if(checkEvidenceUploaded(claim, false)){
    sectionContent.push(getNewUploadLatestUpdateContent(claim));
  }
  if(claim.hasCaseProgressionHearingDocuments()){
    sectionContent.push(getHearingTrialUploadLatestUpdateContent(claim, lang));
    if (claim.isFastTrackClaim && claim.isSixWeeksOrLessFromTrial()) {
      sectionContent.push(getFinaliseTrialArrangementsContent(claim));
    }
  }

  sectionContent.push(getEvidenceUploadLatestUpdateContent(claim.id, claim));

  return getClaimSummaryContent(sectionContent.flat());
};

export const checkEvidenceUploaded = (claim: Claim, isClaimant: boolean): boolean => {
  if(isClaimant){
    return checkEvidenceUploadTime(claim.caseProgression?.defendantLastUploadDate);
  }else {
    return checkEvidenceUploadTime(claim.caseProgression?.claimantLastUploadDate);
  }
};

export const checkClaimDismissedHearingDueDate = (claim: Claim): boolean => {
  return claim.caseDismissedHearingFeeDueDate != null;
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

export const getViewBundleLatestUpdateContent = (claim: Claim) : ClaimSummarySection[][] => {
  return buildViewBundleSection(claim);
};

export const getClaimDismissedHearingDueDateUpdateContent  = (claim: Claim, lang: string, isClaimant: boolean): ClaimSummarySection[][] => {
  return buildClaimDismissedHearingDueDateUpdateContent(claim, lang, isClaimant);
};

export const getClaimSummaryContent = (section: ClaimSummarySection[][]) : ClaimSummaryContent[] => {
  return section.map((sectionContent, index) => ({
    contentSections: sectionContent,
    hasDivider: index < section.length - 1,
  }));
};

export const getFinaliseTrialArrangementsContent = (claim: Claim): ClaimSummarySection[][] => {
  return buildFinaliseTrialArrangements(claim);
};
