import {Response} from 'express';
import settleClaimController from 'routes/features/claimantResponse/settleClaimController';
import {
  CLAIMANT_RESPONSE_REJECTION_REASON_URL,
  CLAIMANT_RESPONSE_SETTLE_CLAIM_URL,
  CLAIMANT_RESPONSE_TASK_LIST_URL,
} from 'routes/urls';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {saveClaimantResponse} from 'services/features/claimantResponse/claimantResponseService';
import {generateRedisKey, getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {Claim} from 'models/claim';
import {Party} from 'models/party';
import {ResponseType} from 'form/models/responseType';
import {PartialAdmission} from 'models/partialAdmission';
import {HowMuchHaveYouPaid} from 'form/models/admission/howMuchHaveYouPaid';
import {RejectAllOfClaim} from 'form/models/rejectAllOfClaim';
import {YesNo} from 'form/models/yesNo';
import {AppRequest} from 'models/AppRequest';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../utils/getRouteHandler';

jest.mock('services/features/claimantResponse/claimantResponseService');
jest.mock('modules/draft-store/draftStoreService');

const viewPath = 'features/claimantResponse/settle-claim';
const claimId = '12345';

const partPaidClaim = (): Claim => {
  const claim = new Claim();
  claim.totalClaimAmount = 1000;
  claim.respondent1 = new Party();
  claim.respondent1.responseType = ResponseType.PART_ADMISSION;
  claim.partialAdmission = new PartialAdmission();
  claim.partialAdmission.alreadyPaid = {option: YesNo.YES} as PartialAdmission['alreadyPaid'];
  claim.partialAdmission.howMuchHaveYouPaid = new HowMuchHaveYouPaid();
  claim.partialAdmission.howMuchHaveYouPaid.amount = 20;
  return claim;
};

const paidInFullClaim = (): Claim => {
  const claim = new Claim();
  claim.totalClaimAmount = 10;
  claim.respondent1 = new Party();
  claim.respondent1.responseType = ResponseType.FULL_DEFENCE;
  claim.rejectAllOfClaim = new RejectAllOfClaim();
  claim.rejectAllOfClaim.howMuchHaveYouPaid = new HowMuchHaveYouPaid();
  claim.rejectAllOfClaim.howMuchHaveYouPaid.amount = 10;
  return claim;
};

const invoke = async (method: 'get' | 'post', req: Record<string, unknown> = {}) => {
  const res = createMockResponse();
  const next = jest.fn();
  await getRouteHandler(settleClaimController, method, CLAIMANT_RESPONSE_SETTLE_CLAIM_URL)(
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

describe('Claimant Response - Settle Claim Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (generateRedisKey as jest.Mock).mockReturnValue(claimId);
    (getCaseDataFromStore as jest.Mock).mockResolvedValue(partPaidClaim());
    (saveClaimantResponse as jest.Mock).mockResolvedValue(undefined);
  });

  describe('on GET', () => {
    it('should return settle claim page', async () => {
      const {res} = await invoke('get');

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        paidAmount: 20,
        isPaidInFull: false,
      }));
    });

    it('should return settle claim page when defendant paid full amount', async () => {
      (getCaseDataFromStore as jest.Mock).mockResolvedValue(paidInFullClaim());

      const {res} = await invoke('get');

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        paidAmount: 10,
        isPaidInFull: true,
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

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        paidAmount: 20,
        isPaidInFull: false,
        formatValues: [{
          keyError: 'ERRORS.SETTLE_CLAIM_REQUIRED',
          keyToReplace: '[£]',
          valueToReplace: '£20',
        }],
      }));
      expect(res.render.mock.calls[0][1].form.hasErrors()).toBe(true);
    });

    it('should redirect to the claimant response task-list if option yes is selected', async () => {
      const {res} = await invoke('post', {body: {option: YesNo.YES}});

      expect(saveClaimantResponse).toHaveBeenCalledWith(claimId, expect.anything(), 'hasPartPaymentBeenAccepted');
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CLAIMANT_RESPONSE_TASK_LIST_URL));
    });

    it('should redirect to the claimant response reject reason page if option no is selected', async () => {
      const {res} = await invoke('post', {body: {option: YesNo.NO}});

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CLAIMANT_RESPONSE_REJECTION_REASON_URL));
    });

    it('should return status 500 when error thrown', async () => {
      const error = new Error('redis failure');
      (getCaseDataFromStore as jest.Mock).mockRejectedValue(error);

      const {next} = await invoke('post', {body: {option: YesNo.YES}});

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
