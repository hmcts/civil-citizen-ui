import {Response} from 'express';
import claimantSuggestedPaymentDateController from 'routes/features/claimantResponse/claimantSuggestedPaymentDateController';
import {CLAIMANT_RESPONSE_PAYMENT_DATE_URL, CLAIMANT_RESPONSE_TASK_LIST_URL} from 'routes/urls';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {getClaimantResponse, saveClaimantResponse} from 'services/features/claimantResponse/claimantResponseService';
import {getDecisionOnClaimantProposedPlan} from 'services/features/claimantResponse/getDecisionOnClaimantProposedPlan';
import {generateRedisKey} from 'modules/draft-store/draftStoreService';
import {ClaimantResponse} from 'models/claimantResponse';
import {AppRequest} from 'models/AppRequest';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../utils/getRouteHandler';

jest.mock('services/features/claimantResponse/claimantResponseService');
jest.mock('services/features/claimantResponse/getDecisionOnClaimantProposedPlan');
jest.mock('modules/draft-store/draftStoreService');

const viewPath = 'features/response/admission/payment-date';
const claimId = '12345';

const invoke = async (method: 'get' | 'post', req: Record<string, unknown> = {}) => {
  const res = createMockResponse();
  const next = jest.fn();
  await getRouteHandler(claimantSuggestedPaymentDateController, method, CLAIMANT_RESPONSE_PAYMENT_DATE_URL)(
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

describe('Claimant suggested Payment date', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (generateRedisKey as jest.Mock).mockReturnValue(claimId);
    (getClaimantResponse as jest.Mock).mockResolvedValue(new ClaimantResponse());
    (saveClaimantResponse as jest.Mock).mockResolvedValue(undefined);
    (getDecisionOnClaimantProposedPlan as jest.Mock).mockResolvedValue(CLAIMANT_RESPONSE_TASK_LIST_URL);
  });

  describe('on Exception', () => {
    it('should return http 500 when has error in the get method', async () => {
      const error = new Error('redis failure');
      (getClaimantResponse as jest.Mock).mockRejectedValue(error);

      const {next} = await invoke('get');

      expect(next).toHaveBeenCalledWith(error);
    });

    it('should return http 500 when has error in the post method', async () => {
      const error = new Error('redis failure');
      (saveClaimantResponse as jest.Mock).mockRejectedValue(error);

      const {next} = await invoke('post', {body: {year: '9999', month: '12', day: '31'}});

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on GET', () => {
    it('should return payment date page', async () => {
      const {res} = await invoke('get');

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        title: 'PAGES.CCJ_DEFENDANT_PAYMENT_DATE.TITLE',
        pageTitle: 'PAGES.ADMISSION_PAYMENT_DATE.PAGE_TITLE',
      }));
    });
  });

  describe('on POST', () => {
    it('should return errors on no input', async () => {
      const {res} = await invoke('post', {body: {year: '', month: '', day: ''}});

      expect(res.render.mock.calls[0][1].form.hasErrors()).toBe(true);
      expect(saveClaimantResponse).not.toHaveBeenCalled();
    });

    it('should return errors on invalid month', async () => {
      const {res} = await invoke('post', {body: {year: '2023', month: '13', day: '1'}});

      expect(res.render.mock.calls[0][1].form.hasErrors()).toBe(true);
    });

    it('should return error on date in the past', async () => {
      const {res} = await invoke('post', {body: {year: '1999', month: '1', day: '1'}});

      expect(res.render.mock.calls[0][1].form.hasErrors()).toBe(true);
    });

    it('should redirect to claimant response task list page on valid payment date', async () => {
      const {res} = await invoke('post', {body: {year: '9999', month: '1', day: '1'}});

      expect(saveClaimantResponse).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CLAIMANT_RESPONSE_TASK_LIST_URL));
    });
  });
});
