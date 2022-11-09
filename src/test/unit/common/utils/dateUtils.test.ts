import {getDOBforAgeFromCurrentTime} from '../../../../main/common/utils/dateUtils';

describe('getDOBforAgeFromCurrentTime', () => {
  it('should return the maximim date for age', () => {
    //Given
    const mockDate = new Date('2022-03-01T11:57:10.592492') as unknown as string;
    const spy = jest
      .spyOn(global, 'Date')
      .mockImplementation(() => mockDate);
    //When
    const result = getDOBforAgeFromCurrentTime(18);
    //Then
    expect(result).not.toBeNull();
    expect(spy).toBeCalled();
    expect(result.toISOString()).toEqual('2004-03-01T11:57:10.592Z');
  });
});
