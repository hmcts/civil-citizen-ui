import {Claim} from 'models/claim';
import {ClaimSummarySection} from 'form/models/claimSummarySection';
import {
  getEvidenceUpload,
} from 'services/features/dashboard/claimSummary/latestUpdate/latestUpdateContent/evidenceUploadContent';
import {
  getHearingTrialLatestUpload,
} from 'services/features/dashboard/claimSummary/latestUpdate/latestUpdateContent/hearingTrialLatestUploadContent';
import {getNewUpload} from 'services/features/dashboard/claimSummary/latestUpdate/latestUpdateContent/newUploadContent';
import {
  getFinaliseTrialArrangements,
} from 'services/features/dashboard/claimSummary/latestUpdate/latestUpdateContent/finaliseTrialArrangementsContent';
import {
  getClaimDismissedHearingDueDateUploadContent,
} from 'services/features/dashboard/claimSummary/latestUpdate/latestUpdateContent/claimDismissedHearingDueDateUploadContent';

export const buildNewUploadSection = (claim: Claim): ClaimSummarySection[][] => {
  const sectionContent = [];
  sectionContent.push(getNewUpload(claim));
  return sectionContent;
};

export const buildEvidenceUploadSection = (claim: Claim): ClaimSummarySection[][] => {
  const sectionContent = [];
  sectionContent.push(getEvidenceUpload(claim));
  return sectionContent;
};

export const buildHearingTrialLatestUploadSection = (claim: Claim, lang: string): ClaimSummarySection[][] => {
  const sectionContent = [];
  sectionContent.push(getHearingTrialLatestUpload(claim, lang));
  return sectionContent;
};

export const buildFinaliseTrialArrangements = (claim: Claim): ClaimSummarySection[][] => {
  const sectionContent = [];
  sectionContent.push(getFinaliseTrialArrangements(claim));
  return sectionContent;
};

export const buildClaimDismissedHearingDueDateUpdateContent = (claim: Claim, lang: string, isClaimant: boolean): ClaimSummarySection[][] => {
  const sectionContent = [];
  sectionContent.push(getClaimDismissedHearingDueDateUploadContent(claim, lang, isClaimant));
  return sectionContent;
};
