import {Response} from 'express';
import claimantIntentionToProceedController from 'routes/features/claimantResponse/claimantIntentionToProceedController';
import {CLAIMANT_RESPONSE_INTENTION_TO_PROCEED_URL, CLAIMANT_RESPONSE_TASK_LIST_URL} from 'routes/urls';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {getClaimantResponse, saveClaimantResponse} from 'services/features/claimantResponse/claimantResponseService';
import {generateRedisKey} from 'modules/draft-store/draftStoreService';
import {ClaimantResponse} from 'models/claimantResponse';
import {YesNo} from 'form/models/yesNo';
import {AppRequest} from 'models/AppRequest';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../utils/getRouteHandler';

jest.mock('services/features/claimantResponse/claimantResponseService');
jest.mock('modules/draft-store/draftStoreService');

const viewPath = 'features/claimantResponse/claimant-intention-to-proceed';
const claimId = '12345';
const taskListUrl = constructResponseUrlWithIdParams(claimId, CLAIMANT_RESPONSE_TASK_LIST_URL);

const invoke = async (method: 'get' | 'post', req: Record<string, unknown> = {}) => {
  const res = createMockResponse();
  const next = jest.fn();
  await getRouteHandler(claimantIntentionToProceedController, method, CLAIMANT_RESPONSE_INTENTION_TO_PROCEED_URL)(
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

describe('Claimant intention to proceed Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (generateRedisKey as jest.Mock).mockReturnValue(claimId);
    (getClaimantResponse as jest.Mock).mockResolvedValue(new ClaimantResponse());
    (saveClaimantResponse as jest.Mock).mockResolvedValue(undefined);
  });

  describe('on GET', () => {
    it('should return intention to proceed page', async () => {
      const {res} = await invoke('get');

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        pageTitle: 'PAGES.CLAIMANT_RESPONSE_PROCEED.PAGE_TITLE',
      }));
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
      expect(res.redirect).not.toHaveBeenCalled();
    });

    it('should redirect to the claimant response task-list if option yes is selected', async () => {
      const {res} = await invoke('post', {body: {option: YesNo.YES}});

      expect(saveClaimantResponse).toHaveBeenCalledWith(claimId, YesNo.YES, 'option', 'intentionToProceed');
      expect(res.redirect).toHaveBeenCalledWith(taskListUrl);
    });

    it('should redirect to the claimant response task-list page if option no is selected', async () => {
      const {res} = await invoke('post', {body: {option: YesNo.NO}});

      expect(saveClaimantResponse).toHaveBeenCalledWith(claimId, YesNo.NO, 'option', 'intentionToProceed');
      expect(res.redirect).toHaveBeenCalledWith(taskListUrl);
    });

    it('should return status 500 when error thrown', async () => {
      const error = new Error('redis failure');
      (saveClaimantResponse as jest.Mock).mockRejectedValue(error);

      const {next} = await invoke('post', {body: {option: YesNo.YES}});

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
