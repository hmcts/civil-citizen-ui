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

  it('should allow a zero interest rate', async () => {
    const claimantInterestRate = new ClaimantInterestRate(
      SameRateInterestType.SAME_RATE_INTEREST_DIFFERENT_RATE,
      0,
      'This is a test reason',
    );

    const errors = await validate(claimantInterestRate);

    expect(errors.length).toBe(0);
  });

  it('should reject a negative interest rate', async () => {
    const claimantInterestRate = new ClaimantInterestRate(
      SameRateInterestType.SAME_RATE_INTEREST_DIFFERENT_RATE,
      -5,
      'This is a test reason',
    );

    const errors = await validate(claimantInterestRate);

    expect(errors.length).toBe(1);
    expect(errors[0].property).toBe('differentRate');
    expect(errors[0].constraints).toEqual({min: 'ERRORS.VALID_INTEREST_RATE'});
  });

  it('should reject when different rate is missing', async () => {
    const claimantInterestRate = new ClaimantInterestRate(
      SameRateInterestType.SAME_RATE_INTEREST_DIFFERENT_RATE,
      undefined,
      'This is a test reason',
    );

    const errors = await validate(claimantInterestRate);

    expect(errors.length).toBe(1);
    expect(errors[0].property).toBe('differentRate');
    expect(errors[0].constraints).toEqual(expect.objectContaining({
      isDefined: 'ERRORS.RATE_CORRECT_THE_ONE_ENTERED',
    }));
  });
});
