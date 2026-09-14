import {Response} from 'express';
import howMuchDoYouOweController from '../../../../../../../main/routes/features/response/admission/partialAdmission/howMuchDoYouOweController';
import {RESPONSE_TASK_LIST_URL} from 'routes/urls';
import {HowMuchDoYouOwe} from 'form/models/admission/partialAdmission/howMuchDoYouOwe';
import {
  getHowMuchDoYouOweForm,
  saveHowMuchDoYouOweData,
} from 'services/features/response/admission/partialAdmission/howMuchDoYouOweService';
import {generateRedisKey} from 'modules/draft-store/draftStoreService';
import {AppRequest} from 'models/AppRequest';
import {GenericForm} from 'form/models/genericForm';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../../../utils/getRouteHandler';

jest.mock('modules/draft-store/draftStoreService');
jest.mock('services/features/response/admission/partialAdmission/howMuchDoYouOweService');

describe('Partial Admit - How much money do you admit you owe? Controller', () => {
  const getHandler = getRouteHandler(howMuchDoYouOweController, 'get');
  const postHandler = getRouteHandler(howMuchDoYouOweController, 'post');
  const viewPath = 'features/response/admission/partialAdmission/how-much-do-you-owe';
  const claimId = '12345';
  let req: Partial<AppRequest>;
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;
  const mockGenerateRedisKey = generateRedisKey as jest.Mock;
  const mockGetHowMuchDoYouOweForm = getHowMuchDoYouOweForm as jest.Mock;
  const mockSaveHowMuchDoYouOweData = saveHowMuchDoYouOweData as jest.Mock;
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
    mockGetHowMuchDoYouOweForm.mockResolvedValue(new HowMuchDoYouOwe(undefined, 110));
    mockSaveHowMuchDoYouOweData.mockResolvedValue(undefined);
  });

  describe('on GET', () => {
    it('should render how much do you owe page', async () => {
      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({form: expect.any(GenericForm)}));
    });

    it('should call next when loading the form fails', async () => {
      const error = new Error('error');
      mockGetHowMuchDoYouOweForm.mockRejectedValue(error);

      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST', () => {
    it('should show errors when no amount is provided', async () => {
      req.body = {amount: ''};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({form: expect.any(GenericForm)}));
      expect(renderedForm().hasErrors()).toBe(true);
      expect(renderedForm().errorFor('amount')).toBe('ERRORS.CLAIM_VALID_AMOUNT');
    });

    it('should show errors when amount 0 is provided', async () => {
      req.body = {amount: 0};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(renderedForm().errorFor('amount')).toBe('ERRORS.CLAIM_VALID_AMOUNT');
    });

    it('should show errors when more than 2 decimals provided', async () => {
      req.body = {amount: 10.123};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(renderedForm().errorFor('amount')).toBe('ERRORS.VALID_TWO_DECIMAL_NUMBER');
    });

    it('should show errors when negative amount is provided', async () => {
      req.body = {amount: -110};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(renderedForm().errorFor('amount')).toBe('ERRORS.CLAIM_VALID_AMOUNT');
    });

    it('should show errors when non-numeric amount is provided', async () => {
      req.body = {amount: 'abc'};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(renderedForm().errorFor('amount')).toBe('ERRORS.CLAIM_VALID_AMOUNT');
    });

    it('should show errors when provided amount is bigger than claim amount', async () => {
      req.body = {amount: 9999999999999};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(renderedForm().errorFor('amount')).toBe('ERRORS.AMOUNT_LESS_THAN_CLAIMED');
    });

    it('should show errors when provided amount is equal to claim amount plus 1', async () => {
      req.body = {amount: 111};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(renderedForm().errorFor('amount')).toBe('ERRORS.AMOUNT_LESS_THAN_CLAIMED');
    });

    it('should redirect when a valid amount is provided', async () => {
      req.body = {amount: 100};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(mockSaveHowMuchDoYouOweData).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, RESPONSE_TASK_LIST_URL));
    });

    it('should call next when loading the form fails', async () => {
      const error = new Error('error');
      mockGetHowMuchDoYouOweForm.mockRejectedValue(error);
      req.body = {amount: 200};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
