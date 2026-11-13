import {
  getSystemGeneratedCaseDocumentIdByType,
  SystemGeneratedCaseDocuments,
} from 'models/document/systemGeneratedCaseDocuments';
import {
  SystemGeneratedCaseDocumentsWithSDOMock,
  SystemGeneratedCaseDocumentsWithSEALEDCLAIMAndSDOMock,
} from '../../../../utils/mocks/SystemGeneratedCaseDocumentsMock';
import {DocumentType} from 'models/document/documentType';

describe('System Document Info Extractor Service', () => {
  it('should extract document correctly', async () => {
    //Given
    const systemGeneratedCaseDocuments: SystemGeneratedCaseDocuments[] = SystemGeneratedCaseDocumentsWithSDOMock();
    const documentType = DocumentType.SDO_ORDER;

    // when
    const result = getSystemGeneratedCaseDocumentIdByType(
      systemGeneratedCaseDocuments,
      documentType,
    );

    // Then
    expect(result).toBe('123');
  });
  it('should extract claim form correctly', async () => {
    //Given
    const systemGeneratedCaseDocuments: SystemGeneratedCaseDocuments[] = SystemGeneratedCaseDocumentsWithSEALEDCLAIMAndSDOMock();
    const documentType = DocumentType.SEALED_CLAIM;

    // when
    const result = getSystemGeneratedCaseDocumentIdByType(
      systemGeneratedCaseDocuments,
      documentType,
      'claimant',
    );

    // Then
    expect(result).toBe('123');
  });

  it('should skip an earlier matching document whose id is the null sentinel', () => {
    const systemGeneratedCaseDocuments = [
      {
        id: '1',
        value: {
          createdBy: 'Civil',
          documentName: 'response_claim_form.pdf',
          documentLink: {
            document_url: 'http://dm-store:8080/documents/null',
            document_filename: 'response.pdf',
            document_binary_url: 'http://dm-store:8080/documents/null/binary',
          },
          documentSize: 100,
          documentType: DocumentType.DEFENDANT_DEFENCE,
          createdDatetime: new Date('2022-06-21'),
        },
      },
      {
        id: '2',
        value: {
          createdBy: 'Civil',
          documentName: 'response_claim_form.pdf',
          documentLink: {
            document_url: 'http://dm-store:8080/documents/valid-defence-id',
            document_filename: 'response.pdf',
            document_binary_url: 'http://dm-store:8080/documents/valid-defence-id/binary',
          },
          documentSize: 100,
          documentType: DocumentType.DEFENDANT_DEFENCE,
          createdDatetime: new Date('2022-06-22'),
        },
      },
    ] as SystemGeneratedCaseDocuments[];

    expect(getSystemGeneratedCaseDocumentIdByType(
      systemGeneratedCaseDocuments,
      DocumentType.DEFENDANT_DEFENCE,
    )).toBe('valid-defence-id');
  });
});
