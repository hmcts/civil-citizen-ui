import {Request, Response, NextFunction} from 'express';
import {Claim} from 'models/claim';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {trialArrangementsGuard} from 'routes/guards/caseProgression/trialArragement/trialArrangementsGuard';
import {Party} from 'models/party';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../../main/modules/draft-store');

const mockGetCaseData = getCaseDataFromStore as jest.Mock;

const MOCK_REQUEST = { params: { id: '123' } } as unknown as Request;
const MOCK_RESPONSE = { redirect: jest.fn() } as unknown as Response;
const MOCK_NEXT = jest.fn() as NextFunction;

describe('Trial Arrangement guard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should redirect to next screen with fast track claim', async () => {
    //Given
    const mockClaim = new Claim();
    mockClaim.applicant1 = new Party();
    mockClaim.totalClaimAmount = 15000;
    mockGetCaseData.mockImplementation(async () => mockClaim);
    //When
    await trialArrangementsGuard(MOCK_REQUEST, MOCK_RESPONSE, MOCK_NEXT);

    //Then
    expect(MOCK_NEXT).toHaveBeenCalled();

  });

  it('should redirect not call next screen with small claim', async () => {
    //Given
    const mockClaim = new Claim();
    mockClaim.applicant1 = new Party();
    mockClaim.totalClaimAmount = 1000;
    mockGetCaseData.mockImplementation(async () => mockClaim);
    //When
    await trialArrangementsGuard(MOCK_REQUEST, MOCK_RESPONSE, MOCK_NEXT);
    //Then
    expect(MOCK_NEXT).not.toHaveBeenCalled();
  });
});
