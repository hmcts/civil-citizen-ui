import InterestClaimOption from '../../../../../../../src/main/common/form/models/claim/interest/interestClaimOption';
import {InterestClaimOptionsType} from '../../../../../../../src/main/common/form/models/claim/interest/interestClaimOptionsType';
import {validate} from 'class-validator';

describe('InterestClaimOption', () => {
  it('should validate the InterestClaimOption class with a valid interestType value', async () => {
    //Given
    const validInterestType = InterestClaimOptionsType.SAME_RATE_INTEREST;
    const interestClaimOption = new InterestClaimOption(validInterestType);

    //When
    const errors = await validate(interestClaimOption);

    //Then
    expect(errors.length).toBe(0);
  });

  it('should not validate the InterestClaimOption class with an invalid interestType value', async () => {
    //Given
    const invalidInterestType = 'invalid';
    const interestClaimOption = new InterestClaimOption(invalidInterestType as InterestClaimOptionsType);

    //When
    const errors = await validate(interestClaimOption);

    //Then
    expect(errors.length).toBe(1);
    expect(errors[0].constraints).toHaveProperty('isIn');
  });
});
