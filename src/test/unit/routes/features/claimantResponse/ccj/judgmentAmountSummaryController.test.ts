import {Response} from 'express';
import judgmentAmountSummaryController from 'routes/features/claimantResponse/ccj/judgmentAmountSummaryController';
import {CCJ_PAID_AMOUNT_SUMMARY_URL, CCJ_PAYMENT_OPTIONS_URL} from 'routes/urls';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {generateRedisKey, getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {isJudgmentBufferEnabled} from '../../../../../../main/app/auth/launchdarkly/launchDarklyClient';
import {Claim} from 'models/claim';
import {AppRequest} from 'models/AppRequest';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../../utils/getRouteHandler';

jest.mock('modules/draft-store/draftStoreService');
jest.mock('../../../../../../main/app/auth/launchdarkly/launchDarklyClient', () => ({
  isJudgmentBufferEnabled: jest.fn(),
}));

const viewPath = 'features/claimantResponse/ccj/judgement-amount-summary';
const claimId = '12345';

const feeClaim = (): Claim => {
  const claim = new Claim();
  claim.totalClaimAmount = 100;
  claim.claimFee = {calculatedAmountInPence: 3500} as Claim['claimFee'];
  return claim;
};

const invoke = async (method: 'get' | 'post') => {
  const res = createMockResponse();
  const next = jest.fn();
  await getRouteHandler(judgmentAmountSummaryController, method, CCJ_PAID_AMOUNT_SUMMARY_URL)(
    {
      params: {id: claimId},
      query: {},
      cookies: {},
      session: createMockSession({user: {id: 'user-1'}}),
    } as unknown as AppRequest,
    res as unknown as Response,
    next,
  );
  return {res, next};
};

describe('Judgment Amount Summary', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (generateRedisKey as jest.Mock).mockReturnValue(claimId);
    (getCaseDataFromStore as jest.Mock).mockResolvedValue(feeClaim());
    (isJudgmentBufferEnabled as jest.Mock).mockResolvedValue(false);
  });

  describe('on GET', () => {
    it('should return judgement summary page - from request CCJ', async () => {
      const {res} = await invoke('get');

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        claimAmount: '100.00',
        claimFee: '35.00',
        pageTitle: 'PAGES.JUDGMENT_AMOUNT.PAGE_TITLE',
        judgmentSummaryDetails: expect.objectContaining({total: expect.any(String)}),
      }));
    });

    it('should return http 500 when has error in the get method - from request CCJ', async () => {
      const error = new Error('redis failure');
      (getCaseDataFromStore as jest.Mock).mockRejectedValue(error);

      const {next} = await invoke('get');

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST', () => {
    it('should redirect to ccj payment options - from request CCJ', async () => {
      const {res} = await invoke('post');

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CCJ_PAYMENT_OPTIONS_URL));
    });
  });
});
