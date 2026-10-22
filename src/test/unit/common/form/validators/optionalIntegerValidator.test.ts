import {OptionalIntegerValidator} from 'form/validators/optionalIntegerValidator';

describe('OptionalIntegerValidator', () => {
  const validator = new OptionalIntegerValidator();

  it.each(['', undefined, '0', '00012', '1234567890'])(
    'accepts an optional or unsigned integer value %p', value => {
      expect(validator.validate(value)).toBe(true);
    },
  );

  it.each(['-1', '+1', '1.5', '1e3', ' 12', '12 ', '12 3', '12#', 'abc', '\n', null])(
    'rejects a non-integer phone value %p', value => {
      expect(validator.validate(value)).toBe(false);
    },
  );

  it('retains the phone validation message used by its callers', () => {
    expect(validator.defaultMessage()).toBe('ERRORS.VALID_PHONE_NUMBER');
  });
});
