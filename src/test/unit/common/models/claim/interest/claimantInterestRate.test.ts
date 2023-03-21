import {ClaimantInterestRate} from 'common/form/models/claim/interest/claimantInterestRate';
import {validate} from 'class-validator';
import {SameRateInterestType} from 'common/form/models/claimDetails';

describe('ClaimantInterestRate', () => {
  it('should validate the ClaimantInterestRate class', async () => {
    //Given
    const sameRateInterestType = SameRateInterestType.SAME_RATE_INTEREST_DIFFERENT_RATE;
    const differentRate = 1.5;
    const reason = 'This is a test reason';
    const claimantInterestRate = new ClaimantInterestRate(sameRateInterestType, differentRate, reason);

    //When
    const errors = await validate(claimantInterestRate);

    //Then
    expect(errors.length).toBe(0);
  });
});
