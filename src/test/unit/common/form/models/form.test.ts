import {ValidationError} from 'class-validator';

import {Form} from '../../../../../main/common/form/models/form';

const ERROR_MESSAGE = 'Error message';
const PROPERTY = 'property';


describe('Form get error message', () => {
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
describe('Form has field errors', () => {
  const form = new Form();
  it('should return field error when there are error', () => {
    //Given
    form.errors = createValidationError();
    //When
    const result = form.hasFieldError(PROPERTY);
    //Then
    expect(result).toBe(true);
  });
  it('should return undefined when there is no error', () => {
    //Given
    form.errors = createValidationError();
    //When
    const result = form.hasFieldError('');
    //Then
    expect(result).toBe(false);
  });
});

function createValidationError() {
  const validationError = new ValidationError();
  validationError.property = PROPERTY;
  validationError.constraints = {'constraint': ERROR_MESSAGE};
  return [validationError];
}
