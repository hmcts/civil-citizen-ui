import {AmountBreakdown} from 'common/form/models/claim/amount/amountBreakdown';
import {MAX_CLAIM_AMOUNT_TOTAL} from '../../../../../../main/common/form/validators/validationConstraints';

describe('AmountBreakdown', () => {
  it('should return false when the total amount is greater than the maximum', async () => {
    //Given
    const amountBreakdown = new AmountBreakdown([], MAX_CLAIM_AMOUNT_TOTAL + 1);

    //When
    const result = amountBreakdown.isValidTotal();
  
    //Then
    expect(result).toBeFalsy();
  });

  it('should return undefined when value is false', async () => {
    //Given
    const value: any = false;

    //When
    const result = AmountBreakdown.fromObject(value);

    //Then
    expect(result).toBeUndefined();
  });
});

