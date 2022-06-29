import {convertToDocumentType} from '../../../../main/common/utils/documentTypeConverter';
import {DocumentType} from '../../../../main/common/models/document/documentType';

describe('Document type converter', () => {
  it('should return undefined when uri is empty', () => {
    //When
    const result = convertToDocumentType('');
    //Then
    expect(result).toBeUndefined();
  });
  it('should return undefined with unexpected uri', () => {
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
  it('should return ACKNOWLEDGEMENT_OF_CLAIM', () => {
    //When
    const result = convertToDocumentType('acknowledgement-of-claim');
    //Then
    expect(result).toBe(DocumentType.ACKNOWLEDGEMENT_OF_CLAIM);
  });
  it('should return ACKNOWLEDGEMENT_OF_SERVICE', () => {
    //When
    const result = convertToDocumentType('acknowledgement-of-service');
    //Then
    expect(result).toBe(DocumentType.ACKNOWLEDGEMENT_OF_SERVICE);
  });
  it('should return DIRECTIONS_QUESTIONNAIRE', () => {
    //When
    const result = convertToDocumentType('directions-questionnaire');
    //Then
    expect(result).toBe(DocumentType.DIRECTIONS_QUESTIONNAIRE);
  });
  it('should return DEFENDANT_DEFENCE', () => {
    //When
    const result = convertToDocumentType('defendant-defence');
    //Then
    expect(result).toBe(DocumentType.DEFENDANT_DEFENCE);
  });
  it('should return DEFENDANT_DRAFT_DIRECTIONS', () => {
    //When
    const result = convertToDocumentType('defendant-draft-directions');
    //Then
    expect(result).toBe(DocumentType.DEFENDANT_DRAFT_DIRECTIONS);
  });
  it('should return DEFAULT_JUDGMENT', () => {
    //When
    const result = convertToDocumentType('default-judgement');
    //Then
    expect(result).toBe(DocumentType.DEFAULT_JUDGMENT);
  });
  it('should return CLAIMANT_DEFENCE', () => {
    //When
    const result = convertToDocumentType('claimant-defence');
    //Then
    expect(result).toBe(DocumentType.CLAIMANT_DEFENCE);
  });
  it('should return CLAIMANT_DRAFT_DIRECTIONS', () => {
    //When
    const result = convertToDocumentType('claimant-draft-directions');
    //Then
    expect(result).toBe(DocumentType.CLAIMANT_DRAFT_DIRECTIONS);
  });
});

