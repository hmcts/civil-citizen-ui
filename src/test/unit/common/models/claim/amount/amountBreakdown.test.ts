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

  it('should return undefined when there is no value ', async () => {
    //When
    const result = AmountBreakdown.fromObject(undefined);

    //Then
    expect(result).toBeUndefined();
  });
});

