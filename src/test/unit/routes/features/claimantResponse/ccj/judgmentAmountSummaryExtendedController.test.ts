import {Response} from 'express';
import judgmentAmountSummaryExtendedController from 'routes/features/claimantResponse/ccj/judgmentAmountSummaryExtendedController';
import {CCJ_EXTENDED_PAID_AMOUNT_SUMMARY_URL, CLAIMANT_RESPONSE_TASK_LIST_URL} from 'routes/urls';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {generateRedisKey, getCaseDataFromStore, saveDraftClaim} from 'modules/draft-store/draftStoreService';
import {isJudgmentBufferEnabled} from '../../../../../../main/app/auth/launchdarkly/launchDarklyClient';
import {Claim} from 'models/claim';
import {ClaimantResponse} from 'models/claimantResponse';
import {ChooseHowProceed} from 'models/chooseHowProceed';
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
  claim.id = claimId;
  claim.totalClaimAmount = 100;
  claim.claimFee = {calculatedAmountInPence: 3500} as Claim['claimFee'];
  claim.claimantResponse = new ClaimantResponse();
  return claim;
};

const invoke = async (method: 'get' | 'post') => {
  const res = createMockResponse();
  const next = jest.fn();
  const handler = getRouteHandler(judgmentAmountSummaryExtendedController, method, CCJ_EXTENDED_PAID_AMOUNT_SUMMARY_URL);
  await handler(
    {
      params: {id: claimId},
      query: {},
      cookies: {},
      session: createMockSession({user: {id: 'user-1'}}),
    } as unknown as AppRequest,
    res as unknown as Response,
    next,
  );
  await new Promise((resolve) => setImmediate(resolve));
  return {res, next};
};

describe('Judgment Amount Summary Extended', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (generateRedisKey as jest.Mock).mockReturnValue(claimId);
    (getCaseDataFromStore as jest.Mock).mockResolvedValue(feeClaim());
    (saveDraftClaim as jest.Mock).mockResolvedValue(undefined);
    (isJudgmentBufferEnabled as jest.Mock).mockResolvedValue(false);
  });

  describe('on GET', () => {
    it('should return judgement summary page - from claimant response task-list', async () => {
      const {res} = await invoke('get');

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        claimAmount: 100,
        claimFee: 35,
        pageTitle: 'PAGES.JUDGMENT_AMOUNT.PAGE_TITLE',
      }));
    });

    it('should return http 500 when has error in the get method - from claimant response task-list', async () => {
      const error = new Error('redis failure');
      (getCaseDataFromStore as jest.Mock).mockRejectedValue(error);

      const {next} = await invoke('get');

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST', () => {
    it('should redirect to the claimant response task list', async () => {
      const {res} = await invoke('post');

      expect(saveDraftClaim).toHaveBeenCalledWith(
        claimId,
        expect.objectContaining({
          claimantResponse: expect.objectContaining({
            chooseHowToProceed: expect.objectContaining({option: ChooseHowProceed.REQUEST_A_CCJ}),
          }),
        }),
        true,
        'user-1',
      );
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CLAIMANT_RESPONSE_TASK_LIST_URL));
    });
  });
});
