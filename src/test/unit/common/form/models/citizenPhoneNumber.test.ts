import {CitizenTelephoneNumber} from '../../../../../main/common/form/models/citizenTelephoneNumber';

describe('Citizen telephone number constructor', () => {
  it('should trim telephone number value when given value has trailing spaces', () => {
    //Given
    const inputWithTrailingSpaces = ' 234234 ';
    //When
    const citizenTelephoneNumber = new CitizenTelephoneNumber(inputWithTrailingSpaces);
    //Then
    const expected = '234234';
    const result = citizenTelephoneNumber.telephoneNumber;
    expect(result).toBe(expected);
  });
});
