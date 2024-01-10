import {ClaimSummaryContent} from 'form/models/claimSummarySection';
import {Claim} from 'models/claim';
import {
  buildDownloadHearingNoticeSection,
  buildSystemGeneratedDocumentSections,
  buildTrialReadyDocumentSection,
} from './claimDocuments/claimDocumentContentBuilder';
import {getEvidenceUploadDocuments} from 'services/features/caseProgression/documentTableBuilder';
import {isCaseProgressionV1Enable} from '../../../app/auth/launchdarkly/launchDarklyClient';
import {t} from 'i18next';
import {buildDownloadSectionTitle} from 'services/features/dashboard/documentBuilderService';
import {
  buildDownloadFinalOrderSection,
} from 'services/features/dashboard/finalOrderDocuments/finalOrderDocumentContentBuilder';

async function getDocumentsContent(claim: Claim, claimId: string, lang?: string): Promise<ClaimSummaryContent[]> {
  const downloadOrdersSection = await isCaseProgressionV1Enable() ? buildDownloadFinalOrderSection(claim, claimId, lang): [];
  const downloadClaimTitle = buildDownloadSectionTitle(t('PAGES.CLAIM_SUMMARY.CLAIM_DOCUMENTS', { lng: lang }));
  const downloadClaimSection = buildSystemGeneratedDocumentSections(claim, claimId, lang);
  const downloadHearingNoticeSection = await isCaseProgressionV1Enable() ? buildDownloadHearingNoticeSection(claim, claimId, lang) : undefined;
  const downloadTrialReadyClaimantSection = await isCaseProgressionV1Enable() ? buildTrialReadyDocumentSection(claim, claimId, lang, true) : undefined;
  const downloadTrialReadyDefendantSection = await isCaseProgressionV1Enable() ? buildTrialReadyDocumentSection(claim, claimId, lang, false) : undefined;

  return [{
    contentSections: [
      ...downloadOrdersSection,
      downloadClaimTitle,
      ...downloadClaimSection,
      downloadHearingNoticeSection,
      downloadTrialReadyClaimantSection,
      downloadTrialReadyDefendantSection,
    ],
    hasDivider: false,
  }];
}

function getEvidenceUploadContent(claim: Claim, lang: string): ClaimSummaryContent[] {
  return [{
    contentSections: getEvidenceUploadDocuments(claim, lang),
    hasDivider: false,
  }];
}

function hasTrialArrangementsDocuments(claim: Claim): boolean {
  const claimantTrialArrangementsDocument = claim?.caseProgression?.claimantTrialArrangements?.trialArrangementsDocument;
  const defendantTrialArrangementsDocument = claim?.caseProgression?.defendantTrialArrangements?.trialArrangementsDocument;

  return claimantTrialArrangementsDocument !== undefined && claimantTrialArrangementsDocument !== null
    || defendantTrialArrangementsDocument !== undefined && defendantTrialArrangementsDocument !== null;
}

export {getDocumentsContent, getEvidenceUploadContent, hasTrialArrangementsDocuments};
