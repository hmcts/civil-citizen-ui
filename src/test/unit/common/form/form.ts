import {Form} from '../../../../main/common/form/form';
import {ValidationError} from 'class-validator';
const mockModel = jest.fn();
const ERROR_MESSAGE = 'Error message';
const PROPERTY = 'property';
describe('Form has errors', () => {
  it('should return false when no errors exist', () => {
    //Given
    const form = new Form(mockModel);
    //When
    const result = form.hasErrors();
    //Then
    expect(result).toBeFalsy();
  });
  it('should return true when form has errors', ()=> {
    //Given
    const validationError = createValidationError();
    const form = new Form(mockModel, [validationError]);
    //When
    const result = form.hasErrors();
    //Then
    expect(result).toBeTruthy();
  });
});
describe('Form get error message', () => {
  const validationError = createValidationError();
  it('should return error message successfully', () => {
    //Given
    const form = new Form(mockModel, [validationError]);
    //When
    const result = form.errorFor(PROPERTY);
    //Then
    expect(result).toBe(ERROR_MESSAGE);
  });
});

function createValidationError() {
  const validationError = new ValidationError();
  validationError.property = PROPERTY;
  validationError.constraints = {'constraint': ERROR_MESSAGE};
  return validationError;
}
