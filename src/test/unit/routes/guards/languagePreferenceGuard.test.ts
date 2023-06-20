import {ClaimBilingualLanguagePreference} from 'common/models/claimBilingualLanguagePreference';
import {Request, Response, NextFunction} from 'express';
import {Claim} from 'models/claim';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {languagePreferenceGuard} from 'routes/guards/languagePreferenceGuard';

jest.mock('../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../main/modules/draft-store');

const mockGetCaseData = getCaseDataFromStore as jest.Mock;

const MOCK_REQUEST = { params: { id: '123' } } as unknown as Request;
const MOCK_RESPONSE = { redirect: jest.fn() } as unknown as Response;
const MOCK_NEXT = jest.fn() as NextFunction;

describe('Language Preference Guard', () => {
  it('should access to lagunage preference page', async () => {
    //Given
    const mockClaim = new Claim();
    mockGetCaseData.mockImplementation(async () => mockClaim);
    //When
    await languagePreferenceGuard(MOCK_REQUEST, MOCK_RESPONSE, MOCK_NEXT);
    //Then
    expect(MOCK_NEXT).toHaveBeenCalled();
  });
  it('should redirect if language preference already set', async () => {
    //Given
    const mockClaim = new Claim();
    mockClaim.claimBilingualLanguagePreference = ClaimBilingualLanguagePreference.WELSH_AND_ENGLISH;
    mockGetCaseData.mockImplementation(async () => mockClaim);
    //When
    await languagePreferenceGuard(MOCK_REQUEST, MOCK_RESPONSE, MOCK_NEXT);
    //Then
    expect(MOCK_RESPONSE.redirect).toHaveBeenCalled();
  });
});
