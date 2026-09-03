import {Request, Response} from 'express';
import claimantResponseTasklistController from '../../../../../main/routes/features/claimantResponse/claimantResponseTasklistController';
import {getClaimById} from 'modules/utilityService';
import {getClaimantResponseTaskLists} from 'services/features/claimantResponse/claimantResponseTasklistService/claimantResponseTasklistService';
import * as taskListService from 'services/features/common/taskListService';
import * as launchDarklyClient from '../../../../../main/app/auth/launchdarkly/launchDarklyClient';
import {Claim} from 'models/claim';
import {createMockResponse, getRouteHandler} from '../../../../utils/getRouteHandler';

jest.mock('modules/utilityService', () => ({
  getClaimById: jest.fn(),
}));
jest.mock('services/features/claimantResponse/claimantResponseTasklistService/claimantResponseTasklistService', () => ({
  getClaimantResponseTaskLists: jest.fn(() => []),
}));
jest.mock('../../../../../main/app/auth/launchdarkly/launchDarklyClient');

describe('Claimant response task list', () => {
  const getHandler = getRouteHandler(claimantResponseTasklistController, 'get');
  const viewPath = 'features/claimantResponse/claimant-response-task-list';
  const claimId = '12345';
  const submittedDate = new Date('2024-01-02T00:00:00.000Z');
  let req: Partial<Request>;
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;
  const mockGetClaimById = getClaimById as jest.Mock;
  const isCarmEnabledForCase = launchDarklyClient.isCarmEnabledForCase as jest.Mock;
  const isMintiEnabledForCase = launchDarklyClient.isMintiEnabledForCase as jest.Mock;
  const mockGetClaimantResponseTaskLists = getClaimantResponseTaskLists as jest.Mock;

  beforeEach(() => {
    req = {
      params: {id: claimId},
      query: {lang: 'en'},
      cookies: {},
      session: {} as Request['session'],
    };
    res = createMockResponse();
    next = jest.fn();
    const claim = new Claim();
    claim.submittedDate = submittedDate;
    mockGetClaimById.mockResolvedValue(claim);
    isCarmEnabledForCase.mockResolvedValue(false);
    isMintiEnabledForCase.mockResolvedValue(false);
    mockGetClaimantResponseTaskLists.mockReturnValue([]);
    jest.spyOn(taskListService, 'getTitle').mockReturnValue('Your response');
    jest.spyOn(taskListService, 'getDescription').mockReturnValue('');
  });

  it('should render the claimant response task list', async () => {
    await getHandler(req as Request, res as unknown as Response, next);

    expect(mockGetClaimantResponseTaskLists).toHaveBeenCalledWith(expect.any(Claim), claimId, 'en', false, false);
    expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
      taskLists: [],
      pageTitle: 'PAGES.CLAIMANT_RESPONSE_TASK_LIST.PAGE_TITLE',
    }));
    expect(req.session.claimId).toBe(claimId);
  });

  it('should pass carm enabled to the task list service', async () => {
    isCarmEnabledForCase.mockResolvedValue(true);

    await getHandler(req as Request, res as unknown as Response, next);

    expect(isCarmEnabledForCase).toHaveBeenCalledWith(submittedDate);
    expect(mockGetClaimantResponseTaskLists).toHaveBeenCalledWith(expect.any(Claim), claimId, 'en', true, false);
  });

  it('should call next when loading the claim fails', async () => {
    const error = new Error('redis failure');
    mockGetClaimById.mockRejectedValue(error);

    await getHandler(req as Request, res as unknown as Response, next);

    expect(next).toHaveBeenCalledWith(error);
  });
});
