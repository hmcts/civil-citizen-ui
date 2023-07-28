import {ClaimSummaryContent} from 'form/models/claimSummarySection';
import {Claim} from 'models/claim';
import {
  buildDownloadSealedClaimSection,
  buildDownloadSealedResponseSection,
  buildDownloadSealedClaimSectionTitle,
} from './claimDocuments/claimDocumentContentBuilder';
import {getEvidenceUploadDocuments} from 'services/features/caseProgression/documentTableBuilder';

function getDocumentsContent(claim: Claim, claimId: string, lang?: string): ClaimSummaryContent[] {
  const downloadClaimTitle = buildDownloadSealedClaimSectionTitle(lang);
  const downloadClaimSection = buildDownloadSealedClaimSection(claim, claimId, lang);
  const downloadResponseSection = buildDownloadSealedResponseSection(claim, claimId, lang);

  return [{
    contentSections: [
      downloadClaimTitle,
      downloadClaimSection,
      downloadResponseSection,
    ],
  }];
}

function getEvidenceUploadContent(claim: Claim): ClaimSummaryContent[]{
  return [{
    contentSections: getEvidenceUploadDocuments(claim),
  }];
}

export {getDocumentsContent, getEvidenceUploadContent};
