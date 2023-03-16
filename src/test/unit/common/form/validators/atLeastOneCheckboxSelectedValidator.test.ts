import {AtLeastOneCheckboxSelectedValidator} from 'form/validators/atLeastOneCheckboxSelectedValidator';

describe('AtLeastOneCheckboxSelectedValidator', () => {
  let validator: AtLeastOneCheckboxSelectedValidator;
  //Given
  beforeEach(() => {
    validator = new AtLeastOneCheckboxSelectedValidator();
  });

  describe('validate', () => {
    it('should return true when at least one checkbox is selected', async () => {
      //When
      const result = validator.validate([false, true, false]);

      //Then
      expect(result).toBe(true);
    });

    it('should return false when no checkboxes are selected', async () => {
      //When
      const result = validator.validate([false, false, false]);

      //Then
      expect(result).toBe(false);
    });
  });

  describe('defaultMessage', () => {
    it('should return the expected error message', async () => {
      //When
      const message = validator.defaultMessage();

      //Then
      expect(message).toBe('ERRORS.SELECT_SUPPORT');
    });
  });
});
