import {ClaimSummaryContent} from 'form/models/claimSummarySection';
import {Claim} from 'models/claim';
import {
  buildDownloadHearingNoticeSection,
  buildDownloadSealedClaimSection,
  buildDownloadSealedClaimSectionTitle,
} from './claimDocuments/claimDocumentContentBuilder';
import {getEvidenceUploadDocuments} from 'services/features/caseProgression/documentTableBuilder';
import {isCaseProgressionV1Enable} from '../../../app/auth/launchdarkly/launchDarklyClient';

async function getDocumentsContent(claim: Claim, claimId: string, lang?: string): Promise<ClaimSummaryContent[]> {
  const downloadClaimTitle = buildDownloadSealedClaimSectionTitle();
  const downloadClaimSection = buildDownloadSealedClaimSection(claim, claimId, lang);
  const downloadHearingNoticeSection = await isCaseProgressionV1Enable() ? buildDownloadHearingNoticeSection(claim, claimId, lang) : undefined;
  return [{
    contentSections: [
      downloadClaimTitle,
      downloadClaimSection,
      downloadHearingNoticeSection,
    ],
  }];
}

function getEvidenceUploadContent(claim: Claim): ClaimSummaryContent[]{
  return [{
    contentSections: getEvidenceUploadDocuments(claim),
  }];
}

export {getDocumentsContent, getEvidenceUploadContent};
