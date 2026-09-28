import {Request, Response} from 'express';
import applyForHelpWithFeesController from '../../../../../../main/routes/features/public/eligibility/applyForHelpWithFeesController';
import {ELIGIBILITY_HELP_WITH_FEES_REFERENCE_URL} from '../../../../../../main/routes/urls';
import {createMockResponse, getRouteHandler} from '../../../../../utils/getRouteHandler';

describe('Apply for Help With Fees Controller', () => {
  const getHandler = getRouteHandler(applyForHelpWithFeesController, 'get');
  const postHandler = getRouteHandler(applyForHelpWithFeesController, 'post');
  let req: Partial<Request>;
  let res: ReturnType<typeof createMockResponse>;

  beforeEach(() => {
    req = {cookies: {}, body: {}, query: {}};
    res = createMockResponse();
  });

  describe('on GET', () => {
    it('should render Apply For Help With Fees page', () => {
      getHandler(req as Request, res as unknown as Response, jest.fn());

      expect(res.render).toHaveBeenCalledWith(
        'features/public/eligibility/apply-for-help-with-fees',
        {pageTitle: 'PAGES.ELIGIBILITY_APPLY_FOR_HELP_WITH_FEES.TITLE'},
      );
    });
  });

  describe('on POST', () => {
    it('should redirect to Help With Fees Reference page', () => {
      postHandler(req as Request, res as unknown as Response, jest.fn());

      expect(res.redirect).toHaveBeenCalledWith(ELIGIBILITY_HELP_WITH_FEES_REFERENCE_URL);
    });
  });
});
