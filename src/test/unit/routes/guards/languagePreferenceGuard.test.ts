import {ClaimBilingualLanguagePreference} from 'common/models/claimBilingualLanguagePreference';
import {Request, Response, NextFunction} from 'express';
import {Claim} from 'models/claim';
import {getResponseClaimById} from 'modules/draft-store/response/responseDraftStoreService';
import {languagePreferenceGuard} from 'routes/guards/languagePreferenceGuard';

jest.mock('modules/draft-store/response/responseDraftStoreService');

const mockGetResponseClaimById = getResponseClaimById as jest.Mock;

const MOCK_REQUEST = { params: { id: '123' } } as unknown as Request;
const MOCK_RESPONSE = { redirect: jest.fn() } as unknown as Response;
const MOCK_NEXT = jest.fn() as NextFunction;

describe('Language Preference Guard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should access to lagunage preference page', async () => {
    //Given
    const mockClaim = new Claim();
    mockGetResponseClaimById.mockResolvedValue(mockClaim);
    //When
    await languagePreferenceGuard(MOCK_REQUEST, MOCK_RESPONSE, MOCK_NEXT);
    //Then
    expect(mockGetResponseClaimById).toHaveBeenCalledWith(MOCK_REQUEST, '123');
    expect(MOCK_NEXT).toHaveBeenCalled();
  });

  it('should redirect if language preference already set', async () => {
    //Given
    const mockClaim = new Claim();
    mockClaim.claimBilingualLanguagePreference = ClaimBilingualLanguagePreference.WELSH_AND_ENGLISH;
    mockGetResponseClaimById.mockResolvedValue(mockClaim);
    //When
    await languagePreferenceGuard(MOCK_REQUEST, MOCK_RESPONSE, MOCK_NEXT);
    //Then
    expect(MOCK_RESPONSE.redirect).toHaveBeenCalled();
  });
});
