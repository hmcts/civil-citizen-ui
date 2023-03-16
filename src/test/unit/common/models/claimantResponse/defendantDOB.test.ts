import {YesNo} from 'common/form/models/yesNo';
import {DefendantDOB} from 'models/claimantResponse/ccj/defendantDOB';
import {DateOfBirth} from 'models/claimantResponse/ccj/dateOfBirth';

describe('DefendantDOB', () => {
  it('should set option and dob when option is Yes', async () => {
    //Given
    const dob = new DateOfBirth({day: '11', month: '05', year: '1980'});

    //When
    const defendantDOB = new DefendantDOB(YesNo.YES, dob);

    //Then
    expect(defendantDOB.option).toEqual(YesNo.YES);
    expect(defendantDOB.dob).toEqual(dob);
  });

  it('should set option and dob to undefined when option is No', async () => {
    //When
    const defendantDOB = new DefendantDOB(YesNo.NO);

    //Then
    expect(defendantDOB.option).toEqual(YesNo.NO);
    expect(defendantDOB.dob).toBeUndefined();
  });
});
