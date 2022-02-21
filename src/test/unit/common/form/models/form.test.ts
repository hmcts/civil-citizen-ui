import {ValidationError} from 'class-validator';

import {Form} from '../../../../../main/common/form/models/form';

const ERROR_MESSAGE = 'Error message';
const PROPERTY = 'property';


describe('Citizen telephone number get error message', () => {
  const form = new Form();
  it('should return errors when there are errors', () => {
    //Given
    form.errors = createValidationError();
    //When
    const result = form.getErrors();
    //Then
    expect(result.length).toBe(1);
  });
  it('should return undefined when there is no error', () => {
    //Given
    form.errors = undefined;
    //When
    const result = form.getErrors();
    //Then
    expect(result).toBeUndefined();
  });
});

function createValidationError() {
  const validationError = new ValidationError();
  validationError.property = PROPERTY;
  validationError.constraints = {'constraint': ERROR_MESSAGE};
  return [validationError];
}
