import {Claim} from 'models/claim';
import {ClaimSummarySection} from 'form/models/claimSummarySection';
import {
  getEvidenceUpload,
} from 'services/features/dashboard/claimSummary/latestUpdate/latestUpdateContent/evidenceUploadContent';
import {
  getHearingTrialLatestUpload,
} from 'services/features/dashboard/claimSummary/latestUpdate/latestUpdateContent/hearingTrialLatestUploadContent';
import {
  getFinaliseTrialArrangements,
} from 'services/features/dashboard/claimSummary/latestUpdate/latestUpdateContent/finaliseTrialArrangementsContent';

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
