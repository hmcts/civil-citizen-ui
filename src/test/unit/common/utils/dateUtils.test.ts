import {
  addDaysBefore4pm,
  addMonths,
  checkEvidenceUploadTime, dateTimeFormat,
  formatStringDateDMY,
  formatStringTimeHMS,
  getDOBforAgeFromCurrentTime,
  isDateOnOrAfterSpecificDate,
} from '../../../../main/common/utils/dateUtils';

describe('addDaysBefore4pm', () => {
  it('should add 5 days to date if hour is before 4pm', () => {
    //Given
    const date = new Date('2023-01-05');
    date.setHours(10, 0, 0, 0);
    const resultDate = new Date('2023-01-10');
    resultDate.setHours(10, 0, 0, 0);
    //When
    const result = addDaysBefore4pm(date, 5);
    //Then
    expect(result.getDate()).toBe(resultDate.getDate());
  });
  it('should add 6 days to date if hour is after 4pm', () => {
    //Given
    const date = new Date('2023-01-05');
    date.setHours(22, 0, 0, 0);
    const resultDate = new Date('2023-01-11');
    resultDate.setHours(22, 0, 0, 0);
    //When
    const result = addDaysBefore4pm(date, 5);
    //Then
    expect(result.getDate()).toBe(resultDate.getDate());
  });
});

describe('getDOBforAgeFromCurrentTime', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });
  it('should return the maximim date for age', () => {
    //Given
    const mockDate = new Date('2022-03-01');
    jest.setSystemTime(mockDate);
    //When
    const result = getDOBforAgeFromCurrentTime(18);
    //Then
    expect(result).not.toBeNull();

    expect(result.toISOString()).toContain('2004-03-01');
  });
  it('should add month to date provided', () => {
    //Given
    const mockDate = new Date('2023-03-05T00:00:00.000Z');
    //When
    const result = addMonths(mockDate,1);
    //Then
    expect(result).not.toBeNull();
    expect(result.getMonth()).toEqual(3);
  });
});

describe('past 18:00, checkEvidenceUploadTime ', () => {

  beforeEach(() => {
    jest.useFakeTimers()
      .setSystemTime(new Date('2023-01-03T18:00'));
  });

  it('upload from today 17:59 should return true', () => {
    const mockDate = new Date('2023-01-03T17:59');
    const result = checkEvidenceUploadTime(mockDate);
    expect(result).toBeTruthy();
  });
  it('upload from today 18:00 should return false', () => {
    const mockDate = new Date('2023-01-03T18:00:00');
    const result = checkEvidenceUploadTime(mockDate);
    expect(result).toBeFalsy();
  });
  it('upload from yesterday 18:00 should return true', () => {
    const mockDate = new Date('2023-01-02T18:00:00');
    const result = checkEvidenceUploadTime(mockDate);
    expect(result).toBeTruthy();
  });
  it('upload from yesterday 17:59 should return false', () => {
    const mockDate = new Date('2023-01-02T17:59:59');
    const result = checkEvidenceUploadTime(mockDate);
    expect(result).toBeFalsy();
  });
});

describe('before 18:00, checkEvidenceUploadTime ', () => {
  beforeEach(() => {
    jest.useFakeTimers()
      .setSystemTime(new Date('2023-01-03T17:59:59'));
  });

  it('upload from today 17:59 should return false', () => {
    const mockDate = new Date('2023-01-03T17:59');
    const result = checkEvidenceUploadTime(mockDate);
    expect(result).toBeFalsy();
  });
  it('upload from yesterday 18:00 should return false', () => {
    const mockDate = new Date('2023-01-02T18:00');
    const result = checkEvidenceUploadTime(mockDate);
    expect(result).toBeFalsy();
  });
  it('upload from yesterday 17:59 should return true', () => {
    const mockDate = new Date('2023-01-02T17:59');
    const result = checkEvidenceUploadTime(mockDate);
    expect(result).toBeTruthy();
  });
  it('upload from day before yesterday 17:59 should return false', () => {
    const mockDate = new Date('2023-01-01T17:59');
    const result = checkEvidenceUploadTime(mockDate);
    expect(result).toBeFalsy();
  });
  it('upload from day before yesterday 18:00 should return true', () => {
    const mockDate = new Date('2023-01-01T18:00');
    const result = checkEvidenceUploadTime(mockDate);
    expect(result).toBeTruthy();
  });

});

describe('formatStringDateDMY', () => {
  it('date should be formatted in format: day as 2 digits, month as 3 letters, year as 4 digits', () => {
    const mockDate = new Date('2023-01-01T17:59');
    const result = formatStringDateDMY(mockDate);
    expect(result).toStrictEqual('01 Jan 2023');
  });
});

