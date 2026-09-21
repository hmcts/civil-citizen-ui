import {Request, Response} from 'express';
import defendantAgeEligibilityController from '../../../../../../main/routes/features/public/eligibility/defendantAgeEligibilityController';
import {
  ELIGIBILITY_CLAIMANT_AGE_URL,
  NOT_ELIGIBLE_FOR_THIS_SERVICE_URL,
} from '../../../../../../main/routes/urls';
import {AgeEligibilityOptions} from '../../../../../../main/common/form/models/eligibility/defendant/AgeEligibilityOptions';
import {NotEligibleReason} from '../../../../../../main/common/form/models/eligibility/NotEligibleReason';
import {constructUrlWithNotEligibleReason} from '../../../../../../main/common/utils/urlFormatter';
import {GenericForm} from '../../../../../../main/common/form/models/genericForm';
import {createMockResponse, getRouteHandler} from '../../../../../utils/getRouteHandler';

describe('Defendant Age Eligibility Controller', () => {
  const getHandler = getRouteHandler(defendantAgeEligibilityController, 'get');
  const postHandler = getRouteHandler(defendantAgeEligibilityController, 'post');
  const viewPath = 'features/public/eligibility/defendant-age';
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
        pageTitle: 'PAGES.ELIGIBILITY_DEFENDANT_AGE.PAGE_TITLE',
      }));
      expect((res.render as jest.Mock).mock.calls[0][1].form).toBeInstanceOf(GenericForm);
    });

    it('should pre-populate the form from the eligibility cookie', () => {
      req.cookies = {eligibility: {eligibilityDefendantAge: AgeEligibilityOptions.YES}};

      getHandler(req as Request, res as unknown as Response, jest.fn());

      expect((res.render as jest.Mock).mock.calls[0][1].form.model.option).toBe(AgeEligibilityOptions.YES);
    });
  });

  describe('on POST', () => {
    it('should re-render when no option is selected', async () => {
      await postHandler(req as Request, res as unknown as Response, jest.fn());

      expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
      expect(res.redirect).not.toHaveBeenCalled();
    });

    it('should redirect to not eligible when defendant is under 18', async () => {
      req.body = {option: AgeEligibilityOptions.NO};

      await postHandler(req as Request, res as unknown as Response, jest.fn());

      expect(res.redirect).toHaveBeenCalledWith(
        constructUrlWithNotEligibleReason(NOT_ELIGIBLE_FOR_THIS_SERVICE_URL, NotEligibleReason.UNDER_18_DEFENDANT),
      );
    });

    it('should redirect to claimant age when defendant is 18 or over', async () => {
      req.cookies = {eligibility: {foo: 'blah'}};
      req.body = {option: AgeEligibilityOptions.YES};

      await postHandler(req as Request, res as unknown as Response, jest.fn());

      expect(res.cookie).toHaveBeenCalledWith(
        'eligibility',
        {foo: 'blah', eligibilityDefendantAge: AgeEligibilityOptions.YES},
        {httpOnly: true, sameSite: 'lax'},
      );
      expect(res.redirect).toHaveBeenCalledWith(ELIGIBILITY_CLAIMANT_AGE_URL);
    });
  });
});
