import {Request, Response} from 'express';
import helpWithFeesReferenceEligibilityController from '../../../../../../main/routes/features/public/eligibility/helpWithFeesReferenceEligibilityController';
import {
  ELIGIBILITY_HWF_ELIGIBLE_REFERENCE_URL,
  ELIGIBILITY_HWF_ELIGIBLE_URL,
} from '../../../../../../main/routes/urls';
import {YesNo} from '../../../../../../main/common/form/models/yesNo';
import {GenericForm} from '../../../../../../main/common/form/models/genericForm';
import {createMockResponse, getRouteHandler} from '../../../../../utils/getRouteHandler';

describe('Help With Fees Reference Controller', () => {
  const getHandler = getRouteHandler(helpWithFeesReferenceEligibilityController, 'get');
  const postHandler = getRouteHandler(helpWithFeesReferenceEligibilityController, 'post');
  const viewPath = 'features/public/eligibility/help-with-fees-reference';
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
        pageTitle: 'PAGES.ELIGIBILITY_HWF_REFERENCE.PAGE_TITLE',
      }));
      expect((res.render as jest.Mock).mock.calls[0][1].form).toBeInstanceOf(GenericForm);
    });

    it('should pre-populate the form from the eligibility cookie', () => {
      req.cookies = {eligibility: {hwfReference: YesNo.YES}};

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

    it('should redirect to hwf eligible when no is selected', () => {
      req.body = {option: YesNo.NO};

      postHandler(req as Request, res as unknown as Response, jest.fn());

      expect(res.redirect).toHaveBeenCalledWith(ELIGIBILITY_HWF_ELIGIBLE_URL);
    });

    it('should redirect to hwf eligible reference when yes is selected and preserve cookie values', () => {
      req.cookies = {eligibility: {foo: 'blah'}};
      req.body = {option: YesNo.YES};

      postHandler(req as Request, res as unknown as Response, jest.fn());

      expect(res.cookie).toHaveBeenCalledWith(
        'eligibility',
        {foo: 'blah', hwfReference: YesNo.YES},
        {httpOnly: true, sameSite: 'lax'},
      );
      expect(res.redirect).toHaveBeenCalledWith(ELIGIBILITY_HWF_ELIGIBLE_REFERENCE_URL);
    });
  });
});
