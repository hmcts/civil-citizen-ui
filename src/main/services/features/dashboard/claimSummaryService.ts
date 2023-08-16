import {ClaimSummaryContent} from 'form/models/claimSummarySection';
import {Claim} from 'models/claim';
import {
  buildDownloadHearingNoticeSection,
  buildSystemGeneratedDocumentSections,
  buildDownloadSealedClaimSectionTitle,
  buildTrialReadyDocumentSection,
} from './claimDocuments/claimDocumentContentBuilder';
import {getEvidenceUploadDocuments} from 'services/features/caseProgression/documentTableBuilder';
import {isCaseProgressionV1Enable} from '../../../app/auth/launchdarkly/launchDarklyClient';

async function getDocumentsContent(claim: Claim, claimId: string, lang?: string): Promise<ClaimSummaryContent[]> {
  const downloadClaimTitle = buildDownloadSealedClaimSectionTitle(lang);

  const downloadClaimSection = buildSystemGeneratedDocumentSections(claim, claimId, lang);
  const downloadHearingNoticeSection = await isCaseProgressionV1Enable() ? buildDownloadHearingNoticeSection(claim, claimId, lang) : undefined;
  const isClaimant = false; // TODO - provide the actual value once the claimant part is developed in R2
  const downloadTrialReadySection = buildTrialReadyDocumentSection(claim, claimId, lang, isClaimant);

  return [{
    contentSections: [
      downloadClaimTitle,
      ...downloadClaimSection,
      downloadHearingNoticeSection,
      downloadTrialReadySection,
    ],
    hasDivider: false,
  }];
}

function getEvidenceUploadContent(claim: Claim): ClaimSummaryContent[] {
  return [{
    contentSections: getEvidenceUploadDocuments(claim),
    hasDivider: false,
  }];
}

export {getDocumentsContent, getEvidenceUploadContent};
