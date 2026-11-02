import {Response} from 'express';
import ageEligibilityController from 'routes/features/response/ageEligibility/ageEligibilityController';
import {AGE_ELIGIBILITY_URL} from 'routes/urls';
import {AppRequest} from 'models/AppRequest';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../../utils/getRouteHandler';

const viewPath = 'features/response/ageEligibility/under-18';

describe('Under 18 Contact court', () => {
  it('should render the under 18 page', async () => {
    const res = createMockResponse();
    const next = jest.fn();

    await getRouteHandler(ageEligibilityController, 'get', AGE_ELIGIBILITY_URL)(
      {
        params: {},
        body: {},
        query: {},
        cookies: {},
        session: createMockSession(),
      } as unknown as AppRequest,
      res as unknown as Response,
      next,
    );

    expect(res.render).toHaveBeenCalledWith(viewPath);
    expect(next).not.toHaveBeenCalled();
  });
});
