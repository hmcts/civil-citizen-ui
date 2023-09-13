import {CASE_DOCUMENT_VIEW_URL} from 'routes/urls';
import {documentIdExtractor} from 'common/utils/stringUtils';

export function formatDocumentViewURL(documentName: string, claimId: string, binaryURL: string): string {

  const url = CASE_DOCUMENT_VIEW_URL.replace(':id', claimId).replace(':documentId', documentIdExtractor(binaryURL));

  return `<a class="govuk-link" target="_blank" href="${url}">${documentName}</a>`;
}
