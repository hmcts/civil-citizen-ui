import {Response} from 'express';
import ageEligibilityController from '../../../../../../main/routes/features/response/ageEligibility/ageEligibilityController';
import {AppRequest} from 'models/AppRequest';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../../utils/getRouteHandler';

describe('Under 18 Contact court', () => {
  const getHandler = getRouteHandler(ageEligibilityController, 'get');
  const viewPath = 'features/response/ageEligibility/under-18';
  let req: Partial<AppRequest>;
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;

  beforeEach(() => {
    req = {
      params: {id: 'claim-id'},
      session: createMockSession({user: {id: 'user-id'}}),
      query: {},
      cookies: {},
    };
    res = createMockResponse();
    next = jest.fn();
  });

  describe('on GET', () => {
    it('should render under 18 contact court page', () => {
      getHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath);
    });
  });
});
