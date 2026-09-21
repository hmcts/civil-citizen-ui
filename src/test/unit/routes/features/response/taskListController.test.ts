import {Response} from 'express';
import taskListController from '../../../../../main/routes/features/response/taskListController';
import {getClaimById} from 'modules/utilityService';
import {setResponseDeadline} from 'services/features/common/responseDeadlineAgreedService';
import * as taskListService from 'services/features/common/taskListService';
import * as launchDarklyClient from '../../../../../main/app/auth/launchdarkly/launchDarklyClient';
import {Claim} from 'models/claim';
import {AppRequest} from 'models/AppRequest';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../utils/getRouteHandler';

jest.mock('modules/utilityService', () => ({
  getClaimById: jest.fn(),
}));
jest.mock('services/features/common/responseDeadlineAgreedService', () => ({
  setResponseDeadline: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('../../../../../main/app/auth/launchdarkly/launchDarklyClient');

describe('Response task list', () => {
  const getHandler = getRouteHandler(taskListController, 'get');
  const viewPath = 'features/response/task-list';
  const claimId = '1645882162449409';
  const submittedDate = new Date('2024-01-02T00:00:00.000Z');
  let req: Partial<AppRequest>;
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;
  const mockGetClaimById = getClaimById as jest.Mock;
  const isCarmEnabledForCase = launchDarklyClient.isCarmEnabledForCase as jest.Mock;
  const isMintiEnabledForCase = launchDarklyClient.isMintiEnabledForCase as jest.Mock;

  const buildClaim = (): Claim => {
    const claim = new Claim();
    claim.id = claimId;
    claim.submittedDate = submittedDate;
    claim.legacyCaseReference = '000MC001';
    jest.spyOn(claim, 'formattedResponseDeadline').mockReturnValue('15 May 2050');
    jest.spyOn(claim, 'getDocumentDetails').mockReturnValue(undefined);
    return claim;
  };

  beforeEach(() => {
    req = {
      params: {id: claimId},
      query: {lang: 'en'},
      cookies: {},
      session: createMockSession(),
    };
    res = createMockResponse();
    next = jest.fn();
    mockGetClaimById.mockResolvedValue(buildClaim());
    isCarmEnabledForCase.mockResolvedValue(true);
    isMintiEnabledForCase.mockResolvedValue(true);
    (setResponseDeadline as jest.Mock).mockResolvedValue(undefined);
    jest.spyOn(taskListService, 'getTaskLists').mockReturnValue([]);
    jest.spyOn(taskListService, 'getTitle').mockReturnValue('Respond to a money claim');
    jest.spyOn(taskListService, 'getDescription').mockReturnValue('');
  });

  it('should render the task list', async () => {
    await getHandler(req as AppRequest, res as unknown as Response, next);

    expect(setResponseDeadline).toHaveBeenCalled();
    expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
      responseDeadline: '15 May 2050',
      claim: expect.objectContaining({legacyCaseReference: '000MC001'}),
    }));
    expect(req.session.claimId).toBe(claimId);
  });

  it('should pass carm and minti flags to getTaskLists', async () => {
    isCarmEnabledForCase.mockResolvedValue(false);
    isMintiEnabledForCase.mockResolvedValue(false);

    await getHandler(req as AppRequest, res as unknown as Response, next);

    expect(isCarmEnabledForCase).toHaveBeenCalledWith(submittedDate);
    expect(isMintiEnabledForCase).toHaveBeenCalledWith(submittedDate);
    expect(taskListService.getTaskLists).toHaveBeenCalledWith(expect.any(Claim), claimId, 'en', false, false);
  });

  it('should call next when loading the claim fails', async () => {
    const error = new Error('redis failure');
    mockGetClaimById.mockRejectedValue(error);

    await getHandler(req as AppRequest, res as unknown as Response, next);

    expect(next).toHaveBeenCalledWith(error);
  });
});
