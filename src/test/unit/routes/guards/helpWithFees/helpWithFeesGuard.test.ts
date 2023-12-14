import {NextFunction, Request, Response} from 'express';
import {Claim} from 'models/claim';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {trialArrangementsGuard} from 'routes/guards/caseProgression/trialArragement/trialArrangementsGuard';
import {Party} from 'models/party';
import {FeeType} from 'form/models/helpWithFees/feeType';
import {helpWithFeesGuard} from 'routes/guards/helpWithFees/helpWithFeesGuard';

jest.mock('../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../main/modules/draft-store');

const mockGetCaseData = getCaseDataFromStore as jest.Mock;

const MOCK_REQUEST = { params: { id: '123' } } as unknown as Request;
const MOCK_RESPONSE = { redirect: jest.fn() } as unknown as Response;
const MOCK_NEXT = jest.fn() as NextFunction;

describe('Help With Fees Guard guard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should allow to be directed if fee type is populated', async () => {
    //Given
    const mockClaim = new Claim();
    mockClaim.feeTypeHelpRequested = FeeType.HEARING;
    mockGetCaseData.mockImplementation(async () => mockClaim);
    //When
    await helpWithFeesGuard(MOCK_REQUEST, MOCK_RESPONSE, MOCK_NEXT);

    //Then
    expect(MOCK_NEXT).toHaveBeenCalled();

  });

  it('should not allow direction if fee type is not populated', async () => {
    //Given
    const mockClaim = new Claim();
    mockClaim.applicant1 = new Party();
    mockGetCaseData.mockImplementation(async () => mockClaim);
    //When
    await trialArrangementsGuard(MOCK_REQUEST, MOCK_RESPONSE, MOCK_NEXT);
    //Then
    expect(MOCK_NEXT).not.toHaveBeenCalled();
  });
});
