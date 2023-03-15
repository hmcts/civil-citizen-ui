import {DateOfBirth} from '../../../../../main/common/models/claimantResponse/ccj/dateOfBirth';

describe('DateOfBirth', () => {  
  const params = {
    year: '1990',
    month: '01',
    day: '01',
  };
  it('should initialise the DateOfBirth instance with correct values', async () => {
    // Given
    const expectedDateOfBirth = new Date('1990-01-01');

    // When
    const dob = new DateOfBirth(params);

    // Then
    expect(dob.dateOfBirth).toEqual(expectedDateOfBirth);
    expect(dob.year).toEqual(1990);
    expect(dob.month).toEqual(1);
    expect(dob.day).toEqual(1);
  });
});

