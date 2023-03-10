import {InterestEndDate} from '../../../../../../src/main/common/form/models/interest/interestEndDate';
import {InterestEndDateType} from '../../../../../../src/main/common/form/models/claimDetails';

describe('InterestEndDate constructor', () => {
  it('should set the option property when option is provided', async () => {
    //Given
    const expectedOption: InterestEndDateType = InterestEndDateType.UNTIL_CLAIM_SUBMIT_DATE;

    //When
    const interestEndDate = new InterestEndDate(expectedOption);

    //Then
    expect(interestEndDate.option).toEqual(expectedOption);
  });

  it('should set the option property to undefined when option is not provided', async () => {
    //When
    const interestEndDate = new InterestEndDate();

    //Then
    expect(interestEndDate.option).toBeUndefined();
  });
});
