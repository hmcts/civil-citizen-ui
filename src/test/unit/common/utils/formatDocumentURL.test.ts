import {
  formatDocumentAlignedViewURL,
  formatDocumentViewURL,
  formatDocumentWithHintText,
} from 'common/utils/formatDocumentURL';
import {CASE_DOCUMENT_VIEW_URL} from 'routes/urls';
import {DocumentType} from 'models/document/documentType';
import {HearingDateTimeFormatter} from 'services/features/caseProgression/hearingDateTimeFormatter';
import {alignText} from 'form/models/alignText';
import {documentIdExtractor} from 'common/utils/stringUtils';
import {t} from 'i18next';

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
describe('format hint element for document', ()=>{
  const lang = 'en';
  it('Should show hint date document details into', ()=>{
    const documentType = DocumentType.HEARING_FORM;
    const createdDatetime = new Date();
    const created = t('PAGES.DASHBOARD.HEARINGS.CREATED', {lng:lang});
    //When
    const urlElement = formatDocumentWithHintText(documentType, createdDatetime, lang);
    //Then
    const expectedResult = '<div><span class="govuk-body">'+ documentType +'</span>'
      + '<span class="govuk-caption-m">'+created+'['+ HearingDateTimeFormatter.getHearingDateFormatted(createdDatetime,lang) + ']</span></div>';
    expect(urlElement).toEqual(expectedResult);
  });
});

describe('format align element for document file name', ()=>{
  it('Should show document name alignment', ()=>{
    //Given
    const claimId = '1234';
    const fileName = 'Name of file';
    const binary = '77121e9b-e83a-440a-9429-e7f0fe89e518';
    const binary_url = `http://dm-store:8080/documents/${binary}/binary`;
    const url = CASE_DOCUMENT_VIEW_URL.replace(':id', claimId).replace(':documentId', documentIdExtractor(binary_url));
    const document = {document_filename: fileName, document_url: url, document_binary_url: binary_url};
    const alignClass = 'govuk-!-text-align-right';

    //When
    const urlElement = formatDocumentAlignedViewURL(document.document_filename, claimId, document.document_binary_url,alignText.ALIGN_TO_THE_RIGHT);
    //Then
    const expectedResult = `<div class="${alignClass}"><a class="govuk-link" target="_blank" href="${url}">${document.document_filename}</a></div>`;
    expect(urlElement).toEqual(expectedResult);
  });
});
