import {Request, Response, NextFunction} from 'express';
import {getResponseClaimById} from 'modules/draft-store/response/responseDraftStoreService';
import {RESPONSE_TASK_LIST_URL} from 'routes/urls';
import {Claim} from 'models/claim';
import {PartAdmitGuard} from 'routes/guards/partAdmitGuard';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';

jest.mock('modules/draft-store/response/responseDraftStoreService');

const CLAIM_ID = '123';
const redirectUrl = constructResponseUrlWithIdParams(CLAIM_ID, RESPONSE_TASK_LIST_URL);

const mockGetResponseClaimById = getResponseClaimById as jest.Mock;
const MOCK_REQUEST = {params: {id: CLAIM_ID}} as unknown as Request;
const MOCK_RESPONSE = {redirect: jest.fn()} as unknown as Response;
const MOCK_NEXT = jest.fn() as NextFunction;

describe('Response - PartAdmitGuard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call next when partial admission payment amount is greater than zero', async () => {
    const claim = new Claim();
    claim.partialAdmission = {
      howMuchDoYouOwe: {
        amount: 100,
      },
    };
    mockGetResponseClaimById.mockResolvedValue(claim);

    await PartAdmitGuard.apply(RESPONSE_TASK_LIST_URL)(MOCK_REQUEST, MOCK_RESPONSE, MOCK_NEXT);

    expect(mockGetResponseClaimById).toHaveBeenCalledWith(MOCK_REQUEST, CLAIM_ID);
    expect(MOCK_NEXT).toHaveBeenCalledWith();
    expect(MOCK_RESPONSE.redirect).not.toHaveBeenCalled();
  });

  it('should redirect to task list when partial admission payment amount is missing', async () => {
    mockGetResponseClaimById.mockResolvedValue(new Claim());

    await PartAdmitGuard.apply(RESPONSE_TASK_LIST_URL)(MOCK_REQUEST, MOCK_RESPONSE, MOCK_NEXT);

    expect(MOCK_RESPONSE.redirect).toHaveBeenCalledWith(redirectUrl);
    expect(MOCK_NEXT).not.toHaveBeenCalled();
  });

  it('should redirect to task list when partial admission payment amount is zero', async () => {
    const claim = new Claim();
    claim.partialAdmission = {
      howMuchDoYouOwe: {
        amount: 0,
      },
    };
    mockGetResponseClaimById.mockResolvedValue(claim);

    await PartAdmitGuard.apply(RESPONSE_TASK_LIST_URL)(MOCK_REQUEST, MOCK_RESPONSE, MOCK_NEXT);

    expect(MOCK_RESPONSE.redirect).toHaveBeenCalledWith(redirectUrl);
    expect(MOCK_NEXT).not.toHaveBeenCalled();
  });

  it('should call next with error when getResponseClaimById throws', async () => {
    const error = new Error('draft fetch failed');
    mockGetResponseClaimById.mockRejectedValue(error);

    await PartAdmitGuard.apply(RESPONSE_TASK_LIST_URL)(MOCK_REQUEST, MOCK_RESPONSE, MOCK_NEXT);

    expect(MOCK_NEXT).toHaveBeenCalledWith(error);
  });
});
