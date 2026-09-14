import {Response} from 'express';
import citizenPhoneController from '../../../../../../main/routes/features/response/citizenPhoneNumber/citizenPhoneController';
import {RESPONSE_TASK_LIST_URL} from 'routes/urls';
import {AppRequest} from 'models/AppRequest';
import {GenericForm} from 'form/models/genericForm';
import {CitizenTelephoneNumber} from 'form/models/citizenTelephoneNumber';
import {Claim} from 'models/claim';
import {ClaimantOrDefendant} from 'models/partyType';
import {getTelephone, saveTelephone} from 'services/features/claim/yourDetails/phoneService';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import * as launchDarklyClient from '../../../../../../main/app/auth/launchdarkly/launchDarklyClient';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../../utils/getRouteHandler';

jest.mock('services/features/claim/yourDetails/phoneService', () => ({
  getTelephone: jest.fn(),
  saveTelephone: jest.fn(),
}));
jest.mock('modules/draft-store/draftStoreService');
jest.mock('../../../../../../main/app/auth/launchdarkly/launchDarklyClient');

describe('Citizen phone number', () => {
  const getHandler = getRouteHandler(citizenPhoneController, 'get');
  const postHandler = getRouteHandler(citizenPhoneController, 'post');
  const viewPath = 'features/response/citizenPhoneNumber/citizen-phone';
  const claimId = '12345';
  const validPhoneNumber = '01234567890';
  let req: Partial<AppRequest>;
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;
  const mockGetTelephone = getTelephone as jest.Mock;
  const mockSaveTelephone = saveTelephone as jest.Mock;
  const mockGetCaseData = getCaseDataFromStore as jest.Mock;

  const claimWithSubmittedDate = (): Claim => {
    const claim = new Claim();
    claim.submittedDate = new Date('2024-06-23');
    return claim;
  };

  beforeEach(() => {
    req = {
      params: {id: claimId},
      session: createMockSession({user: {id: 'user-id'}}),
      body: {},
      query: {},
      cookies: {},
    };
    res = createMockResponse();
    next = jest.fn();
    mockGetCaseData.mockResolvedValue(claimWithSubmittedDate());
    mockGetTelephone.mockResolvedValue(new CitizenTelephoneNumber());
    mockSaveTelephone.mockResolvedValue(undefined);
  });

  describe('on GET, CARM off', () => {
    beforeEach(() => {
      (launchDarklyClient.isCarmEnabledForCase as jest.Mock).mockResolvedValue(false);
    });

    it('should render citizen phone number page with information from redis', async () => {
      mockGetTelephone.mockResolvedValue(new CitizenTelephoneNumber(validPhoneNumber));

      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(mockGetTelephone).toHaveBeenCalledWith(undefined, ClaimantOrDefendant.DEFENDANT);
      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        form: expect.any(GenericForm),
        carmEnabled: false,
      }));
    });

    it('should render empty citizen phone number page', async () => {
      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        form: expect.any(GenericForm),
        carmEnabled: false,
      }));
    });

    it('should call next when loading the telephone number fails', async () => {
      const error = new Error('error');
      mockGetTelephone.mockRejectedValue(error);

      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on GET, CARM on', () => {
    beforeEach(() => {
      (launchDarklyClient.isCarmEnabledForCase as jest.Mock).mockResolvedValue(true);
    });

    it('should render citizen phone number page with information from redis', async () => {
      mockGetTelephone.mockResolvedValue(new CitizenTelephoneNumber(validPhoneNumber));

      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        form: expect.any(GenericForm),
        carmEnabled: true,
      }));
    });

    it('should render empty citizen phone number page', async () => {
      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        form: expect.any(GenericForm),
        carmEnabled: true,
      }));
    });

    it('should call next when loading the telephone number fails', async () => {
      const error = new Error('error');
      mockGetCaseData.mockRejectedValue(error);

      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST, CARM off', () => {
    beforeEach(() => {
      (launchDarklyClient.isCarmEnabledForCase as jest.Mock).mockResolvedValue(false);
    });

    it('should re-render on incorrect input', async () => {
      req.body = {telephoneNumber: 'abc'};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({form: expect.any(GenericForm)}));
      expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
      expect(res.redirect).not.toHaveBeenCalled();
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

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, RESPONSE_TASK_LIST_URL));
    });

    it('should redirect on correct input when has information on redis', async () => {
      mockGetTelephone.mockResolvedValue(new CitizenTelephoneNumber(validPhoneNumber));
      req.body = {telephoneNumber: validPhoneNumber};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(mockSaveTelephone).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, RESPONSE_TASK_LIST_URL));
    });

    it('should redirect on correct input', async () => {
      req.body = {telephoneNumber: validPhoneNumber};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, RESPONSE_TASK_LIST_URL));
    });

    it('should redirect on empty input', async () => {
      req.body = {telephoneNumber: ''};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(mockSaveTelephone).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, RESPONSE_TASK_LIST_URL));
    });

    it('should call next when save fails', async () => {
      const error = new Error('error');
      mockSaveTelephone.mockRejectedValue(error);
      req.body = {telephoneNumber: validPhoneNumber};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST, CARM on', () => {
    beforeEach(() => {
      (launchDarklyClient.isCarmEnabledForCase as jest.Mock).mockResolvedValue(true);
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

      expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
    });

    it('should accept input with trailing whitespaces', async () => {
      req.body = {telephoneNumber: ' 01234567890 '};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, RESPONSE_TASK_LIST_URL));
    });

    it('should redirect on correct input when has information on redis', async () => {
      req.body = {telephoneNumber: validPhoneNumber};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, RESPONSE_TASK_LIST_URL));
    });

    it('should redirect on correct input', async () => {
      req.body = {telephoneNumber: validPhoneNumber};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, RESPONSE_TASK_LIST_URL));
    });

    it('should re-render on empty input', async () => {
      req.body = {telephoneNumber: ''};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({form: expect.any(GenericForm)}));
      const form = (res.render as jest.Mock).mock.calls[0][1].form as GenericForm<unknown>;
      expect(form.hasErrors()).toBe(true);
      expect(form.errorFor('telephoneNumber')).toBe('ERRORS.ENTER_TELEPHONE_NUMBER');
      expect(res.redirect).not.toHaveBeenCalled();
    });

    it('should call next when save fails', async () => {
      const error = new Error('error');
      mockGetCaseData.mockRejectedValue(error);
      req.body = {telephoneNumber: validPhoneNumber};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
