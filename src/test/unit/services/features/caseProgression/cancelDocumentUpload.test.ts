import {cancelDocumentUpload} from 'services/features/caseProgression/cancelDocumentUpload';
import {deleteDraftClaimFromStore} from 'modules/draft-store/draftStoreService';

jest.mock('modules/draft-store/draftStoreService', () => ({
  deleteDraftClaimFromStore: jest.fn(),
}));

describe('cancelDocumentUpload', () => {
  it('should call draft store client to remove a claim with provided id and reimport it afresh from ccd', async () => {
    //Given
    const claimId = '1645882162449409';
    //When
    await cancelDocumentUpload(claimId);
    //Then
    expect(deleteDraftClaimFromStore).toBeCalledWith(claimId);
  });
});
