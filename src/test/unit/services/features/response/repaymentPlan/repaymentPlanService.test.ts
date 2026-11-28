import {getResponseDraft, updateResponseDraft} from 'modules/draft-store/response/responseDraftStoreService';
import {
  getRepaymentPlanForm,
  saveRepaymentPlanData,
} from 'services/features/response/repaymentPlan/repaymentPlanService';
import {Claim} from 'common/models/claim';
import {RepaymentPlanForm} from 'common/form/models/repaymentPlan/repaymentPlanForm';
import {PartialAdmission} from 'common/models/partialAdmission';
import {PaymentIntention} from 'common/form/models/admission/paymentIntention';
import {Party} from 'common/models/party';
import {ResponseType} from 'common/form/models/responseType';
import {FullAdmission} from 'common/models/fullAdmission';
import {PaymentOptionType} from 'common/form/models/admission/paymentOption/paymentOptionType';
import {HowMuchDoYouOwe} from 'common/form/models/admission/partialAdmission/howMuchDoYouOwe';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import * as claimDetailsService from 'modules/claimDetailsService';
import {AppRequest} from 'models/AppRequest';

jest.mock('modules/draft-store/response/responseDraftStoreService');
jest.mock('modules/claimDetailsService');

const mockGetResponseDraft = getResponseDraft as jest.Mock;
const mockUpdateResponseDraft = updateResponseDraft as jest.Mock;
const mockGetTotalAmountWithInterest = claimDetailsService.getTotalAmountWithInterest as jest.Mock;

const TOTAL_CLAIM_AMOUNT = 1000;
const PAYMENT_AMOUNT = 100;
const PART_ADMIT_AMOUNT = 77;
const REPAYMENT_FREQUENCY = 'WEEK';
const YEAR = '2023';
const MONTH = '02';
const DAY = '02';
const FIRST_PAYMENT_DATE = new Date('2023-02-14T00:00:00.000');

const caseId = '1645882162449409';
const mockReq = {
  params: {id: caseId},
  session: {user: {id: 'user-1', accessToken: 'token'}},
} as unknown as AppRequest;

const mockDraftResult = (claim: Claim) => ({
  claimResponse: {id: 'draft-123', case_data: claim},
  rawResponse: {draftId: 'draft-123', payload: claim},
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '',
  expiresAt: '',
});

const validForm = () => new RepaymentPlanForm(
  TOTAL_CLAIM_AMOUNT,
  PAYMENT_AMOUNT,
  REPAYMENT_FREQUENCY,
  YEAR,
  MONTH,
  DAY,
);

