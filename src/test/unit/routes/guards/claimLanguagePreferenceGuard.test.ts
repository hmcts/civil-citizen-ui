import {ClaimBilingualLanguagePreference} from 'common/models/claimBilingualLanguagePreference';
import {Response, NextFunction} from 'express';
import {Claim} from 'models/claim';
import {AppRequest} from 'models/AppRequest';
import {getDraftClaim} from 'modules/draft-store/draftStoreManagerService';
import {claimLanguagePreferenceGuard} from 'routes/guards/claimLanguagePreferenceGuard';

jest.mock('../../../../main/modules/draft-store/draftStoreManagerService');
jest.mock('../../../../main/modules/draft-store');

const mockGetDraftClaim = getDraftClaim as jest.Mock;

const MOCK_REQUEST = { params: { id: '123' } } as unknown as AppRequest;
const MOCK_REQUEST_NO_ID = { params: { } } as unknown as AppRequest;

const managerResult = (claim: Claim) => ({
  claimResponse: {case_data: claim},
});

const runGuard = async (req: AppRequest) => {
  claimLanguagePreferenceGuard(req, MOCK_RESPONSE, MOCK_NEXT);
  await new Promise((resolve) => setImmediate(resolve));
};

const MOCK_RESPONSE = { redirect: jest.fn() } as unknown as Response;
const MOCK_NEXT = jest.fn() as NextFunction;

describe('Language Preference Guard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('should access to language preference page', async () => {
    //Given
    mockGetDraftClaim.mockResolvedValue(managerResult(new Claim()));
    //when
    await runGuard(MOCK_REQUEST);
    //then
    expect(MOCK_NEXT).toHaveBeenCalled();
  });

  it('should redirect if language preference already set', async () => {
    //Given
    const mockClaim = new Claim();
    mockClaim.claimantBilingualLanguagePreference = ClaimBilingualLanguagePreference.WELSH_AND_ENGLISH;
    mockGetDraftClaim.mockResolvedValue(managerResult(mockClaim));
    //When
    await runGuard(MOCK_REQUEST);
    //Then
    expect(MOCK_RESPONSE.redirect).toHaveBeenCalled();
  });

  it('should access to language preference page if empty claim', async () => {
    await runGuard(MOCK_REQUEST_NO_ID);
    expect(MOCK_NEXT).toHaveBeenCalled();
    expect(MOCK_RESPONSE.redirect).not.toHaveBeenCalled();
  });

  it('should call next with error when the manager fails', async () => {
    mockGetDraftClaim.mockRejectedValue(new Error('manager failed'));
    await runGuard(MOCK_REQUEST);
    expect(MOCK_NEXT).toHaveBeenCalledWith(expect.any(Error));
  });
});
