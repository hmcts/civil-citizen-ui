import {Claim} from 'models/claim';
import {ClaimSummarySection} from 'form/models/claimSummarySection';
import {
  getEvidenceUpload,
} from 'services/features/dashboard/claimSummary/latestUpdate/latestUpdateContent/evidenceUploadContent';
import {
  getHearingTrialLatestUpload,
} from 'services/features/dashboard/claimSummary/latestUpdate/latestUpdateContent/hearingTrialLatestUploadContent';

export const buildEvidenceUploadSection = (claim: Claim): ClaimSummarySection[][] => {
  const sectionContent = [];
  sectionContent.push(getEvidenceUpload(claim));
  return sectionContent;
};
export const buildHearingTrialLatestUploadSection = (claim: Claim): ClaimSummarySection[] => {
  return getHearingTrialLatestUpload(claim);
};
