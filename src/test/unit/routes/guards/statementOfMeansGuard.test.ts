import {Request, Response, NextFunction} from 'express';
import {Claim} from 'models/claim';
import {getResponseClaimById} from 'modules/draft-store/response/responseDraftStoreService';
import {statementOfMeansGuard} from 'routes/guards/statementOfMeansGuard';
import fullAdmitPayBySetDateMock from '../../../utils/mocks/fullAdmitPayBySetDateMock.json';

jest.mock('modules/draft-store/response/responseDraftStoreService');

const mockGetResponseClaimById = getResponseClaimById as jest.Mock;

const MOCK_REQUEST = {params: {id: '123'}} as unknown as Request;
const MOCK_RESPONSE = {redirect: jest.fn()} as unknown as Response;
const MOCK_NEXT = jest.fn() as NextFunction;

describe('Statement of Means Guard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should access to financial details pages', async () => {
    mockGetResponseClaimById.mockResolvedValue(fullAdmitPayBySetDateMock.case_data);

    await statementOfMeansGuard(MOCK_REQUEST, MOCK_RESPONSE, MOCK_NEXT);

    expect(mockGetResponseClaimById).toHaveBeenCalledWith(MOCK_REQUEST, '123');
    expect(MOCK_NEXT).toHaveBeenCalled();
  });

  it('should redirect if response type is not selected yet', async () => {
    mockGetResponseClaimById.mockResolvedValue(new Claim());

    await statementOfMeansGuard(MOCK_REQUEST, MOCK_RESPONSE, MOCK_NEXT);

    expect(MOCK_RESPONSE.redirect).toHaveBeenCalled();
  });
});
