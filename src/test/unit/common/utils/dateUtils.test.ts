import {
  addFiveDaysBefore4pm,
  addMonths, checkEvidenceUploadTime,
  getDOBforAgeFromCurrentTime,
} from '../../../../main/common/utils/dateUtils';

describe('addFiveDaysBefore4pm', () => {
  it('should add 5 days to date if hour is before 4pm', () => {
    //Given
    const date = new Date('2023-01-05');
    date.setHours(10, 0, 0, 0);
    const resultDate = new Date('2023-01-10');
    resultDate.setHours(10, 0, 0, 0);
    //When
    const result = addFiveDaysBefore4pm(date);
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
    const result = addFiveDaysBefore4pm(date);
    //Then
    expect(result.getDate()).toBe(resultDate.getDate());
  });
});

describe('getDOBforAgeFromCurrentTime', () => {
  it('should return the maximim date for age', () => {
    //Given
    const mockDate = new Date('2022-03-01');
    const spy = jest
      .spyOn(global, 'Date')
      .mockImplementation(() => mockDate);
    //When
    const result = getDOBforAgeFromCurrentTime(18);
    //Then
    expect(result).not.toBeNull();
    expect(spy).toBeCalled();
    expect(result.toISOString()).toContain('2004-03-01');
  });
  it('should add month to date provided', () => {
    //Given
    const mockDate = new Date('2023-02-05T00:00:00.000Z');
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
