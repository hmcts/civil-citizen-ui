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
  getViewBundle,
} from 'services/features/dashboard/claimSummary/latestUpdate/latestUpdateContent/viewBundleContent';
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

export const buildViewBundleSection = (): ClaimSummarySection[][] => {
  const sectionContent = [];
  sectionContent.push(getViewBundle());
  return sectionContent;
};
