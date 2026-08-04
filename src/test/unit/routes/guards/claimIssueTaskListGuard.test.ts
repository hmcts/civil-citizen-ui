import {Claim} from 'models/claim';
import {AppRequest} from 'common/models/AppRequest';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {app} from '../../../../main/app';
import request from 'supertest';
import {
  BASE_ELIGIBILITY_URL,
  CLAIMANT_TASK_LIST_URL,
} from 'routes/urls';
import config from 'config';
import nock from 'nock';
import {t} from 'i18next';
import {CivilServiceClient} from 'client/civilServiceClient';
import {claimIssueTaskListGuard} from 'routes/guards/claimIssueTaskListGuard';
import {NextFunction, Request, Response} from 'express';

jest.mock('../../../../main/modules/oidc');
jest.mock('../../../../main/modules/draft-store');
jest.mock('../../../../main/modules/draft-store/draftStoreService');

const mockGetCaseData = getCaseDataFromStore as jest.Mock;

describe('Claim Issue TaskList Guard', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    jest.resetAllMocks();
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });
  it('should redirect if claim not exists and eligibility not completed', async () => {
    //Given
    mockGetCaseData.mockImplementation(async () => new Claim());
    app.request.cookies = {};
    //When
    const res = await request(app).get(CLAIMANT_TASK_LIST_URL).send();
    //Then
    expect(res.status).toBe(302);
    expect(res.header.location).toBe(BASE_ELIGIBILITY_URL);
  });

  it('should access to claim/task-list page when claim exist', async () => {
    //Given
    const mockClaim = new Claim();
    mockClaim.draftClaimCreatedAt = new Date();
    mockGetCaseData.mockImplementation(async () => mockClaim);
    //When
    const res = await request(app).get(CLAIMANT_TASK_LIST_URL).send();
    //Then
    expect(res.status).toBe(200);
    expect(res.text).toContain(t('PAGES.CLAIM_TASK_LIST.PAGE_TITLE'));
  });
  it('should access to claim/task-list  page when eligibility questions completed', async () => {
    //Given
    mockGetCaseData.mockImplementation(async () => new Claim());
    app.request.cookies = {eligibilityCompleted: true};
    jest.spyOn(CivilServiceClient.prototype, 'createDashboard').mockReturnValue(null);

    //When
    const res = await request(app).get(CLAIMANT_TASK_LIST_URL).send();
    //Then
    expect(res.status).toBe(200);
    expect(res.text).toContain(t('PAGES.CLAIM_TASK_LIST.PAGE_TITLE'));
  });
  it('should access to claim/task-list page when eligibility question completed and claim exist', async () => {
    //Given
    const mockClaim = new Claim();
    mockClaim.draftClaimCreatedAt = new Date();
    mockGetCaseData.mockImplementation(async () => mockClaim);
    app.request.cookies = {eligibilityCompleted: true};
    //When
    const res = await request(app).get(CLAIMANT_TASK_LIST_URL).send();
    //Then
    expect(res.status).toBe(200);
    expect(res.text).toContain(t('PAGES.CLAIM_TASK_LIST.PAGE_TITLE'));
  });

  it('should stash claim on req.locals when next is called', async () => {
    //Given
    const mockClaim = new Claim();
    mockClaim.draftClaimCreatedAt = new Date();
    mockGetCaseData.mockImplementation(async () => mockClaim);
    const mockRequest = {
      session: {user: {id: 'user-1'}},
      originalUrl: '/claim/check-answers',
      cookies: {},
    } as unknown as Request;
    const mockResponse = {redirect: jest.fn()} as unknown as Response;
    const mockNext = jest.fn() as NextFunction;
    //When
    await claimIssueTaskListGuard(mockRequest, mockResponse, mockNext);
    //Then
    expect(mockNext).toHaveBeenCalled();
    expect((<AppRequest>mockRequest).locals.claim).toBe(mockClaim);
  });
});
