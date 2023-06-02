import {
  getSystemGeneratedCaseDocumentIdByType,
  SystemGeneratedCaseDocuments,
} from 'models/document/systemGeneratedCaseDocuments';
import {SystemGeneratedCaseDocumentsWithSDOMock} from '../../../../utils/mocks/SystemGeneratedCaseDocumentsMock';
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
});
