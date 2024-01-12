import {TypeOfDocumentsForm} from 'form/models/mediation/uploadDocuments/typeOfDocumentsForm';
import {TypeOfDocumentsItemForm} from 'form/models/mediation/uploadDocuments/typeOfDocumentsItemForm';
import {
  TypeOfMediationDocuments,
  UploadDocuments,
} from 'models/mediation/uploadDocuments/uploadDocuments';

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

  it('should map TypeOfDocumentsForm keep as is when uploadDocuments is undefined', () => {
    //Given
    typeOfDocumentsForm.typeOfDocuments.push(new TypeOfDocumentsItemForm(1,'value','text', true, TypeOfMediationDocuments.DOCUMENTS_REFERRED_TO_IN_STATEMENT, 'hint'));
    const typeOfDocumentsFormExpected = new TypeOfDocumentsForm('title', 'hint');
    typeOfDocumentsFormExpected.typeOfDocuments.push(new TypeOfDocumentsItemForm(1,'value','text', true, TypeOfMediationDocuments.DOCUMENTS_REFERRED_TO_IN_STATEMENT, 'hint'));

    //When
    const result = typeOfDocumentsForm.mapTypeOfDocumentsFormFromUploadDocuments(uploadDocuments);
    //Then
    expect(result).toEqual(typeOfDocumentsFormExpected);
  });
});

