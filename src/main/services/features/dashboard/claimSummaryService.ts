import {ClaimSummaryContent} from 'form/models/claimSummarySection';
import {Claim} from 'models/claim';
import {
  buildDownloadSealedClaimSection,
  buildGeneratedPDFSection
} from './claimDocuments/claimDocumentContentBuilder';

function getDocumentsContent(claim: Claim, claimId: string, lang?: string): ClaimSummaryContent[] {
  const downloadClaimSection = buildDownloadSealedClaimSection(claim, claimId, lang);
  const generatedDocuments = buildGeneratedPDFSection(claim, claimId, lang);

  return [{
    contentSections: [
      downloadClaimSection,
      generatedDocuments[0],
    ],
  }];
}

export {getDocumentsContent};
