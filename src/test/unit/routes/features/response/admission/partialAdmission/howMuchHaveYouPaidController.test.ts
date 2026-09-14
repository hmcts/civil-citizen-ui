import {Response} from 'express';
import howMuchHaveYouPaidController from '../../../../../../../main/routes/features/response/admission/partialAdmission/howMuchHaveYouPaidController';
import {RESPONSE_TASK_LIST_URL} from 'routes/urls';
import {HowMuchHaveYouPaid} from 'form/models/admission/howMuchHaveYouPaid';
import {ResponseType} from 'form/models/responseType';
import howMuchHaveYouPaidService from 'services/features/response/admission/howMuchHaveYouPaidService';
import {generateRedisKey} from 'modules/draft-store/draftStoreService';
import {AppRequest} from 'models/AppRequest';
import {GenericForm} from 'form/models/genericForm';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../../../utils/getRouteHandler';

jest.mock('modules/draft-store/draftStoreService');

describe('How Much Have You Paid', () => {
  const getHandler = getRouteHandler(howMuchHaveYouPaidController, 'get');
  const postHandler = getRouteHandler(howMuchHaveYouPaidController, 'post');
  const viewPath = 'features/response/admission/how-much-have-you-paid';
  const claimId = '12345';
  let req: Partial<AppRequest>;
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;
  const mockGenerateRedisKey = generateRedisKey as jest.Mock;
  const mockGetHowMuchHaveYouPaid = jest.spyOn(howMuchHaveYouPaidService, 'getHowMuchHaveYouPaid');
  const mockSaveHowMuchHaveYouPaid = jest.spyOn(howMuchHaveYouPaidService, 'saveHowMuchHaveYouPaid');
  const renderedForm = () => (res.render as jest.Mock).mock.calls[0][1].form;

  const seedTotalClaimAmount = async (totalClaimAmount = 110) => {
    mockGetHowMuchHaveYouPaid.mockResolvedValue(new HowMuchHaveYouPaid({totalClaimAmount}));
    await getHandler(req as AppRequest, res as unknown as Response, next);
    res = createMockResponse();
    next = jest.fn();
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
    mockGenerateRedisKey.mockReturnValue(claimId);
    mockGetHowMuchHaveYouPaid.mockResolvedValue(new HowMuchHaveYouPaid({totalClaimAmount: 110}));
    mockSaveHowMuchHaveYouPaid.mockResolvedValue(undefined);
  });

  describe('on GET', () => {
    it('should render how much have you paid page', async () => {
      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        form: expect.any(GenericForm),
        lastMonth: expect.any(Date),
        totalClaimAmount: 110,
      }));
    });

    it('should render how much have you paid with payment amount loaded from redis', async () => {
      mockGetHowMuchHaveYouPaid.mockResolvedValue(new HowMuchHaveYouPaid({
        amount: 20,
        totalClaimAmount: 110,
        year: '2022',
        month: '1',
        day: '1',
        text: 'text',
      }));

      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(renderedForm().model.amount).toBe(20);
      expect(renderedForm().model.year).toBe(2022);
      expect(renderedForm().model.month).toBe(1);
      expect(renderedForm().model.day).toBe(1);
    });

    it('should call next when loading the form fails', async () => {
      const error = new Error('error');
      mockGetHowMuchHaveYouPaid.mockRejectedValue(error);

      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST', () => {
    beforeEach(async () => {
      await seedTotalClaimAmount();
    });

    it('should re-render with errors on no input', async () => {
      req.body = {
        amount: undefined,
        totalClaimAmount: undefined,
        year: undefined,
        month: undefined,
        day: undefined,
        text: undefined,
      };

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({form: expect.any(GenericForm)}));
      expect(renderedForm().errorFor('amount')).toBe('ERRORS.VALID_AMOUNT');
      expect(renderedForm().errorFor('day')).toBe('ERRORS.VALID_DAY');
      expect(renderedForm().errorFor('month')).toBe('ERRORS.VALID_MONTH');
      expect(renderedForm().errorFor('year')).toBeTruthy();
      expect(renderedForm().errorFor('text')).toBe('ERRORS.ENTER_PAYMENT_EXPLANATION');
    });

    it('should re-render with error on date in future', async () => {
      req.body = {amount: 20, totalClaimAmount: 110, year: '2040', month: '1', day: '1', text: 'text'};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(renderedForm().errorFor('date')).toBe('ERRORS.VALID_DATE_IN_PAST');
    });

    it('should re-render with error for a 2 digit year', async () => {
      req.body = {amount: 20, totalClaimAmount: 110, year: '22', month: '1', day: '1', text: 'text'};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(renderedForm().errorFor('year')).toBe('ERRORS.VALID_FOUR_DIGIT_YEAR');
    });

    it('should redirect to claim task list on valid amount, date in past, and text', async () => {
      req.body = {amount: 20, totalClaimAmount: 110, year: '2022', month: '1', day: '1', text: 'text'};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(mockSaveHowMuchHaveYouPaid).toHaveBeenCalledWith(claimId, expect.any(HowMuchHaveYouPaid), ResponseType.PART_ADMISSION);
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, RESPONSE_TASK_LIST_URL));
    });

    it('should call next when save fails', async () => {
      const error = new Error('error');
      mockSaveHowMuchHaveYouPaid.mockRejectedValue(error);
      req.body = {amount: 50, totalClaimAmount: 110, year: '2022', month: '1', day: '31', text: 'text'};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
