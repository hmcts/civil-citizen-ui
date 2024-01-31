import {SystemGeneratedCaseDocuments} from 'models/document/systemGeneratedCaseDocuments';
import {CaseDocumentInfoExtractor} from 'services/features/caseProgression/SystemDocumentInfoExtractor';
import {
  DocumentType,
} from 'models/document/documentType';
import {SystemGeneratedCaseDocumentsWithSDOMock} from '../../../../utils/mocks/SystemGeneratedCaseDocumentsMock';

describe('testing of System GeneratedCaseDocuments class', () => {
  test('should getSystemGeneratedCaseDocumentIdByType returns with correct information', () => {
    // Given
    const systemGeneratedCaseDocuments: SystemGeneratedCaseDocuments[] = SystemGeneratedCaseDocumentsWithSDOMock();
    const documentType = DocumentType.SDO_ORDER;

    // when
    const result = CaseDocumentInfoExtractor.getSystemGeneratedCaseDocumentIdByType(
      systemGeneratedCaseDocuments,
      documentType,
    );

    // Then
    expect(result).toBe('123');
  });
});
