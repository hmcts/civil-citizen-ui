import {Response} from 'express';
import completingClaimController from '../../../../../main/routes/features/claim/completingClaimController';
import {CLAIMANT_TASK_LIST_URL} from 'routes/urls';
import {AppRequest} from 'models/AppRequest';
import {saveCompletingClaim} from 'services/features/claim/completingClaimService';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../utils/getRouteHandler';

jest.mock('services/features/claim/completingClaimService', () => ({
  saveCompletingClaim: jest.fn(),
}));

describe('Completing Claim', () => {
  const getHandler = getRouteHandler(completingClaimController, 'get');
  const postHandler = getRouteHandler(completingClaimController, 'post');
  const viewPath = 'features/claim/completing-claim';
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
    (saveCompletingClaim as jest.Mock).mockReturnValue(undefined);
  });

  describe('on GET', () => {
    it('should render completing claim page', () => {
      getHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        pageTitle: 'PAGES.COMPLETING_CLAIM.PAGE_TITLE',
      }));
    });
  });

  describe('on POST', () => {
    it('should redirect to task list', async () => {
      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(saveCompletingClaim).toHaveBeenCalledWith('user-id');
      expect(res.redirect).toHaveBeenCalledWith(CLAIMANT_TASK_LIST_URL);
    });

    it('should call next when saveCompletingClaim throws', async () => {
      const error = new Error('error');
      (saveCompletingClaim as jest.Mock).mockImplementation(() => {
        throw error;
      });

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
