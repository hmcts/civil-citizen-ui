import {AgeEligibilityVerification} from '../../../../main/common/utils/ageEligibilityVerification';

describe('Age eligibility is over 18', () =>{
  it('should return true when age is over 18', ()=> {
    //Given
    const dob = new Date('1990-01-01');
    //When
    const result = AgeEligibilityVerification.isOverEighteen(dob);
    //Then
    expect(result).toBeTruthy();
  });
  it('should return false when age is under 18', ()=> {
    //Given
    const dob = new Date('2022-01-01');
    //When
    const result = AgeEligibilityVerification.isOverEighteen(dob);
    //Then
    expect(result).toBeFalsy();
  });
});
