import {Response} from 'express';
import courtProposedDateController from 'routes/features/claimantResponse/courtProposedDateController';
import {
  CLAIMANT_RESPONSE_COURT_OFFERED_SET_DATE_URL,
  CLAIMANT_RESPONSE_REJECTION_REASON_URL,
  CLAIMANT_RESPONSE_TASK_LIST_URL,
} from 'routes/urls';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {saveClaimantResponse} from 'services/features/claimantResponse/claimantResponseService';
import {generateRedisKey, getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {Claim} from 'models/claim';
import {ClaimantResponse} from 'models/claimantResponse';
import {Party} from 'models/party';
import {ResponseType} from 'form/models/responseType';
import {PartialAdmission} from 'models/partialAdmission';
import {PaymentIntention} from 'form/models/admission/paymentIntention';
import {PaymentOptionType} from 'form/models/admission/paymentOption/paymentOptionType';
import {CourtProposedDateOptions} from 'form/models/claimantResponse/courtProposedDate';
import {AppRequest} from 'models/AppRequest';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../utils/getRouteHandler';

jest.mock('services/features/claimantResponse/claimantResponseService');
jest.mock('modules/draft-store/draftStoreService');

const viewPath = 'features/claimantResponse/court-proposed-date';
const claimId = '12345';

const datedClaim = (): Claim => {
  const claim = new Claim();
  claim.respondent1 = new Party();
  claim.respondent1.responseType = ResponseType.PART_ADMISSION;
  claim.partialAdmission = new PartialAdmission();
  claim.partialAdmission.paymentIntention = new PaymentIntention();
  claim.partialAdmission.paymentIntention.paymentOption = PaymentOptionType.BY_SET_DATE;
  claim.partialAdmission.paymentIntention.paymentDate = new Date('2026-12-01');
  claim.claimantResponse = new ClaimantResponse();
  return claim;
};

const invoke = async (method: 'get' | 'post', req: Record<string, unknown> = {}) => {
  const res = createMockResponse();
  const next = jest.fn();
  await getRouteHandler(courtProposedDateController, method, CLAIMANT_RESPONSE_COURT_OFFERED_SET_DATE_URL)(
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

describe('Claimant court proposed date Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (generateRedisKey as jest.Mock).mockReturnValue(claimId);
    (getCaseDataFromStore as jest.Mock).mockResolvedValue(datedClaim());
    (saveClaimantResponse as jest.Mock).mockResolvedValue(undefined);
  });

  describe('on GET', () => {
    it('should return court proposed date page', async () => {
      const {res} = await invoke('get');

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        pageTitle: 'PAGES.CLAIMANT_RESPONSE.COURT_PROPOSED_DATE.PAGE_TITLE',
        paymentDate: expect.any(String),
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
      const {res} = await invoke('post', {body: {decision: null}});

      expect(res.render.mock.calls[0][1].form.hasErrors()).toBe(true);
      expect(saveClaimantResponse).not.toHaveBeenCalled();
    });

    it('should redirect to the claimant response task-list if option ACCEPT_REPAYMENT_DATE is selected', async () => {
      const {res} = await invoke('post', {body: {decision: CourtProposedDateOptions.ACCEPT_REPAYMENT_DATE}});

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CLAIMANT_RESPONSE_TASK_LIST_URL));
    });

    it('should redirect to rejection reason if option JUDGE_REPAYMENT_DATE is selected', async () => {
      const {res} = await invoke('post', {body: {decision: CourtProposedDateOptions.JUDGE_REPAYMENT_DATE}});

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CLAIMANT_RESPONSE_REJECTION_REASON_URL));
    });

    it('should return status 500 when error thrown', async () => {
      const error = new Error('redis failure');
      (saveClaimantResponse as jest.Mock).mockRejectedValue(error);

      const {next} = await invoke('post', {body: {decision: CourtProposedDateOptions.JUDGE_REPAYMENT_DATE}});

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
