import {CASE_DOCUMENT_VIEW_URL} from 'routes/urls';
import {documentIdExtractor} from 'common/utils/stringUtils';
import {HearingDateTimeFormatter} from 'services/features/caseProgression/hearingDateTimeFormatter';
import {t} from 'i18next';
import {alignText} from 'form/models/alignText';

export function formatDocumentViewURL(documentName: string, claimId: string, binaryURL: string): string {

  const url = CASE_DOCUMENT_VIEW_URL.replace(':id', claimId).replace(':documentId', documentIdExtractor(binaryURL));

  return `<a class="govuk-link" target="_blank" href="${url}">${documentName}</a>`;
}
export function formatEvidenceDocumentAlignedViewURL(documentName: string, claimId: string, binaryURL: string, align:alignText): string {

  const url = CASE_DOCUMENT_VIEW_URL.replace(':id', claimId).replace(':documentId', documentIdExtractor(binaryURL));

  return `<div class="${align} govuk-body govuk-grid-column-one-half"><a class="govuk-link" target="_blank" href="${url}">${documentName}</a></div>`;
}
export function formatDocumentAlignedViewURL(documentName: string, claimId: string, binaryURL: string, align:alignText): string {

  const url = CASE_DOCUMENT_VIEW_URL.replace(':id', claimId).replace(':documentId', documentIdExtractor(binaryURL));

  return `<div class="${align}"><a class="govuk-link" target="_blank" href="${url}">${documentName}</a></div>`;
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
