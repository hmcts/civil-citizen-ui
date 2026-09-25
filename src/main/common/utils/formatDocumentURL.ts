import {CASE_DOCUMENT_DOWNLOAD_URL, CASE_DOCUMENT_VIEW_URL} from 'routes/urls';
import {documentIdExtractor} from 'common/utils/stringUtils';
import {isUsablePathSegment} from 'common/utils/routeParamUtils';
import {HearingDateTimeFormatter} from 'services/features/caseProgression/hearingDateTimeFormatter';
import {t} from 'i18next';
import {alignText} from 'form/models/alignText';

export function buildDocumentPathUrl(
  urlTemplate: string,
  claimId?: string | null,
  documentId?: string | null,
): string | null {
  const claimIdSegment = typeof claimId === 'string' ? claimId.trim() : '';
  const documentIdSegment = typeof documentId === 'string' ? documentId.trim() : '';
  if (!isUsablePathSegment(claimIdSegment) || !isUsablePathSegment(documentIdSegment)) {
    return null;
  }
  return urlTemplate
    .replace(':id', claimIdSegment)
    .replace(':documentId', documentIdSegment);
}

export function buildCaseDocumentViewUrl(claimId?: string | null, documentId?: string | null): string | null {
  return buildDocumentPathUrl(CASE_DOCUMENT_VIEW_URL, claimId, documentId);
}

export function buildCaseDocumentDownloadUrl(claimId?: string | null, documentId?: string | null): string | null {
  return buildDocumentPathUrl(CASE_DOCUMENT_DOWNLOAD_URL, claimId, documentId);
}

export function formatDocumentHtmlLink(
  documentName: string,
  claimId: string,
  binaryURL?: string | null,
  extraAttributes = 'class="govuk-link" target="_blank" rel="noopener noreferrer"',
): string {
  const href = buildCaseDocumentViewUrl(claimId, documentIdExtractor(binaryURL));
  if (!href) {
    return documentName ?? '';
  }
  return `<a href="${href}" ${extraAttributes}>${documentName}</a>`;
}

export function formatDocumentViewURL(documentName: string, claimId: string, binaryURL?: string | null): string {
  const href = buildCaseDocumentViewUrl(claimId, documentIdExtractor(binaryURL));
  if (!href) {
    return documentName;
  }
  return `<a class="govuk-link" target="_blank" href="${href}">${documentName}</a>`;
}
export function formatEvidenceDocumentAlignedViewURL(documentName: string, claimId: string, binaryURL: string | null | undefined, align:alignText): string {
  const href = buildCaseDocumentViewUrl(claimId, documentIdExtractor(binaryURL));
  if (!href) {
    return `<div class="${align} govuk-body govuk-grid-column-one-half">${documentName}</div>`;
  }
  return `<div class="${align} govuk-body govuk-grid-column-one-half"><a class="govuk-link" target="_blank" href="${href}">${documentName}</a></div>`;
}
export function formatDocumentAlignedViewURL(documentName: string, claimId: string, binaryURL: string | null | undefined, align:alignText): string {
  const href = buildCaseDocumentViewUrl(claimId, documentIdExtractor(binaryURL));
  if (!href) {
    return `<div class="${align}">${documentName}</div>`;
  }
  return `<div class="${align}"><a class="govuk-link" target="_blank" href="${href}">${documentName}</a></div>`;
}

export function formatDocumentWithHintText(documentType: string, createdDatetime: Date,lang: string): string {

  const created = t('PAGES.DASHBOARD.HEARINGS.CREATED', {lng:lang});
  const hintText ='<div><span class="govuk-body">'+ documentType +'</span>'
    + '<span class="govuk-caption-m">' + created + '['+HearingDateTimeFormatter.getHearingDateFormatted(createdDatetime,lang)+']'+'</span></div>';
  return hintText;
}
export function formatEvidenceDocumentWithHintText(documentType: string, createdDatetime: Date,lang: string): string {

  const created = t('PAGES.CLAIM_SUMMARY.DATE_DOCUMENT_UPLOADED', {lng: lang});
  return '<div class="govuk-grid-column-one-half govuk-body">' + documentType
    + '<span class="govuk-caption-m">' + created + '[' + HearingDateTimeFormatter.getHearingDateFormatted(createdDatetime, lang) + ']' + '</span></div>';
}
