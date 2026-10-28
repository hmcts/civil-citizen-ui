import {Request, Response} from 'express';
import partialAdmissionPaymentOptionController from '../../../../../../../main/routes/features/response/admission/partialAdmission/partialAdmissionPaymentOptionController';
import {CITIZEN_PA_PAYMENT_DATE_URL, RESPONSE_TASK_LIST_URL} from 'routes/urls';
import {PaymentOptionType} from 'form/models/admission/paymentOption/paymentOptionType';
import {ResponseType} from 'form/models/responseType';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {Claim} from 'models/claim';
import {Party} from 'models/party';
import {PartialAdmission} from 'models/partialAdmission';
import {HowMuchDoYouOwe} from 'form/models/admission/partialAdmission/howMuchDoYouOwe';
import {PaymentIntention} from 'form/models/admission/paymentIntention';
import {getResponseClaimById} from 'modules/draft-store/response/responseDraftStoreService';
import {savePaymentOptionData} from 'services/features/response/admission/paymentOptionService';
import {createMockResponse, getRouteHandler} from '../../../../../../utils/getRouteHandler';

jest.mock('modules/draft-store/response/responseDraftStoreService');
jest.mock('services/features/response/admission/paymentOptionService', () => {
  const actual = jest.requireActual('services/features/response/admission/paymentOptionService');
  return {
    ...actual,
    savePaymentOptionData: jest.fn(),
  };
});

describe('Part Admit - Payment Option Controller', () => {
  const getHandler = getRouteHandler(partialAdmissionPaymentOptionController, 'get');
  const postHandler = getRouteHandler(partialAdmissionPaymentOptionController, 'post');
  const viewPath = 'features/response/admission/payment-option';
  const claimId = '12345';
  const admittedAmount = 23;
  let req: Partial<Request>;
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;
  const mockGetResponseClaimById = getResponseClaimById as jest.Mock;
  const mockSavePaymentOptionData = savePaymentOptionData as jest.Mock;

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

  beforeEach(async () => {
    req = {params: {id: claimId}, body: {}, query: {}, cookies: {}};
    res = createMockResponse();
    next = jest.fn();
    jest.clearAllMocks();
    mockGetResponseClaimById.mockResolvedValue(stubClaim());
    mockSavePaymentOptionData.mockResolvedValue(undefined);
    // Prime module-level admittedPaymentAmount used by POST validation re-render
    await getHandler(req as Request, res as unknown as Response, next);
    res = createMockResponse();
    next = jest.fn();
  });

  describe('on GET', () => {
    it('should render the payment option page', async () => {
      await getHandler(req as Request, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        form: expect.anything(),
        amount: admittedAmount,
        responseType: ResponseType.PART_ADMISSION,
      }));
      expect(mockGetResponseClaimById).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    it('should redirect to the task list when the response is not a partial admission', async () => {
      const claim = stubClaim();
      claim.respondent1.responseType = ResponseType.FULL_ADMISSION;
      mockGetResponseClaimById.mockResolvedValue(claim);

      await getHandler(req as Request, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, RESPONSE_TASK_LIST_URL));
      expect(res.render).not.toHaveBeenCalled();
    });

    it('should redirect to the task list when the admitted amount is missing', async () => {
      const claim = stubClaim();
      claim.partialAdmission.howMuchDoYouOwe = undefined;
      mockGetResponseClaimById.mockResolvedValue(claim);

      await getHandler(req as Request, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, RESPONSE_TASK_LIST_URL));
      expect(res.render).not.toHaveBeenCalled();
    });

    it('should call next when loading the claim fails', async () => {
      const error = new Error('draft failure');
      mockGetResponseClaimById.mockRejectedValue(error);

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
      expect(mockSavePaymentOptionData).not.toHaveBeenCalled();
    });

    it('should save and redirect to the task list when pay immediately is selected', async () => {
      req.body = {paymentType: PaymentOptionType.IMMEDIATELY};

      await postHandler(req as Request, res as unknown as Response, next);

      expect(mockSavePaymentOptionData).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({paymentType: PaymentOptionType.IMMEDIATELY}),
        ResponseType.PART_ADMISSION,
      );
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, RESPONSE_TASK_LIST_URL));
      expect(next).not.toHaveBeenCalled();
    });

    it('should save and redirect to the task list when instalments is selected', async () => {
      req.body = {paymentType: PaymentOptionType.INSTALMENTS};

      await postHandler(req as Request, res as unknown as Response, next);

      expect(mockSavePaymentOptionData).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, RESPONSE_TASK_LIST_URL));
      expect(next).not.toHaveBeenCalled();
    });

    it('should save and redirect to the payment date page when pay by a set date is selected', async () => {
      req.body = {paymentType: PaymentOptionType.BY_SET_DATE};

      await postHandler(req as Request, res as unknown as Response, next);

      expect(mockSavePaymentOptionData).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CITIZEN_PA_PAYMENT_DATE_URL));
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next when saving fails', async () => {
      const error = new Error('draft failure');
      mockSavePaymentOptionData.mockRejectedValue(error);
      req.body = {paymentType: PaymentOptionType.BY_SET_DATE};

      await postHandler(req as Request, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
