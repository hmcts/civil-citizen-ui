import {Request, Response} from 'express';
import howMuchHaveYouPaidController from '../../../../../../../main/routes/features/response/admission/fullRejection/howMuchHaveYouPaidController';
import howMuchHaveYouPaidService from 'services/features/response/admission/howMuchHaveYouPaidService';
import {HowMuchHaveYouPaid} from 'form/models/admission/howMuchHaveYouPaid';
import {
  CITIZEN_FULL_REJECTION_YOU_PAID_LESS_URL,
  RESPONSE_TASK_LIST_URL,
} from 'routes/urls';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {ResponseType} from 'form/models/responseType';
import {Claim} from 'models/claim';
import {AppRequest} from 'models/AppRequest';
import * as responseDraftStoreService from 'modules/draft-store/response/responseDraftStoreService';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../../../utils/getRouteHandler';

jest.mock('modules/draft-store/response/responseDraftStoreService');

describe('How Much Have You Paid - Full Rejection', () => {
  const getHandler = getRouteHandler(howMuchHaveYouPaidController, 'get');
  const postHandler = getRouteHandler(howMuchHaveYouPaidController, 'post');
  const viewPath = 'features/response/admission/how-much-have-you-paid';
  const claimId = '12345';
  const validPayment = {amount: 20, year: '2022', month: '1', day: '1', text: 'text'};
  let req: Partial<Request>;
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;
  let mockGetHowMuchHaveYouPaid: jest.SpyInstance;
  let mockSaveHowMuchHaveYouPaid: jest.SpyInstance;
  const mockGetResponseClaimById = responseDraftStoreService.getResponseClaimById as jest.Mock;

  const claimWithTotal = (totalClaimAmount?: number): Claim => {
    const claim = new Claim();
    claim.totalClaimAmount = totalClaimAmount;
    return claim;
  };

  const expectValidationError = () => {
    expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
      form: expect.anything(),
      responseType: ResponseType.FULL_DEFENCE,
    }));
    expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
    expect(res.redirect).not.toHaveBeenCalled();
    expect(mockSaveHowMuchHaveYouPaid).not.toHaveBeenCalled();
  };

  beforeEach(() => {
    req = {
      params: {id: claimId},
      body: {},
      query: {},
      cookies: {},
      session: createMockSession({user: {id: 'user-1'}}),
    };
    res = createMockResponse();
    next = jest.fn();
    mockGetHowMuchHaveYouPaid = jest.spyOn(howMuchHaveYouPaidService, 'getHowMuchHaveYouPaid')
      .mockResolvedValue(new HowMuchHaveYouPaid({totalClaimAmount: 110}));
    mockSaveHowMuchHaveYouPaid = jest.spyOn(howMuchHaveYouPaidService, 'saveHowMuchHaveYouPaid')
      .mockResolvedValue(undefined);
    mockGetResponseClaimById.mockResolvedValue(claimWithTotal(110));
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('on GET', () => {
    it('should render the how much have you paid page', async () => {
      await getHandler(req as Request, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        form: expect.anything(),
        totalClaimAmount: 110,
        responseType: ResponseType.FULL_DEFENCE,
      }));
      expect(mockGetHowMuchHaveYouPaid).toHaveBeenCalledWith(expect.anything(), ResponseType.FULL_DEFENCE);
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next when loading the claim fails', async () => {
      const error = new Error('draft failure');
      mockGetHowMuchHaveYouPaid.mockRejectedValue(error);

      await getHandler(req as Request, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST', () => {
    it('should re-render when no input is provided', async () => {
      req.body = {
        amount: undefined,
        year: undefined,
        month: undefined,
        day: undefined,
        text: undefined,
      };

      await postHandler(req as Request, res as unknown as Response, next);

      expectValidationError();
    });

    it('should re-render when the date is in the future', async () => {
      req.body = {amount: 20, year: '2040', month: '1', day: '1', text: 'text'};

      await postHandler(req as Request, res as unknown as Response, next);

      expectValidationError();
    });

    it('should re-render when the year is not four digits', async () => {
      req.body = {amount: 20, year: '22', month: '1', day: '1', text: 'text'};

      await postHandler(req as Request, res as unknown as Response, next);

      expectValidationError();
    });

    it('should save and redirect to you paid less when amount is less than claim', async () => {
      req.body = validPayment;

      await postHandler(req as Request, res as unknown as Response, next);

      expect(mockSaveHowMuchHaveYouPaid).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({amount: 20, text: 'text'}),
        ResponseType.FULL_DEFENCE,
      );
      expect(res.redirect).toHaveBeenCalledWith(
        constructResponseUrlWithIdParams(claimId, CITIZEN_FULL_REJECTION_YOU_PAID_LESS_URL),
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('should save and redirect to the task list when amount equals claim', async () => {
      req.body = {amount: 110, year: '2022', month: '1', day: '1', text: 'text'};

      await postHandler(req as Request, res as unknown as Response, next);

      expect(mockSaveHowMuchHaveYouPaid).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(
        constructResponseUrlWithIdParams(claimId, RESPONSE_TASK_LIST_URL),
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('should validate against the submitting user\'s own claim amount when another user has loaded the page in between', async () => {
      const claimsByUser: Record<string, Claim> = {
        'user-1': claimWithTotal(1000),
        'user-2': claimWithTotal(50),
      };
      mockGetResponseClaimById.mockImplementation(async (appReq: AppRequest) =>
        claimsByUser[appReq.session.user.id]);

      await getHandler({
        ...req,
        session: createMockSession({user: {id: 'user-1'}}),
      } as Request, createMockResponse() as unknown as Response, jest.fn());
      await getHandler({
        ...req,
        session: createMockSession({user: {id: 'user-2'}}),
      } as Request, createMockResponse() as unknown as Response, jest.fn());

      await postHandler({
        ...req,
        session: createMockSession({user: {id: 'user-1'}}),
        body: {...validPayment, amount: 500},
      } as Request, res as unknown as Response, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.render).not.toHaveBeenCalled();
      expect(mockSaveHowMuchHaveYouPaid).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({amount: 500, totalClaimAmount: 1000}),
        ResponseType.FULL_DEFENCE,
      );
      expect(res.redirect).toHaveBeenCalledWith(
        constructResponseUrlWithIdParams(claimId, CITIZEN_FULL_REJECTION_YOU_PAID_LESS_URL),
      );
    });

    it('should call next when saving fails', async () => {
      const error = new Error('draft failure');
      mockSaveHowMuchHaveYouPaid.mockRejectedValue(error);
      req.body = {amount: 50, year: '2022', month: '1', day: '31', text: 'text'};

      await postHandler(req as Request, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
