import {Request, Response} from 'express';
import claimTypeController from '../../../../../../main/routes/features/public/eligibility/claimTypeController';
import {NotEligibleReason} from '../../../../../../main/common/form/models/eligibility/NotEligibleReason';
import {ClaimTypeOptions} from '../../../../../../main/common/models/eligibility/claimTypeOptions';
import {constructUrlWithNotEligibleReason} from '../../../../../../main/common/utils/urlFormatter';
import {
  NOT_ELIGIBLE_FOR_THIS_SERVICE_URL,
  ELIGIBILITY_CLAIMANT_ADDRESS_URL,
} from '../../../../../../main/routes/urls';
import {GenericForm} from '../../../../../../main/common/form/models/genericForm';
import {createMockResponse, getRouteHandler} from '../../../../../utils/getRouteHandler';

describe('Claim Type Controller', () => {
  const getHandler = getRouteHandler(claimTypeController, 'get');
  const postHandler = getRouteHandler(claimTypeController, 'post');
  const viewPath = 'features/public/eligibility/claim-type';
  let req: Partial<Request>;
  let res: ReturnType<typeof createMockResponse>;

  beforeEach(() => {
    req = {cookies: {}, body: {}, query: {}};
    res = createMockResponse();
  });

  describe('on GET', () => {
    it('should render the claim type page', () => {
      getHandler(req as Request, res as unknown as Response, jest.fn());

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        pageTitle: 'PAGES.ELIGIBILITY_CLAIM_TYPE.TITLE',
      }));
      expect((res.render as jest.Mock).mock.calls[0][1].form).toBeInstanceOf(GenericForm);
    });

    it('should pre-populate the form from the eligibility cookie', () => {
      req.cookies = {eligibility: {claimType: ClaimTypeOptions.JUST_MYSELF}};

      getHandler(req as Request, res as unknown as Response, jest.fn());

      expect((res.render as jest.Mock).mock.calls[0][1].form.model.option).toBe(ClaimTypeOptions.JUST_MYSELF);
    });
  });

  describe('on POST', () => {
    it('should re-render when claim type is not selected', async () => {
      await postHandler(req as Request, res as unknown as Response, jest.fn());

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({form: expect.any(GenericForm)}));
      expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
      expect(res.redirect).not.toHaveBeenCalled();
    });

    it('should redirect to not eligible for more than one person or organisation', async () => {
      req.body = {claimType: ClaimTypeOptions.MORE_THAN_ONE_PERSON_OR_ORGANISATION};

      await postHandler(req as Request, res as unknown as Response, jest.fn());

      expect(res.redirect).toHaveBeenCalledWith(
        constructUrlWithNotEligibleReason(NOT_ELIGIBLE_FOR_THIS_SERVICE_URL, NotEligibleReason.MULTIPLE_CLAIMANTS),
      );
    });

    it('should redirect to claimant address for just myself and preserve cookie values', async () => {
      req.cookies = {eligibility: {foo: 'blah'}};
      req.body = {claimType: ClaimTypeOptions.JUST_MYSELF};

      await postHandler(req as Request, res as unknown as Response, jest.fn());

      expect(res.cookie).toHaveBeenCalledWith(
        'eligibility',
        {foo: 'blah', claimType: ClaimTypeOptions.JUST_MYSELF},
        {httpOnly: true, sameSite: 'lax'},
      );
      expect(res.redirect).toHaveBeenCalledWith(ELIGIBILITY_CLAIMANT_ADDRESS_URL);
    });

    it('should redirect to not eligible when claiming on behalf of a client', async () => {
      req.body = {claimType: ClaimTypeOptions.A_CLIENT};

      await postHandler(req as Request, res as unknown as Response, jest.fn());

      expect(res.redirect).toHaveBeenCalledWith(
        constructUrlWithNotEligibleReason(NOT_ELIGIBLE_FOR_THIS_SERVICE_URL, NotEligibleReason.CLAIM_ON_BEHALF),
      );
    });
  });
});
