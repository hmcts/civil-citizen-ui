import {Claim} from 'common/models/claim';
import {NextFunction, Request, Response} from 'express';
import {responseSubmitDateGuard} from 'routes/guards/responseSubmitDateGuard';
import CivilClaimResponseMock from '../../../utils/mocks/civilClaimResponseMock.json';
import nock from 'nock';
import {CaseRole} from 'form/models/caseRoles';

const MOCK_REQUEST = { params: { id: '123' } } as unknown as Request;
const MOCK_RESPONSE = { redirect: jest.fn() } as unknown as Response;
const MOCK_NEXT = jest.fn() as NextFunction;

describe('Response Submit Date Guard', () => {
  it('should redirect to the dashboard if response submit date is not set', async () => {
    nock('http://localhost:4000')
      .get('/cases/123')
      .reply(200, new Claim());

    await responseSubmitDateGuard(MOCK_REQUEST, MOCK_RESPONSE, MOCK_NEXT);
    expect(MOCK_NEXT).not.toHaveBeenCalled();
  });

  it('should call next if response submit date is set', async () => {
    nock('http://localhost:4000')
      .get('/cases/123/userCaseRoles')
      .reply(200, [CaseRole.APPLICANTSOLICITORONE]);

    nock('http://localhost:4000')
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
