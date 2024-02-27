import {NextFunction, Request, Response} from 'express';
import {responseSubmitDateGuard} from 'routes/guards/responseSubmitDateGuard';
import CivilClaimResponseMock from '../../../utils/mocks/civilClaimResponseMock.json';
import nock from 'nock';
import {CaseRole} from 'form/models/caseRoles';
import {CivilClaimResponse} from 'models/civilClaimResponse';
import config from 'config';

const MOCK_REQUEST = { params: { id: '123' } } as unknown as Request;
const MOCK_RESPONSE = { redirect: jest.fn() } as unknown as Response;
const MOCK_NEXT = jest.fn() as NextFunction;
const citizenBaseUrl: string = config.get('services.civilService.url');

describe('Response Submit Date Guard', () => {
  it('should redirect to the dashboard if response submit date is not set', async () => {
    nock(citizenBaseUrl)
      .get('/cases/123/userCaseRoles')
      .reply(200, [CaseRole.APPLICANTSOLICITORONE]);

    const claimFromService = new CivilClaimResponse('123', {});
    nock(citizenBaseUrl)
      .get('/cases/123')
      .reply(200, claimFromService);

    await responseSubmitDateGuard(MOCK_REQUEST, MOCK_RESPONSE, MOCK_NEXT);
    expect(MOCK_NEXT).not.toHaveBeenCalled();
  });

  it('should call next if response submit date is set', async () => {
    nock(citizenBaseUrl)
      .get('/cases/123/userCaseRoles')
      .reply(200, [CaseRole.APPLICANTSOLICITORONE]);

    nock(citizenBaseUrl)
      .get('/cases/123')
      .reply(200, CivilClaimResponseMock);

    await responseSubmitDateGuard(MOCK_REQUEST, MOCK_RESPONSE, MOCK_NEXT);
    expect(MOCK_NEXT).toHaveBeenCalled();
  });

  it('should catch an error', async () => {
    await responseSubmitDateGuard(null, MOCK_RESPONSE, MOCK_NEXT);
    expect(MOCK_NEXT).toHaveBeenCalled();
  });
});
