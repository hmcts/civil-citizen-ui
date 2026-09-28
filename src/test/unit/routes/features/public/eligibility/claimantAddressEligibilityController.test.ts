import {Request, Response} from 'express';
import claimantAddressEligibilityController from '../../../../../../main/routes/features/public/eligibility/claimantAddressEligibilityController';
import {
  ELIGIBILITY_TENANCY_DEPOSIT_URL,
  NOT_ELIGIBLE_FOR_THIS_SERVICE_URL,
} from '../../../../../../main/routes/urls';
import {YesNo} from '../../../../../../main/common/form/models/yesNo';
import {NotEligibleReason} from '../../../../../../main/common/form/models/eligibility/NotEligibleReason';
import {constructUrlWithNotEligibleReason} from '../../../../../../main/common/utils/urlFormatter';
import {GenericForm} from '../../../../../../main/common/form/models/genericForm';
import {createMockResponse, getRouteHandler} from '../../../../../utils/getRouteHandler';

describe('Claimant Address Eligibility Controller', () => {
  const getHandler = getRouteHandler(claimantAddressEligibilityController, 'get');
  const postHandler = getRouteHandler(claimantAddressEligibilityController, 'post');
  const viewPath = 'features/public/eligibility/claimant-address-eligibility';
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
        pageTitle: 'PAGES.ELIGIBILITY_CLAIMANT_ADDRESS.PAGE_TITLE',
      }));
      expect((res.render as jest.Mock).mock.calls[0][1].form).toBeInstanceOf(GenericForm);
    });

    it('should pre-populate the form from the eligibility cookie', () => {
      req.cookies = {eligibility: {eligibleClaimantAddress: YesNo.YES}};

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

    it('should redirect to tenancy deposit when yes is selected', async () => {
      req.cookies = {eligibility: {foo: 'blah'}};
      req.body = {option: YesNo.YES};

      await postHandler(req as Request, res as unknown as Response, jest.fn());

      expect(res.cookie).toHaveBeenCalledWith(
        'eligibility',
        {foo: 'blah', eligibleClaimantAddress: YesNo.YES},
        {httpOnly: true, sameSite: 'lax'},
      );
      expect(res.redirect).toHaveBeenCalledWith(ELIGIBILITY_TENANCY_DEPOSIT_URL);
    });

    it('should redirect to not eligible when no is selected', async () => {
      req.body = {option: YesNo.NO};

      await postHandler(req as Request, res as unknown as Response, jest.fn());

      expect(res.redirect).toHaveBeenCalledWith(
        constructUrlWithNotEligibleReason(NOT_ELIGIBLE_FOR_THIS_SERVICE_URL, NotEligibleReason.CLAIMANT_ADDRESS),
      );
    });
  });
});
