import {Response} from 'express';
import alreadyPaidController from '../../../../../../../main/routes/features/response/admission/partialAdmission/alreadyPaidController';
import {RESPONSE_TASK_LIST_URL} from 'routes/urls';
import {PartialAdmissionService} from 'services/features/response/admission/partialAdmission/partialAdmissionService';
import {generateRedisKey} from 'modules/draft-store/draftStoreService';
import {AppRequest} from 'models/AppRequest';
import {GenericForm} from 'form/models/genericForm';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../../../utils/getRouteHandler';

jest.mock('modules/draft-store/draftStoreService');

describe('Already Paid Controller', () => {
  const getHandler = getRouteHandler(alreadyPaidController, 'get');
  const postHandler = getRouteHandler(alreadyPaidController, 'post');
  const viewPath = 'features/response/admission/partialAdmission/already-paid';
  const claimId = '12345';
  let req: Partial<AppRequest>;
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;
  const mockGenerateRedisKey = generateRedisKey as jest.Mock;
  const mockGetClaimAlreadyPaid = jest.spyOn(PartialAdmissionService.prototype, 'getClaimAlreadyPaid');
  const mockSaveClaimAlreadyPaid = jest.spyOn(PartialAdmissionService.prototype, 'saveClaimAlreadyPaid');
  const renderedForm = () => (res.render as jest.Mock).mock.calls[0][1].form;

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
    mockGenerateRedisKey.mockReturnValue(claimId);
    mockGetClaimAlreadyPaid.mockResolvedValue(undefined);
    mockSaveClaimAlreadyPaid.mockResolvedValue(undefined);
  });

  describe('on GET', () => {
    it('should render already paid page successfully', async () => {
      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({form: expect.any(GenericForm)}));
    });

    it('should call next when loading already paid fails', async () => {
      const error = new Error('error');
      mockGetClaimAlreadyPaid.mockRejectedValue(error);

      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST', () => {
    it('should re-render when option is not selected', async () => {
      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({form: expect.any(GenericForm)}));
      expect(renderedForm().hasErrors()).toBe(true);
      expect(renderedForm().errorFor('option')).toBe('ERRORS.ALREADY_PAID_REQUIRED');
      expect(res.redirect).not.toHaveBeenCalled();
    });

    it('should redirect to claim task list if selected option is no', async () => {
      req.body = {option: 'No'};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(mockSaveClaimAlreadyPaid).toHaveBeenCalledWith(claimId, 'No');
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, RESPONSE_TASK_LIST_URL));
    });

    it('should redirect to claim task list if selected option is yes', async () => {
      req.body = {option: 'Yes'};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(mockSaveClaimAlreadyPaid).toHaveBeenCalledWith(claimId, 'Yes');
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, RESPONSE_TASK_LIST_URL));
    });
  });
});
