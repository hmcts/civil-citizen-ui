import {Response} from 'express';
import resolvingThisDisputeController from '../../../../../main/routes/features/claim/resolvingThisDisputeController';
import {CLAIMANT_TASK_LIST_URL} from 'routes/urls';
import {AppRequest} from 'models/AppRequest';
import {saveResolvingDispute} from 'services/features/claim/resolvingDisputeService';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../utils/getRouteHandler';

jest.mock('services/features/claim/resolvingDisputeService', () => ({
  saveResolvingDispute: jest.fn(),
}));

describe('Resolving Dispute', () => {
  const getHandler = getRouteHandler(resolvingThisDisputeController, 'get');
  const postHandler = getRouteHandler(resolvingThisDisputeController, 'post');
  const viewPath = 'features/claim/resolving-this-dispute';
  let req: Partial<AppRequest>;
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;

  beforeEach(() => {
    req = {
      session: createMockSession({user: {id: 'user-id'}}),
      body: {},
      query: {},
      cookies: {},
    };
    res = createMockResponse();
    next = jest.fn();
    (saveResolvingDispute as jest.Mock).mockResolvedValue(undefined);
  });

  describe('on GET', () => {
    it('should render resolving dispute page', async () => {
      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        pageTitle: 'PAGES.CLAIM_JOURNEY.RESOLVE_THE_DISPUTE.PAGE_TITLE',
      }));
    });
  });

  describe('on POST', () => {
    it('should redirect to task list', async () => {
      postHandler(req as AppRequest, res as unknown as Response, next);
      await new Promise((resolve) => setImmediate(resolve));

      expect(saveResolvingDispute).toHaveBeenCalledWith('user-id');
      expect(res.redirect).toHaveBeenCalledWith(CLAIMANT_TASK_LIST_URL);
    });

    it('should call next when saveResolvingDispute fails', async () => {
      const error = new Error('error');
      (saveResolvingDispute as jest.Mock).mockRejectedValue(error);

      postHandler(req as AppRequest, res as unknown as Response, next);
      await new Promise((resolve) => setImmediate(resolve));

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
