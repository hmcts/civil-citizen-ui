import {Claim} from '../../../../common/models/claim';
import {ClaimSummarySection, ClaimSummaryType} from '../../../../common/form/models/claimSummarySection';
import {DocumentType, DocumentUri} from '../../../../common/models/document/documentType';
import {CASE_DOCUMENT_DOWNLOAD_URL} from '../../../../routes/urls';
import {t} from 'i18next';
import {getLng} from '../../../../common/utils/languageToggleUtils';
import {formatDateToFullDate} from '../../../../common/utils/dateUtils';

const buildDownloadSealedClaimSection = (claim: Claim, claimId: string, lang: string): ClaimSummarySection => {
  const document = claim.getDocumentDetails(DocumentType.SEALED_CLAIM);
  const downloadClaimLabel = t('PAGES.CLAIM_SUMMARY.DOWNLOAD_CLAIM', {lng: getLng(lang)});
  const createdLabel = t('PAGES.CLAIM_SUMMARY.DOCUMENT_CREATED', {lng: getLng(lang)});
  if (document) {
    return {
      type: ClaimSummaryType.LINK,
      data: {
        href: CASE_DOCUMENT_DOWNLOAD_URL.replace(':id', claimId).replace(':documentType', DocumentUri.SEALED_CLAIM),
        text: `${downloadClaimLabel}(PDF, ${document.documentSize}KB)`,
        subtitle: `${createdLabel}${formatDateToFullDate(document.createdDatetime)}`,
      },
    };
  }
};

export {
  buildDownloadSealedClaimSection,
};
