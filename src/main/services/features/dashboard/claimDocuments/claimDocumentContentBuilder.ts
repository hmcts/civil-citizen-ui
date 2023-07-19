import {Claim} from 'models/claim';
import {ClaimSummarySection, ClaimSummaryType} from 'form/models/claimSummarySection';
import {DocumentType, DocumentUri} from 'models/document/documentType';
import {CASE_DOCUMENT_DOWNLOAD_URL} from 'routes/urls';
import {formatDateToFullDate} from 'common/utils/dateUtils';
import {displayDocumentSizeInKB} from 'common/utils/documentSizeDisplayFormatter';
import {t} from 'i18next';
import {getSystemGeneratedCaseDocumentIdByType} from 'models/document/systemGeneratedCaseDocuments';

const buildDownloadSealedClaimSectionTitle = (): ClaimSummarySection => {
  return {type: ClaimSummaryType.TITLE,
    data:{
      text: t('PAGES.CLAIM_SUMMARY.CLAIM_DOCUMENTS'),
    },
  };
};

const buildDownloadSealedClaimSection = (claim: Claim, claimId: string, lang: string): ClaimSummarySection => {
  const document = claim.getDocumentDetails(DocumentType.SEALED_CLAIM);
  const downloadClaimLabel = 'PAGES.CLAIM_SUMMARY.DOWNLOAD_CLAIM';
  const createdLabel = 'PAGES.CLAIM_SUMMARY.DOCUMENT_CREATED';
  if (document) {
    return {
      type: ClaimSummaryType.LINK,
      data: {
        href: CASE_DOCUMENT_DOWNLOAD_URL.replace(':id', claimId).replace(':documentId', getSystemGeneratedCaseDocumentIdByType(claim.systemGeneratedCaseDocuments,DocumentType.SEALED_CLAIM)),
        text: `${t(downloadClaimLabel, lang)} (PDF, ${displayDocumentSizeInKB(document.documentSize)})`,
        subtitle: `${t(createdLabel, lang)} ${formatDateToFullDate(document.createdDatetime)}`,
      },
    };
  }
};

const buildDownloadSealedResponseSection = (claim: Claim, claimId: string, lang: string): ClaimSummarySection => {
  const document = claim.getDocumentDetails(DocumentType.DEFENDANT_DEFENCE);
  const downloadClaimLabel = 'PAGES.CLAIM_SUMMARY.DOWNLOAD_RESPONSE';
  const createdLabel = 'PAGES.CLAIM_SUMMARY.DOCUMENT_CREATED';

  if(document) {
    return {
      type: ClaimSummaryType.LINK,
      data: {
        href: CASE_DOCUMENT_DOWNLOAD_URL.replace(':id', claimId).replace(':documentType', DocumentUri.DEFENDANT_DEFENCE),
        text: `${t(downloadClaimLabel, lang)} (PDF, ${displayDocumentSizeInKB(document.documentSize)})`,
        subtitle: `${t(createdLabel, lang)} ${formatDateToFullDate(document.createdDatetime)}`,
      },
    };
  }
};

export {
  buildDownloadSealedClaimSection,
  buildDownloadSealedResponseSection,
  buildDownloadSealedClaimSectionTitle,
};
