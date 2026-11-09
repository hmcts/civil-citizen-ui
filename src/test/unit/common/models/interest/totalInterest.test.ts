import {validate} from 'class-validator';
import {TotalInterest} from 'common/form/models/interest/totalInterest';

describe('TotalInterest', () => {
  it('should validate a positive interest amount', async () => {
    const totalInterest = new TotalInterest('1.50', 'This is a test reason');

    const errors = await validate(totalInterest);

    expect(errors.length).toBe(0);
  });

  it('should reject a negative interest amount', async () => {
    const totalInterest = new TotalInterest('-5', 'This is a test reason');

    const errors = await validate(totalInterest);

    expect(errors.length).toBe(1);
    expect(errors[0].property).toBe('amount');
    expect(errors[0].constraints).toEqual(expect.objectContaining({
      min: 'ERRORS.VALID_INTEREST_AMOUNT',
    }));
  });

  it('should reject when interest amount is missing', async () => {
    const totalInterest = new TotalInterest('', 'This is a test reason');

    const errors = await validate(totalInterest);

    expect(errors.length).toBe(1);
    expect(errors[0].property).toBe('amount');
    expect(errors[0].constraints).toEqual(expect.objectContaining({
      isDefined: 'ERRORS.TOTAL_INTEREST_AMOUNT_REQUIRED',
    }));
  });
});
