import {convertToDocumentType} from '../../../../main/common/utils/documentTypeConverter';
import {DocumentType} from '../../../../main/common/models/document/documentType';

describe('Document type converter', () => {
  it('should return undefined when uri is empty', () => {
    //When
    const result = convertToDocumentType('');
    //Then
    expect(result).toBeUndefined();
  });
  it('should returnundefined with unexpected uri', () => {
    //When
    const result = convertToDocumentType('news');
    //Then
    expect(result).toBeUndefined();
  });
  it('should return SEALED CLAIM', () => {
    //When
    const result = convertToDocumentType('sealed-claim');
    //Then
    expect(result).toBe(DocumentType.SEALED_CLAIM);
  });
});
