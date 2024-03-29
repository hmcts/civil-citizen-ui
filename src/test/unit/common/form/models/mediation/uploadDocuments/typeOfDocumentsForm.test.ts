import {TypeOfDocumentsForm} from 'form/models/mediation/uploadDocuments/typeOfDocumentsForm';
import {TypeOfDocumentsItemForm} from 'form/models/mediation/uploadDocuments/typeOfDocumentsItemForm';
import {
  TypeOfMediationDocuments,
  UploadDocuments,
} from 'models/mediation/uploadDocuments/uploadDocuments';
import {TypeOfDocumentSectionMapper} from 'services/features/caseProgression/TypeOfDocumentSectionMapper';

const uploadDocuments = new UploadDocuments(Array.of(new TypeOfDocumentsItemForm(1,'value','text', false, TypeOfMediationDocuments.YOUR_STATEMENT, 'hint')));
const typeOfDocumentsForm = new TypeOfDocumentsForm('title', 'hint');

describe('typeOfDocumentsForm', () => {
  beforeEach(() => {
    typeOfDocumentsForm.typeOfDocuments = [];
  });

  it('should map TypeOfDocumentsForm as checked = false when the strings undefined ', () => {
    //Given
    typeOfDocumentsForm.typeOfDocuments.push(new TypeOfDocumentsItemForm(1,'value','text', true, TypeOfMediationDocuments.YOUR_STATEMENT, 'hint'));
    const typeOfDocumentsFormExpected = new TypeOfDocumentsForm('title', 'hint');
    typeOfDocumentsFormExpected.typeOfDocuments.push(new TypeOfDocumentsItemForm(1,'value','text', false, TypeOfMediationDocuments.YOUR_STATEMENT, 'hint'));

    //When
    const result = typeOfDocumentsForm.mapTypeOfDocumentsFormFromStrings(undefined);
    //Then
    expect(result).toEqual(typeOfDocumentsFormExpected);
  });

  it('should map TypeOfDocumentsForm as checked = true when the typeOfDocuments was false', () => {
    //Given
    typeOfDocumentsForm.typeOfDocuments.push(new TypeOfDocumentsItemForm(1,'value','text', false, TypeOfMediationDocuments.YOUR_STATEMENT, 'hint'));
    const typeOfDocumentsFormExpected = new TypeOfDocumentsForm('title', 'hint');
    typeOfDocumentsFormExpected.typeOfDocuments.push(new TypeOfDocumentsItemForm(1,'value','text', true, TypeOfMediationDocuments.YOUR_STATEMENT, 'hint'));

    //When
    const result = typeOfDocumentsForm.mapTypeOfDocumentsFormFromStrings(Array.of(TypeOfMediationDocuments.YOUR_STATEMENT.toString()));
    //Then
    expect(result).toEqual(typeOfDocumentsFormExpected);
  });

  it('should map TypeOfDocumentsForm as checked = false when the typeOfDocuments is not found', () => {
    //Given
    typeOfDocumentsForm.typeOfDocuments.push(new TypeOfDocumentsItemForm(1,'value','text', true, TypeOfMediationDocuments.YOUR_STATEMENT, 'hint'));
    const typeOfDocumentsFormExpected = new TypeOfDocumentsForm('title', 'hint');
    typeOfDocumentsFormExpected.typeOfDocuments.push(new TypeOfDocumentsItemForm(1,'value','text', false, TypeOfMediationDocuments.YOUR_STATEMENT, 'hint'));

    //When
    const result = typeOfDocumentsForm.mapTypeOfDocumentsFormFromStrings(Array.of(TypeOfMediationDocuments.DOCUMENTS_REFERRED_TO_IN_STATEMENT.toString()));
    //Then
    expect(result).toEqual(typeOfDocumentsFormExpected);
  });

  it('should map TypeOfDocumentsForm keep as is when uploadDocuments is undefined', () => {
    //Given
    const typeOfDocumentsFormExpected = new TypeOfDocumentsForm('title', 'hint');

    //When
    const result = typeOfDocumentsForm.mapTypeOfDocumentsFormFromUploadDocuments(undefined);
    //Then
    expect(result).toEqual(typeOfDocumentsFormExpected);
  });

  it('should map TypeOfDocumentsForm keep as is when uploadDocuments is populated', () => {
    //Given
    typeOfDocumentsForm.typeOfDocuments.push(new TypeOfDocumentsItemForm(1,'value','text', true, TypeOfMediationDocuments.YOUR_STATEMENT, 'hint'));
    const typeOfDocumentsFormExpected = new TypeOfDocumentsForm('title', 'hint');
    typeOfDocumentsFormExpected.typeOfDocuments.push(new TypeOfDocumentsItemForm(1,'value','text', false, TypeOfMediationDocuments.YOUR_STATEMENT, 'hint'));

    //When
    const result = typeOfDocumentsForm.mapTypeOfDocumentsFormFromUploadDocuments(uploadDocuments);
    //Then
    expect(result).toEqual(typeOfDocumentsFormExpected);
  });

  it('should map TypeOfDocumentsForm creating new object when is undefined', () => {
    //Given
    typeOfDocumentsForm.typeOfDocuments.push(new TypeOfDocumentsItemForm(1,'value','text', true, TypeOfMediationDocuments.DOCUMENTS_REFERRED_TO_IN_STATEMENT, 'hint'));
    const typeOfDocumentsFormExpected = new TypeOfDocumentsForm('title', 'hint');
    typeOfDocumentsFormExpected.typeOfDocuments.push(new TypeOfDocumentsItemForm(1,'value','text', true, TypeOfMediationDocuments.DOCUMENTS_REFERRED_TO_IN_STATEMENT, 'hint'));
    typeOfDocumentsFormExpected.typeOfDocuments.push(new TypeOfDocumentsItemForm(0,'','', false, TypeOfMediationDocuments.YOUR_STATEMENT, undefined));

    //When
    const result = typeOfDocumentsForm.mapTypeOfDocumentsFormFromUploadDocuments(uploadDocuments);
    //Then
    expect(result).toEqual(typeOfDocumentsFormExpected);
  });

  it('should map multer file to FileUpload object correctly', () => {
    // Given
    const mockFile = {
      fieldname: 'test',
      originalname: 'test.png',
      mimetype: 'image/png',
      size: 1024,
      buffer: Buffer.from('test png'),
    } as Express.Multer.File;

    // When
    const result = TypeOfDocumentSectionMapper.mapMulterFileToSingleFile(mockFile);

    // Then
    expect(result).toBeDefined();
    expect(result.fieldname).toEqual(mockFile.fieldname);
    expect(result.originalname).toEqual(mockFile.originalname);
    expect(result.mimetype).toEqual(mockFile.mimetype);
    expect(result.size).toEqual(mockFile.size);
    expect(result.buffer).toEqual(mockFile.buffer);
  });
});

