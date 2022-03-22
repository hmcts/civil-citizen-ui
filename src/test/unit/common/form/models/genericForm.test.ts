import {ValidationError} from 'class-validator';

import {GenericForm} from '../../../../../main/common/form/models/genericForm';

const ERROR_MESSAGE = 'Error message';
const PROPERTY = 'property';
const model: object = {};

describe('Form get error message', () => {
  const form = new GenericForm(model);
  it('should return errors when there are errors', () => {
    //Given
    form.errors = createValidationError();
    //When
    const result = form.getErrors();
    //Then
    expect(result.length).toBe(1);
  });
  it('should return empty array when there is no error', () => {
    //Given
    form.errors = undefined;
    //When
    const result = form.getErrors();
    //Then
    expect(result).toEqual([]);
  });
});
describe('Form has field errors', () => {
  const form = new GenericForm(model);
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

describe('Get error message for field', () => {
  const form = new GenericForm(model);
  it('should return error message for field', () => {
    //Given
    form.errors = [
      {
        target: {
          type: {
            value: 'OTHER',
            displayValue: 'Other',
          },
          housingDetails: '',
        },
        value: '',
        property: 'housingDetails',
        children: [],
        constraints: {
          isNotEmpty: 'Describe your housing',
        },
      },
    ];
    //When
    const result = form.errorFor('housingDetails');
    //Then
    expect(result).toBe('Describe your housing');
  });
});

describe('Form has nested error', () => {
  const form = new GenericForm(model);
  form.errors = [
    {
      target: {
        declared: true,
        numberOfChildren: {
          under11: -1,
        },
      },
      value: {
        under11: -1,
      },
      property: 'numberOfChildren',
      children: [
        {
          target: {
            under11: -1,
          },
          value: -1,
          property: 'under11',
          children: [],
          constraints: {
            min: 'Don\'t enter a negative number',
          },
        },
      ],
    },
  ];

  test('hasNestedErrors should return true', () => {
    expect(form.hasNestedErrors()).toBe(true);
  });

  test('hasNestedFieldError(\'under11\') should return true', () => {
    expect(form.hasNestedFieldError('under11')).toBe(true);
  });

  test('getNestedErrors() should not be empty', () => {
    expect(form.getNestedErrors().length).toBe(1);
  });

  test('There should be a nested error for property \'under11\'', () => {
    expect(form.getNestedErrors()[0].property).toBe('under11');
  });

  test('Nested error for property \'under11\' should have the expected wording', () => {
    expect(form.nestedErrorFor('under11')).toBe('Don\'t enter a negative number');
  });
});

function createValidationError() {
  const validationError = new ValidationError();
  validationError.property = PROPERTY;
  validationError.constraints = {'constraint': ERROR_MESSAGE};
  return [validationError];
}
