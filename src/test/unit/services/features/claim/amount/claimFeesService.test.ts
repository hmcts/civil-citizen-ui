import * as draftStoreService from '../../../../../../main/modules/draft-store/draftStoreService';
import {Claim} from 'models/claim';
import {saveClaimFee} from 'services/features/claim/amount/claimFeesService';

jest.mock('../../../../../../main/modules/draft-store');
jest.mock('../../../../../../main/modules/draft-store/draftStoreService');

const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;

describe('claim fee  service', () => {
  it('should get claim fee ', async () => {
    //Given
    const claim = new Claim();
    claim.claimAmountBreakup = [{value: {claimAmount: '200', claimReason: 'just because'}}];
    mockGetCaseData.mockImplementation(async () => {
      return claim;
    });
    //When
    const claimFee = await saveClaimFee('123',111);
    //Then
    expect(claimFee).toBeUndefined();
  });

});
