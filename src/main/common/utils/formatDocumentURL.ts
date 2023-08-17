import {CASE_DOCUMENT_DOWNLOAD_URL} from 'routes/urls';
import {documentIdExtractor} from 'common/utils/stringUtils';

export function formatDocumentDownloadURL(documentName: string, claimId: string, binaryURL: string): string {

  const url = CASE_DOCUMENT_DOWNLOAD_URL.replace(':id', claimId).replace(':documentId', documentIdExtractor(binaryURL));

  return `<a class="govuk-link" href="${url}">${documentName}</a>`;
}