describe('formatStringTimeHMS', () => {
  it('if hour is a single digit, it should be displayed as such', () => {
    const mockDate = new Date('2023-01-01T07:59:02');
    const result = formatStringTimeHMS(mockDate);
    expect(result).toStrictEqual('7:59:02 AM');
  });

  it('before noon, time should be formatted as hours:minutes:seconds AM', () => {
    const mockDate = new Date('2023-01-01T11:59:59');
    const result = formatStringTimeHMS(mockDate);
    expect(result).toStrictEqual('11:59:59 AM');
  });

  it('from noon onwards, time should be formatted as hours:minutes:seconds PM', () => {
    const mockDate = new Date('2023-01-01T12:00:00');
    const result = formatStringTimeHMS(mockDate);
    expect(result).toStrictEqual('12:00:00 PM');
  });
});

describe('isDateOnOrAfterSpecificDate', () => {
  it('should return false when date is before specified date', () => {
    const date = new Date('2023-01-01T17:59');
    const specifiedDate = new Date('2024-01-01T17:59');
    const result = isDateOnOrAfterSpecificDate(date, specifiedDate);
    expect(result).toBe(false);
  });

  it('should return true when date is on specified date', () => {
    const date = new Date('2023-01-01T17:59');
    const specifiedDate = new Date('2023-01-01T17:59');
    const result = isDateOnOrAfterSpecificDate(date, specifiedDate);
    expect(result).toBe(true);
  });

  it('should return true when date is after specified date', () => {
    const date = new Date('2023-02-01T17:59');
    const specifiedDate = new Date('2023-01-01T17:59');
    const result = isDateOnOrAfterSpecificDate(date, specifiedDate);
    expect(result).toBe(true);
  });
});

describe('dateTimeFormat', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('should correctly format a UTC date in GMT to English full date and time', () => {
    jest.setSystemTime(new Date('2024-01-01T12:00:00.000Z'));
    const utcDateString = '2024-01-01T12:00:00.000Z';
    const formattedDate = dateTimeFormat(utcDateString, 'en',true);

    expect(formattedDate).toBe('1 January 2024, 12:00:00 pm');
  });

  test('should correctly format a UTC date in BST to English full date and time', () => {
    jest.setSystemTime(new Date('2024-07-01T12:00:00.000Z'));
    const utcDateString = '2024-07-01T12:00:00.000Z';
    const formattedDate = dateTimeFormat(utcDateString, 'en',true);

    expect(formattedDate).toBe('1 July 2024, 1:00:00 pm');
  });

  test('should correctly format a GMT date in GMT to English full date and time', () => {
    jest.setSystemTime(new Date('2024-01-01T12:00:00.000Z'));
    const utcDateString = '2024-01-01T12:00:00.483971';
    const formattedDate = dateTimeFormat(utcDateString);

    expect(formattedDate).toBe('1 January 2024, 12:00:00 pm');
  });

  test('should correctly format a BST date in BST to English full date and time', () => {
    jest.setSystemTime(new Date('2024-07-03T12:00:00.000Z'));
    const dateString = '2024-07-01T13:00:00.483971';
    const formattedDate = dateTimeFormat(dateString);

    expect(formattedDate).toBe('1 July 2024, 1:00:00 pm');
  });

  test('should correctly format a UTC date in GMT to Welsh full date and time', () => {
    jest.setSystemTime(new Date('2024-01-01T12:00:00.000Z'));
    const utcDateString = '2024-01-01T12:00:00.000Z';
    const formattedDate = dateTimeFormat(utcDateString, 'cy', true);

    expect(formattedDate).toBe('1 Ionawr 2024, 12:00:00 PM');
  });

  test('should correctly format a UTC date in BST to Welsh full date and time', () => {
    jest.setSystemTime(new Date('2024-07-01T12:00:00.000Z'));
    const utcDateString = '2024-07-01T12:00:00.000Z';
    const formattedDate = dateTimeFormat(utcDateString, 'cy', true);

    expect(formattedDate).toBe('1 Gorffennaf 2024, 1:00:00 PM');
  });

  test('should correctly format a GMT date in GMT to Welsh full date and time', () => {
    jest.setSystemTime(new Date('2024-01-01T12:00:00.000Z'));
    const dateString = '2024-01-01T12:00:00.483971';
    const formattedDate = dateTimeFormat(dateString, 'cy');

    expect(formattedDate).toBe('1 Ionawr 2024, 12:00:00 PM');
  });

  test('should correctly format a BST date in BST to Welsh full date and time', () => {
    jest.setSystemTime(new Date('2024-07-01T12:00:00.000Z'));
    const dateString = '2024-07-01T13:00:00.483971';
    const formattedDate = dateTimeFormat(dateString, 'cy');

    expect(formattedDate).toBe('1 Gorffennaf 2024, 1:00:00 PM');
  });
});
