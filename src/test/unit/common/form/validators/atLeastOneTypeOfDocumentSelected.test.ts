import {AtLeastOneTypeOfDocumentSelected} from 'form/validators/atLeastOneTypeOfDocumentSelected';
import {TypeOfDocumentsForm} from 'form/models/mediation/uploadDocuments/typeOfDocumentsForm';
import {TypeOfMediationDocuments} from 'models/mediation/uploadDocuments/uploadDocuments';
import {TypeOfDocumentsItemForm} from 'form/models/mediation/uploadDocuments/typeOfDocumentsItemForm';

const typeOfDocumentsForm = new TypeOfDocumentsForm('title', 'hint');
describe('AtLeastOneCheckboxSelectedValidator', () => {
  let validator: AtLeastOneTypeOfDocumentSelected;
  //Given
  beforeEach(() => {
    typeOfDocumentsForm.typeOfDocuments = [];
    validator = new AtLeastOneTypeOfDocumentSelected();
  });

  describe('validate', () => {
    it('should return true when at least one type of documents is selected', async () => {
      //Given
      typeOfDocumentsForm.typeOfDocuments.push(new TypeOfDocumentsItemForm(1,'value','text', false, TypeOfMediationDocuments.YOUR_STATEMENT, 'hint'));

      //When
      const result = validator.validate(typeOfDocumentsForm.typeOfDocuments);

      //Then
      expect(result).toBe(false);
    });

    it('should return false when no checkboxes are selected', async () => {
      //Given
      typeOfDocumentsForm.typeOfDocuments.push(new TypeOfDocumentsItemForm(1,'value','text', true, TypeOfMediationDocuments.YOUR_STATEMENT, 'hint'));
      //When
      const result = validator.validate(typeOfDocumentsForm.typeOfDocuments);

      //Then
      expect(result).toBe(true);
    });
  });

  describe('defaultMessage', () => {
    it('should return the expected error message', async () => {
      //When
      const message = validator.defaultMessage();

      //Then
      expect(message).toBe('ERRORS.VALID_ENTER_AT_LEAST_ONE_UPLOAD');
    });
  });
});
