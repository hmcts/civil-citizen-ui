import {Claim} from 'models/claim';
import {deleteFieldDraftClaimFromStore} from 'modules/draft-store/draftStoreService';
import {cancelMediationDocumentUpload} from 'services/features/mediation/uploadDocuments/mediationCancelUploadService';

jest.mock('modules/draft-store/draftStoreService', () => ({
  deleteFieldDraftClaimFromStore: jest.fn(),
}));

describe('cancelMediationDocumentUpload', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('forwards the mediation draft field and supplied identity to the deletion helper', async () => {
    const claim = new Claim();
    const removeDraftField = jest.mocked(deleteFieldDraftClaimFromStore).mockResolvedValueOnce(undefined);

    await cancelMediationDocumentUpload('user-1:claim-123', claim, 'user-1');

    expect(removeDraftField).toHaveBeenCalledTimes(1);
    expect(removeDraftField).toHaveBeenCalledWith('user-1:claim-123', claim, 'mediationUploadDocuments', 'user-1');
    expect(removeDraftField.mock.calls[0][1]).toBe(claim);
  });
});
