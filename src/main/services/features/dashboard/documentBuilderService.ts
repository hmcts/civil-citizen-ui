import {CaseDocument} from 'models/document/caseDocument';
import {ClaimSummarySection, ClaimSummaryType} from 'form/models/claimSummarySection';
import {CASE_DOCUMENT_DOWNLOAD_URL} from 'routes/urls';
import {displayDocumentSizeInKB} from 'common/utils/documentSizeDisplayFormatter';
import {formatDateToFullDate} from 'common/utils/dateUtils';
import {documentIdExtractor} from 'common/utils/stringUtils';
import {buildSystemGeneratedCaseDocumentUrl} from 'models/document/systemGeneratedCaseDocuments';
import {t} from 'i18next';

export const generateDocumentSection = (document: CaseDocument, claimId: string, lang:string): ClaimSummarySection => {
  if (document) {
    const href = buildSystemGeneratedCaseDocumentUrl(
      claimId,
      documentIdExtractor(document.documentLink?.document_binary_url),
      CASE_DOCUMENT_DOWNLOAD_URL,
    );
    const createdLabel = t('PAGES.CLAIM_SUMMARY.DOCUMENT_CREATED', {lng: lang});
    const subtitle = `${createdLabel} ${formatDateToFullDate(document.createdDatetime, lang)}`;
    return {
      type: ClaimSummaryType.LINK,
      data: href
        ? {
          href,
          text: `${document.documentName} (PDF, ${displayDocumentSizeInKB(document.documentSize)})`,
          subtitle,
        }
        : {
          text: 'COMMON.DOCUMENT_NOT_AVAILABLE_YET',
          subtitle,
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
