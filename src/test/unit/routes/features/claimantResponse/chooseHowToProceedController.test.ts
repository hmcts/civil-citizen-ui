import config from 'config';
import {Response} from 'express';
import chooseHowToProceedController from 'routes/features/claimantResponse/chooseHowToProceedController';
import {CLAIMANT_RESPONSE_CHOOSE_HOW_TO_PROCEED_URL, CLAIMANT_RESPONSE_TASK_LIST_URL} from 'routes/urls';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {getClaimantResponse, saveClaimantResponse} from 'services/features/claimantResponse/claimantResponseService';
import {generateRedisKey} from 'modules/draft-store/draftStoreService';
import {ClaimantResponse} from 'models/claimantResponse';
import {ChooseHowProceed} from 'models/chooseHowProceed';
import {AppRequest} from 'models/AppRequest';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../utils/getRouteHandler';

jest.mock('services/features/claimantResponse/claimantResponseService');
jest.mock('modules/draft-store/draftStoreService');

const viewPath = 'features/claimantResponse/choose-how-to-proceed';
const claimId = '12345';
const taskListUrl = constructResponseUrlWithIdParams(claimId, CLAIMANT_RESPONSE_TASK_LIST_URL);

const invoke = async (method: 'get' | 'post', req: Record<string, unknown> = {}) => {
  const res = createMockResponse();
  const next = jest.fn();
  await getRouteHandler(chooseHowToProceedController, method, CLAIMANT_RESPONSE_CHOOSE_HOW_TO_PROCEED_URL)(
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

describe('Choose how to proceed Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (generateRedisKey as jest.Mock).mockReturnValue(claimId);
    (getClaimantResponse as jest.Mock).mockResolvedValue(new ClaimantResponse());
    (saveClaimantResponse as jest.Mock).mockResolvedValue(undefined);
  });

  describe('on GET', () => {
    it('should return intention to proceed page', async () => {
      const {res, next} = await invoke('get');

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        pageTitle: 'PAGES.CLAIMANT_FORMALISE_REPAYMENT_TYPE.PAGE_TITLE',
      }));
      expect(next).not.toHaveBeenCalled();
    });

    it('should return status 500 when error thrown', async () => {
      const error = new Error('redis failure');
      (getClaimantResponse as jest.Mock).mockRejectedValue(error);

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

    it('should redirect to the claimant response task-list if option SIGN_A_SETTLEMENT_AGREEMENT is selected', async () => {
      const settlementAgreementEnabled = config.get<boolean>('featureToggles.settlementAgreementEnabled') || false;
      const {res} = await invoke('post', {body: {option: ChooseHowProceed.SIGN_A_SETTLEMENT_AGREEMENT}});

      if (settlementAgreementEnabled) {
        expect(res.redirect).toHaveBeenCalledWith(taskListUrl);
      } else {
        expect(res.render.mock.calls[0][1].form.hasErrors()).toBe(true);
        expect(res.redirect).not.toHaveBeenCalled();
      }
    });

    it('should redirect to the claimant response task-list if option REQUEST_A_CCJ is selected', async () => {
      const {res} = await invoke('post', {body: {option: ChooseHowProceed.REQUEST_A_CCJ}});

      expect(saveClaimantResponse).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(taskListUrl);
    });

    it('should return status 500 when error thrown', async () => {
      const error = new Error('redis failure');
      (saveClaimantResponse as jest.Mock).mockRejectedValue(error);

      const {next} = await invoke('post', {body: {option: 'yes'}});

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
