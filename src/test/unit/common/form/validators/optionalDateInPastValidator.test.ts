import {OptionalDateInPastValidator} from 'form/validators/optionalDateInPastValidator';

describe('OptionalDateInPastValidator', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date(2026, 9, 21, 12));
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  it.each<[Date, boolean]>([
    [null, true],
    [new Date('invalid'), true],
    [new Date(2026, 9, 20, 23, 59, 59, 999), true],
    [new Date(2026, 9, 21), false],
    [new Date(2026, 9, 22), false],
  ])('validates %p as %p at the date boundary', (value, expected) => {
    expect(new OptionalDateInPastValidator().validate(value)).toBe(expected);
  });

  it('retains its existing validation message', () => {
    expect(new OptionalDateInPastValidator().defaultMessage()).toBe('ERRORS.VALID_DATE_IN_PAST21 October 2026');
  });
});
