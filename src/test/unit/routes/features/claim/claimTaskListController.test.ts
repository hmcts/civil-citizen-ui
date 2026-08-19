import {Response} from 'express';
import claimTaskListController from '../../../../../main/routes/features/claim/claimTaskListController';
import {getDraftClaim, createOrLoadDraft} from 'modules/draft-store/draftStoreManagerService';
import {Claim} from 'models/claim';
import {CivilServiceClient} from 'client/civilServiceClient';
import {AppRequest} from 'models/AppRequest';
import {CivilClaimResponse} from 'models/civilClaimResponse';
import {DraftClaimManagerResult} from 'models/draft/draftClaim';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../utils/getRouteHandler';

jest.mock('modules/draft-store/draftStoreManagerService');

const mockGetDraftClaim = getDraftClaim as jest.Mock;
const mockCreateOrLoadDraft = createOrLoadDraft as jest.Mock;

const createMockManagerResult = (claim: Claim, isNew = false): DraftClaimManagerResult => ({
  claimResponse: {
    id: '123',
    case_data: claim as unknown as Claim,
  } as unknown as CivilClaimResponse,
  rawResponse: {
    draftId: 'draft-123',
    payload: claim,
  } as unknown as DraftClaimManagerResult['rawResponse'],
  isNew,
  createdAt: '2026-08-01T10:00:00.000Z',
  updatedAt: '2026-08-01T11:00:00.000Z',
  expiresAt: '2026-09-01T10:00:00.000Z',
});

describe('Claim TaskList page', () => {
  const getHandler = getRouteHandler(claimTaskListController, 'get');
  const viewPath = 'features/claim/task-list';
  let req: Partial<AppRequest>;
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;
  let createDashboardSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      session: createMockSession({user: {id: 'user-id'}}),
      query: {},
      cookies: {},
    };
    res = createMockResponse();
    next = jest.fn();
    createDashboardSpy = jest.spyOn(CivilServiceClient.prototype, 'createDashboard')
      .mockResolvedValue(undefined as never);
  });

  it('should render claim task list with an existing draft claim', async () => {
    const claim = new Claim();
    claim.draftClaimCreatedAt = new Date();
    claim.draftClaimCacheTtlDays = 30;
    mockGetDraftClaim.mockResolvedValue(createMockManagerResult(claim));

    await getHandler(req as AppRequest, res as unknown as Response, next);

    expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
      pageTitle: 'PAGES.CLAIM_TASK_LIST.PAGE_TITLE',
      draftClaimDeletionDate: expect.anything(),
    }));
    expect(mockCreateOrLoadDraft).not.toHaveBeenCalled();
    expect(createDashboardSpy).not.toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it('should create a new draft claim when the store has no draft', async () => {
    const newClaim = new Claim();
    newClaim.draftClaimCreatedAt = new Date();
    newClaim.draftClaimCacheTtlDays = 30;
    mockGetDraftClaim.mockResolvedValue(null);
    mockCreateOrLoadDraft.mockResolvedValue(createMockManagerResult(newClaim, true));

    await getHandler(req as AppRequest, res as unknown as Response, next);

    expect(mockCreateOrLoadDraft).toHaveBeenCalled();
    expect(createDashboardSpy).toHaveBeenCalled();
    expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
      pageTitle: 'PAGES.CLAIM_TASK_LIST.PAGE_TITLE',
    }));
  });

  it('should call next when loading the claim fails', async () => {
    const error = new Error('error');
    mockGetDraftClaim.mockRejectedValue(error);

    await getHandler(req as AppRequest, res as unknown as Response, next);

    expect(next).toHaveBeenCalledWith(error);
    expect(res.render).not.toHaveBeenCalled();
  });
});
