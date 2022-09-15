import * as draftStoreService from '../../../../../../main/modules/draft-store/draftStoreService';
import {
  getRepaymentPlanForm,
  saveRepaymentPlanData,
} from '../../../../../../main/services/features/response/repaymentPlan/repaymentPlanService';
import {Claim} from '../../../../../../main/common/models/claim';
import {RepaymentPlanForm} from '../../../../../../main/common/form/models/repaymentPlan/repaymentPlanForm';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';

jest.mock('../../../../../../main/modules/draft-store');
jest.mock('../../../../../../main/modules/draft-store/draftStoreService');

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
      const form = getRepaymentPlanForm(new Claim());
      //Then
      expect(form.totalClaimAmount).toBeUndefined();
      expect(form.paymentAmount).toBeUndefined();
      expect(form.repaymentFrequency).toBeUndefined();
      expect(form.day).toBeUndefined();
      expect(form.month).toBeUndefined();
      expect(form.year).toBeUndefined();
    });

    it('should get empty form when repayment plan does not exist', async () => {
      //Given
      const claim = new Claim();
      claim.repaymentPlan = {
        paymentAmount: undefined,
        repaymentFrequency: '',
        firstRepaymentDate: undefined,
      };

      //When
      const form = getRepaymentPlanForm(claim);
      //Then
      expect(form.totalClaimAmount).toBeUndefined();
      expect(form.paymentAmount).toBeUndefined();
      expect(form.repaymentFrequency).toBe('');
      expect(form.firstRepaymentDate?.toDateString()).toBe('Invalid Date');
    });

    it('should return populated form when repayment plan exists', async () => {
      //Given
      const claim = new Claim();
      claim.totalClaimAmount = TOTAL_CLAIM_AMOUNT;
      claim.repaymentPlan = {
        paymentAmount: PAYMENT_AMOUNT,
        repaymentFrequency: REPAYMENT_FREQUENCY,
        firstRepaymentDate: FIRST_PAYMENT_DATE,
      };

      //When
      const form = getRepaymentPlanForm(claim);

      //Then
      expect(form.totalClaimAmount).toBeTruthy();
      expect(form.totalClaimAmount).toBe(TOTAL_CLAIM_AMOUNT);
      expect(form.paymentAmount).toBe(PAYMENT_AMOUNT);
      expect(form.repaymentFrequency).toBe(REPAYMENT_FREQUENCY);
      expect(form.firstRepaymentDate).toStrictEqual(FIRST_PAYMENT_DATE);
    });

    it('part admit - should set total claimed amount to be partial amount defendant is claiming to be', () => {
      const claim = new Claim();
      claim.totalClaimAmount = TOTAL_CLAIM_AMOUNT;
      claim.partialAdmission = {};
      claim.partialAdmission.howMuchDoYouOwe = {
        amount: PART_ADMIT_AMOUNT,
      };

      const form = getRepaymentPlanForm(claim, true);

      expect(form.totalClaimAmount).toBe(PART_ADMIT_AMOUNT);
    });

    it('should not set total claim amount to be partial amount if partial admission is false', () => {
      const claim = new Claim();
      claim.totalClaimAmount = TOTAL_CLAIM_AMOUNT;

      const form = getRepaymentPlanForm(claim, false);

      expect(form.totalClaimAmount).toBe(TOTAL_CLAIM_AMOUNT);
    });
  });

  describe('saveRepaymentPlanData', () => {
    it('should save selfEmployedAs data successfully when claim exists', async () => {
      //Given
      mockGetCaseData.mockImplementation(async () => {
        return new Claim();
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
