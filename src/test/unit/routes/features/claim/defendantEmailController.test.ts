import {Response} from 'express';
import defendantEmailController from '../../../../../main/routes/features/claim/yourDetails/defendantEmailController';
import {CLAIM_DEFENDANT_PHONE_NUMBER_URL} from 'routes/urls';
import {AppRequest} from 'models/AppRequest';
import {GenericForm} from 'form/models/genericForm';
import {DefendantEmail} from 'common/form/models/claim/yourDetails/defendantEmail';
import {getDefendantEmail, saveDefendantEmail} from 'services/features/claim/yourDetails/defendantEmailService';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../utils/getRouteHandler';

jest.mock('services/features/claim/yourDetails/defendantEmailService', () => ({
  getDefendantEmail: jest.fn(),
  saveDefendantEmail: jest.fn(),
}));

const EMAIL_ADDRESS = 'test@gmail.com';

describe('Defendant Email', () => {
  const getHandler = getRouteHandler(defendantEmailController, 'get');
  const postHandler = getRouteHandler(defendantEmailController, 'post');
  const viewPath = 'features/claim/yourDetails/defendant-email';
  const pageTitle = 'PAGES.CLAIM_JOURNEY.DEFENDANT_EMAIL.TITLE';
  let req: Partial<AppRequest>;
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;
  const mockGetDefendantEmail = getDefendantEmail as jest.Mock;
  const mockSaveDefendantEmail = saveDefendantEmail as jest.Mock;

  beforeEach(() => {
    req = {
      session: createMockSession({user: {id: 'user-id'}}),
      body: {},
      query: {},
      cookies: {},
    };
    res = createMockResponse();
    next = jest.fn();
    mockGetDefendantEmail.mockResolvedValue(new DefendantEmail());
    mockSaveDefendantEmail.mockResolvedValue(undefined);
  });

  describe('on GET', () => {
    it('should render claimant defendant email page', async () => {
      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        pageTitle,
        form: expect.any(GenericForm),
      }));
    });

    it('should call next when loading defendant email fails', async () => {
      const error = new Error('error');
      mockGetDefendantEmail.mockRejectedValue(error);

      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST', () => {
    it('should redirect to the defendant phone screen when email is provided', async () => {
      req.body = {emailAddress: EMAIL_ADDRESS};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(mockSaveDefendantEmail).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(CLAIM_DEFENDANT_PHONE_NUMBER_URL);
    });

    it('should redirect to the defendant phone screen when email is not provided', async () => {
      req.body = {emailAddress: ''};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(mockSaveDefendantEmail).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(CLAIM_DEFENDANT_PHONE_NUMBER_URL);
    });

    it('should re-render when email is incorrect', async () => {
      req.body = {emailAddress: 'test'};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({form: expect.any(GenericForm)}));
      expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
      expect(res.redirect).not.toHaveBeenCalled();
    });

    it('should re-render when email is too long', async () => {
      req.body = {emailAddress: 'x'.repeat(311) + '@gmail.com'};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({form: expect.any(GenericForm)}));
      expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
    });

    it('should re-render when email domain is invalid', async () => {
      req.body = {emailAddress: 'underscoreindomain@gmail_.com'};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({form: expect.any(GenericForm)}));
      expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
    });

    it('should call next when save fails', async () => {
      const error = new Error('error');
      mockSaveDefendantEmail.mockRejectedValue(error);
      req.body = {emailAddress: EMAIL_ADDRESS};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
