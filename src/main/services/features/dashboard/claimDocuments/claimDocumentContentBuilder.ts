import {Claim} from '../../../../common/models/claim';
import {ClaimSummarySection, ClaimSummaryType} from '../../../../common/form/models/claimSummarySection';
import {DocumentType, DocumentUri} from '../../../../common/models/document/documentType';
import {CASE_DOCUMENT_DOWNLOAD_URL} from '../../../../routes/urls';
import {formatDateToFullDate} from '../../../../common/utils/dateUtils';
import {displayDocumentSizeInKB} from '../../../../common/utils/documentSizeDisplayFormatter';

const buildDownloadSealedClaimSection = (claim: Claim, claimId: string, lang: string): ClaimSummarySection => {
  const document = claim.getDocumentDetails(DocumentType.SEALED_CLAIM);
  const downloadClaimLabel = 'PAGES.CLAIM_SUMMARY.DOWNLOAD_CLAIM';
  const createdLabel = 'PAGES.CLAIM_SUMMARY.DOCUMENT_CREATED';
  if (document) {
    return {
      type: ClaimSummaryType.LINK,
      data: {
        href: CASE_DOCUMENT_DOWNLOAD_URL.replace(':id', claimId).replace(':documentType', DocumentUri.SEALED_CLAIM),
        text: `${downloadClaimLabel}(PDF, ${displayDocumentSizeInKB(document.documentSize)})`,
        subtitle: `${createdLabel}${formatDateToFullDate(document.createdDatetime)}`,
      },
    };
  }
};

export {
  buildDownloadSealedClaimSection,
};
