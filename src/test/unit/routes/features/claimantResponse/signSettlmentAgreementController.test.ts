import {Response} from 'express';
import signSettlementAgreementController from 'routes/features/claimantResponse/signSettlmentAgreementController';
import {CLAIMANT_RESPONSE_TASK_LIST_URL, CLAIMANT_SIGN_SETTLEMENT_AGREEMENT} from 'routes/urls';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {getClaimantResponse, saveClaimantResponse} from 'services/features/claimantResponse/claimantResponseService';
import {generateRedisKey, getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {getPaymentText} from 'services/features/claimantResponse/signSettlmentAgreementService';
import {Claim} from 'models/claim';
import {ClaimantResponse} from 'models/claimantResponse';
import {AppRequest} from 'models/AppRequest';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../utils/getRouteHandler';

jest.mock('services/features/claimantResponse/claimantResponseService');
jest.mock('modules/draft-store/draftStoreService');
jest.mock('services/features/claimantResponse/signSettlmentAgreementService', () => ({
  getPaymentText: jest.fn(),
}));

const viewPath = 'features/claimantResponse/sign-settlement-agreement';
const claimId = '12345';
const paymentData = {
  paymentText: 'PAGES.CLAIMANT_TERMS_OF_AGREEMENT.DETAILS.THE_AGREEMENT.PAYMENT_TEXT',
  claimant: 'John White',
};

const invoke = async (method: 'get' | 'post', req: Record<string, unknown> = {}) => {
  const res = createMockResponse();
  const next = jest.fn();
  await getRouteHandler(signSettlementAgreementController, method, CLAIMANT_SIGN_SETTLEMENT_AGREEMENT)(
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

describe('Sign Settlement Agreement', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (generateRedisKey as jest.Mock).mockReturnValue(claimId);
    (getCaseDataFromStore as jest.Mock).mockResolvedValue(new Claim());
    (getClaimantResponse as jest.Mock).mockResolvedValue(new ClaimantResponse());
    (saveClaimantResponse as jest.Mock).mockResolvedValue(undefined);
    (getPaymentText as jest.Mock).mockReturnValue(paymentData);
  });

  describe('on GET', () => {
    it('should return sign settlement agreement page', async () => {
      const {res} = await invoke('get');

      expect(getPaymentText).toHaveBeenCalled();
      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        pageTitle: 'PAGES.CLAIMANT_TERMS_OF_AGREEMENT.PAGE_TITLE',
        data: paymentData,
      }));
    });

    it('should return status 500 when error thrown', async () => {
      const error = new Error('redis failure');
      (getCaseDataFromStore as jest.Mock).mockRejectedValue(error);

      const {next} = await invoke('get');

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST', () => {
    it('should return error on empty post', async () => {
      const {res} = await invoke('post');

      expect(res.render.mock.calls[0][1].form.hasErrors()).toBe(true);
      expect(saveClaimantResponse).not.toHaveBeenCalled();
    });

    it('should redirect to the claimant response task-list if sign agreement checkbox is selected', async () => {
      const {res} = await invoke('post', {body: {signed: 'true'}});

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CLAIMANT_RESPONSE_TASK_LIST_URL));
    });

    it('should return status 500 when error thrown', async () => {
      const error = new Error('redis failure');
      (saveClaimantResponse as jest.Mock).mockRejectedValue(error);

      const {next} = await invoke('post', {body: {signed: 'true'}});

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