describe('Repayment Plan Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getRepaymentPlanForm', () => {
    it('should get empty form when no data exist', async () => {
      mockGetTotalAmountWithInterest.mockResolvedValue(undefined);

      const form = await getRepaymentPlanForm(new Claim());

      expect(form.totalClaimAmount).toBeUndefined();
      expect(form.paymentAmount).toBeUndefined();
      expect(form.repaymentFrequency).toBeUndefined();
      expect(form.day).toBeUndefined();
      expect(form.month).toBeUndefined();
      expect(form.year).toBeUndefined();
    });

    it('should get empty form when repayment plan does not exist for part admit journey', async () => {
      mockGetTotalAmountWithInterest.mockResolvedValue(undefined);
      const claim = new Claim();
      claim.respondent1 = new Party();
      claim.respondent1.responseType = ResponseType.PART_ADMISSION;
      claim.partialAdmission = new PartialAdmission();
      claim.partialAdmission.paymentIntention = new PaymentIntention();

      const form = await getRepaymentPlanForm(claim);

      expect(form.totalClaimAmount).toBeUndefined();
      expect(form.paymentAmount).toBeUndefined();
      expect(form.repaymentFrequency).toBeUndefined();
      expect(form.firstRepaymentDate).toBeUndefined();
    });

    it('should get empty form when repayment plan does not exist for full admit journey', async () => {
      mockGetTotalAmountWithInterest.mockResolvedValue(undefined);
      const claim = new Claim();
      claim.respondent1 = new Party();
      claim.respondent1.responseType = ResponseType.FULL_ADMISSION;
      claim.fullAdmission = new FullAdmission();
      claim.fullAdmission.paymentIntention = new PaymentIntention();

      const form = await getRepaymentPlanForm(claim);

      expect(form.totalClaimAmount).toBeUndefined();
      expect(form.paymentAmount).toBeUndefined();
      expect(form.repaymentFrequency).toBeUndefined();
      expect(form.firstRepaymentDate).toBeUndefined();
    });

    it('should return populated form when repayment plan exists for part admit', async () => {
      mockGetTotalAmountWithInterest.mockResolvedValue(TOTAL_CLAIM_AMOUNT);
      const claim = new Claim();
      claim.respondent1 = new Party();
      claim.respondent1.responseType = ResponseType.PART_ADMISSION;
      claim.totalClaimAmount = TOTAL_CLAIM_AMOUNT;
      claim.partialAdmission = new PartialAdmission();
      claim.partialAdmission.paymentIntention = new PaymentIntention();
      claim.partialAdmission.howMuchDoYouOwe = new HowMuchDoYouOwe(100, 1000);
      claim.partialAdmission.paymentIntention.paymentOption = PaymentOptionType.INSTALMENTS;
      claim.partialAdmission.paymentIntention.paymentDate = undefined;
      claim.partialAdmission.paymentIntention.repaymentPlan = {
        paymentAmount: PAYMENT_AMOUNT,
        repaymentFrequency: REPAYMENT_FREQUENCY,
        firstRepaymentDate: FIRST_PAYMENT_DATE,
      };
      claim.partialAdmission.howMuchDoYouOwe.amount = 1000;

      const form = await getRepaymentPlanForm(claim, true);

      expect(form.totalClaimAmount).toBe(TOTAL_CLAIM_AMOUNT);
      expect(form.paymentAmount).toBe(PAYMENT_AMOUNT);
      expect(form.repaymentFrequency).toBe(REPAYMENT_FREQUENCY);
      expect(form.firstRepaymentDate).toStrictEqual(FIRST_PAYMENT_DATE);
    });

    it('should return populated form when repayment plan exists for full admit', async () => {
      mockGetTotalAmountWithInterest.mockResolvedValue(TOTAL_CLAIM_AMOUNT);
      const claim = new Claim();
      claim.respondent1 = new Party();
      claim.respondent1.responseType = ResponseType.FULL_ADMISSION;
      claim.totalClaimAmount = TOTAL_CLAIM_AMOUNT;
      claim.fullAdmission = new FullAdmission();
      claim.fullAdmission.paymentIntention = new PaymentIntention();
      claim.fullAdmission.paymentIntention.paymentOption = PaymentOptionType.INSTALMENTS;
      claim.fullAdmission.paymentIntention.paymentDate = undefined;
      claim.fullAdmission.paymentIntention.repaymentPlan = {
        paymentAmount: PAYMENT_AMOUNT,
        repaymentFrequency: REPAYMENT_FREQUENCY,
        firstRepaymentDate: FIRST_PAYMENT_DATE,
      };

      const form = await getRepaymentPlanForm(claim);

      expect(form.totalClaimAmount).toBe(TOTAL_CLAIM_AMOUNT);
      expect(form.paymentAmount).toBe(PAYMENT_AMOUNT);
      expect(form.repaymentFrequency).toBe(REPAYMENT_FREQUENCY);
      expect(form.firstRepaymentDate).toStrictEqual(FIRST_PAYMENT_DATE);
    });

    it('part admit - should set total claimed amount to be partial amount defendant is claiming to be', async () => {
      mockGetTotalAmountWithInterest.mockResolvedValue(TOTAL_CLAIM_AMOUNT);
      const claim = new Claim();
      claim.totalClaimAmount = TOTAL_CLAIM_AMOUNT;
      claim.partialAdmission = {};
      claim.partialAdmission.howMuchDoYouOwe = {
        amount: PART_ADMIT_AMOUNT,
      };

      const form = await getRepaymentPlanForm(claim, true);

      expect(form.totalClaimAmount).toBe(PART_ADMIT_AMOUNT);
    });

    it('should not set total claim amount to be partial amount if partial admission is false', async () => {
      mockGetTotalAmountWithInterest.mockResolvedValue(TOTAL_CLAIM_AMOUNT);
      const claim = new Claim();
      claim.totalClaimAmount = TOTAL_CLAIM_AMOUNT;

      const form = await getRepaymentPlanForm(claim, false);

      expect(form.totalClaimAmount).toBe(TOTAL_CLAIM_AMOUNT);
    });
  });

  describe('saveRepaymentPlanData', () => {
    it('should throw when no response draft is found', async () => {
      mockGetResponseDraft.mockResolvedValue(null);

      await expect(saveRepaymentPlanData(mockReq, validForm(), true))
        .rejects.toThrow('[repaymentPlanService] no response draft found');
      expect(mockUpdateResponseDraft).not.toHaveBeenCalled();
    });

    it('should save repayment plan data successfully when claim exists for part admit journey', async () => {
      const claim = new Claim();
      claim.partialAdmission = new PartialAdmission();
      claim.partialAdmission.paymentIntention = new PaymentIntention();
      claim.partialAdmission.howMuchDoYouOwe = new HowMuchDoYouOwe(100, 1000);
      mockGetResponseDraft.mockResolvedValue(mockDraftResult(claim));
      mockUpdateResponseDraft.mockResolvedValue({});

      await saveRepaymentPlanData(mockReq, validForm(), true);

      expect(mockUpdateResponseDraft).toHaveBeenCalledWith(
        mockReq,
        caseId,
        expect.objectContaining({
          partialAdmission: expect.objectContaining({
            paymentIntention: expect.objectContaining({
              repaymentPlan: expect.objectContaining({
                paymentAmount: PAYMENT_AMOUNT,
                repaymentFrequency: REPAYMENT_FREQUENCY,
              }),
            }),
          }),
          draftClaimCreatedAt: new Date('2026-01-01T00:00:00.000Z'),
        }),
        'draft-123',
      );
    });

    it('should save repayment plan data successfully when claim exists for full admit journey', async () => {
      const claim = new Claim();
      claim.fullAdmission = new FullAdmission();
      claim.fullAdmission.paymentIntention = new PaymentIntention();
      mockGetResponseDraft.mockResolvedValue(mockDraftResult(claim));
      mockUpdateResponseDraft.mockResolvedValue({});

      await saveRepaymentPlanData(mockReq, validForm());

      expect(mockUpdateResponseDraft).toHaveBeenCalledWith(
        mockReq,
        caseId,
        expect.objectContaining({
          fullAdmission: expect.objectContaining({
            paymentIntention: expect.objectContaining({
              repaymentPlan: expect.objectContaining({
                paymentAmount: PAYMENT_AMOUNT,
                repaymentFrequency: REPAYMENT_FREQUENCY,
              }),
            }),
          }),
        }),
        'draft-123',
      );
    });

    it('should initialise payment intention when missing', async () => {
      mockGetResponseDraft.mockResolvedValue(mockDraftResult(new Claim()));
      mockUpdateResponseDraft.mockResolvedValue({});

      await saveRepaymentPlanData(mockReq, validForm(), true);

      const savedClaim = mockUpdateResponseDraft.mock.calls[0][2] as Claim;
      expect(savedClaim.partialAdmission.paymentIntention.repaymentPlan.paymentAmount).toBe(PAYMENT_AMOUNT);
    });

    it('should rethrow error when getResponseDraft fails', async () => {
      mockGetResponseDraft.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));

      await expect(saveRepaymentPlanData(mockReq, validForm())).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });

    it('should rethrow error when updateResponseDraft fails', async () => {
      mockGetResponseDraft.mockResolvedValue(mockDraftResult(new Claim()));
      mockUpdateResponseDraft.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));

      await expect(saveRepaymentPlanData(mockReq, validForm())).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });
});
