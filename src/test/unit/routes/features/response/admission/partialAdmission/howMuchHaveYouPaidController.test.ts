import {Request, Response} from 'express';
import howMuchHaveYouPaidController from '../../../../../../../main/routes/features/response/admission/partialAdmission/howMuchHaveYouPaidController';
import howMuchHaveYouPaidService from 'services/features/response/admission/howMuchHaveYouPaidService';
import {HowMuchHaveYouPaid} from 'form/models/admission/howMuchHaveYouPaid';
import {RESPONSE_TASK_LIST_URL} from 'routes/urls';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {ResponseType} from 'form/models/responseType';
import {createMockResponse, getRouteHandler} from '../../../../../../utils/getRouteHandler';

describe('How Much Have You Paid', () => {
  const getHandler = getRouteHandler(howMuchHaveYouPaidController, 'get');
  const postHandler = getRouteHandler(howMuchHaveYouPaidController, 'post');
  const viewPath = 'features/response/admission/how-much-have-you-paid';
  const claimId = '12345';
  let req: Partial<Request>;
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;
  let mockGetHowMuchHaveYouPaid: jest.SpyInstance;
  let mockSaveHowMuchHaveYouPaid: jest.SpyInstance;

  const expectValidationError = () => {
    expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
      form: expect.anything(),
    }));
    expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
    expect(res.redirect).not.toHaveBeenCalled();
    expect(mockSaveHowMuchHaveYouPaid).not.toHaveBeenCalled();
  };

  beforeEach(async () => {
    req = {params: {id: claimId}, body: {}, query: {}, cookies: {}};
    res = createMockResponse();
    next = jest.fn();
    mockGetHowMuchHaveYouPaid = jest.spyOn(howMuchHaveYouPaidService, 'getHowMuchHaveYouPaid')
      .mockResolvedValue(new HowMuchHaveYouPaid({totalClaimAmount: 110}));
    mockSaveHowMuchHaveYouPaid = jest.spyOn(howMuchHaveYouPaidService, 'saveHowMuchHaveYouPaid')
      .mockResolvedValue(undefined);
    // Prime module-level totalClaimAmount used by POST
    await getHandler(req as Request, res as unknown as Response, next);
    res = createMockResponse();
    next = jest.fn();
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
      }));
      expect(mockGetHowMuchHaveYouPaid).toHaveBeenCalledWith(expect.anything(), ResponseType.PART_ADMISSION);
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

    it('should save and redirect to the task list for a valid amount, past date and explanation', async () => {
      req.body = {amount: 20, year: '2022', month: '1', day: '1', text: 'text'};

      await postHandler(req as Request, res as unknown as Response, next);

      expect(mockSaveHowMuchHaveYouPaid).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({amount: 20, text: 'text'}),
        ResponseType.PART_ADMISSION,
      );
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, RESPONSE_TASK_LIST_URL));
      expect(next).not.toHaveBeenCalled();
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
