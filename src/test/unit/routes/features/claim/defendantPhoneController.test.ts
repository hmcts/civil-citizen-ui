import {Response} from 'express';
import defendantPhoneController from '../../../../../main/routes/features/claim/yourDetails/defendantPhoneController';
import {CLAIMANT_TASK_LIST_URL} from 'routes/urls';
import {AppRequest} from 'models/AppRequest';
import {GenericForm} from 'form/models/genericForm';
import {CitizenTelephoneNumber} from 'form/models/citizenTelephoneNumber';
import {ClaimantOrDefendant} from 'models/partyType';
import {getTelephone, saveTelephone} from 'services/features/claim/yourDetails/phoneService';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../utils/getRouteHandler';

jest.mock('services/features/claim/yourDetails/phoneService', () => ({
  getTelephone: jest.fn(),
  saveTelephone: jest.fn(),
}));

const PHONE_NUMBER = '01632960001';

describe('Defendant Phone', () => {
  const getHandler = getRouteHandler(defendantPhoneController, 'get');
  const postHandler = getRouteHandler(defendantPhoneController, 'post');
  const viewPath = 'features/public/claim/defendant-phone';
  const pageTitle = 'PAGES.DEFENDANT_PHONE_NUMBER.PAGE_TITLE';
  let req: Partial<AppRequest>;
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;
  const mockGetTelephone = getTelephone as jest.Mock;
  const mockSaveTelephone = saveTelephone as jest.Mock;

  beforeEach(() => {
    req = {
      session: createMockSession({user: {id: 'user-id'}}),
      body: {},
      query: {},
      cookies: {},
    };
    res = createMockResponse();
    next = jest.fn();
    mockGetTelephone.mockResolvedValue(new CitizenTelephoneNumber());
    mockSaveTelephone.mockResolvedValue(undefined);
  });

  describe('on GET', () => {
    it('should render defendant phone number page', async () => {
      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(mockGetTelephone).toHaveBeenCalledWith('user-id', ClaimantOrDefendant.DEFENDANT);
      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        pageTitle,
        form: expect.any(GenericForm),
      }));
    });

    it('should call next when loading the telephone number fails', async () => {
      const error = new Error('error');
      mockGetTelephone.mockRejectedValue(error);

      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST', () => {
    it('should redirect to task list when optional phone number is provided', async () => {
      req.body = {telephoneNumber: PHONE_NUMBER};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(mockSaveTelephone).toHaveBeenCalledWith('user-id', expect.any(CitizenTelephoneNumber), ClaimantOrDefendant.DEFENDANT);
      expect(res.redirect).toHaveBeenCalledWith(CLAIMANT_TASK_LIST_URL);
    });

    it('should redirect to task list when optional phone number is not provided', async () => {
      req.body = {telephoneNumber: ''};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(mockSaveTelephone).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(CLAIMANT_TASK_LIST_URL);
    });

    it('should accept input with trailing whitespaces', async () => {
      req.body = {telephoneNumber: PHONE_NUMBER};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(CLAIMANT_TASK_LIST_URL);
    });

    it('should re-render when phone number is incorrect', async () => {
      req.body = {telephoneNumber: 'abc'};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({form: expect.any(GenericForm)}));
      expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
      expect(res.redirect).not.toHaveBeenCalled();
    });

    it('should re-render when phone number has interior spaces', async () => {
      req.body = {telephoneNumber: '123 456'};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({form: expect.any(GenericForm)}));
      expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
    });

    it('should call next when save fails', async () => {
      const error = new Error('error');
      mockSaveTelephone.mockRejectedValue(error);
      req.body = {telephoneNumber: PHONE_NUMBER};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
