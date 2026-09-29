import {Request, Response} from 'express';
import singleDefendantController from '../../../../../../main/routes/features/public/eligibility/singleDefendantController';
import {
  ELIGIBILITY_DEFENDANT_ADDRESS_URL,
  NOT_ELIGIBLE_FOR_THIS_SERVICE_URL,
} from '../../../../../../main/routes/urls';
import {YesNo} from '../../../../../../main/common/form/models/yesNo';
import {GenericForm} from '../../../../../../main/common/form/models/genericForm';
import {createMockResponse, getRouteHandler} from '../../../../../utils/getRouteHandler';

describe('Single Defendant Controller', () => {
  const getHandler = getRouteHandler(singleDefendantController, 'get');
  const postHandler = getRouteHandler(singleDefendantController, 'post');
  const viewPath = 'features/public/eligibility/single-defendant';
  let req: Partial<Request>;
  let res: ReturnType<typeof createMockResponse>;

  beforeEach(() => {
    req = {cookies: {}, body: {}, query: {}};
    res = createMockResponse();
  });

  describe('on GET', () => {
    it('should render the page with an empty form', () => {
      getHandler(req as Request, res as unknown as Response, jest.fn());

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        pageTitle: 'PAGES.ELIGIBILITY_SINGLE_DEFENDANT.PAGE_TITLE',
      }));
      expect((res.render as jest.Mock).mock.calls[0][1].form).toBeInstanceOf(GenericForm);
    });

    it('should pre-populate the form from the eligibility cookie', () => {
      req.cookies = {eligibility: {singleDefendant: YesNo.YES}};

      getHandler(req as Request, res as unknown as Response, jest.fn());

      expect((res.render as jest.Mock).mock.calls[0][1].form.model.option).toBe(YesNo.YES);
    });
  });

  describe('on POST', () => {
    it('should re-render when no option is selected', () => {
      postHandler(req as Request, res as unknown as Response, jest.fn());

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.anything());
      expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
      expect(res.redirect).not.toHaveBeenCalled();
    });

    it('should redirect to not eligible when yes is selected', () => {
      req.body = {option: YesNo.YES};

      postHandler(req as Request, res as unknown as Response, jest.fn());

      expect(res.cookie).toHaveBeenCalledWith('eligibility', {singleDefendant: YesNo.YES}, {httpOnly: true, sameSite: 'lax'});
      expect(res.redirect).toHaveBeenCalledWith(`${NOT_ELIGIBLE_FOR_THIS_SERVICE_URL}?reason=multiple-defendants`);
    });

    it('should redirect to defendant address and preserve existing cookie values', () => {
      req.cookies = {eligibility: {foo: 'blah'}};
      req.body = {option: YesNo.NO};

      postHandler(req as Request, res as unknown as Response, jest.fn());

      expect(res.cookie).toHaveBeenCalledWith(
        'eligibility',
        {foo: 'blah', singleDefendant: YesNo.NO},
        {httpOnly: true, sameSite: 'lax'},
      );
      expect(res.redirect).toHaveBeenCalledWith(ELIGIBILITY_DEFENDANT_ADDRESS_URL);
    });
  });
});
