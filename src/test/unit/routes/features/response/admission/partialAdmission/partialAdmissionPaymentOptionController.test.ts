import {Response} from 'express';
import partialAdmissionPaymentOptionController from '../../../../../../../main/routes/features/response/admission/partialAdmission/partialAdmissionPaymentOptionController';
import {
  CITIZEN_PA_PAYMENT_DATE_URL,
  RESPONSE_TASK_LIST_URL,
} from 'routes/urls';
import {PaymentOption} from 'form/models/admission/paymentOption/paymentOption';
import {PaymentOptionType} from 'form/models/admission/paymentOption/paymentOptionType';
import {ResponseType} from 'form/models/responseType';
import {getPaymentOptionForm, savePaymentOptionData} from 'services/features/response/admission/paymentOptionService';
import {generateRedisKey, getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {Claim} from 'models/claim';
import {AppRequest} from 'models/AppRequest';
import {GenericForm} from 'form/models/genericForm';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../../../utils/getRouteHandler';

jest.mock('modules/draft-store/draftStoreService');
jest.mock('services/features/response/admission/paymentOptionService');

describe('Part Admit - Payment Option Controller', () => {
  const getHandler = getRouteHandler(partialAdmissionPaymentOptionController, 'get');
  const postHandler = getRouteHandler(partialAdmissionPaymentOptionController, 'post');
  const viewPath = 'features/response/admission/payment-option';
  const claimId = '12345';
  const admittedAmount = 23;
  let req: Partial<AppRequest>;
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;
  const mockGetCaseData = getCaseDataFromStore as jest.Mock;
  const mockGenerateRedisKey = generateRedisKey as jest.Mock;
  const mockGetPaymentOptionForm = getPaymentOptionForm as jest.Mock;
  const mockSavePaymentOptionData = savePaymentOptionData as jest.Mock;
  const renderedForm = () => (res.render as jest.Mock).mock.calls[0][1].form;

  const partAdmitClaim = (amount?: number): Claim => {
    const claim = new Claim();
    jest.spyOn(claim, 'isPartialAdmission').mockReturnValue(true);
    jest.spyOn(claim, 'partialAdmissionPaymentAmount').mockReturnValue(amount);
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
    mockGenerateRedisKey.mockReturnValue(claimId);
    mockGetCaseData.mockResolvedValue(partAdmitClaim(admittedAmount));
    mockGetPaymentOptionForm.mockResolvedValue(new PaymentOption(undefined, admittedAmount));
    mockSavePaymentOptionData.mockResolvedValue(undefined);
  });

  describe('on GET', () => {
    it('should render payment option page successfully', async () => {
      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        form: expect.any(GenericForm),
        amount: admittedAmount,
        responseType: ResponseType.PART_ADMISSION,
      }));
    });

    it('should redirect to claim task list when response type is not part admission', async () => {
      mockGetCaseData.mockResolvedValue(new Claim());

      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, RESPONSE_TASK_LIST_URL));
    });

    it('should redirect to claim task list when admitted payment amount is not provided', async () => {
      mockGetCaseData.mockResolvedValue(partAdmitClaim(undefined));

      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, RESPONSE_TASK_LIST_URL));
    });

    it('should call next when loading the claim fails', async () => {
      const error = new Error('error');
      mockGetCaseData.mockRejectedValue(error);

      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST', () => {
    beforeEach(async () => {
      await getHandler(req as AppRequest, res as unknown as Response, next);
      res = createMockResponse();
      next = jest.fn();
    });

    it('should re-render when option is not selected', async () => {
      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        form: expect.any(GenericForm),
        amount: admittedAmount,
        responseType: ResponseType.PART_ADMISSION,
      }));
      expect(renderedForm().hasErrors()).toBe(true);
      expect(renderedForm().errorFor('paymentType')).toBe('ERRORS.VALID_PAYMENT_OPTION');
    });

    it('should redirect to claim task list when immediately option is selected', async () => {
      req.body = {paymentType: PaymentOptionType.IMMEDIATELY};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(mockSavePaymentOptionData).toHaveBeenCalledWith(claimId, expect.any(PaymentOption), ResponseType.PART_ADMISSION);
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, RESPONSE_TASK_LIST_URL));
    });

    it('should redirect to claim task list when instalments option is selected', async () => {
      req.body = {paymentType: PaymentOptionType.IMMEDIATELY};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, RESPONSE_TASK_LIST_URL));
    });

    it('should redirect to payment date when by set date option is selected', async () => {
      req.body = {paymentType: PaymentOptionType.BY_SET_DATE};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CITIZEN_PA_PAYMENT_DATE_URL));
    });

    it('should call next when save fails', async () => {
      const error = new Error('error');
      mockSavePaymentOptionData.mockRejectedValue(error);
      req.body = {paymentType: PaymentOptionType.BY_SET_DATE};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
