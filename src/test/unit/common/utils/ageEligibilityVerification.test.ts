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
  it('sould return true when age is 18', ()=> {
    //Given
    const dob = calculateDobForAge(18);
    //When
    const result = AgeEligibilityVerification.isOverEighteen(dob);
    //Then
    expect(result).toBeTruthy();
  });
});

function calculateDobForAge(age: number) {
  const currentDate = new Date();
  const dobYear = currentDate.getFullYear() - age;
  return new Date(dobYear, currentDate.getMonth(), currentDate.getDay());
}
