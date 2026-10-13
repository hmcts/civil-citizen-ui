import {Request, Response} from 'express';
import tenancyDepositController from '../../../../../../main/routes/features/public/eligibility/tenancyDepositController';
import {
  ELIGIBILITY_GOVERNMENT_DEPARTMENT_URL,
  NOT_ELIGIBLE_FOR_THIS_SERVICE_URL,
} from '../../../../../../main/routes/urls';
import {YesNo} from '../../../../../../main/common/form/models/yesNo';
import {NotEligibleReason} from '../../../../../../main/common/form/models/eligibility/NotEligibleReason';
import {constructUrlWithNotEligibleReason} from '../../../../../../main/common/utils/urlFormatter';
import {GenericForm} from '../../../../../../main/common/form/models/genericForm';
import {createMockResponse, getRouteHandler} from '../../../../../utils/getRouteHandler';

describe('Tenancy Deposit Controller', () => {
  const getHandler = getRouteHandler(tenancyDepositController, 'get');
  const postHandler = getRouteHandler(tenancyDepositController, 'post');
  const viewPath = 'features/public/eligibility/tenancy-deposit';
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
        pageTitle: 'PAGES.TENANCY_DEPOSIT.TITLE',
      }));
      expect((res.render as jest.Mock).mock.calls[0][1].form).toBeInstanceOf(GenericForm);
    });

    it('should pre-populate the form from the eligibility cookie', () => {
      req.cookies = {eligibility: {tenancyDeposit: YesNo.NO}};

      getHandler(req as Request, res as unknown as Response, jest.fn());

      expect((res.render as jest.Mock).mock.calls[0][1].form.model.option).toBe(YesNo.NO);
    });
  });

  describe('on POST', () => {
    it('should re-render when no option is selected', () => {
      postHandler(req as Request, res as unknown as Response, jest.fn());

      expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
      expect(res.redirect).not.toHaveBeenCalled();
    });

    it('should redirect to not eligible when yes is selected', () => {
      req.body = {option: YesNo.YES};

      postHandler(req as Request, res as unknown as Response, jest.fn());

      expect(res.redirect).toHaveBeenCalledWith(
        constructUrlWithNotEligibleReason(NOT_ELIGIBLE_FOR_THIS_SERVICE_URL, NotEligibleReason.CLAIM_IS_FOR_TENANCY_DEPOSIT),
      );
    });

    it('should redirect to government department when no is selected', () => {
      req.cookies = {eligibility: {foo: 'blah'}};
      req.body = {option: YesNo.NO};

      postHandler(req as Request, res as unknown as Response, jest.fn());

      expect(res.cookie).toHaveBeenCalledWith(
        'eligibility',
        {foo: 'blah', tenancyDeposit: YesNo.NO},
        {httpOnly: true, sameSite: 'lax'},
      );
      expect(res.redirect).toHaveBeenCalledWith(ELIGIBILITY_GOVERNMENT_DEPARTMENT_URL);
    });
  });
});
