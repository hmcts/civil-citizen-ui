import {NextFunction, Request, Response} from 'express';
import {responseSubmitDateGuard} from 'routes/guards/responseSubmitDateGuard';
import CivilClaimResponseMock from '../../../utils/mocks/civilClaimResponseMock.json';
import nock from 'nock';
import {CaseRole} from 'form/models/caseRoles';
import {CivilClaimResponse} from 'models/civilClaimResponse';
import config from 'config';

let mockRequest: Request;
let mockResponse: Response;
let mockNext: NextFunction;
const citizenBaseUrl: string = config.get('services.civilService.url');

describe('Response Submit Date Guard', () => {
  beforeEach(() => {
    // CivilServiceClient caches retrieval on the request, so each test needs a real new request.
    mockRequest = {params: {id: '123'}} as unknown as Request;
    mockResponse = {redirect: jest.fn()} as unknown as Response;
    mockNext = jest.fn();
  });
  afterEach(() => {
    nock.cleanAll();
  });
  it('should redirect to the dashboard if response submit date is not set', async () => {
    nock(citizenBaseUrl)
      .get('/cases/123/userCaseRoles')
      .reply(200, [CaseRole.APPLICANTSOLICITORONE]);

    const claimFromService = new CivilClaimResponse('123', {});
    nock(citizenBaseUrl)
      .get('/cases/123')
      .reply(200, claimFromService);

    await responseSubmitDateGuard(mockRequest, mockResponse, mockNext);
    expect(mockNext).not.toHaveBeenCalled();
    expect(mockResponse.redirect).toHaveBeenCalledWith('/dashboard');
    expect(nock.isDone()).toBe(true);
  });

  it('should call next if response submit date is set', async () => {
    nock(citizenBaseUrl)
      .get('/cases/123/userCaseRoles')
      .reply(200, [CaseRole.APPLICANTSOLICITORONE]);

    nock(citizenBaseUrl)
      .get('/cases/123')
      .reply(200, structuredClone(CivilClaimResponseMock));

    await responseSubmitDateGuard(mockRequest, mockResponse, mockNext);
    expect(mockNext).toHaveBeenCalledTimes(1);
    expect(mockResponse.redirect).not.toHaveBeenCalled();
    expect(nock.isDone()).toBe(true);
  });

  it('should catch an error', async () => {
    await responseSubmitDateGuard(null, mockResponse, mockNext);
    expect(mockNext).toHaveBeenCalledTimes(1);
    expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    expect(mockResponse.redirect).not.toHaveBeenCalled();
  });
});
