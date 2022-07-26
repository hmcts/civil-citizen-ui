import {DateConverter} from '../../../../main/common/utils/dateConverter';


describe('Convert to valid Date', () => {
  it('should convert to valid date successfully with valid input', () => {
    //Given
    const day = '1';
    const month = '2';
    const year = '2021';
    //When
    const result = DateConverter.convertToDate(year, month, day);
    //Then
    expect(result).not.toBeNull();
  });

  it('should convert to date with leap year date', () => {
    //Given
    const day = '29';
    const month = '2';
    const year = '2024';
    const convertedDate = new Date(year + '-' + month + '-' + day);
    //When
    const result = DateConverter.convertToDate(year, month, day);
    //Then
    expect(result).not.toBeNull();
    expect(result).toEqual(convertedDate);
  });

  it('should not convert to date with invalid input', () => {
    //Given
    const day = '1';
    const month = 'abc';
    const year = '2021';
    //When
    const result = DateConverter.convertToDate(year, month, day);
    //Then
    expect(result.toDateString()).toBe('Invalid Date');
  });

  it('should not convert to date with non-leap year date', () => {
    //Given
    const day = '29';
    const month = '2';
    const year = '2025';
    //When
    const result = DateConverter.convertToDate(year, month, day);
    //Then
    expect(result.toDateString()).toBe('Invalid Date');
  });

  

});
