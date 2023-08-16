import {ClaimSummaryContent} from 'form/models/claimSummarySection';
import {Claim} from 'models/claim';
import {
  buildDownloadHearingNoticeSection,
  buildSystemGeneratedDocumentSections,
  buildDownloadSealedClaimSectionTitle,
} from './claimDocuments/claimDocumentContentBuilder';
import {getEvidenceUploadDocuments} from 'services/features/caseProgression/documentTableBuilder';
import {isCaseProgressionV1Enable} from '../../../app/auth/launchdarkly/launchDarklyClient';

async function getDocumentsContent(claim: Claim, claimId: string, lang?: string): Promise<ClaimSummaryContent[]> {
  const downloadClaimTitle = buildDownloadSealedClaimSectionTitle(lang);

  const downloadClaimSection = buildSystemGeneratedDocumentSections(claim, claimId, lang);
  const downloadHearingNoticeSection = await isCaseProgressionV1Enable() ? buildDownloadHearingNoticeSection(claim, claimId, lang) : undefined;

  return [{
    contentSections: [
      downloadClaimTitle,
      ...downloadClaimSection,
      downloadHearingNoticeSection,
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

export {getDocumentsContent, getEvidenceUploadContent};
