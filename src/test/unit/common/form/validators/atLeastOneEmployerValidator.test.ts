import {Employer} from 'form/models/statementOfMeans/employment/employer';
import {AtLeastOneEmployerValidator} from 'form/validators/atLeastOneEmployerValidator';

describe('AtLeastOneEmployerValidator', () => {
  const validator = new AtLeastOneEmployerValidator();

  describe('validate', () => {
    it('should return false when all employers have empty fields', () => {
      //Given
      const value = [new Employer('', ''), new Employer('', '')];
      //When
      const result = validator.validate(value);
      //Then
      expect(result).toEqual(false);
    });

    it('should return true when at least one employer has a name', () => {
      //Given
      const value = [new Employer('', ''), new Employer('Acme Corp', '')];
      //When
      const result = validator.validate(value);
      //Then
      expect(result).toEqual(true);
    });

    it('should return true when at least one employer has a job title', () => {
      //Given
      const value = [new Employer('', 'Developer')];
      //When
      const result = validator.validate(value);
      //Then
      expect(result).toEqual(true);
    });

    it('should return true when employer has both name and job title', () => {
      //Given
      const value = [new Employer('Acme Corp', 'Developer')];
      //When
      const result = validator.validate(value);
      //Then
      expect(result).toEqual(true);
    });

    it('should return false for empty array', () => {
      //Given
      const value: Employer[] = [];
      //When
      const result = validator.validate(value);
      //Then
      expect(result).toEqual(false);
    });
  });

  describe('defaultMessage', () => {
    it('should return the expected error message', () => {
      //Given
      //When
      const message = validator.defaultMessage();
      //Then
      expect(message).toEqual('ERRORS.VALID_ENTER_AT_LEAST_ONE_EMPLOYER');
    });
  });
});
