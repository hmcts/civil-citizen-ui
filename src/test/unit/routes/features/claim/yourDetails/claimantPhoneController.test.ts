import {Response} from 'express';
import claimantPhoneController from '../../../../../../main/routes/features/claim/yourDetails/claimantPhoneController';
import {CLAIMANT_TASK_LIST_URL} from 'routes/urls';
import {AppRequest} from 'models/AppRequest';
import {GenericForm} from 'form/models/genericForm';
import {CitizenTelephoneNumber} from 'form/models/citizenTelephoneNumber';
import {Claim} from 'models/claim';
import {ClaimantOrDefendant} from 'models/partyType';
import {getTelephone, saveTelephone} from 'services/features/claim/yourDetails/phoneService';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import * as launchDarklyClient from '../../../../../../main/app/auth/launchdarkly/launchDarklyClient';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../../utils/getRouteHandler';

jest.mock('services/features/claim/yourDetails/phoneService', () => ({
  getTelephone: jest.fn(),
  saveTelephone: jest.fn(),
}));
jest.mock('modules/draft-store/draftStoreService');
jest.mock('../../../../../../main/app/auth/launchdarkly/launchDarklyClient');

const PHONE_NUMBER = '01632960001';

describe('Claimant Phone', () => {
  const getHandler = getRouteHandler(claimantPhoneController, 'get');
  const postHandler = getRouteHandler(claimantPhoneController, 'post');
  const viewPath = 'features/claim/claimant-phone';
  const pageTitle = 'PAGES.CLAIMANT_PHONE.PAGE_TITLE';
  let req: Partial<AppRequest>;
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;
  const mockGetTelephone = getTelephone as jest.Mock;
  const mockSaveTelephone = saveTelephone as jest.Mock;
  const mockGetCaseData = getCaseDataFromStore as jest.Mock;

  beforeEach(() => {
    req = {
      session: createMockSession({user: {id: 'user-id'}}),
      body: {},
      query: {},
      cookies: {},
    };
    res = createMockResponse();
    next = jest.fn();
    mockGetCaseData.mockResolvedValue(new Claim());
    mockGetTelephone.mockResolvedValue(new CitizenTelephoneNumber());
    mockSaveTelephone.mockResolvedValue(undefined);
    (launchDarklyClient.isCarmEnabledForCase as jest.Mock).mockResolvedValue(false);
  });

  describe('on GET, CARM off', () => {
    beforeEach(() => {
      (launchDarklyClient.isCarmEnabledForCase as jest.Mock).mockResolvedValue(false);
    });

    it('should render claimant phone number page', async () => {
      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(mockGetTelephone).toHaveBeenCalledWith('user-id', ClaimantOrDefendant.CLAIMANT);
      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        pageTitle,
        carmEnabled: false,
        form: expect.any(GenericForm),
      }));
    });

    it('should call next when loading the claim fails', async () => {
      const error = new Error('error');
      mockGetCaseData.mockRejectedValue(error);

      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on GET, CARM on', () => {
    beforeEach(() => {
      (launchDarklyClient.isCarmEnabledForCase as jest.Mock).mockResolvedValue(true);
    });

    it('should render claimant phone number page as mandatory', async () => {
      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        pageTitle,
        carmEnabled: true,
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

  describe('on POST, CARM on', () => {
    beforeEach(() => {
      (launchDarklyClient.isCarmEnabledForCase as jest.Mock).mockResolvedValue(true);
    });

    it('should redirect to task list when mandatory phone number is provided', async () => {
      req.body = {telephoneNumber: PHONE_NUMBER};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(mockSaveTelephone).toHaveBeenCalledWith('user-id', expect.any(CitizenTelephoneNumber), ClaimantOrDefendant.CLAIMANT);
      expect(res.redirect).toHaveBeenCalledWith(CLAIMANT_TASK_LIST_URL);
    });

    it('should re-render on empty input', async () => {
      req.body = {telephoneNumber: ''};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({form: expect.any(GenericForm)}));
      expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
      expect(res.redirect).not.toHaveBeenCalled();
    });

    it('should re-render on input with space', async () => {
      req.body = {telephoneNumber: ' '};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({form: expect.any(GenericForm)}));
      expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
    });

    it('should re-render on incorrect input', async () => {
      req.body = {telephoneNumber: 'abc'};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({form: expect.any(GenericForm)}));
      expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
    });

    it('should re-render on input with interior spaces', async () => {
      req.body = {telephoneNumber: '123 456'};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({form: expect.any(GenericForm)}));
      expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
    });

    it('should accept input with trailing whitespaces', async () => {
      req.body = {telephoneNumber: ' 01234567890 '};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(CLAIMANT_TASK_LIST_URL);
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
