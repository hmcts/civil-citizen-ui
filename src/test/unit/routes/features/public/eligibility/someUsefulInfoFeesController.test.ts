import {Request, Response} from 'express';
import someUsefulInfoFeesController from '../../../../../../main/routes/features/public/eligibility/someUsefulInfoFeesController';
import {
  ELIGIBILITY_APPLY_HELP_FEES_URL,
  ELIGIBILITY_HELP_WITH_FEES_URL,
} from '../../../../../../main/routes/urls';
import {YesNo} from '../../../../../../main/common/form/models/yesNo';
import {GenericForm} from '../../../../../../main/common/form/models/genericForm';
import {createMockResponse, getRouteHandler} from '../../../../../utils/getRouteHandler';

describe('Some useful information about Help with Fees Controller', () => {
  const getHandler = getRouteHandler(someUsefulInfoFeesController, 'get');
  const postHandler = getRouteHandler(someUsefulInfoFeesController, 'post');
  const viewPath = 'features/public/eligibility/some-useful-info-fees';
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
        pageTitle: 'PAGES.ELIGIBILITY_USEFUL_INFO_FEES.TITLE',
      }));
      expect((res.render as jest.Mock).mock.calls[0][1].form).toBeInstanceOf(GenericForm);
    });

    it('should pre-populate the form from the eligibility cookie', () => {
      req.cookies = {eligibility: {someUsefulInfoFees: YesNo.YES}};

      getHandler(req as Request, res as unknown as Response, jest.fn());

      expect((res.render as jest.Mock).mock.calls[0][1].form.model.option).toBe(YesNo.YES);
    });
  });

  describe('on POST', () => {
    it('should re-render when no option is selected', () => {
      postHandler(req as Request, res as unknown as Response, jest.fn());

      expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
      expect(res.redirect).not.toHaveBeenCalled();
    });

    it('should redirect to apply help fees when yes is selected', () => {
      req.body = {option: YesNo.YES};

      postHandler(req as Request, res as unknown as Response, jest.fn());

      expect(res.redirect).toHaveBeenCalledWith(ELIGIBILITY_APPLY_HELP_FEES_URL);
    });

    it('should redirect to help with fees when no is selected and preserve cookie values', () => {
      req.cookies = {eligibility: {foo: 'blah'}};
      req.body = {option: YesNo.NO};

      postHandler(req as Request, res as unknown as Response, jest.fn());

      expect(res.cookie).toHaveBeenCalledWith(
        'eligibility',
        {foo: 'blah', someUsefulInfoFees: YesNo.NO},
        {httpOnly: true, sameSite: 'lax'},
      );
      expect(res.redirect).toHaveBeenCalledWith(ELIGIBILITY_HELP_WITH_FEES_URL);
    });
  });
});
