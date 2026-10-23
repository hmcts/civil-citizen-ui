import {OptionalDateNotInPastValidator} from 'form/validators/optionalDateNotInPastValidator';

describe('OptionalDateNotInPastValidator', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date(2026, 9, 21, 12));
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  it.each<[Date, boolean]>([
    [null, true],
    [new Date('invalid'), true],
    [new Date(2026, 9, 20, 23, 59, 59, 999), false],
    [new Date(2026, 9, 21), true],
    [new Date(2026, 9, 22), true],
  ])('validates %p as %p at the date boundary', (value, expected) => {
    expect(new OptionalDateNotInPastValidator().validate(value)).toBe(expected);
  });

  it('retains its existing validation message', () => {
    expect(new OptionalDateNotInPastValidator().defaultMessage()).toBe('ERRORS.VALID_DATE_NOT_IN_PAST');
  });
});
