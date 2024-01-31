import {Claim} from 'models/claim';
import {ClaimSummaryContent, ClaimSummarySection} from 'form/models/claimSummarySection';
import {
  buildEvidenceUploadSection,
  buildHearingTrialLatestUploadSection,
  buildNewUploadSection,
  buildViewFinalGeneralOrderContent,
  buildFinaliseTrialArrangements,
  buildViewBundleSection,
  buildClaimDismissedHearingDueDateUpdateContent,
  buildViewTrialArrangementsSection,
} from 'services/features/dashboard/claimSummary/latestUpdate/caseProgression/latestUpdateContentBuilderCaseProgression';
import {checkEvidenceUploadTime} from 'common/utils/dateUtils';

export const getCaseProgressionLatestUpdates = (claim: Claim, lang: string) : ClaimSummaryContent[] => {
  const areTrialArrangementsFinalised = isCaseReady(claim.isClaimant(), claim);
  const areOtherPartyTrialArrangementsFinalised = isCaseReady(!claim.isClaimant(), claim);
  const sectionContent = [];

  if (claim.isFinalGeneralOrderIssued()) {
    sectionContent.push(getViewFinalGeneralOrderContent(claim));
  }

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
    if (areOtherPartyTrialArrangementsFinalised) {
      sectionContent.push(getViewTrialArrangementsContent(true, claim));
    }
    if (areTrialArrangementsFinalised) {
      sectionContent.push(getViewTrialArrangementsContent(false, claim));
    }
    if (claim.isFastTrackClaim && claim.isBetweenSixAndThreeWeeksBeforeHearingDate()) {
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

export const getViewFinalGeneralOrderContent = (claim: Claim): ClaimSummarySection[][] => {
  return buildViewFinalGeneralOrderContent(claim);
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

export const getViewTrialArrangementsContent = (isOtherParty: boolean, claim: Claim) : ClaimSummarySection[][] => {
  return buildViewTrialArrangementsSection(isOtherParty, claim);
};

function isCaseReady(isClaimant: boolean, claim: Claim): boolean {
  if (isClaimant) {
    return !!(claim?.caseProgression?.claimantTrialArrangements?.isCaseReady);
  } else {
    return !!(claim?.caseProgression?.defendantTrialArrangements?.isCaseReady);
  }
}
