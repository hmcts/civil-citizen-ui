import {Response} from 'express';
import claimTaskListController from '../../../../../main/routes/features/claim/claimTaskListController';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {Claim} from 'models/claim';
import {CivilServiceClient} from 'client/civilServiceClient';
import {AppRequest} from 'models/AppRequest';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../utils/getRouteHandler';

jest.mock('modules/draft-store/draftStoreService');

describe('Claim TaskList page', () => {
  const getHandler = getRouteHandler(claimTaskListController, 'get');
  const viewPath = 'features/claim/task-list';
  let req: Partial<AppRequest>;
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;
  const createDraftClaimSpy = jest.spyOn(draftStoreService, 'createDraftClaimInStoreWithExpiryTime');

  beforeEach(() => {
    req = {
      session: createMockSession({user: {id: 'user-id'}}),
      query: {},
      cookies: {},
    };
    res = createMockResponse();
    next = jest.fn();
    createDraftClaimSpy.mockResolvedValue(undefined);
    jest.spyOn(CivilServiceClient.prototype, 'createDashboard').mockResolvedValue(undefined as never);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should render claim task list with an existing draft claim', async () => {
    const claim = new Claim();
    claim.draftClaimCreatedAt = new Date();
    claim.draftClaimCacheTtlDays = 30;
    (getCaseDataFromStore as jest.Mock).mockResolvedValue(claim);

    await getHandler(req as AppRequest, res as unknown as Response, next);

    expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
      pageTitle: 'PAGES.CLAIM_TASK_LIST.PAGE_TITLE',
      draftClaimDeletionDate: expect.anything(),
    }));
    expect(createDraftClaimSpy).not.toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it('should create a new draft claim when the store has no draft', async () => {
    const emptyClaim = new Claim();
    const draftClaim = new Claim();
    draftClaim.draftClaimCreatedAt = new Date();
    draftClaim.draftClaimCacheTtlDays = 30;
    (getCaseDataFromStore as jest.Mock)
      .mockResolvedValueOnce(emptyClaim)
      .mockResolvedValueOnce(draftClaim);

    await getHandler(req as AppRequest, res as unknown as Response, next);

    expect(createDraftClaimSpy).toHaveBeenCalledWith('user-id');
    expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
      pageTitle: 'PAGES.CLAIM_TASK_LIST.PAGE_TITLE',
    }));
  });

  it('should call next when loading the claim fails', async () => {
    const error = new Error('error');
    (getCaseDataFromStore as jest.Mock).mockRejectedValue(error);

    await getHandler(req as AppRequest, res as unknown as Response, next);

    expect(next).toHaveBeenCalledWith(error);
    expect(res.render).not.toHaveBeenCalled();
  });
});
