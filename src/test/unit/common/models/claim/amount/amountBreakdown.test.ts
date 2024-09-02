import {AmountBreakdown} from 'common/form/models/claim/amount/amountBreakdown';
import {MAX_CLAIM_AMOUNT_TOTAL} from '../../../../../../main/common/form/validators/validationConstraints';

jest.mock('../../../../../../main/app/auth/launchdarkly/launchDarklyClient');

describe('AmountBreakdown', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return false when the total amount is greater than the maximum - minti toggled off', async () => {
    //Given
    const amountBreakdown = new AmountBreakdown([], MAX_CLAIM_AMOUNT_TOTAL + 1);

    //When
    const result = amountBreakdown.isValidTotal(false);

    //Then
    expect(result).toBeFalsy();
  });

  it('should return true when the total amount is less than the maximum - minti toggled off', async () => {
    //Given
    const amountBreakdown = new AmountBreakdown([], 1000);

    //When
    const result = amountBreakdown.isValidTotal(false);

    //Then
    expect(result).toBe(true);
  });

  it('should return true when the total amount is greater than 25000 - minti toggled on', async () => {
    //Given
    const amountBreakdown = new AmountBreakdown([], MAX_CLAIM_AMOUNT_TOTAL + 1);

    //When
    const result = amountBreakdown.isValidTotal(true);

    //Then
    expect(result).toBe(true);
  });

  it('should return undefined when there is no value ', async () => {
    //When
    const result = AmountBreakdown.fromObject(undefined);

    //Then
    expect(result).toBeUndefined();
  });
});
