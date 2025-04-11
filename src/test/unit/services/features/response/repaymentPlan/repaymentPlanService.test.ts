import * as draftStoreService from 'modules/draft-store/draftStoreService';
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

jest.mock('../../../../../../main/modules/draft-store');
jest.mock('../../../../../../main/modules/draft-store/draftStoreService');
jest.mock('common/utils/repaymentUtils', () => ({fetchClaimTotal: jest.fn(() => Promise.resolve(0))}));

const TOTAL_CLAIM_AMOUNT = 1000;
const PAYMENT_AMOUNT = 100;
const PART_ADMIT_AMOUNT = 77;
const REPAYMENT_FREQUENCY = 'WEEK';
const YEAR = '2023';
const MONTH = '02';
const DAY = '02';
const FIRST_PAYMENT_DATE = new Date('2023-02-14T00:00:00.000');

describe('Repayment Plan Service', () => {
  const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;
  describe('getRepaymentPlanForm', () => {
    it('should get empty form when no data exist', async () => {
      //When
      const form = await getRepaymentPlanForm(new Claim());
      //Then
      expect(form.totalClaimAmount).toBeUndefined();
      expect(form.paymentAmount).toBeUndefined();
      expect(form.repaymentFrequency).toBeUndefined();
      expect(form.day).toBeUndefined();
      expect(form.month).toBeUndefined();
      expect(form.year).toBeUndefined();
    });

    it('should get empty form when repayment plan does not exist for part admit journey', async () => {
      //Given
      const claim = new Claim();
      claim.respondent1 = new Party();
      claim.respondent1.responseType = ResponseType.PART_ADMISSION;
      claim.partialAdmission = new PartialAdmission();
      claim.partialAdmission.paymentIntention = new PaymentIntention();

      //When
      const form = await getRepaymentPlanForm(claim);
      //Then
      expect(form.totalClaimAmount).toBeUndefined();
      expect(form.paymentAmount).toBeUndefined();
      expect(form.repaymentFrequency).toBeUndefined();
      expect(form.firstRepaymentDate).toBeUndefined();
    });

    it('should get empty form when repayment plan does not exist for full admit journey', async () => {
      //Given
      const claim = new Claim();
      claim.respondent1 = new Party();
      claim.respondent1.responseType = ResponseType.FULL_ADMISSION;
      claim.fullAdmission = new FullAdmission();
      claim.fullAdmission.paymentIntention = new PaymentIntention();
      //When
      const form = await getRepaymentPlanForm(claim);
      //Then
      expect(form.totalClaimAmount).toBeUndefined();
      expect(form.paymentAmount).toBeUndefined();
      expect(form.repaymentFrequency).toBeUndefined();
      expect(form.firstRepaymentDate).toBeUndefined();
    });

    it('should return populated form when repayment plan exists for part admit', async () => {
      //Given

      const claim = new Claim();
      claim.respondent1 = new Party();
      claim.respondent1.responseType = ResponseType.PART_ADMISSION;
      claim.totalClaimAmount = TOTAL_CLAIM_AMOUNT;
      claim.partialAdmission = new PartialAdmission();
      claim.partialAdmission.paymentIntention = new PaymentIntention();
      claim.partialAdmission.howMuchDoYouOwe = new HowMuchDoYouOwe(100, 1000);
      const repaymentPlan = {
        paymentAmount: PAYMENT_AMOUNT,
        repaymentFrequency: REPAYMENT_FREQUENCY,
        firstRepaymentDate: FIRST_PAYMENT_DATE,
      };
      claim.partialAdmission.paymentIntention.paymentOption = PaymentOptionType.INSTALMENTS;
      claim.partialAdmission.paymentIntention.paymentDate = undefined;
      claim.partialAdmission.paymentIntention.repaymentPlan = repaymentPlan;
      claim.partialAdmission.howMuchDoYouOwe.amount = 1000;

      //When
      const form = await getRepaymentPlanForm(claim, true);
      //Then
      expect(form.totalClaimAmount).toBeTruthy();
      expect(form.totalClaimAmount).toBe(TOTAL_CLAIM_AMOUNT);
      expect(form.paymentAmount).toBe(PAYMENT_AMOUNT);
      expect(form.repaymentFrequency).toBe(REPAYMENT_FREQUENCY);
      expect(form.firstRepaymentDate).toStrictEqual(FIRST_PAYMENT_DATE);
    });

    it('should return populated form when repayment plan exists for full admit', async () => {
      //Given

      const claim = new Claim();
      claim.respondent1 = new Party();
      claim.respondent1.responseType = ResponseType.FULL_ADMISSION;
      claim.totalClaimAmount = TOTAL_CLAIM_AMOUNT;
      claim.fullAdmission = new FullAdmission();
      claim.fullAdmission.paymentIntention = new PaymentIntention();
      const repaymentPlan = {
        paymentAmount: PAYMENT_AMOUNT,
        repaymentFrequency: REPAYMENT_FREQUENCY,
        firstRepaymentDate: FIRST_PAYMENT_DATE,
      };
      claim.fullAdmission.paymentIntention.paymentOption = PaymentOptionType.INSTALMENTS;
      claim.fullAdmission.paymentIntention.paymentDate = undefined;
      claim.fullAdmission.paymentIntention.repaymentPlan = repaymentPlan;

      //When
      const form = await getRepaymentPlanForm(claim);
      //Then
      expect(form.totalClaimAmount).toBeTruthy();
      expect(form.totalClaimAmount).toBe(TOTAL_CLAIM_AMOUNT);
      expect(form.paymentAmount).toBe(PAYMENT_AMOUNT);
      expect(form.repaymentFrequency).toBe(REPAYMENT_FREQUENCY);
      expect(form.firstRepaymentDate).toStrictEqual(FIRST_PAYMENT_DATE);
    });

    it('part admit - should set total claimed amount to be partial amount defendant is claiming to be', async () => {
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
      const claim = new Claim();
      claim.totalClaimAmount = TOTAL_CLAIM_AMOUNT;

      const form = await getRepaymentPlanForm(claim, false);

      expect(form.totalClaimAmount).toBe(TOTAL_CLAIM_AMOUNT);
    });
  });

  describe('saveRepaymentPlanData', () => {
    it('should save repayment paln data successfully when claim exists for part admit journey', async () => {
      //Given
      mockGetCaseData.mockImplementation(async () => {
        const claim = new Claim();
        claim.partialAdmission = new PartialAdmission();
        claim.partialAdmission.paymentIntention = new PaymentIntention();
        claim.partialAdmission.howMuchDoYouOwe = new HowMuchDoYouOwe(100, 1000);
        return claim;
      });
      const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');
      //When
      await saveRepaymentPlanData('123', new RepaymentPlanForm(
        TOTAL_CLAIM_AMOUNT,
        PAYMENT_AMOUNT,
        REPAYMENT_FREQUENCY,
        YEAR,
        MONTH,
        DAY,
      ),true);
      //Then
      expect(spySave).toBeCalled();
    });

    it('should save repayment paln data successfully when claim exists for full admit journey', async () => {
      //Given
      mockGetCaseData.mockImplementation(async () => {
        const claim = new Claim();
        claim.fullAdmission = new FullAdmission();
        claim.fullAdmission.paymentIntention = new PaymentIntention();
        return claim;
      });
      const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');
      //When
      await saveRepaymentPlanData('123', new RepaymentPlanForm(
        TOTAL_CLAIM_AMOUNT,
        PAYMENT_AMOUNT,
        REPAYMENT_FREQUENCY,
        YEAR,
        MONTH,
        DAY,
      ));
      //Then
      expect(spySave).toBeCalled();
    });

    it('should rethrow error when error occurs on get claim', async () => {
      //When
      mockGetCaseData.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      //Then
      await expect(saveRepaymentPlanData('123', new RepaymentPlanForm(
        TOTAL_CLAIM_AMOUNT,
        PAYMENT_AMOUNT,
        REPAYMENT_FREQUENCY,
        YEAR,
        MONTH,
        DAY))).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });

    it('should rethrow error when error occurs on save claim', async () => {
      //Given
      const mockSaveDraftClaim = draftStoreService.saveDraftClaim as jest.Mock;
      mockSaveDraftClaim.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      //Then
      await expect(saveRepaymentPlanData('123', new RepaymentPlanForm(
        TOTAL_CLAIM_AMOUNT,
        PAYMENT_AMOUNT,
        REPAYMENT_FREQUENCY,
        YEAR,
        MONTH,
        DAY))).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });
});
