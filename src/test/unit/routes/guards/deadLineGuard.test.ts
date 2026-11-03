import {Request, Response, NextFunction} from 'express';
import {AdditionalTimeOptions} from 'form/models/additionalTime';
import {ResponseDeadline, ResponseOptions} from 'form/models/responseDeadline';
import {Claim} from 'models/claim';
import {AppRequest} from 'common/models/AppRequest';
import {getResponseClaimById} from 'modules/draft-store/response/responseDraftStoreService';
import {deadLineGuard} from 'routes/guards/deadLineGuard';

jest.mock('modules/draft-store/response/responseDraftStoreService');

const mockGetResponseClaimById = getResponseClaimById as jest.Mock;

const MOCK_REQUEST = {params: {id: '123'}} as unknown as Request;
const MOCK_RESPONSE = {redirect: jest.fn()} as unknown as Response;
const MOCK_NEXT = jest.fn() as NextFunction;

describe('Deadline Guard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should respond unauthorized when isTaskComplete && isDeadlineExtended', async () => {
    const mockClaim = new Claim();
    mockClaim.responseDeadline = new ResponseDeadline();
    mockClaim.responseDeadline.option = ResponseOptions.ALREADY_AGREED;
    mockClaim.respondentSolicitor1AgreedDeadlineExtension = new Date();
    mockGetResponseClaimById.mockResolvedValue(mockClaim);

    await deadLineGuard(MOCK_REQUEST, MOCK_RESPONSE, MOCK_NEXT);

    expect(MOCK_NEXT).not.toHaveBeenCalled();
  });

  it('should respond unauthorized when isDeadlinePassed && isTaskComplete && isMoreThan28Days', async () => {
    const mockClaim = new Claim();
    mockClaim.respondent1ResponseDeadline = new Date('2022-01-01');
    mockClaim.responseDeadline = new ResponseDeadline();
    mockClaim.responseDeadline.option = ResponseOptions.YES;
    mockClaim.responseDeadline.additionalTime = AdditionalTimeOptions.MORE_THAN_28_DAYS;
    mockGetResponseClaimById.mockResolvedValue(mockClaim);

    await deadLineGuard(MOCK_REQUEST, MOCK_RESPONSE, MOCK_NEXT);

    expect(MOCK_NEXT).not.toHaveBeenCalled();
  });

  it('should respond unauthorized when isDeadlinePassed && isTaskComplete && isRequestRefused', async () => {
    const mockClaim = new Claim();
    mockClaim.respondent1ResponseDeadline = new Date('2022-01-01');
    mockClaim.responseDeadline = new ResponseDeadline();
    mockClaim.responseDeadline.option = ResponseOptions.REQUEST_REFUSED;
    mockGetResponseClaimById.mockResolvedValue(mockClaim);

    await deadLineGuard(MOCK_REQUEST, MOCK_RESPONSE, MOCK_NEXT);

    expect(MOCK_NEXT).not.toHaveBeenCalled();
  });

  it('should respond unauthorized when isDeadlinePassed && isTaskComplete && isResponseNo', async () => {
    const mockClaim = new Claim();
    mockClaim.respondent1ResponseDeadline = new Date('2022-01-01');
    mockClaim.responseDeadline = new ResponseDeadline();
    mockClaim.responseDeadline.option = ResponseOptions.NO;
    mockGetResponseClaimById.mockResolvedValue(mockClaim);

    await deadLineGuard(MOCK_REQUEST, MOCK_RESPONSE, MOCK_NEXT);

    expect(MOCK_NEXT).not.toHaveBeenCalled();
  });

  it('should respond unauthorized when isDeadlinePassed && !isTaskComplete', async () => {
    const mockClaim = new Claim();
    mockClaim.respondent1ResponseDeadline = new Date('2022-01-01');
    mockGetResponseClaimById.mockResolvedValue(mockClaim);

    await deadLineGuard(MOCK_REQUEST, MOCK_RESPONSE, MOCK_NEXT);

    expect(MOCK_NEXT).not.toHaveBeenCalled();
  });

  it('should respond authorized', async () => {
    const mockClaim = new Claim();
    const mockRequest = {params: {id: '123'}} as unknown as Request;
    mockGetResponseClaimById.mockResolvedValue(mockClaim);

    await deadLineGuard(mockRequest, MOCK_RESPONSE, MOCK_NEXT);

    expect(MOCK_NEXT).toHaveBeenCalled();
    expect(mockGetResponseClaimById).toHaveBeenCalledWith(mockRequest, '123');
    expect((<AppRequest>mockRequest).locals.claim).toBe(mockClaim);
  });
});
