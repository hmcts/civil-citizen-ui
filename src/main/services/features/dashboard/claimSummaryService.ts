import {ClaimSummaryContent} from 'form/models/claimSummarySection';
import {Claim} from 'models/claim';
import {
  buildDownloadSealedClaimSection,
  buildDownloadSealedClaimSectionTitle,
} from './claimDocuments/claimDocumentContentBuilder';
import {getEvidenceUploadDocuments} from 'services/features/caseProgression/documentTableBuilder';

function getDocumentsContent(claim: Claim, claimId: string, lang?: string): ClaimSummaryContent[] {
  const downloadClaimTitle = buildDownloadSealedClaimSectionTitle();
  const downloadClaimSection = buildDownloadSealedClaimSection(claim, claimId, lang);
  return [{
    contentSections: [
      downloadClaimTitle,
      downloadClaimSection,
    ],
  }];
}

function getEvidenceUploadContent(claim: Claim): ClaimSummaryContent[]{
  return [{
    contentSections: getEvidenceUploadDocuments(claim),
  }];
}

export {getDocumentsContent, getEvidenceUploadContent};
