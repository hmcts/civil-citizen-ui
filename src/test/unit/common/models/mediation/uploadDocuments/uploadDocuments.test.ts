import {TypeOfDocumentsForm} from 'form/models/mediation/uploadDocuments/typeOfDocumentsForm';
import {TypeOfDocumentsItemForm} from 'form/models/mediation/uploadDocuments/typeOfDocumentsItemForm';
import {
  TypeOfDocuments,
  TypeOfMediationDocuments,
  UploadDocuments,
} from 'models/mediation/uploadDocuments/uploadDocuments';

const uploadDocuments = new UploadDocuments([]);
const typeOfDocumentsForm = new TypeOfDocumentsForm('title', 'hint');
describe('UploadDocuments', () => {
  beforeEach(() => {
    typeOfDocumentsForm.typeOfDocuments = [];
    uploadDocuments.typeOfDocuments = [];
  });

  it('should upload typeOfDocuments empty when map TypeOfDocumentsForm without any check box selected', () => {
    //Given
    typeOfDocumentsForm.typeOfDocuments.push(new TypeOfDocumentsItemForm(1,'value','text', false, TypeOfMediationDocuments.YOUR_STATEMENT, 'hint'));
    const expected = new UploadDocuments([]);
    //When
    const result = uploadDocuments.mapUploadDocumentsFromTypeOfDocumentsForm(typeOfDocumentsForm);
    //Then
    expect(result).toEqual(expected);
  });

  it('should map to UploadDocuments From TypeOfDocumentsForm with checkbox selected', () => {
    //Given
    typeOfDocumentsForm.typeOfDocuments.push(new TypeOfDocumentsItemForm(1,'value','text', true, TypeOfMediationDocuments.YOUR_STATEMENT, 'hint'));
    const expected = new UploadDocuments([new TypeOfDocuments(1, TypeOfMediationDocuments.YOUR_STATEMENT, true)]);
    //When
    const result = uploadDocuments.mapUploadDocumentsFromTypeOfDocumentsForm(typeOfDocumentsForm);
    //Then
    expect(result).toEqual(expected);
  });

  it('should remove type of document item when was checked = true from form is checked = false', () => {
    //Given
    uploadDocuments.typeOfDocuments.push(new TypeOfDocuments(1, TypeOfMediationDocuments.YOUR_STATEMENT, true));
    typeOfDocumentsForm.typeOfDocuments.push(new TypeOfDocumentsItemForm(1,'value','text', false, TypeOfMediationDocuments.YOUR_STATEMENT, 'hint'));

    const expected = new UploadDocuments([]);

    //When
    const result = uploadDocuments.mapUploadDocumentsFromTypeOfDocumentsForm(typeOfDocumentsForm);
    //Then
    expect(result).toEqual(expected);
  });

  it('should do nothing if there is an object checked = true from form is checked = true', () => {
    //Given
    uploadDocuments.typeOfDocuments.push(new TypeOfDocuments(1, TypeOfMediationDocuments.YOUR_STATEMENT, true));
    typeOfDocumentsForm.typeOfDocuments.push(new TypeOfDocumentsItemForm(1,'value','text', true, TypeOfMediationDocuments.YOUR_STATEMENT, 'hint'));

    const expected = new UploadDocuments([new TypeOfDocuments(1, TypeOfMediationDocuments.YOUR_STATEMENT, true)]);

    //When
    const result = uploadDocuments.mapUploadDocumentsFromTypeOfDocumentsForm(typeOfDocumentsForm);
    //Then
    expect(result).toEqual(expected);
  });

  it('should add new elements when the user have at least one element on upload Document then the user unchecked the exists one and added a different one', () => {
    //Given
    uploadDocuments.typeOfDocuments.push(new TypeOfDocuments(1, TypeOfMediationDocuments.YOUR_STATEMENT, true));
    typeOfDocumentsForm.typeOfDocuments.push(new TypeOfDocumentsItemForm(1,'value','text', false, TypeOfMediationDocuments.YOUR_STATEMENT, 'hint'));
    typeOfDocumentsForm.typeOfDocuments.push(new TypeOfDocumentsItemForm(2,'value','text', true, TypeOfMediationDocuments.DOCUMENTS_REFERRED_TO_IN_STATEMENT, 'hint'));
    const expected = new UploadDocuments([new TypeOfDocuments(2, TypeOfMediationDocuments.DOCUMENTS_REFERRED_TO_IN_STATEMENT, true)]);
    //When
    const result = uploadDocuments.mapUploadDocumentsFromTypeOfDocumentsForm(typeOfDocumentsForm);
    //Then
    expect(result).toEqual(expected);
  });

  it('should order by id', () => {
    //Given
    uploadDocuments.typeOfDocuments.push(new TypeOfDocuments(2, TypeOfMediationDocuments.DOCUMENTS_REFERRED_TO_IN_STATEMENT, true));
    uploadDocuments.typeOfDocuments.push(new TypeOfDocuments(1, TypeOfMediationDocuments.YOUR_STATEMENT, true));

    const expected = new UploadDocuments([
      new TypeOfDocuments(1, TypeOfMediationDocuments.YOUR_STATEMENT, true),
      new TypeOfDocuments(2, TypeOfMediationDocuments.DOCUMENTS_REFERRED_TO_IN_STATEMENT, true),
    ]);

    //When
    const result = uploadDocuments.orderArrayById();
    //Then
    expect(result).toEqual(expected.typeOfDocuments);
  });
});

