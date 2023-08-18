import {Claim} from 'models/claim';
import {ClaimSummarySection, ClaimSummaryType} from 'form/models/claimSummarySection';
import {DocumentType} from 'models/document/documentType';
import {CASE_DOCUMENT_DOWNLOAD_URL} from 'routes/urls';
import {formatDateToFullDate} from 'common/utils/dateUtils';
import {displayDocumentSizeInKB} from 'common/utils/documentSizeDisplayFormatter';
import {t} from 'i18next';
import {getSystemGeneratedCaseDocumentIdByType} from 'models/document/systemGeneratedCaseDocuments';
import {CaseDocument} from 'models/document/caseDocument';
import {documentIdExtractor} from 'common/utils/stringUtils';

const buildDownloadSealedClaimSectionTitle = (lang: string): ClaimSummarySection => {
  return {
    type: ClaimSummaryType.TITLE,
    data: {
      text: t('PAGES.CLAIM_SUMMARY.CLAIM_DOCUMENTS', { lng: lang }),
    },
  };
};

const buildSystemGeneratedDocumentSections = (claim: Claim, claimId: string, lang: string): ClaimSummarySection [] => {
  const claimDocuments = claim.systemGeneratedCaseDocuments;
  const claimDocumentsSections: ClaimSummarySection[] = [];
  if(claimDocuments && claimDocuments.length > 0) {
    claimDocuments.forEach(document =>  claimDocumentsSections.push(generateDocumentSection(document.value, claimId, lang)));
  }
  return claimDocumentsSections;
};

const generateDocumentSection = (document: CaseDocument, claimId: string, lang:string): ClaimSummarySection => {
  if (document) {
    const createdLabel = t('PAGES.CLAIM_SUMMARY.DOCUMENT_CREATED', {lng: lang});
    return {
      type: ClaimSummaryType.LINK,
      data: {
        href: CASE_DOCUMENT_DOWNLOAD_URL.replace(':id', claimId).replace(':documentId', documentIdExtractor(document.documentLink?.document_binary_url)),
        text: `${document.documentName} (PDF, ${displayDocumentSizeInKB(document.documentSize)})`,
        subtitle: `${createdLabel} ${formatDateToFullDate(document.createdDatetime, lang)}`,
      },
    };
  }
};

const buildDownloadHearingNoticeSection = (claim: Claim, claimId: string, lang: string): ClaimSummarySection => {
  const document = claim.getDocumentDetails(DocumentType.HEARING_FORM);
  const createdLabel = 'PAGES.CLAIM_SUMMARY.DOCUMENT_CREATED';
  if (document) {
    return {
      type: ClaimSummaryType.LINK,
      data: {
        href: CASE_DOCUMENT_DOWNLOAD_URL.replace(':id', claimId).replace(':documentId', getSystemGeneratedCaseDocumentIdByType(claim.caseProgressionHearing.hearingDocuments, DocumentType.HEARING_FORM)),
        text: `${document.documentName} (PDF, ${displayDocumentSizeInKB(document.documentSize)})`,
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
        href: CASE_DOCUMENT_DOWNLOAD_URL.replace(':id', claimId).replace(':documentId', getSystemGeneratedCaseDocumentIdByType(claim.systemGeneratedCaseDocuments, DocumentType.DEFENDANT_DEFENCE)),
        text: `${t(downloadClaimLabel, {lng : lang})} (PDF, ${displayDocumentSizeInKB(document.documentSize)})`,
        subtitle: `${t(createdLabel, {lng : lang})} ${formatDateToFullDate(document.createdDatetime, lang)}`,
      },
    };
  }
};

const buildDownloadOrdersSection = (claim: Claim, claimId: string, lang: string): ClaimSummarySection [] => {
  const finalOrderDocumentCollection = claim.caseProgression.finalOrderDocumentCollection;
  const claimDocumentsSections: ClaimSummarySection[] = [];
  claimDocumentsSections.push (getOrdersTitle(lang));
  if (finalOrderDocumentCollection && finalOrderDocumentCollection.length > 0) {
    finalOrderDocumentCollection.forEach(document =>  claimDocumentsSections.push(generateDocumentSection(document.value, claimId, lang)));
  }
  return claimDocumentsSections;
};

const getOrdersTitle = (lang: string) : ClaimSummarySection => {
  return {
    type: ClaimSummaryType.TITLE,
    data: {
      text: t('PAGES.CLAIM_SUMMARY.ORDERS', { lng: lang }),
    },
  };
};

export {
  buildSystemGeneratedDocumentSections,
  buildDownloadSealedResponseSection,
  buildDownloadHearingNoticeSection,
  buildDownloadSealedClaimSectionTitle,
  buildDownloadOrdersSection,
};
