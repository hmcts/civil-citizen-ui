import {CASE_DOCUMENT_VIEW_URL} from 'routes/urls';
import {documentIdExtractor} from 'common/utils/stringUtils';
import {HearingDateTimeFormatter} from 'services/features/caseProgression/hearingDateTimeFormatter';
import {alignText} from 'form/models/alignText';
import {t} from 'i18next';

export function formatDocumentViewURL(documentName: string, claimId: string, binaryURL: string): string {

  const url = CASE_DOCUMENT_VIEW_URL.replace(':id', claimId).replace(':documentId', documentIdExtractor(binaryURL));

  return `<a class="govuk-link" target="_blank" href="${url}">${documentName}</a>`;
}

export function formatDocumentAlignedViewURL(documentName: string, claimId: string, binaryURL: string, align:alignText): string {

  const url = CASE_DOCUMENT_VIEW_URL.replace(':id', claimId).replace(':documentId', documentIdExtractor(binaryURL));

  return `<div class="${align}"><a class="govuk-link" target="_blank" href="${url}">${documentName}</a></div>`;
}

export function formatDocumentWithHintText(documentType: string, createdDatetime: Date,lang: string): string {

  const created = t('PAGES.DASHBOARD.HEARINGS.CREATED', {lng:lang});
  const hintText ='<span class="govuk-body">'+ documentType +'</span>'
    + '<span class="govuk-caption-m">' + created + [HearingDateTimeFormatter.getHearingDateFormatted(createdDatetime,lang)]+'</span>';
  return hintText;
}
