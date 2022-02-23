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
  it('should return true when age is 18', ()=> {
    //Given
    const dob = calculateDobForAge(18);
    //When
    const result = AgeEligibilityVerification.isOverEighteen(dob);
    //Then
    expect(result).toBeTruthy();
  });
  it('should return false when a day before 18th birthday', ()=>{
    //Given
    const dobADayBeforeBirthday = calculateDobForAge(18, new Date().getDate()+1);
    //When
    const result = AgeEligibilityVerification.isOverEighteen(dobADayBeforeBirthday);
    //Then
    expect(result).toBeFalsy();
  });
});

function calculateDobForAge(age: number, day?: number) {
  const currentDate = new Date();
  const dobYear = currentDate.getFullYear() - age;
  return new Date(dobYear,  currentDate.getMonth(), day? day : currentDate.getDate());
}

