import * as draftStoreService from 'modules/draft-store/draftStoreService';
import {Claim} from 'common/models/claim';
import {
  getClaimAmountBreakdownForm, saveClaimAmountBreakdownForm,
} from '../../../../../../main/services/features/claim/amount/claimAmountBreakdownService';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {AmountBreakdown} from 'common/form/models/claim/amount/amountBreakdown';
import {ClaimAmountRow} from 'common/form/models/claim/amount/claimAmountRow';

jest.mock('modules/draft-store');
jest.mock('modules/draft-store/draftStoreService');

const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;

describe('claim amount breakdown service', () => {
  it('should get claim amount breakdown when claim has breakdown', async () => {
    //Given
    const claim = new Claim();
    claim.claimAmountBreakup = [{value: {claimAmount: '200', claimReason: 'just because'}}];
    mockGetCaseData.mockImplementation(async () => {
      return claim;
    });
    //When
    const amountBreakdown = await getClaimAmountBreakdownForm('123');
    //Then
    expect(amountBreakdown.claimAmountRows?.length).toEqual(4);
    expect(amountBreakdown.claimAmountRows[0].amount).toEqual(200);
    expect(amountBreakdown.claimAmountRows[0].reason).toEqual('just because');
  });
  it('should get empty claim amount breakdown when claim does not have breakdown', async () => {
    //Given
    mockGetCaseData.mockImplementation(async () => {
      return new Claim();
    });
    //When
    const amountBreakdown = await getClaimAmountBreakdownForm('123');
    //Then
    expect(amountBreakdown.claimAmountRows?.length).toEqual(4);
    expect(amountBreakdown.claimAmountRows[0].amount).toBeUndefined();
    expect(amountBreakdown.claimAmountRows[0].reason).toBeUndefined();
  });
  it('should throw error when redis throws error', async () => {
    //Given
    mockGetCaseData.mockImplementation(async () => {
      throw new Error(TestMessages.REDIS_FAILURE);
    });
    //Then
    await expect(getClaimAmountBreakdownForm('123')).rejects.toThrow(TestMessages.REDIS_FAILURE);
  });
  it('should save claim amount successfully', async () => {
    //Given
    mockGetCaseData.mockImplementation(async () => {
      return new Claim();
    });
    const form = new AmountBreakdown([new ClaimAmountRow('just because', 200), new ClaimAmountRow()]);
    const spy = jest.spyOn(draftStoreService, 'saveDraftClaim');
    //When
    await saveClaimAmountBreakdownForm('123', form);
    expect(spy).toBeCalled();
  });
  it('should throw exception when redis throws exception', async () => {
    //Given
    mockGetCaseData.mockImplementation(async () => {
      throw new Error(TestMessages.REDIS_FAILURE);
    });
    const form = new AmountBreakdown([new ClaimAmountRow('just because', 200), new ClaimAmountRow()]);
    //Then
    await expect(saveClaimAmountBreakdownForm('123', form)).rejects.toThrow(TestMessages.REDIS_FAILURE);
  });
});
