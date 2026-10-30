import {Response} from 'express';
import partPaymentReceivedController from 'routes/features/claimantResponse/partPaymentReceivedController';
import {CLAIMANT_RESPONSE_PART_PAYMENT_RECEIVED_URL, CLAIMANT_RESPONSE_TASK_LIST_URL} from 'routes/urls';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {saveClaimantResponse} from 'services/features/claimantResponse/claimantResponseService';
import {generateRedisKey, getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {Claim} from 'models/claim';
import {Party} from 'models/party';
import {ResponseType} from 'form/models/responseType';
import {PartialAdmission} from 'models/partialAdmission';
import {HowMuchHaveYouPaid} from 'form/models/admission/howMuchHaveYouPaid';
import {YesNo} from 'form/models/yesNo';
import {AppRequest} from 'models/AppRequest';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../utils/getRouteHandler';

jest.mock('services/features/claimantResponse/claimantResponseService');
jest.mock('modules/draft-store/draftStoreService');

const viewPath = 'features/claimantResponse/part-payment-received';
const claimId = '12345';
const taskListUrl = constructResponseUrlWithIdParams(claimId, CLAIMANT_RESPONSE_TASK_LIST_URL);

const paidClaim = (): Claim => {
  const claim = new Claim();
  claim.respondent1 = new Party();
  claim.respondent1.responseType = ResponseType.PART_ADMISSION;
  claim.partialAdmission = new PartialAdmission();
  claim.partialAdmission.alreadyPaid = {option: YesNo.YES} as PartialAdmission['alreadyPaid'];
  claim.partialAdmission.howMuchHaveYouPaid = new HowMuchHaveYouPaid();
  claim.partialAdmission.howMuchHaveYouPaid.amount = 20;
  return claim;
};

const invoke = async (method: 'get' | 'post', req: Record<string, unknown> = {}) => {
  const res = createMockResponse();
  const next = jest.fn();
  await getRouteHandler(partPaymentReceivedController, method, CLAIMANT_RESPONSE_PART_PAYMENT_RECEIVED_URL)(
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

describe('Claimant Response - Part Payment Received Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (generateRedisKey as jest.Mock).mockReturnValue(claimId);
    (getCaseDataFromStore as jest.Mock).mockResolvedValue(paidClaim());
    (saveClaimantResponse as jest.Mock).mockResolvedValue(undefined);
  });

  describe('on GET', () => {
    it('should return has the defendant paid you amount page', async () => {
      const {res} = await invoke('get');

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        paidAmount: 20,
        pageTitle: 'PAGES.CLAIMANT_RESPONSE_PART_PAYMENT_RECEIVED.PAGE_TITLE',
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

    it('should redirect to the claimant response task-list if option yes is selected', async () => {
      const {res} = await invoke('post', {body: {option: YesNo.YES}});

      expect(saveClaimantResponse).toHaveBeenCalledWith(claimId, expect.objectContaining({option: YesNo.YES}), 'hasDefendantPaidYou');
      expect(res.redirect).toHaveBeenCalledWith(taskListUrl);
    });

    it('should redirect to the claimant response task-list page if option no is selected', async () => {
      const {res} = await invoke('post', {body: {option: YesNo.NO}});

      expect(saveClaimantResponse).toHaveBeenCalledWith(claimId, expect.objectContaining({option: YesNo.NO}), 'hasDefendantPaidYou');
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
