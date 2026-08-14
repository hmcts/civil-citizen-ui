import {Claim} from 'models/claim';
import {AppRequest} from 'common/models/AppRequest';
import {getDraftClaim, createOrLoadDraft} from 'modules/draft-store/draftStoreManagerService';
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
jest.mock('../../../../main/modules/draft-store/draftStoreManagerService');

const mockGetDraftClaim = getDraftClaim as jest.Mock;
const mockCreateOrLoadDraft = createOrLoadDraft as jest.Mock;

describe('Claim Issue TaskList Guard', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    jest.resetAllMocks();
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateOrLoadDraft.mockResolvedValue({
      claimResponse: {case_data: {}},
      createdAt: '2026-08-14T10:00:00.000Z',
      rawResponse: {draftId: 'draft-123'},
      isNew: true,
    });
  });

  it('should redirect to eligibility if claim is not a draft and eligibility cookie is missing not', async () => {
    //Given
    mockGetDraftClaim.mockResolvedValue(null);
    app.request.cookies = {};
    //When
    const res = await request(app).get(CLAIMANT_TASK_LIST_URL).send();
    //Then
    expect(res.status).toBe(302);
    expect(res.header.location).toBe(BASE_ELIGIBILITY_URL);
  });

  it('should grant access to claim/task-list page when draft claim exist and map draftClaimCreatedAt', async () => {
    //Given
    const mockCreatedAt = '2026-08-14T10:00:00.000Z';
    mockGetDraftClaim.mockResolvedValue({
      claimResponse: {case_data: {}},
      createdAt: mockCreatedAt,
      rawResponse: {draftId: 'draft-123'},
      isNew: false,
    });

    //When
    const res = await request(app).get(CLAIMANT_TASK_LIST_URL).send();
    //Then
    expect(res.status).toBe(200);
    expect(res.text).toContain(t('PAGES.CLAIM_TASK_LIST.PAGE_TITLE'));
  });

  it('should grant access to claim/task-list page when eligibility questions are completed', async () => {
    //Given
    mockGetDraftClaim.mockResolvedValue(null);
    app.request.cookies = {eligibilityCompleted: true};
    jest.spyOn(CivilServiceClient.prototype, 'createDashboard').mockReturnValue(null);

    //When
    const res = await request(app).get(CLAIMANT_TASK_LIST_URL).send();
    //Then
    expect(res.status).toBe(200);
    expect(res.text).toContain(t('PAGES.CLAIM_TASK_LIST.PAGE_TITLE'));
  });

  it('should grant access to claim/task-list page when both eligibility cookie exists and draft claim exist', async () => {
    //Given
    mockGetDraftClaim.mockResolvedValue({
      claimResponse: {case_data: {}},
      createdAt: new Date().toISOString(),
      rawResponse: {draftId: 'draft-123'},
      isNew: false,
    });
    app.request.cookies = {eligibilityCompleted: 'true'};
    //When
    const res = await request(app).get(CLAIMANT_TASK_LIST_URL).send();
    //Then
    expect(res.status).toBe(200);
    expect(res.text).toContain(t('PAGES.CLAIM_TASK_LIST.PAGE_TITLE'));
  });

  it('should stash claim on req.locals, store draftId on session, and call next()', async () => {
    //Given
    const mockCreatedAt = '2026-08-14T12:00:00.000Z';
    const mockDraftId = 'draft-456';

    mockGetDraftClaim.mockResolvedValue({
      claimResponse: {case_data: {id: 'claim-123'}},
      createdAt: mockCreatedAt,
      rawResponse: {draftId: mockDraftId},
      isNew: false,
    });

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

    const appReq = mockRequest as AppRequest;
    expect(appReq.session.draftId).toBe(mockDraftId);

    const stashedClaim = appReq.locals.claim;
    expect(stashedClaim).toBeInstanceOf(Claim);
    expect(stashedClaim.draftClaimCreatedAt).toEqual(new Date(mockCreatedAt));
    expect(stashedClaim.isDraftClaim()).toBe(true);

  });
});
