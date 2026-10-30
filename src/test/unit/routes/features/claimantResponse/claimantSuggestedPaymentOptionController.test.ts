import {Response} from 'express';
import claimantSuggestedPaymentOptionController from 'routes/features/claimantResponse/claimantSuggestedPaymentOptionController';
import {
  CLAIMANT_RESPONSE_COURT_OFFERED_SET_DATE_URL,
  CLAIMANT_RESPONSE_PAYMENT_DATE_URL,
  CLAIMANT_RESPONSE_PAYMENT_OPTION_URL,
  CLAIMANT_RESPONSE_PAYMENT_PLAN_URL,
} from 'routes/urls';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {saveClaimantResponse} from 'services/features/claimantResponse/claimantResponseService';
import {getDecisionOnClaimantProposedPlan} from 'services/features/claimantResponse/getDecisionOnClaimantProposedPlan';
import {generateRedisKey, getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {clearClaimantSuggestion} from 'routes/features/claimantResponse/clearClaimantSuggestionService';
import {Claim} from 'models/claim';
import {ClaimantResponse} from 'models/claimantResponse';
import {PaymentOptionType} from 'form/models/admission/paymentOption/paymentOptionType';
import {AppRequest} from 'models/AppRequest';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../utils/getRouteHandler';

jest.mock('services/features/claimantResponse/claimantResponseService');
jest.mock('services/features/claimantResponse/getDecisionOnClaimantProposedPlan');
jest.mock('modules/draft-store/draftStoreService');
jest.mock('routes/features/claimantResponse/clearClaimantSuggestionService', () => ({
  clearClaimantSuggestion: jest.fn(async (_redisKey: string, claim: unknown) => claim),
}));

const viewPath = 'features/response/admission/payment-option';
const claimId = '12345';

const suggestedClaim = (): Claim => {
  const claim = new Claim();
  claim.claimantResponse = new ClaimantResponse();
  return claim;
};

const invoke = async (method: 'get' | 'post', req: Record<string, unknown> = {}) => {
  const res = createMockResponse();
  const next = jest.fn();
  await getRouteHandler(claimantSuggestedPaymentOptionController, method, CLAIMANT_RESPONSE_PAYMENT_OPTION_URL)(
    {
      params: {id: claimId},
      body: {},
      query: {},
      cookies: {},
      session: createMockSession({user: {id: 'user-1'}}),
      ...req,
    } as unknown as AppRequest,
    res as unknown as Response,
    next,
  );
  return {res, next};
};

describe('Claimant suggested Payment Option Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (generateRedisKey as jest.Mock).mockReturnValue(claimId);
    (getCaseDataFromStore as jest.Mock).mockResolvedValue(suggestedClaim());
    (clearClaimantSuggestion as jest.Mock).mockImplementation(async (_redisKey: string, claim: unknown) => claim);
    (saveClaimantResponse as jest.Mock).mockResolvedValue(undefined);
    (getDecisionOnClaimantProposedPlan as jest.Mock).mockResolvedValue(CLAIMANT_RESPONSE_COURT_OFFERED_SET_DATE_URL);
  });

  describe('on Get', () => {
    it('should return payment option page successfully', async () => {
      const {res} = await invoke('get');

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        isClaimantResponse: true,
      }));
    });

    it('should return status 500 when there is an error', async () => {
      const error = new Error('redis failure');
      (getCaseDataFromStore as jest.Mock).mockRejectedValue(error);

      const {next} = await invoke('get');

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on Post', () => {
    it('should validate when option is not selected', async () => {
      const {res} = await invoke('post', {body: {}});

      expect(res.render.mock.calls[0][1].form.hasErrors()).toBe(true);
      expect(saveClaimantResponse).not.toHaveBeenCalled();
    });

    it('should redirect to the calculated decision when immediately option is selected', async () => {
      const {res} = await invoke('post', {body: {paymentType: PaymentOptionType.IMMEDIATELY}});

      expect(getDecisionOnClaimantProposedPlan).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CLAIMANT_RESPONSE_COURT_OFFERED_SET_DATE_URL));
    });

    it('should redirect to suggest instalments page when instalments option is selected', async () => {
      const {res} = await invoke('post', {body: {paymentType: PaymentOptionType.INSTALMENTS}});

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CLAIMANT_RESPONSE_PAYMENT_PLAN_URL));
    });

    it('should redirect to payment date page when by set date option is selected', async () => {
      const {res} = await invoke('post', {body: {paymentType: PaymentOptionType.BY_SET_DATE}});

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CLAIMANT_RESPONSE_PAYMENT_DATE_URL));
    });

    it('should return 500 status when there is error', async () => {
      const error = new Error('redis failure');
      (saveClaimantResponse as jest.Mock).mockRejectedValue(error);

      const {next} = await invoke('post', {body: {paymentType: PaymentOptionType.BY_SET_DATE}});

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
