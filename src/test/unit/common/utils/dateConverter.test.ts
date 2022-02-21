import {DateConverter} from '../../../../main/common/utils/dateConverter';


describe('Convert to valid Date', () => {
  it('should convert to valid date successfully with valid input', () => {
    //Given
    const date = '1';
    const month = '2';
    const year = '2021';
    //When
    const result = DateConverter.convertToDate(year, month, date);
    //Then
    expect(result).not.toBeNull();
    expect(result?.toString()).toBe('Mon Feb 01 2021 00:00:00 GMT+0000 (Greenwich Mean Time)');
  });

  it('should not convert to date with invalid input', () => {
    //Given
    const date = '1';
    const month = '22';
    const year = '2021';
    //When
    const result = DateConverter.convertToDate(year, month, date);
    //Then
    expect(result).toBeNull();
  });

});
