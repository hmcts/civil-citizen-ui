import {Claim} from 'models/claim';
import {ClaimSummarySection} from 'form/models/claimSummarySection';
import {
  getEvidenceUpload,
} from 'services/features/dashboard/claimSummary/latestUpdate/latestUpdateContent/evidenceUploadContent';
import {
  getHearingTrialLatestUpload,
} from 'services/features/dashboard/claimSummary/latestUpdate/latestUpdateContent/hearingTrialLatestUploadContent';
import {
  getViewTrialArrangements,
} from 'services/features/dashboard/claimSummary/latestUpdate/latestUpdateContent/viewTrialArrangementsContent';
import {getNewUpload} from 'services/features/dashboard/claimSummary/latestUpdate/latestUpdateContent/newUploadContent';

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

export const buildViewTrialArrangementsSection = (isOtherParty: boolean) : ClaimSummarySection[][] => {
  const sectionContent = [];
  sectionContent.push(getViewTrialArrangements(isOtherParty));
  return sectionContent;
};
