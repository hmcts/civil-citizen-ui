import {Response} from 'express';
import rejectionReasonController from 'routes/features/claimantResponse/rejectionReasonController';
import {CLAIMANT_RESPONSE_REJECTION_REASON_URL, CLAIMANT_RESPONSE_TASK_LIST_URL} from 'routes/urls';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {getClaimantResponse, saveClaimantResponse} from 'services/features/claimantResponse/claimantResponseService';
import {generateRedisKey} from 'modules/draft-store/draftStoreService';
import {ClaimantResponse} from 'models/claimantResponse';
import {AppRequest} from 'models/AppRequest';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../utils/getRouteHandler';

jest.mock('services/features/claimantResponse/claimantResponseService');
jest.mock('modules/draft-store/draftStoreService');

const viewPath = 'features/claimantResponse/rejection-reason';
const claimId = '12345';

const invoke = async (method: 'get' | 'post', req: Record<string, unknown> = {}) => {
  const res = createMockResponse();
  const next = jest.fn();
  await getRouteHandler(rejectionReasonController, method, CLAIMANT_RESPONSE_REJECTION_REASON_URL)(
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

describe('Claimant Response - Rejection reason', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (generateRedisKey as jest.Mock).mockReturnValue(claimId);
    (getClaimantResponse as jest.Mock).mockResolvedValue(new ClaimantResponse());
    (saveClaimantResponse as jest.Mock).mockResolvedValue(undefined);
  });

  describe('on GET', () => {
    it('should return rejection response page', async () => {
      const {res} = await invoke('get');

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        pageTitle: 'PAGES.CLAIMANT_RESPONSE_REJECTION_REASON.PAGE_TITLE',
        courtProposedPlanDecision: '',
      }));
    });

    it('should return http 500 when has error', async () => {
      const error = new Error('redis failure');
      (getClaimantResponse as jest.Mock).mockRejectedValue(error);

      const {next} = await invoke('get');

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST', () => {
    it('should redirect to claimant-response task list page', async () => {
      const {res} = await invoke('post', {body: {text: 'test'}});

      expect(saveClaimantResponse).toHaveBeenCalledWith(claimId, expect.objectContaining({text: 'test'}), 'rejectionReason');
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CLAIMANT_RESPONSE_TASK_LIST_URL));
    });

    it('should return error on incorrect input', async () => {
      const {res} = await invoke('post');

      expect(res.render.mock.calls[0][1].form.hasErrors()).toBe(true);
      expect(saveClaimantResponse).not.toHaveBeenCalled();
    });

    it('should return http 500 when saving into redis has error', async () => {
      const error = new Error('redis failure');
      (saveClaimantResponse as jest.Mock).mockRejectedValue(error);

      const {next} = await invoke('post', {body: {text: 'test'}});

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
