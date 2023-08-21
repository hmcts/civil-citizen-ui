import {formatDocumentViewURL} from 'common/utils/formatDocumentURL';
import {CASE_DOCUMENT_VIEW_URL} from 'routes/urls';

describe('format <a> element for document', ()=>{
  it('Should format document details into <a>', ()=>{
    //Given
    const claimId = '1234';
    const fileName = 'Name of file';
    const url = 'URL of file';
    const binary = '77121e9b-e83a-440a-9429-e7f0fe89e518';
    const binary_url = `http://dm-store:8080/documents/${binary}/binary`;
    const document = {document_filename: fileName, document_url: url, document_binary_url: binary_url};

    //When
    const urlElement = formatDocumentViewURL(document.document_filename, claimId, document.document_binary_url);

    //Then
    const hrefExpected = CASE_DOCUMENT_VIEW_URL.replace(':id', claimId).replace(':documentId', binary);
    const expectedResult = `<a class="govuk-link" target="_blank" href="${hrefExpected}">${fileName}</a>`;
    expect(urlElement).toEqual(expectedResult);
  });
});
