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
import {
  getViewFinalGeneralOrder,
} from 'services/features/dashboard/claimSummary/latestUpdate/latestUpdateContent/viewFinalGeneralOrderContent';
import {
  getFinaliseTrialArrangements,
} from 'services/features/dashboard/claimSummary/latestUpdate/latestUpdateContent/finaliseTrialArrangementsContent';
import {
  getClaimDismissedHearingDueDateUploadContent,
} from 'services/features/dashboard/claimSummary/latestUpdate/latestUpdateContent/claimDismissedHearingDueDateUploadContent';

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

export const buildViewFinalGeneralOrderContent = (claim: Claim): ClaimSummarySection[][] => {
  const sectionContent = [];
  sectionContent.push(getViewFinalGeneralOrder(claim));
  return sectionContent;
};

export const buildFinaliseTrialArrangements = (claim: Claim): ClaimSummarySection[][] => {
  const sectionContent = [];
  sectionContent.push(getFinaliseTrialArrangements(claim));
  return sectionContent;
};

export const buildViewBundleSection = (claim: Claim): ClaimSummarySection[][] => {
  const sectionContent = [];
  sectionContent.push(getViewBundle(claim));
  return sectionContent;
};

export const buildClaimDismissedHearingDueDateUpdateContent = (claim: Claim, lang: string): ClaimSummarySection[][] => {
  const sectionContent = [];
  sectionContent.push(getClaimDismissedHearingDueDateUploadContent(claim, lang));
  return sectionContent;
};

export const buildViewTrialArrangementsSection = (isOtherParty: boolean, claim: Claim) : ClaimSummarySection[][] => {
  const sectionContent = [];
  sectionContent.push(getViewTrialArrangements(isOtherParty, claim));
  return sectionContent;
};
