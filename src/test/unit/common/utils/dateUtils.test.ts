import {getDOBforAgeFromCurrentTime} from '../../../../main/common/utils/dateUtils';

describe('getDOBforAgeFromCurrentTime', () => {
  it('should return the maximim date for age', () => {
    //Given
    const mockDate = new Date('2022-03-01') as unknown as string;
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
});
