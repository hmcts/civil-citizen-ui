import {Request, Response} from 'express';
import helpWithFeesEligibilityController from '../../../../../../main/routes/features/public/eligibility/helpWithFeesEligibilityController';
import {
  ELIGIBILITY_INFORMATION_ABOUT_HELP_WITH_FEES_URL,
  ELIGIBLE_FOR_THIS_SERVICE_URL,
} from '../../../../../../main/routes/urls';
import {YesNo} from '../../../../../../main/common/form/models/yesNo';
import {GenericForm} from '../../../../../../main/common/form/models/genericForm';
import {createMockResponse, getRouteHandler} from '../../../../../utils/getRouteHandler';

describe('Help With Fees Eligibility Controller', () => {
  const getHandler = getRouteHandler(helpWithFeesEligibilityController, 'get');
  const postHandler = getRouteHandler(helpWithFeesEligibilityController, 'post');
  const viewPath = 'features/public/eligibility/help-with-fees';
  let req: Partial<Request>;
  let res: ReturnType<typeof createMockResponse>;

  beforeEach(() => {
    req = {cookies: {}, body: {}, query: {}};
    res = createMockResponse();
  });

  describe('on GET', () => {
    it('should render the page', () => {
      getHandler(req as Request, res as unknown as Response, jest.fn());

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        pageTitle: 'PAGES.ELIGIBILITY_HELP_WITH_FEES.PAGE_TITLE',
      }));
      expect((res.render as jest.Mock).mock.calls[0][1].form).toBeInstanceOf(GenericForm);
    });

    it('should pre-populate the form from the eligibility cookie', () => {
      req.cookies = {eligibility: {eligibleHelpWithFees: YesNo.YES}};

      getHandler(req as Request, res as unknown as Response, jest.fn());

      expect((res.render as jest.Mock).mock.calls[0][1].form.model.option).toBe(YesNo.YES);
    });
  });

  describe('on POST', () => {
    it('should re-render when no option is selected', async () => {
      await postHandler(req as Request, res as unknown as Response, jest.fn());

      expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
      expect(res.redirect).not.toHaveBeenCalled();
    });

    it('should redirect to eligible page when no is selected', async () => {
      req.body = {option: YesNo.NO};

      await postHandler(req as Request, res as unknown as Response, jest.fn());

      expect(res.redirect).toHaveBeenCalledWith(ELIGIBLE_FOR_THIS_SERVICE_URL);
    });

    it('should redirect to information about help with fees when yes is selected', async () => {
      req.cookies = {eligibility: {foo: 'blah'}};
      req.body = {option: YesNo.YES};

      await postHandler(req as Request, res as unknown as Response, jest.fn());

      expect(res.cookie).toHaveBeenCalledWith(
        'eligibility',
        {foo: 'blah', eligibleHelpWithFees: YesNo.YES},
        {httpOnly: true, sameSite: 'lax'},
      );
      expect(res.redirect).toHaveBeenCalledWith(ELIGIBILITY_INFORMATION_ABOUT_HELP_WITH_FEES_URL);
    });
  });
});
