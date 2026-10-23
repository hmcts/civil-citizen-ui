import {OptionalDateNotInFutureValidator} from 'form/validators/optionalDateNotInFutureValidator';

describe('OptionalDateNotInFutureValidator', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date(2026, 9, 21, 12));
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  it.each<[Date, boolean]>([
    [null, true],
    [new Date('invalid'), true],
    [new Date(2026, 9, 21, 11, 59, 59, 999), true],
    [new Date(2026, 9, 21, 12), true],
    [new Date(2026, 9, 21, 12, 0, 0, 1), false],
  ])('validates %p as %p at the date boundary', (value, expected) => {
    expect(new OptionalDateNotInFutureValidator().validate(value)).toBe(expected);
  });

  it('retains its existing validation message', () => {
    expect(new OptionalDateNotInFutureValidator().defaultMessage()).toBe('ERRORS.VALID_DATE');
  });
});
