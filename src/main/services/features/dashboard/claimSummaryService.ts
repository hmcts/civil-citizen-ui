import {ClaimSummaryContent} from 'form/models/claimSummarySection';
import {Claim} from 'models/claim';
import {
  buildDownloadSealedClaimSection,
  buildDownloadSealedResponseSection,
} from './claimDocuments/claimDocumentContentBuilder';

function getDocumentsContent(claim: Claim, claimId: string, lang?: string): ClaimSummaryContent[] {
  const downloadClaimSection = buildDownloadSealedClaimSection(claim, claimId, lang);
  const downloadResponseSection = buildDownloadSealedResponseSection(claim, claimId, lang);

  return [{
    contentSections: [
      downloadClaimSection,
      downloadResponseSection,
    ],
  }];
}

export {getDocumentsContent};
