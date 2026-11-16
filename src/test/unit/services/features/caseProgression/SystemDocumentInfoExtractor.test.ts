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
  it('should return null for directions questionnaire when defendantOrClaimant is not provided', async () => {
    //Given
    const systemGeneratedCaseDocuments = [{
      id: '1',
      value: {
        documentType: DocumentType.DIRECTIONS_QUESTIONNAIRE,
        documentName: 'claimant_directions_questionnaire.pdf',
        documentLink: {document_url: 'url', document_filename: 'claimant_directions_questionnaire.pdf', document_binary_url: 'http://dm-store/documents/123/binary'},
      },
    }] as unknown as SystemGeneratedCaseDocuments[];

    // when
    const result = getSystemGeneratedCaseDocumentIdByType(
      systemGeneratedCaseDocuments,
      DocumentType.DIRECTIONS_QUESTIONNAIRE,
    );

    // Then
    expect(result).toBeNull();
  });
});
