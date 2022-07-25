import {ValidationError} from 'class-validator';

import { Form } from '../../../../../main/common/form/models/form';
import { DEFENDANT_POSTCODE_NOT_VALID, VALID_ADDRESS_LINE_1 } from '../../../../../main/common/form/validationErrors/errorMessageConstants';

const ERROR_MESSAGE = 'Error message';
const PROPERTY = 'property';

const _errors = [
  {
    CitizenAddress: {
      primaryAddressLine1: '',
      primaryAddressLine2: '',
      primaryAddressLine3: '',
      primaryCity: 'London',
      primaryPostCode: 'SW1H 9AJ',
    },
    value: '',
    property: 'primaryAddressLine1',
    constraints: { isNotEmpty: 'Enter first address line' },
  },
];

const _correspondenceAddressErrors = [
  {
    CitizenCorrespondenceAddress: {
      correspondenceAddressLine1: '',
      correspondenceAddressLine2: '',
      correspondenceAddressLine3: '',
      correspondenceCity: '',
      correspondencePostCode: 'SW1H 9AJJJ',
    },
    value: 'SW1H 9AJJJ',
    property: 'correspondencePostCode',
    constraints: { customInt: DEFENDANT_POSTCODE_NOT_VALID },
  },
];

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

describe('Form has field text error', () => {
  const form = new Form();
  it('should return text error when there is an error', () => {
    //Given
    form.errors = createValidationError();
    //When
    const textError = form.getTextError(_errors, 'primaryAddressLine1');
    //Then
    expect(textError).toEqual({'isNotEmpty': VALID_ADDRESS_LINE_1});
  });
});

describe('Form has postcode error on correspondence address form', () => {
  const form = new Form();
  it('should return text error when there is an error', () => {
    //Given
    form.errors = createValidationError();
    //When
    const textError = form.getTextError(_correspondenceAddressErrors, 'correspondencePostCode');
    //Then
    expect(textError).toEqual({'customInt': DEFENDANT_POSTCODE_NOT_VALID});
  });
});

describe('Form has children test', () => {
  const form = new Form();
  it('should return true when form has children', () => {
    //Given
    form.errors = createValidationErrorWithChildren();
    //When
    const result = form.hasChildren();
    //Then
    expect(result).toEqual(true);
  });
  it('should return false when form has no children', () => {
    //Given
    form.errors = createValidationError();
    //When
    const result = form.hasChildren();
    //Then
    expect(result).toEqual(false);
  });
  it('should return false when form has no children and no error', () => {
    //Given
    form.errors = undefined;
    //When
    const result = form.hasChildren();
    //Then
    expect(result).toEqual(false);
  });
});

function createValidationError() {
  const validationError = new ValidationError();
  validationError.property = PROPERTY;
  validationError.constraints = {'constraint': ERROR_MESSAGE};
  return [validationError];
}

function createValidationErrorWithChildren() {
  const childrenError : ValidationError[] = [];
  const validationError = new ValidationError();
  validationError.property = PROPERTY;
  validationError.constraints = {'constraint': ERROR_MESSAGE};
  childrenError.push(validationError);
  validationError.children = childrenError;
  return [validationError];
}
