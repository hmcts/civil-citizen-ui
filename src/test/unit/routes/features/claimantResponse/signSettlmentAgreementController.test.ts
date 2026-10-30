import {Response} from 'express';
import i18next from 'i18next';
import en from 'modules/i18n/locales/en.json';
import signSettlementAgreementController from 'routes/features/claimantResponse/signSettlmentAgreementController';
import {CLAIMANT_RESPONSE_TASK_LIST_URL, CLAIMANT_SIGN_SETTLEMENT_AGREEMENT} from 'routes/urls';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {getClaimantResponse, saveClaimantResponse} from 'services/features/claimantResponse/claimantResponseService';
import {generateRedisKey, getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {Claim} from 'models/claim';
import {ClaimantResponse} from 'models/claimantResponse';
import {Party} from 'models/party';
import {PartyType} from 'models/partyType';
import {ResponseType} from 'form/models/responseType';
import {PartialAdmission} from 'models/partialAdmission';
import {PaymentIntention} from 'form/models/admission/paymentIntention';
import {PaymentOptionType} from 'form/models/admission/paymentOption/paymentOptionType';
import {HowMuchDoYouOwe} from 'form/models/admission/partialAdmission/howMuchDoYouOwe';
import {TransactionSchedule} from 'form/models/statementOfMeans/expensesAndIncome/transactionSchedule';
import {RepaymentDecisionType} from 'models/claimantResponse/RepaymentDecisionType';
import {YesNo} from 'form/models/yesNo';
import {AppRequest} from 'models/AppRequest';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../utils/getRouteHandler';

jest.mock('services/features/claimantResponse/claimantResponseService');
jest.mock('modules/draft-store/draftStoreService');

const viewPath = 'features/claimantResponse/sign-settlement-agreement';
const claimId = '12345';

const instalmentClaim = (): Claim => {
  const claim = new Claim();
  claim.totalClaimAmount = 1000;
  claim.respondent1 = new Party();
  claim.respondent1.type = PartyType.INDIVIDUAL;
  claim.respondent1.responseType = ResponseType.PART_ADMISSION;
  claim.respondent1.partyDetails = {firstName: 'John', lastName: 'White'} as unknown as Party['partyDetails'];
  claim.applicant1 = new Party();
  claim.applicant1.type = PartyType.INDIVIDUAL;
  claim.applicant1.partyDetails = {firstName: 'James', lastName: 'White'} as unknown as Party['partyDetails'];
  claim.partialAdmission = new PartialAdmission();
  claim.partialAdmission.alreadyPaid = {option: YesNo.YES} as PartialAdmission['alreadyPaid'];
  const howMuchDoYouOwe = new HowMuchDoYouOwe();
  howMuchDoYouOwe.amount = 200;
  howMuchDoYouOwe.totalAmount = 1000;
  claim.partialAdmission.howMuchDoYouOwe = howMuchDoYouOwe;
  claim.partialAdmission.paymentIntention = new PaymentIntention();
  claim.partialAdmission.paymentIntention.paymentOption = PaymentOptionType.INSTALMENTS;
  claim.partialAdmission.paymentIntention.repaymentPlan = {
    paymentAmount: 50,
    repaymentFrequency: TransactionSchedule.WEEK,
    firstRepaymentDate: new Date(),
  };
  claim.claimantResponse = new ClaimantResponse();
  return claim;
};

const immediatePlanClaim = (): Claim => {
  const claim = instalmentClaim();
  claim.claimantResponse.courtDecision = RepaymentDecisionType.IN_FAVOUR_OF_CLAIMANT;
  claim.claimantResponse.suggestedPaymentIntention = new PaymentIntention();
  claim.claimantResponse.suggestedPaymentIntention.paymentOption = PaymentOptionType.IMMEDIATELY;
  claim.claimantResponse.suggestedImmediatePaymentDeadLine = new Date() as unknown as ClaimantResponse['suggestedImmediatePaymentDeadLine'];
  return claim;
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
  beforeAll(async () => {
    await i18next.init({lng: 'en', fallbackLng: 'en', resources: {en: {translation: en}}});
  });

  beforeEach(() => {
    jest.clearAllMocks();
    (generateRedisKey as jest.Mock).mockReturnValue(claimId);
    (getCaseDataFromStore as jest.Mock).mockResolvedValue(instalmentClaim());
    (getClaimantResponse as jest.Mock).mockResolvedValue(new ClaimantResponse());
    (saveClaimantResponse as jest.Mock).mockResolvedValue(undefined);
  });

  describe('on GET', () => {
    it('should return sign settlement agreement page', async () => {
      const {res} = await invoke('get');

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        pageTitle: 'PAGES.CLAIMANT_TERMS_OF_AGREEMENT.PAGE_TITLE',
        data: expect.objectContaining({
          paymentText: expect.stringContaining('John White'),
        }),
      }));
    });

    it('should return sign settlement agreement page - court decision in favour of claimant', async () => {
      (getCaseDataFromStore as jest.Mock).mockResolvedValue(immediatePlanClaim());

      const {res} = await invoke('get');

      const paymentText = res.render.mock.calls[0][1].data.paymentText as string;
      expect(paymentText).toContain('John White');
      expect(paymentText).toContain('James White');
      expect(paymentText).toContain('£200');
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
