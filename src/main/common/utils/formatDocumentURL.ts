import {CASE_DOCUMENT_VIEW_URL} from 'routes/urls';
import {documentIdExtractor} from 'common/utils/stringUtils';
import {HearingDateTimeFormatter} from 'services/features/caseProgression/hearingDateTimeFormatter';
import {alignText} from 'form/models/alignText';

export function formatDocumentViewURL(documentName: string, claimId: string, binaryURL: string): string {

  const url = CASE_DOCUMENT_VIEW_URL.replace(':id', claimId).replace(':documentId', documentIdExtractor(binaryURL));

  return `<a class="govuk-link" target="_blank" href="${url}">${documentName}</a>`;
}

export function formatDocumentAlignedViewURL(documentName: string, claimId: string, binaryURL: string, align:alignText): string {
  let alignClass = '';

  switch (align) {
    case alignText.ALIGN_TO_THE_RIGHT:
      alignClass='govuk-!-text-align-right';
      break;
    case alignText.ALIGN_TO_THE_LEFT:
      alignClass='govuk-!-text-align-left';
      break;
    case alignText.ALIGN_TO_THE_CENTER:
      alignClass='govuk-!-text-align-centre';
      break;
    default:
      alignClass='govuk-!-text-align-right';
      break;
  }

  const url = CASE_DOCUMENT_VIEW_URL.replace(':id', claimId).replace(':documentId', documentIdExtractor(binaryURL));

  return `<div class="${alignClass}"><a class="govuk-link ${alignClass}" target="_blank" href="${url}">${documentName}</a></div>`;
}

export function formatDocumentWithHintText(documentType: string, createdDatetime: Date,lang: string): string {

  const hintText ='<span class="govuk-body">'+ documentType +'</span>'
    + '<span class="govuk-caption-m"> Created ['+ HearingDateTimeFormatter.getHearingDateFormatted(createdDatetime,lang) + ']</span>';
  return hintText;
}
