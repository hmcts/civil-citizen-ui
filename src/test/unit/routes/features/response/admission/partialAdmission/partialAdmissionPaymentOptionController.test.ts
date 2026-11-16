import {Request, Response} from 'express';
import partialAdmissionPaymentOptionController from '../../../../../../../main/routes/features/response/admission/partialAdmission/partialAdmissionPaymentOptionController';
import {CITIZEN_PA_PAYMENT_DATE_URL, RESPONSE_TASK_LIST_URL} from 'routes/urls';
import {PaymentOptionType} from 'form/models/admission/paymentOption/paymentOptionType';
import {ResponseType} from 'form/models/responseType';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {Claim} from 'models/claim';
import {Party} from 'models/party';
import {PartialAdmission} from 'models/partialAdmission';
import {HowMuchDoYouOwe} from 'form/models/admission/partialAdmission/howMuchDoYouOwe';
import {PaymentIntention} from 'form/models/admission/paymentIntention';
import {createMockResponse, getRouteHandler} from '../../../../../../utils/getRouteHandler';

jest.mock('modules/draft-store/draftStoreService');

describe('Part Admit - Payment Option Controller', () => {
  const getHandler = getRouteHandler(partialAdmissionPaymentOptionController, 'get');
  const postHandler = getRouteHandler(partialAdmissionPaymentOptionController, 'post');
  const viewPath = 'features/response/admission/payment-option';
  const claimId = '12345';
  const admittedAmount = 23;
  let req: Partial<Request>;
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;
  const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;
  const mockGenerateRedisKey = draftStoreService.generateRedisKey as jest.Mock;
  const mockSaveDraftClaim = draftStoreService.saveDraftClaim as jest.Mock;

  const stubClaim = (): Claim => {
    const claim = new Claim();
    claim.applicant1 = new Party();
    claim.respondent1 = new Party();
    claim.respondent1.responseType = ResponseType.PART_ADMISSION;
    claim.partialAdmission = new PartialAdmission();
    claim.partialAdmission.howMuchDoYouOwe = new HowMuchDoYouOwe(admittedAmount);
    claim.partialAdmission.paymentIntention = new PaymentIntention();
    return claim;
  };

  beforeEach(() => {
    req = {params: {id: claimId}, body: {}, query: {}, cookies: {}};
    res = createMockResponse();
    next = jest.fn();
    jest.clearAllMocks();
    mockGenerateRedisKey.mockReturnValue(claimId);
    mockGetCaseData.mockResolvedValue(stubClaim());
    mockSaveDraftClaim.mockResolvedValue(undefined);
  });

  describe('on GET', () => {
    it('should render the payment option page', async () => {
      await getHandler(req as Request, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        form: expect.anything(),
        amount: admittedAmount,
        responseType: ResponseType.PART_ADMISSION,
      }));
      expect(next).not.toHaveBeenCalled();
    });

    it('should redirect to the task list when the response is not a partial admission', async () => {
      const claim = stubClaim();
      claim.respondent1.responseType = ResponseType.FULL_ADMISSION;
      mockGetCaseData.mockResolvedValue(claim);

      await getHandler(req as Request, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, RESPONSE_TASK_LIST_URL));
      expect(res.render).not.toHaveBeenCalled();
    });

    it('should redirect to the task list when the admitted amount is missing', async () => {
      const claim = stubClaim();
      claim.partialAdmission.howMuchDoYouOwe = undefined;
      mockGetCaseData.mockResolvedValue(claim);

      await getHandler(req as Request, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, RESPONSE_TASK_LIST_URL));
      expect(res.render).not.toHaveBeenCalled();
    });

    it('should call next when loading the claim fails', async () => {
      const error = new Error('redis failure');
      mockGetCaseData.mockRejectedValue(error);

      await getHandler(req as Request, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST', () => {
    it('should re-render when no option is selected', async () => {
      await postHandler(req as Request, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        form: expect.anything(),
        responseType: ResponseType.PART_ADMISSION,
      }));
      expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
      expect(res.redirect).not.toHaveBeenCalled();
    });

    it('should save and redirect to the task list when pay immediately is selected', async () => {
      req.body = {paymentType: PaymentOptionType.IMMEDIATELY};

      await postHandler(req as Request, res as unknown as Response, next);

      expect(mockSaveDraftClaim).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, RESPONSE_TASK_LIST_URL));
      expect(next).not.toHaveBeenCalled();
    });

    it('should save and redirect to the task list when instalments is selected', async () => {
      req.body = {paymentType: PaymentOptionType.INSTALMENTS};

      await postHandler(req as Request, res as unknown as Response, next);

      expect(mockSaveDraftClaim).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, RESPONSE_TASK_LIST_URL));
      expect(next).not.toHaveBeenCalled();
    });

    it('should save and redirect to the payment date page when pay by a set date is selected', async () => {
      req.body = {paymentType: PaymentOptionType.BY_SET_DATE};

      await postHandler(req as Request, res as unknown as Response, next);

      expect(mockSaveDraftClaim).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CITIZEN_PA_PAYMENT_DATE_URL));
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next when saving fails', async () => {
      const error = new Error('redis failure');
      mockGetCaseData.mockRejectedValue(error);
      req.body = {paymentType: PaymentOptionType.BY_SET_DATE};

      await postHandler(req as Request, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
