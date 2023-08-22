import {CaseDocument} from 'models/document/caseDocument';
import {ClaimSummarySection, ClaimSummaryType} from 'form/models/claimSummarySection';
import {CASE_DOCUMENT_DOWNLOAD_URL} from 'routes/urls';
import {displayDocumentSizeInKB} from 'common/utils/documentSizeDisplayFormatter';
import {formatDateToFullDate} from 'common/utils/dateUtils';
import {documentIdExtractor} from 'common/utils/stringUtils';
import {t} from 'i18next';

export const generateDocumentSection = (document: CaseDocument, claimId: string, lang:string): ClaimSummarySection => {
  if (document) {
    let documentId: string;
    if (document.documentLink) {
      documentId = documentIdExtractor(document.documentLink.document_binary_url);
    }
    const createdLabel = t('PAGES.CLAIM_SUMMARY.DOCUMENT_CREATED', {lng: lang});
    return {
      type: ClaimSummaryType.LINK,
      data: {
        href: CASE_DOCUMENT_DOWNLOAD_URL.replace(':id', claimId).replace(':documentId', documentId),
        text: `${document.documentName} (PDF, ${displayDocumentSizeInKB(document.documentSize)})`,
        subtitle: `${createdLabel} ${formatDateToFullDate(document.createdDatetime, lang)}`,
      },
    };
  }
};

export const buildDownloadSectionTitle = (title: string) : ClaimSummarySection => {
  return {
    type: ClaimSummaryType.TITLE,
    data: {
      text: title,
    },
  };
};
