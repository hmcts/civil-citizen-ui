import {AmountBreakdown} from 'common/form/models/claim/amount/amountBreakdown';
import {MAX_CLAIM_AMOUNT_TOTAL} from '../../../../../../main/common/form/validators/validationConstraints';
import * as launchDarklyClient from '../../../../../../main/app/auth/launchdarkly/launchDarklyClient';

jest.mock('../../../../../../main/app/auth/launchdarkly/launchDarklyClient');
const mockCheckFlagEnabled = launchDarklyClient.isMintiEnabled as jest.Mock;

describe('AmountBreakdown', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return false when the total amount is greater than the maximum - minti toggled off', async () => {
    //Given
    mockCheckFlagEnabled.mockReturnValue(false);
    const amountBreakdown = new AmountBreakdown([], MAX_CLAIM_AMOUNT_TOTAL + 1);

    //When
    const result = await amountBreakdown.isValidTotal();

    //Then
    expect(result).toBeFalsy();
  });

  it('should return true when the total amount is less than the maximum - minti toggled off', async () => {
    //Given
    mockCheckFlagEnabled.mockReturnValue(false);
    const amountBreakdown = new AmountBreakdown([], 1000);

    //When
    const result = await amountBreakdown.isValidTotal();

    //Then
    expect(result).toBe(true);
  });

  it('should return true when the total amount is greater than the maximum - minti toggled on', async () => {
    //Given
    mockCheckFlagEnabled.mockReturnValue(true);
    const amountBreakdown = new AmountBreakdown([], MAX_CLAIM_AMOUNT_TOTAL + 1);

    //When
    const result = await amountBreakdown.isValidTotal();

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
