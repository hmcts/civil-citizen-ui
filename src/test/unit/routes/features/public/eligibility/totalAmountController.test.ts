import {Request, Response} from 'express';
import totalAmountController from '../../../../../../main/routes/features/public/eligibility/totalAmountController';
import {NotEligibleReason} from '../../../../../../main/common/form/models/eligibility/NotEligibleReason';
import {TotalAmountOptions} from '../../../../../../main/common/models/eligibility/totalAmountOptions';
import {constructUrlWithNotEligibleReason} from '../../../../../../main/common/utils/urlFormatter';
import {
  NOT_ELIGIBLE_FOR_THIS_SERVICE_URL,
  ELIGIBILITY_SINGLE_DEFENDANT_URL,
} from '../../../../../../main/routes/urls';
import {GenericForm} from '../../../../../../main/common/form/models/genericForm';
import {createMockResponse, getRouteHandler} from '../../../../../utils/getRouteHandler';

describe('Total Amount Eligibility Controller', () => {
  const getHandler = getRouteHandler(totalAmountController, 'get');
  const postHandler = getRouteHandler(totalAmountController, 'post');
  const viewPath = 'features/public/eligibility/total-amount';
  let req: Partial<Request>;
  let res: ReturnType<typeof createMockResponse>;

  beforeEach(() => {
    req = {cookies: {}, body: {}, query: {}};
    res = createMockResponse();
  });

  describe('on GET', () => {
    it('should render the total amount page', () => {
      getHandler(req as Request, res as unknown as Response, jest.fn());

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        pageTitle: 'PAGES.ELIGIBILITY_TOTAL_AMOUNT.TITLE',
      }));
      expect((res.render as jest.Mock).mock.calls[0][1].form).toBeInstanceOf(GenericForm);
    });
  });

  describe('on POST', () => {
    it('should re-render when total amount is not selected', async () => {
      await postHandler(req as Request, res as unknown as Response, jest.fn());

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({pageTitle: 'PAGES.ELIGIBILITY_TOTAL_AMOUNT.TITLE'}));
      expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
      expect(res.redirect).not.toHaveBeenCalled();
    });

    it('should redirect to not eligible when over 25000 is selected', async () => {
      req.body = {totalAmount: TotalAmountOptions.OVER_25000};

      await postHandler(req as Request, res as unknown as Response, jest.fn());

      expect(res.cookie).toHaveBeenCalledWith('eligibility', {totalAmount: TotalAmountOptions.OVER_25000}, {httpOnly: true, sameSite: 'lax'});
      expect(res.redirect).toHaveBeenCalledWith(
        constructUrlWithNotEligibleReason(NOT_ELIGIBLE_FOR_THIS_SERVICE_URL, NotEligibleReason.CLAIM_VALUE_OVER_25000),
      );
    });

    it('should redirect to single defendant when less than 25000 is selected', async () => {
      req.body = {totalAmount: TotalAmountOptions.LESS_25000};

      await postHandler(req as Request, res as unknown as Response, jest.fn());

      expect(res.redirect).toHaveBeenCalledWith(ELIGIBILITY_SINGLE_DEFENDANT_URL);
    });

    it('should redirect to not eligible when amount is unknown', async () => {
      req.body = {totalAmount: TotalAmountOptions.UNKNOWN};

      await postHandler(req as Request, res as unknown as Response, jest.fn());

      expect(res.redirect).toHaveBeenCalledWith(
        constructUrlWithNotEligibleReason(NOT_ELIGIBLE_FOR_THIS_SERVICE_URL, NotEligibleReason.CLAIM_VALUE_NOT_KNOWN),
      );
    });
  });
});
