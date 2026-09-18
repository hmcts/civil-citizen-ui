import {Claim} from 'models/claim';
import {ClaimSummarySection, ClaimSummaryType} from 'form/models/claimSummarySection';
import {DocumentType} from 'models/document/documentType';
import {buildCaseDocumentDownloadUrl} from 'common/utils/formatDocumentURL';
import {formatDateToFullDate} from 'common/utils/dateUtils';
import {displayDocumentSizeInKB} from 'common/utils/documentSizeDisplayFormatter';
import {t} from 'i18next';
import {getSystemGeneratedCaseDocumentIdByType} from 'models/document/systemGeneratedCaseDocuments';
import {generateDocumentSection} from 'services/features/dashboard/documentBuilderService';
import {documentIdExtractor} from 'common/utils/stringUtils';

const buildSystemGeneratedDocumentSections = (claim: Claim, claimId: string, lang: string): ClaimSummarySection [] => {
  const claimDocuments = claim.systemGeneratedCaseDocuments;
  const claimDocumentsSections: ClaimSummarySection[] = [];
  if(claimDocuments && claimDocuments.length > 0) {
    claimDocuments.forEach(document =>  claimDocumentsSections.push(generateDocumentSection(document.value, claimId, lang)));
  }
  return claimDocumentsSections;
};

const buildDownloadHearingNoticeSection = (claim: Claim, claimId: string, lang: string): ClaimSummarySection => {
  const document = claim.getDocumentDetails(DocumentType.HEARING_FORM);
  const createdLabel = 'PAGES.CLAIM_SUMMARY.DOCUMENT_CREATED';
  if (document) {
    return {
      type: ClaimSummaryType.LINK,
      data: {
        href: buildCaseDocumentDownloadUrl(claimId, getSystemGeneratedCaseDocumentIdByType(claim.caseProgressionHearing.hearingDocuments, DocumentType.HEARING_FORM)) ?? undefined,
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
        href: buildCaseDocumentDownloadUrl(claimId, getSystemGeneratedCaseDocumentIdByType(claim.systemGeneratedCaseDocuments, DocumentType.DEFENDANT_DEFENCE)) ?? undefined,
        text: `${t(downloadClaimLabel, {lng : lang})} (PDF, ${displayDocumentSizeInKB(document.documentSize)})`,
        subtitle: `${t(createdLabel, {lng : lang})} ${formatDateToFullDate(document.createdDatetime, lang)}`,
      },
    };
  }
};

const buildTrialReadyDocumentSection = (claim: Claim, claimId: string, lang: string, isClaimant: boolean): ClaimSummarySection => {
  const createdLabel = t('PAGES.CLAIM_SUMMARY.DOCUMENT_CREATED', {lng: lang});
  const document = isClaimant ? claim?.caseProgression?.claimantTrialArrangements?.trialArrangementsDocument?.value
    : claim?.caseProgression?.defendantTrialArrangements?.trialArrangementsDocument?.value;

  if (document) {
    const documentId = documentIdExtractor(document.documentLink.document_binary_url);
    const href = buildCaseDocumentDownloadUrl(claimId, documentId);
    const text = `${document.documentName} (PDF, ${displayDocumentSizeInKB(document.documentSize)})`;
    const subtitle = `${createdLabel} ${formatDateToFullDate(document.createdDatetime, lang)}`;
    return createLink(href, text, subtitle);
  }
};

const createLink = (href: string | null, text: string, subtitle: string) => {
  return {
    type: href ? ClaimSummaryType.LINK : ClaimSummaryType.PARAGRAPH,
    data: {
      href: href ?? undefined,
      text: text,
      subtitle: subtitle,
    },
  };
};

export {
  buildSystemGeneratedDocumentSections,
  buildDownloadSealedResponseSection,
  buildDownloadHearingNoticeSection,
  buildTrialReadyDocumentSection,
};
