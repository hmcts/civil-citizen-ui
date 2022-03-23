import {ValidationError} from 'class-validator';

import {Form} from '../../../../../main/common/form/models/form';

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
    constraints: { customInt: 'Postcode must be in England or Wales' },
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
    expect(textError).toEqual({'isNotEmpty': 'Enter first address line'});
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
    expect(textError).toEqual({'customInt': 'Postcode must be in England or Wales'});
  });
});

function createValidationError() {
  const validationError = new ValidationError();
  validationError.property = PROPERTY;
  validationError.constraints = {'constraint': ERROR_MESSAGE};
  return [validationError];
}
